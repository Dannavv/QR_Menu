import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft, Save, Building2, AlertCircle, MapPin, Globe } from "lucide-react";
// Import the geographical data library
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "Restaurant",
    pure_veg: false,
    country_code: "IN", // Defaulting to India
    state_code: "",
    city_code: "",
    location: "" // To be sent as "City, State, Country"
  });

  // Data for dropdowns
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // --- Helpers ---

  // Generates a human-readable string from ISO codes
  const generateLocationString = (cCode, sCode, cityName) => {
    const countryName = Country.getCountryByCode(cCode)?.name || "";
    const stateName = State.getStateByCodeAndCountry(sCode, cCode)?.name || "";
    const parts = [cityName, stateName, countryName].filter(Boolean);
    return parts.join(", ");
  };

  // --- Effects ---

  // Load data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadRestaurantData = async () => {
        try {
          const res = await api.getRestaurantById(id);
          const data = res.data;
          
          setFormData({
            ...data,
            password: "" // Keep password blank in edit mode
          });

          // Handle custom restaurant type
          const defaults = ["Restaurant", "Cafe", "Fast Food", "Bakery"];
          if (!defaults.includes(data.type)) setIsCustomType(true);

          // Populate dependent dropdowns based on existing data
          if (data.country_code) {
            const countryStates = State.getStatesOfCountry(data.country_code);
            setStates(countryStates);
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
      // Default state list for India on fresh creation
      setStates(State.getStatesOfCountry("IN"));
    }
  }, [id, isEditMode]);

  // --- Handlers ---

  const handleCountryChange = (e) => {
    const code = e.target.value;
    const locString = generateLocationString(code, "", "");
    setFormData({ 
      ...formData, 
      country_code: code, 
      state_code: "", 
      city_code: "", 
      location: locString 
    });
    setStates(State.getStatesOfCountry(code));
    setCities([]);
  };

  const handleStateChange = (e) => {
    const code = e.target.value;
    const locString = generateLocationString(formData.country_code, code, "");
    setFormData({ 
      ...formData, 
      state_code: code, 
      city_code: "", 
      location: locString 
    });
    setCities(City.getCitiesOfState(formData.country_code, code));
  };

  const handleCityChange = (e) => {
    const name = e.target.value;
    const locString = generateLocationString(formData.country_code, formData.state_code, name);
    setFormData({ 
      ...formData, 
      city_code: name, 
      location: locString 
    });
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === "Others") {
      setIsCustomType(true);
      setFormData({ ...formData, type: "" });
    } else {
      setIsCustomType(false);
      setFormData({ ...formData, type: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const payload = { ...formData };
      if (isEditMode && !payload.password) delete payload.password;
      
      if (isEditMode) {
        await api.updateRestaurant(id, payload);
      } else {
        await api.createRestaurant(payload);
      }
      navigate("/admin/restaurants");
    } catch (err) {
      setError(err.response?.data?.detail || "Action failed. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center animate-pulse text-indigo-600 font-medium">Loading Details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Directory
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg text-white shadow-md ${isEditMode ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Restaurant" : "Add New Restaurant"}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditMode ? `Updating ${formData.name}` : "Register outlet details and geographic location."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Account Info Section */}
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

            {/* Regional Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Regional Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                  <select 
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition"
                    onChange={handleTypeChange}
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
                  
                  {/* Country Selection */}
                  <select 
                    required
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.country_code}
                    onChange={handleCountryChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                    ))}
                  </select>

                  {/* State Selection */}
                  <select 
                    required
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                    value={formData.state_code}
                    onChange={handleStateChange}
                    disabled={!states.length}
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                    ))}
                  </select>

                  {/* City Selection */}
                  <select 
                    required
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                    value={formData.city_code}
                    onChange={handleCityChange}
                    disabled={!cities.length}
                  >
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  {/* Display calculated location string */}
                  {formData.location && (
                    <div className="flex items-center gap-2 text-[11px] text-indigo-600 bg-indigo-50 p-2 rounded-md border border-indigo-100">
                      <MapPin size={12} />
                      <span className="font-semibold">{formData.location}</span>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${formData.pure_veg ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                  <input
                    type="checkbox"
                    id="pure_veg"
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    checked={formData.pure_veg}
                    onChange={(e) => setFormData({...formData, pure_veg: e.target.checked})}
                  />
                  <label htmlFor="pure_veg" className={`text-sm font-bold cursor-pointer ${formData.pure_veg ? 'text-green-700' : 'text-gray-500'}`}>
                     Pure Veg Outlet
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium italic">
              {isEditMode ? "Changes will reflect across the platform instantly." : "* All fields are required for registration."}
            </p>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-70 ${
                isEditMode ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              }`}
            >
              {loading ? "Processing..." : (
                <>
                  <Save size={18} /> 
                  {isEditMode ? "Update Restaurant" : "Create Restaurant"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}