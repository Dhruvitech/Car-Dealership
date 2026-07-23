import { useState } from "react";
import api from "../api/axios";

export default function VehicleCard({ vehicle, onPurchaseSuccess }) {
  if (!vehicle) return null;

  const { _id, id, make, model, category, price, color, images } = vehicle;
  const vehicleId = _id || id;

  const [quantity, setQuantity] = useState(vehicle.quantity ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOutOfStock = quantity <= 0;
  const imageUrl = images && images.length > 0 ? images[0] : null;

  const handlePurchase = async () => {
    if (isOutOfStock || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/vehicles/${vehicleId}/purchase`);
      const updatedVehicle = response.data?.vehicle;

      if (updatedVehicle) {
        setQuantity(updatedVehicle.quantity);
        if (onPurchaseSuccess) {
          onPurchaseSuccess(updatedVehicle);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all group flex flex-col">
      {/* Image Container */}
      <div className="h-48 bg-slate-800 relative flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7h8m-8 4h8m-8 4h4m4-11a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10z"
              />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold">No Image</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              isOutOfStock
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `${quantity} in stock`}
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              {category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-slate-600"
                style={{ backgroundColor: color?.toLowerCase() || "gray" }}
              />
              {color}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {make} {model}
          </h3>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
            {error}
          </p>
        )}

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="block text-xs text-slate-400">Price</span>
            <span className="text-xl font-extrabold text-white">
              ${price?.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            disabled={isOutOfStock || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Purchasing..." : "Purchase"}
          </button>
        </div>
      </div>
    </div>
  );
}
