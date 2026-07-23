import { useState, useEffect } from "react";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearched, setIsSearched] = useState(false);

  const [filters, setFilters] = useState({
    make: "",
    model: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/vehicles");
      const data = response.data?.vehicles || response.data || [];
      setVehicles(data);
      setIsSearched(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load vehicle inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const [searchError, setSearchError] = useState("");

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearchError("");

    const params = {};
    if (filters.make.trim())     params.make = filters.make.trim();
    if (filters.model.trim())    params.model = filters.model.trim();
    if (filters.category.trim()) params.category = filters.category.trim();
    if (filters.minPrice.trim()) params.minPrice = filters.minPrice.trim();
    if (filters.maxPrice.trim()) params.maxPrice = filters.maxPrice.trim();

    // Block blank search
    if (Object.keys(params).length === 0) {
      setSearchError("Please enter at least one search field before searching.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/vehicles/search", { params });
      const data = response.data?.vehicles || response.data || [];
      setVehicles(data);
      setIsSearched(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to perform vehicle search.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ make: "", model: "", category: "", minPrice: "", maxPrice: "" });
    fetchVehicles();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white border border-blue-900/40">
        {/* Decorative background circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-8 sm:px-12 py-10 sm:py-12">
          {/* Text Side */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Premium Dealership
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Vehicle{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Inventory
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">
              Browse our curated collection of premium vehicles. Find your perfect match, search by model, price, or category.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex flex-col">
                <span aria-live="polite" className="text-2xl font-extrabold text-white">
                  {loading ? "—" : vehicles.length}
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Vehicles Listed</span>
              </div>
              <div className="w-px bg-slate-700" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">100%</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Verified Stock</span>
              </div>
              <div className="w-px bg-slate-700" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-white">24/7</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Online Purchasing</span>
              </div>
            </div>
          </div>

          {/* Illustration / Icon Side */}
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-56 h-44 relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl" />
            <svg viewBox="0 0 200 120" className="w-48 h-36 drop-shadow-xl" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Road */}
              <rect x="0" y="90" width="200" height="30" rx="4" fill="#1e3a5f" />
              <rect x="85" y="100" width="30" height="6" rx="3" fill="#60a5fa" opacity="0.5" />
              {/* Car body */}
              <rect x="30" y="55" width="140" height="38" rx="10" fill="#1d4ed8" />
              {/* Cabin */}
              <path d="M60 55 Q80 28 120 28 Q150 28 165 55Z" fill="#2563eb" />
              {/* Windows */}
              <path d="M72 55 Q84 36 110 36 Q128 36 138 55Z" fill="#93c5fd" opacity="0.7" />
              {/* Wheels */}
              <circle cx="65" cy="93" r="16" fill="#1e293b" />
              <circle cx="65" cy="93" r="8" fill="#94a3b8" />
              <circle cx="135" cy="93" r="16" fill="#1e293b" />
              <circle cx="135" cy="93" r="8" fill="#94a3b8" />
              {/* Headlight */}
              <ellipse cx="168" cy="68" rx="6" ry="4" fill="#fde68a" opacity="0.9" />
              {/* Tail light */}
              <ellipse cx="32" cy="68" rx="5" ry="3.5" fill="#f87171" opacity="0.8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        aria-label="Search Vehicles"
        className="bg-white border border-slate-200/90 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end shadow-sm"
      >
        <div>
          <label htmlFor="search-make" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Make</label>
          <input
            id="search-make"
            type="text"
            name="make"
            value={filters.make}
            onChange={handleFilterChange}
            placeholder="Search Make"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        <div>
          <label htmlFor="search-model" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Model</label>
          <input
            id="search-model"
            type="text"
            name="model"
            value={filters.model}
            onChange={handleFilterChange}
            placeholder="Search Model"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        <div>
          <label htmlFor="search-category" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Category</label>
          <input
            id="search-category"
            type="text"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="Category"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        <div>
          <label htmlFor="search-min-price" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Min Price</label>
          <input
            id="search-min-price"
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min Price"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        <div>
          <label htmlFor="search-max-price" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Max Price</label>
          <input
            id="search-max-price"
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max Price"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            aria-label="Submit vehicle search"
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-600/10"
          >
            Search
          </button>
          {isSearched && (
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset search filters"
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-200"
            >
              Reset
            </button>
          )}
        </div>

        {/* Blank search validation message */}
        {searchError && (
          <div role="alert" className="col-span-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {searchError}
          </div>
        )}
      </form>

      {/* Loading State */}
      {loading && (
        <div
          data-testid="loading-state"
          aria-label="Loading vehicle inventory"
          aria-live="polite"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse"
        >
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl h-80 flex flex-col p-5 space-y-4 shadow-sm"
            >
              <div className="bg-slate-200 h-40 rounded-xl w-full" />
              <div className="bg-slate-200 h-6 rounded-lg w-3/4" />
              <div className="bg-slate-200 h-4 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div role="alert" className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3 shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={fetchVehicles}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && vehicles.length === 0 && (
        <div
          data-testid="empty-state"
          className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-sm"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {isSearched ? "No Vehicles Match Your Search" : "No Vehicles Found"}
          </h3>
          <p className="text-sm text-slate-500">
            {isSearched
              ? "No vehicles match your search criteria. Try adjusting your filters."
              : "There are currently no vehicles available in the inventory."}
          </p>
        </div>
      )}

      {/* Vehicle Grid */}
      {!loading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
