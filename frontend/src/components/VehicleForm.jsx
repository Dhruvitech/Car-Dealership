import { useState, useEffect } from "react";

export default function VehicleForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    category: "",
    price: "",
    quantity: "",
    color: "",
    images: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        make: initialData.make || "",
        model: initialData.model || "",
        category: initialData.category || "",
        price: initialData.price !== undefined ? String(initialData.price) : "",
        quantity: initialData.quantity !== undefined ? String(initialData.quantity) : "",
        color: initialData.color || "",
        images: initialData.images ? initialData.images.join(", ") : "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.make.trim())     newErrors.make = "Make is required";
    if (!formData.model.trim())    newErrors.model = "Model is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.color.trim())    newErrors.color = "Color is required";

    if (formData.price === "" || Number(formData.price) < 0) {
      newErrors.price = "Valid non-negative price is required";
    }

    if (formData.quantity === "" || Number(formData.quantity) < 0) {
      newErrors.quantity = "Valid non-negative quantity is required";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      make: formData.make.trim(),
      model: formData.model.trim(),
      category: formData.category.trim(),
      color: formData.color.trim(),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      images: formData.images
        ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="make" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Make <span className="text-red-500">*</span>
          </label>
          <input
            id="make"
            name="make"
            type="text"
            aria-required="true"
            aria-invalid={Boolean(errors.make)}
            value={formData.make}
            onChange={handleChange}
            placeholder="e.g. Toyota"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.make && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{errors.make}</p>}
        </div>

        <div>
          <label htmlFor="model" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            id="model"
            name="model"
            type="text"
            aria-required="true"
            aria-invalid={Boolean(errors.model)}
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g. Camry"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.model && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{errors.model}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            id="category"
            name="category"
            type="text"
            aria-required="true"
            aria-invalid={Boolean(errors.category)}
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. SUV, Sedan"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.category && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="color" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Color <span className="text-red-500">*</span>
          </label>
          <input
            id="color"
            name="color"
            type="text"
            aria-required="true"
            aria-invalid={Boolean(errors.color)}
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g. Red, Black"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.color && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{errors.color}</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            aria-required="true"
            aria-invalid={Boolean(errors.price)}
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 25000"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.price && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{errors.price}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Initial Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            aria-required="true"
            aria-invalid={Boolean(errors.quantity)}
            value={formData.quantity}
            onChange={handleChange}
            placeholder="e.g. 5"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {errors.quantity && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{errors.quantity}</p>}
        </div>

        <div>
          <label htmlFor="images" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Image URLs (comma separated)
          </label>
          <input
            id="images"
            name="images"
            type="text"
            value={formData.images}
            onChange={handleChange}
            placeholder="https://example.com/img1.jpg"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-blue-600/10 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update Vehicle" : "Add Vehicle"}
        </button>
      </div>
    </form>
  );
}
