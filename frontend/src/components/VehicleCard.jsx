import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VehicleCard({ vehicle, onPurchaseSuccess, showPurchase = true }) {
  if (!vehicle) return null;

  const { isAdmin } = useAuth() || {};
  const { _id, id, make, model, category, price, color, images } = vehicle;
  const vehicleId = _id || id;

  const [quantity, setQuantity] = useState(vehicle.quantity ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOutOfStock = quantity <= 0;
  const imageUrl = images && images.length > 0 ? images[0] : null;

  // Hide purchase button if user is an admin or if explicitly hidden
  const canPurchase = showPurchase && !isAdmin;

  const handlePurchase = async () => {
    if (isOutOfStock || loading || !canPurchase) return;

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
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 group flex flex-col">
      {/* Image Container */}
      <div className="h-56 bg-white relative flex items-center justify-center overflow-hidden border-b border-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5 p-4 text-center">
            <svg
              className="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7h8m-8 4h8m-8 4h4m4-11a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10z"
              />
            </svg>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">No Image</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm ${isOutOfStock
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
          >
            {isOutOfStock ? "Out of Stock" : `${quantity} in stock`}
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {category}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300 shadow-sm"
                style={{ backgroundColor: color?.toLowerCase() || "gray" }}
                aria-hidden="true"
              />
              {color}
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {make} {model}
          </h3>
        </div>

        {error && (
          <div role="alert" className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 font-medium">
            {error}
          </div>
        )}

        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Price</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ${price?.toLocaleString()}
            </span>
          </div>

          {canPurchase && (
            <button
              type="button"
              onClick={handlePurchase}
              disabled={isOutOfStock || loading}
              aria-label={`Purchase ${make} ${model}`}
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {loading ? "Purchasing..." : "Purchase"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
