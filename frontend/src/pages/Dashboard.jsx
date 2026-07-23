import { useState, useEffect } from "react";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/vehicles");
      // Response expected format: { vehicles: [...] } or [...]
      const data = response.data?.vehicles || response.data || [];
      setVehicles(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load vehicle inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse current available dealership vehicles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            {loading ? "Updating..." : `${vehicles.length} Vehicles Available`}
          </span>
        </div>
      </div>

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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">No Vehicles Found</h3>
          <p className="text-sm text-slate-400">
            There are currently no vehicles available in the inventory.
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
