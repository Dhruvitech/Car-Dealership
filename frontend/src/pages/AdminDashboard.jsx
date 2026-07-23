import { useState, useEffect } from "react";
import api from "../api/axios";
import VehicleForm from "../components/VehicleForm";

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Restock state for inline restock input per vehicle id
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
        // Edit vehicle endpoint: PUT /api/vehicles/:id
        const id = editingVehicle._id || editingVehicle.id;
        const res = await api.put(`/vehicles/${id}`, payload);
        const updated = res.data?.vehicle || res.data;

        setVehicles((prev) =>
          prev.map((v) => ((v._id || v.id) === id ? updated : v))
        );
        setSuccess(`Successfully updated ${payload.make} ${payload.model}.`);
      } else {
        // Create vehicle endpoint: POST /api/vehicles
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
      // Delete vehicle endpoint: DELETE /api/vehicles/:id
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
      // Restock endpoint: POST /api/vehicles/:id/restock
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Management Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, update, delete, and restock dealership vehicles
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateForm}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Vehicle
        </button>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Form Modal / Container */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">
              {editingVehicle ? "Edit Vehicle Details" : "Create New Vehicle Listing"}
            </h2>
            <button onClick={handleCloseForm} className="text-slate-400 hover:text-white">✕</button>
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
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
          Loading inventory management records...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
          No vehicle records found. Click "Add New Vehicle" to create one.
        </div>
      ) : (
        /* Inventory Management Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Color</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Restock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {vehicles.map((v) => {
                  const id = v._id || v.id;
                  const isRestocking = restockLoadingId === id;

                  return (
                    <tr key={id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {v.make} {v.model}
                      </td>
                      <td className="p-4 text-slate-400">{v.category}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block border border-slate-600"
                            style={{ backgroundColor: v.color?.toLowerCase() || "gray" }}
                          />
                          {v.color}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white">${v.price?.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            v.quantity <= 0
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
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
                            value={restockAmounts[id] || ""}
                            onChange={(e) => handleRestockChange(id, e.target.value)}
                            className="w-20 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRestockSubmit(id)}
                            disabled={isRestocking}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition disabled:opacity-50"
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
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-medium rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(id, v.make, v.model)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium rounded border border-red-500/20 transition"
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
