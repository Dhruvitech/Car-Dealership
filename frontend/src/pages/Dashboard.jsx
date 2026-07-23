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

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = {};
    if (filters.make.trim())     params.make = filters.make.trim();
    if (filters.model.trim())    params.model = filters.model.trim();
    if (filters.category.trim()) params.category = filters.category.trim();
    if (filters.minPrice.trim()) params.minPrice = filters.minPrice.trim();
    if (filters.maxPrice.trim()) params.maxPrice = filters.maxPrice.trim();

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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vehicle Inventory</h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse and filter current dealership listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-live="polite"
            className="text-xs px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-sm"
          >
            {loading ? "Updating..." : `${vehicles.length} Vehicles`}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        aria-label="Search Vehicles"
        className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end shadow-sm"
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

        <div className="flex gap-2">
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
              className="bg-white border border-slate-200 rounded-2xl h-80 flex flex-col p-5 space-y-4 shadow-sm"
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
          className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
