import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
// 1. Import the library components
import { Country, State, City } from "country-state-city";
import { 
  MapPin, Utensils, Globe, ChevronRight, 
  Search, ShieldCheck, ChevronDown 
} from "lucide-react";

export default function BrowseRestaurants() {
  const { country: urlCountry, state: urlState, city: urlCity } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getRestaurants(); 
        setRestaurants(res.data);
      } catch (err) {
        console.error("Failed to load restaurants", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. SMART LOCATION LOOKUPS
  // This converts "IN" -> "India" and "BR" -> "Bihar" using the library
  const getCountryName = (code) => Country.getCountryByCode(code)?.name || code;
  const getStateName = (sCode, cCode) => State.getStateByCodeAndCountry(sCode, cCode)?.name || sCode;

  // 3. EXTRACT UNIQUE LOCATION CODES FROM API DATA
  const locationData = useMemo(() => {
    const countries = [...new Set(restaurants.map(r => r.country_code).filter(Boolean))];
    
    const states = restaurants
      .filter(r => !urlCountry || r.country_code === urlCountry)
      .map(r => r.state_code)
      .filter(Boolean);
    
    const cities = restaurants
      .filter(r => (!urlCountry || r.country_code === urlCountry) && (!urlState || r.state_code === urlState))
      .map(r => r.city_code)
      .filter(Boolean);

    return {
      countries: countries.sort(),
      states: [...new Set(states)].sort(),
      cities: [...new Set(cities)].sort()
    };
  }, [restaurants, urlCountry, urlState]);

  // 4. FILTER RESTAURANTS
  const filteredList = useMemo(() => {
    return restaurants.filter(r => {
      const matchCountry = !urlCountry || r.country_code === urlCountry;
      const matchState = !urlState || r.state_code === urlState;
      const matchCity = !urlCity || r.city_code === urlCity;
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCountry && matchState && matchCity && matchSearch;
    });
  }, [restaurants, urlCountry, urlState, urlCity, searchQuery]);

  const handleLocationChange = (type, value) => {
    if (type === 'country') navigate(`/${value}`);
    if (type === 'state') navigate(`/${urlCountry}/${value}`);
    if (type === 'city') navigate(`/${urlCountry}/${urlState}/${value}`);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
               <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                <Link to="/browse" className="hover:text-indigo-600">Global</Link>
                {urlCountry && <><ChevronRight size={10} /> <span>{getCountryName(urlCountry)}</span></>}
                {urlState && <><ChevronRight size={10} /> <span>{getStateName(urlState, urlCountry)}</span></>}
              </nav>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {urlCity || (urlState ? getStateName(urlState, urlCountry) : "") || (urlCountry ? getCountryName(urlCountry) : "All Restaurants")}
              </h1>
            </div>

            <div className="relative group min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
            </div>
          </div>

          {/* SELECTORS USING country-state-city NAMES */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-50">
            
            {/* Country Selector */}
            <div className="relative">
              <select 
                value={urlCountry || ""} 
                onChange={(e) => handleLocationChange('country', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Select Country</option>
                {locationData.countries.map(c => (
                  <option key={c} value={c}>{getCountryName(c)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* State Selector */}
            <div className="relative">
              <select 
                disabled={!urlCountry}
                value={urlState || ""} 
                onChange={(e) => handleLocationChange('state', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                <option value="">Select State</option>
                {locationData.states.map(s => (
                  <option key={s} value={s}>{getStateName(s, urlCountry)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {/* City Selector */}
            <div className="relative">
              <select 
                disabled={!urlState}
                value={urlCity || ""} 
                onChange={(e) => handleLocationChange('city', e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                <option value="">Select City</option>
                {locationData.cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            {(urlCountry || urlState || urlCity) && (
              <button onClick={() => navigate('/browse')} className="px-4 py-2 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredList.map((res) => {
            const country = res.country_code || "IN";
            const state = res.state_code || "BR";
            const city = res.city_code || "any";
            const identifier = res.email.split("@")[0] || res.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <Link key={res.id} to={`/${country}/${state}/${city}/${identifier}`} className="bg-white rounded-[2.5rem] p-2 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
                <div className="relative h-52 rounded-[2rem] bg-slate-50 overflow-hidden mb-6">
                  {res.logo_url ? (
                    <img src={res.logo_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={res.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><Utensils size={48} /></div>
                  )}
                  {res.pure_veg && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Pure Veg</div>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{res.type}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{res.city_code}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{res.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <MapPin size={14} className="text-indigo-500" />
                    <span className="truncate">{res.location || `${res.city_code}, ${getStateName(res.state_code, res.country_code)}`}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Updating Map Data...</p>
      </div>
    </div>
  );
}