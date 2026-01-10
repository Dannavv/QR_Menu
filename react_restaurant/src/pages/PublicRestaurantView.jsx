    import { useEffect, useState } from "react";
    import { useParams } from "react-router-dom";
    import { api } from "../services/api";
    import { 
    MapPin, Utensils, ShieldCheck, ShoppingBag, 
    Info, Star, Clock, Globe, ChevronRight, X, ChevronLeft
    } from "lucide-react";

    export default function PublicRestaurantView() {
    const { country, state, city, identifier } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isVegOnly, setIsVegOnly] = useState(false);

    useEffect(() => {
        const loadPublicData = async () => {
        try {
            const res = await api.getPublicRestaurantProfile(country, state, city, identifier);
            setData(res.data);
        } catch (err) {
            console.error("Restaurant not found", err);
        } finally {
            setLoading(false);
        }
        };
        loadPublicData();
        window.scrollTo(0, 0);
    }, [country, state, city, identifier]);

    if (loading) return <LoadingScreen />;
    if (!data?.restaurant) return <NotFound />;

    const { restaurant, products } = data;
    const categories = ["All", ...new Set(products.flatMap(p => p?.categories?.map(c => c.name) || []))];
    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === "All" || p?.categories?.some(c => c.name === activeCategory);
        const matchesVeg = isVegOnly ? p.veg === true : true;
        return matchesCategory && matchesVeg;
    });

    // Helper to find the lowest price
    const getMinPrice = (product) => {
        if (product.price) return product.price;
        if (product.sizes && product.sizes.length > 0) {
        return Math.min(...product.sizes.map(s => s.price));
        }
        return "0";
    };

    return (
        <div className="min-h-screen bg-slate-50/30 pb-20 font-sans">
        {/* 1. BREADCRUMBS */}
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Globe size={12} />
            <span>{country}</span>
            <ChevronRight size={10} />
            <span>{state}</span>
            <ChevronRight size={10} />
            <span>{city}</span>
        </nav>

        {/* 2. HEADER SECTION */}
        <header className="bg-white border-y border-slate-100 mb-8">
            <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-28 w-28 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden ring-4 ring-slate-50">
                {restaurant.logo_url ? (
                    <img src={restaurant.logo_url} alt="logo" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><Utensils size={40} /></div>
                )}
                </div>

                <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{restaurant.name}</h1>
                    {restaurant.pure_veg && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck size={12} fill="currentColor" fillOpacity={0.2} /> Pure Veg
                    </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 font-semibold text-sm">
                    <div className="flex items-center gap-2"><Utensils size={16} className="text-indigo-500" /><span>{restaurant.type || "Restaurant"}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /><span>{restaurant.location}</span></div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-indigo-500" /><span>Open Now</span></div>
                </div>
                </div>
            </div>
            </div>
        </header>

        {/* 3. MENU CONTENT */}
        <main className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {categories.map((cat) => (
                        <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                            activeCategory === cat ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                        }`}
                        >
                        {cat}
                        </button>
                    ))}
                </div>

                {/* VEG TOGGLE SWITCH */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                    <span className={`text-[10px] font-black uppercase tracking-widest pl-2 ${isVegOnly ? 'text-slate-400' : 'text-slate-900'}`}>All</span>
                    <button 
                    onClick={() => setIsVegOnly(!isVegOnly)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isVegOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 transform ${isVegOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-widest pr-2 ${isVegOnly ? 'text-emerald-600' : 'text-slate-400'}`}>Veg Only</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
                <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer"
                >
                <div className="relative h-64 w-full bg-slate-50 overflow-hidden">
                    {product.images?.[0] ? (
                    <img src={product.images[0].image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBag size={48} /></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-100">
                    <div className={`h-3 w-3 rounded-full ${product.veg ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight">{product.name}</h3>
                    <div className="text-indigo-600 font-black text-xl">₹{getMinPrice(product)}</div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{product.description}</p>
                </div>
                </div>
            ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Utensils size={24} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No items found matching your filter</p>
                </div>
            )}
        </main>

        {/* 4. PRODUCT DETAIL MODAL */}
        {selectedProduct && (
            <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            getMinPrice={getMinPrice}
            />
        )}
        </div>
    );
    }
    function ProductModal({ product, onClose, getMinPrice }) {
    const [currentImg, setCurrentImg] = useState(0);

    // Auto-sliding logic for images
    useEffect(() => {
        if (!product.images || product.images.length <= 1) return;
        const interval = setInterval(() => {
        setCurrentImg((prev) => (prev + 1) % product.images.length);
        }, 4000); // 4 seconds per slide
        return () => clearInterval(interval);
    }, [product.images]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
        
        {/* Modal Container */}
        <div className="relative bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300 max-h-[90vh]">
            
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 right-6 z-20 p-3 bg-white/90 hover:bg-white rounded-full text-slate-900 shadow-xl transition-all active:scale-90">
            <X size={20} />
            </button>

            {/* 1. LEFT: Image Gallery (Auto-Sliding) */}
            <div className="w-full md:w-3/5 h-80 md:h-auto bg-slate-50 relative overflow-hidden group">
            {product.images?.length > 0 ? (
                <div className="w-full h-full">
                <img 
                    src={product.images[currentImg].image_url} 
                    className="w-full h-full object-cover transition-all duration-1000 ease-in-out scale-100 group-hover:scale-105" 
                    alt={`${product.name} view ${currentImg + 1}`} 
                />
                
                {/* Image Navigation Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                    {product.images.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentImg(i)}
                        className={`h-2 transition-all duration-500 rounded-full ${i === currentImg ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`} 
                    />
                    ))}
                </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                <ShoppingBag size={80} />
                </div>
            )}
            
            {/* Veg/Non-Veg Tag on Image */}
            <div className="absolute top-8 left-8">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md border ${product.veg ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'} font-black text-[10px] uppercase tracking-widest`}>
                <div className={`h-2 w-2 rounded-full ${product.veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {product.veg ? "Pure Veg" : "Non-Veg"}
                </div>
            </div>
            </div>

            {/* 2. RIGHT: Content & Details */}
            <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto flex flex-col border-l border-slate-50">
            
            <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2 block">
                {product.categories?.[0]?.name || "Featured Item"}
                </span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                {product.name}
                </h2>
                <p className="text-slate-500 leading-relaxed font-medium text-sm">
                {product.description || "Crafted with the finest ingredients to ensure an authentic and delightful experience."}
                </p>
            </div>

            <div className="space-y-8 flex-1">
                {/* PRICE DISPLAY */}
                <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-slate-400">Starting from</span>
                <span className="text-4xl font-black text-slate-900">₹{getMinPrice(product)}</span>
                </div>

                {/* SIZES SECTION */}
                {product.sizes?.length > 0 && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    Select Size <div className="h-px flex-1 bg-slate-100" />
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                    {product.sizes.map((s, idx) => (
                        <div 
                        key={idx} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group"
                        >
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Standard Portion</span>
                        </div>
                        <span className="text-lg font-black text-indigo-600">₹{s.price}</span>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* ADDITIONAL TAGS */}
                <div className="flex flex-wrap gap-2 pt-4">
                {product.iced && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    <Clock size={12} /> Best Served Cold
                    </div>
                )}
                {product.spicy && (
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Spicy
                    </div>
                )}
                </div>
            </div>

            {/* FOOTER INFO */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quality Guaranteed</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Product ID: #{product.id.toString().slice(-4)}</span>
            </div>
            
            </div>
        </div>
        </div>
    );
    }

    // Keep LoadingScreen and NotFound components as they are...

    // Components remain the same...
    function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preparing Menu...</p>
        </div>
        </div>
    );
    }

    function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white">
        <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
            <Info size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Store Not Found</h2>
        <p className="text-slate-500 max-w-xs mt-3 font-medium">This restaurant link might be expired or the store is currently offline.</p>
        <a href="/" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
            Browse Other Outlets
        </a>
        </div>
    );
    }