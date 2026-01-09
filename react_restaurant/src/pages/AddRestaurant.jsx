import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft, Save, Building2, AlertCircle, MapPin, Globe, Camera, X } from "lucide-react";
import { Country, State, City } from 'country-state-city';

export default function AddRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  
  // Image Preview State
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "Restaurant",
    pure_veg: false,
    country_code: "IN",
    state_code: "",
    city_code: "",
    location: "",
    logo: null // For the File object
  });

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // --- Helpers ---
  const generateLocationString = (cCode, sCode, cityName) => {
    const countryName = Country.getCountryByCode(cCode)?.name || "";
    const stateName = State.getStateByCodeAndCountry(sCode, cCode)?.name || "";
    const parts = [cityName, stateName, countryName].filter(Boolean);
    return parts.join(", ");
  };

  // --- Effects ---
  useEffect(() => {
    if (isEditMode) {
      const loadRestaurantData = async () => {
        try {
          const res = await api.getRestaurantById(id);
          const data = res.data;
          
          setFormData({
            ...data,
            password: "",
            logo: null // Files aren't fetched, we use logo_url for preview
          });

          // Set existing logo as preview if available
          if (data.logo_url) setLogoPreview(data.logo_url);

          const defaults = ["Restaurant", "Cafe", "Fast Food", "Bakery"];
          if (!defaults.includes(data.type)) setIsCustomType(true);

          if (data.country_code) {
            setStates(State.getStatesOfCountry(data.country_code));
            if (data.state_code) {
              setCities(City.getCitiesOfState(data.country_code, data.state_code));
            }
          }
        } catch (err) {
          setError("Could not find restaurant data.");
        } finally {
          setFetching(false);
        }
      };
      loadRestaurantData();
    } else {
      setStates(State.getStatesOfCountry("IN"));
    }
  }, [id, isEditMode]);

  // --- Handlers ---
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file)); // Create local URL for preview
    }
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;
    const locString = generateLocationString(code, "", "");
    setFormData({ ...formData, country_code: code, state_code: "", city_code: "", location: locString });
    setStates(State.getStatesOfCountry(code));
    setCities([]);
  };

  const handleStateChange = (e) => {
    const code = e.target.value;
    const locString = generateLocationString(formData.country_code, code, "");
    setFormData({ ...formData, state_code: code, city_code: "", location: locString });
    setCities(City.getCitiesOfState(formData.country_code, code));
  };

  const handleCityChange = (e) => {
    const name = e.target.value;
    const locString = generateLocationString(formData.country_code, formData.state_code, name);
    setFormData({ ...formData, city_code: name, location: locString });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Use FormData because we are sending a File (logo)
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      
      // Only append password if it's filled (important for Edit Mode)
      if (formData.password) data.append("password", formData.password);
      
      data.append("country_code", formData.country_code);
      data.append("state_code", formData.state_code);
      data.append("city_code", formData.city_code);
      data.append("location", formData.location);
      data.append("type", formData.type);
      data.append("pure_veg", formData.pure_veg);

      if (formData.logo) {
        data.append("logo", formData.logo);
      }
      
      if (isEditMode) {
        await api.updateRestaurant(id, data);
      } else {
        await api.createRestaurant(data);
      }
      navigate("/admin/restaurants");
    } catch (err) {
      setError(err.response?.data?.detail || "Action failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center animate-pulse text-indigo-600 font-medium text-lg">Loading Details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Directory
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg text-white shadow-md ${isEditMode ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Restaurant" : "Add New Restaurant"}
              </h1>
              <p className="text-sm text-gray-500">Configure outlet identity and regional settings.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Logo Upload Section */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={48} className="text-gray-200" />
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-indigo-600 p-2.5 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-all shadow-lg border-2 border-white">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-gray-700">Restaurant Logo</p>
              <p className="text-xs text-gray-400">JPG, PNG or WEBP. Max 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {isEditMode && "(Leave blank to keep same)"}
                  </label>
                  <input
                    required={!isEditMode}
                    type="password"
                    placeholder={isEditMode ? "••••••••" : "Min. 6 chars"}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Regional Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Regional Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                  <select 
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition"
                    onChange={(e) => {
                      if (e.target.value === "Others") {
                        setIsCustomType(true);
                        setFormData({ ...formData, type: "" });
                      } else {
                        setIsCustomType(false);
                        setFormData({ ...formData, type: e.target.value });
                      }
                    }}
                    value={isCustomType ? "Others" : formData.type}
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Others">Others</option>
                  </select>
                  {isCustomType && (
                    <input
                      required
                      type="text"
                      placeholder="Specify type..."
                      className="w-full mt-2 px-4 py-2 border border-indigo-200 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Location Details*</label>
                  <select 
                    required className="w-full px-4 py-2 border rounded-lg text-sm"
                    value={formData.country_code} onChange={handleCountryChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>

                  <select 
                    required className="w-full px-4 py-2 border rounded-lg text-sm disabled:bg-gray-100"
                    value={formData.state_code} onChange={handleStateChange} disabled={!states.length}
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>

                  <select 
                    required className="w-full px-4 py-2 border rounded-lg text-sm disabled:bg-gray-100"
                    value={formData.city_code} onChange={handleCityChange} disabled={!cities.length}
                  >
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>

                  {formData.location && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-600 bg-indigo-50 p-2 rounded-md border border-indigo-100">
                      <MapPin size={12} />
                      <span className="font-semibold">{formData.location}</span>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${formData.pure_veg ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                  <input
                    type="checkbox" id="pure_veg" className="w-5 h-5 text-green-600 border-gray-300 rounded"
                    checked={formData.pure_veg} onChange={(e) => setFormData({...formData, pure_veg: e.target.checked})}
                  />
                  <label htmlFor="pure_veg" className={`text-sm font-bold cursor-pointer ${formData.pure_veg ? 'text-green-700' : 'text-gray-500'}`}>
                     Pure Veg Outlet
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium italic">
              {isEditMode ? "Changes are permanent once saved." : "* All fields are mandatory."}
            </p>
            <button
              type="submit" disabled={loading}
              className={`flex items-center gap-2 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-70 ${
                isEditMode ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              }`}
            >
              {loading ? "Processing..." : (
                <><Save size={18} /> {isEditMode ? "Update Restaurant" : "Register Restaurant"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}