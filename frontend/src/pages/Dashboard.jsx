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

    // Build query parameters object
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and filter current dealership listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            {loading ? "Updating..." : `${vehicles.length} Vehicles`}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Make</label>
          <input
            type="text"
            name="make"
            value={filters.make}
            onChange={handleFilterChange}
            placeholder="Search Make"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Model</label>
          <input
            type="text"
            name="model"
            value={filters.model}
            onChange={handleFilterChange}
            placeholder="Search Model"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="Category"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Min Price</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min Price"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Max Price</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max Price"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition"
          >
            Search
          </button>
          {isSearched && (
            <button
              type="button"
              onClick={handleReset}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse"
        >
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl h-80 flex flex-col p-5 space-y-4"
            >
              <div className="bg-slate-800 h-40 rounded-lg w-full" />
              <div className="bg-slate-800 h-6 rounded w-3/4" />
              <div className="bg-slate-800 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center space-y-3">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchVehicles}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && vehicles.length === 0 && (
        <div
          data-testid="empty-state"
          className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-md mx-auto space-y-3"
        >
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">
            {isSearched ? "No Vehicles Match Your Search" : "No Vehicles Found"}
          </h3>
          <p className="text-sm text-slate-400">
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
