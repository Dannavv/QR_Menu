import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import {
    ArrowLeft, Save, UtensilsCrossed, Plus, Trash2,
    Image as ImageIcon, X, Loader2, CheckCircle2
} from "lucide-react";

export default function AddProduct() {
    const { rest_id, product_id } = useParams(); // product_id present if editing
    const navigate = useNavigate();
    const isEditMode = !!product_id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [error, setError] = useState("");

    // Image handling state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        veg: true,
        remark: "",
        available: true,
        iced: false,
        description: "",
        category_ids: [],
        sizes: [{ size_label: "Regular", price: "" }]
    });

    // Load data for Edit Mode
    useEffect(() => {
        if (isEditMode) {
            const loadData = async () => {
                try {
                    const res = await api.getProductDetails(product_id);
                    const { images, ...data } = res.data;
                    console.log(res.data)
                    setFormData(data);
                    setExistingImages(images || []);
                } catch (err) {
                    setError("Failed to load product details.");
                } finally {
                    setFetching(false);
                }
            };
            loadData();
        }
    }, [product_id, isEditMode]);

    // --- Image Logic ---
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        setSelectedFiles((prevFiles) => [
            ...prevFiles,
            ...newFiles.filter(
                (file) =>
                    !prevFiles.some(
                        (prev) =>
                            prev.name === file.name &&
                            prev.size === file.size &&
                            prev.lastModified === file.lastModified
                    )
            ),
        ]);

        // reset input so same file can be re-selected
        e.target.value = "";
    };



    const removeNewFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    // --- Dynamic Sizes Logic ---
    const updateSize = (index, field, value) => {
        const newSizes = [...formData.sizes];
        newSizes[index][field] = value;
        setFormData({ ...formData, sizes: newSizes });
    };

    const addSizeRow = () => setFormData({
        ...formData,
        sizes: [...formData.sizes, { size_label: "", price: "" }]
    });

    // --- Submit Sequence ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let productId = product_id;

            // 1. Create or Update Product
            if (isEditMode) {
                await api.updateProductDetails(product_id, formData); // Ensure updateProduct exists in your api.js
            } else {
                const productRes = await api.createProduct(rest_id, formData);
                productId = productRes.data.id;
            }

            // 2. Upload Images one by one
            if (selectedFiles.length > 0) {
                await api.updateProductImage(productId, selectedFiles);

            }

            // 3. Finalize
            navigate(`/admin/restaurants/${rest_id}/menu`);
        } catch (err) {
            setError(err.response?.data?.detail || "An error occurred during save.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-20 text-center animate-pulse">Loading product...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 font-medium">
                <ArrowLeft size={20} className="mr-2" /> Back to Menu
            </button>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Product Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">
                            {isEditMode ? "Edit Dish" : "Add New Dish"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                                <input required className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Veg/Non-Veg</label>
                                <select className="w-full px-4 py-2.5 border rounded-xl bg-white"
                                    value={formData.veg} onChange={(e) => setFormData({ ...formData, veg: e.target.value === 'true' })}>
                                    <option value="true">🟢 Vegetarian</option>
                                    <option value="false">🔴 Non-Vegetarian</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Kitchen Note)</label>
                                <input className="w-full px-4 py-2.5 border rounded-xl outline-none" placeholder="Spicy, Cold, etc."
                                    value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea rows="3" className="w-full px-4 py-2.5 border rounded-xl outline-none"
                                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        {/* Sizes & Pricing */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Sizes & Pricing*</label>
                            {formData.sizes.map((s, i) => (
                                <div key={i} className="flex gap-3">
                                    <input required placeholder="Size (e.g. Half)" className="flex-1 px-4 py-2 border rounded-xl"
                                        value={s.size_label} onChange={(e) => updateSize(i, 'size_label', e.target.value)} />
                                    <input required type="number" placeholder="Price" className="w-32 px-4 py-2 border rounded-xl"
                                        value={s.price} onChange={(e) => updateSize(i, 'price', e.target.value)} />
                                    {formData.sizes.length > 1 && (
                                        <button type="button" onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, idx) => idx !== i) })} className="text-red-500 p-2"><Trash2 size={18} /></button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addSizeRow} className="text-indigo-600 text-sm font-bold flex items-center gap-1">+ Add Size</button>
                        </div>
                    </div>
                </div>

                {/* Right: Media & Status */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Product Images</h3>

                        {/* Multi-Image Upload */}
                        <div className="space-y-4">
                            <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all">
                                <ImageIcon className="text-gray-400 mb-2" size={28} />
                                <span className="text-xs font-semibold text-gray-500">Upload Photos</span>
                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>

                            {/* Preview Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                                        <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                                        <button onClick={() => removeNewFile(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Container for the Grid */}
                    <div className="grid grid-cols-3 gap-3">

                        {/* SECTION A: Render Existing Images from API */}
                        {existingImages.map((img) => (
                            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                <img
                                    src={img.image_url}
                                    alt="Product"
                                    className="object-cover w-full h-full"
                                />

                                {/* Visual Indicator for 'Saved' status */}
                                <div className="absolute top-0 left-0 bg-indigo-600 text-[10px] text-white px-2 py-0.5 font-bold rounded-br-lg shadow-sm">
                                    SAVED
                                </div>

                                {/* Remove Button for existing image */}
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(img.id)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {/* SECTION B: Render Local File Previews (New uploads) */}
                        {selectedFiles.map((file, i) => (
                            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-dashed border-emerald-400 bg-emerald-50">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="object-cover w-full h-full opacity-70"
                                />

                                <div className="absolute top-0 left-0 bg-emerald-500 text-[10px] text-white px-2 py-0.5 font-bold rounded-br-lg shadow-sm">
                                    NEW
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeNewFile(i)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Availability</span>
                            <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Served Cold/Iced</span>
                            <input type="checkbox" checked={formData.iced} onChange={(e) => setFormData({ ...formData, iced: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? "Saving Dish..." : (isEditMode ? "Save Changes" : "Create Product")}
                        </button>
                        {error && <p className="text-red-500 text-xs text-center font-medium mt-2">{error}</p>}
                    </div>
                </div>
            </form>
        </div>
    );
}