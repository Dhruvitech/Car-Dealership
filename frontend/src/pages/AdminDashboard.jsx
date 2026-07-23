import { useState, useEffect } from "react";
import api from "../api/axios";
import VehicleForm from "../components/VehicleForm";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [restockAmounts, setRestockAmounts] = useState({});
  const [restockLoadingId, setRestockLoadingId] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/vehicles");
      const data = response.data?.vehicles || response.data || [];
      setVehicles(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load inventory for admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEditForm = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
    setError("");
    setSuccess("");
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
  };

  const handleFormSubmit = async (payload) => {
    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingVehicle) {
        const id = editingVehicle._id || editingVehicle.id;
        const res = await api.put(`/vehicles/${id}`, payload);
        const updated = res.data?.vehicle || res.data;

        setVehicles((prev) =>
          prev.map((v) => ((v._id || v.id) === id ? updated : v))
        );
        setSuccess(`Successfully updated ${payload.make} ${payload.model}.`);
      } else {
        const res = await api.post("/vehicles", payload);
        const created = res.data?.vehicle || res.data;

        setVehicles((prev) => [created, ...prev]);
        setSuccess(`Successfully added ${payload.make} ${payload.model}.`);
      }

      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.error || "Action failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVehicle = async (id, make, model) => {
    if (!window.confirm(`Are you sure you want to delete ${make} ${model}?`)) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => (v._id || v.id) !== id));
      setSuccess(`Successfully deleted ${make} ${model}.`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete vehicle.");
    }
  };

  const handleRestockChange = (id, value) => {
    setRestockAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleRestockSubmit = async (id) => {
    const amount = Number(restockAmounts[id]);
    if (!amount || amount <= 0) {
      setError("Please enter a valid positive restock quantity.");
      return;
    }

    setRestockLoadingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await api.post(`/vehicles/${id}/restock`, { quantity: amount });
      const updated = res.data?.vehicle || res.data;

      setVehicles((prev) =>
        prev.map((v) => ((v._id || v.id) === id ? updated : v))
      );

      setRestockAmounts((prev) => ({ ...prev, [id]: "" }));
      setSuccess(`Successfully restocked ${updated.make || "vehicle"} (+${amount}).`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to restock vehicle.");
    } finally {
      setRestockLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Management Portal</h1>
          <p className="text-sm text-slate-600 mt-1">
            Create, update, delete, and restock dealership vehicles
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateForm}
          aria-label="Add new vehicle listing"
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-600/10 flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Vehicle
        </button>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between shadow-sm font-medium">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error notification" className="text-red-500 hover:text-red-700 p-1">✕</button>
        </div>
      )}

      {success && (
        <div role="status" aria-live="polite" className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center justify-between shadow-sm font-medium">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Dismiss success notification" className="text-emerald-600 hover:text-emerald-800 p-1">✕</button>
        </div>
      )}

      {/* Form Modal / Container */}
      {isFormOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              {editingVehicle ? "Edit Vehicle Details" : "Create New Vehicle Listing"}
            </h2>
            <button onClick={handleCloseForm} aria-label="Close vehicle form" className="text-slate-400 hover:text-slate-600 p-1">✕</button>
          </div>

          <VehicleForm
            initialData={editingVehicle}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            loading={formLoading}
          />
        </div>
      )}

      {/* Loading & Empty Table States */}
      {loading ? (
        <div aria-live="polite" className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          Loading inventory management records...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          No vehicle records found. Click "Add New Vehicle" to create one.
        </div>
      ) : (
        /* Inventory Management Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Vehicle Inventory Records">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Color</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Restock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {vehicles.map((v) => {
                  const id = v._id || v.id;
                  const isRestocking = restockLoadingId === id;

                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        {v.make} {v.model}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{v.category}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300 shadow-sm"
                            style={{ backgroundColor: v.color?.toLowerCase() || "gray" }}
                            aria-hidden="true"
                          />
                          {v.color}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">${v.price?.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            v.quantity <= 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {v.quantity} units
                        </span>
                      </td>

                      {/* Restock Inline Form */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="+ Qty"
                            aria-label="Restock quantity"
                            value={restockAmounts[id] || ""}
                            onChange={(e) => handleRestockChange(id, e.target.value)}
                            className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRestockSubmit(id)}
                            disabled={isRestocking}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-50"
                          >
                            {isRestocking ? "..." : "Restock"}
                          </button>
                        </div>
                      </td>

                      {/* Edit / Delete Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(v)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(id, v.make, v.model)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
