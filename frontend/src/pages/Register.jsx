import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

function validateRegisterForm(formData) {
  const errors = {};
  if (!formData.name.trim())     errors.name = "Name is required";
  if (!formData.email.trim())    errors.email = "Email is required";
  if (!formData.password.trim()) errors.password = "Password is required";
  return errors;
}

function extractErrorMessage(err) {
  return err.response?.data?.error || "Registration failed. Please try again.";
}

function FormField({ id, name, label, type = "text", value, onChange, placeholder, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        aria-required="true"
        aria-invalid={Boolean(error)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
      />
      {error && <p role="alert" className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      const { message, token, user } = response.data || {};

      setSuccessMessage(message || "Registration successful!");

      if (token && user && auth?.login) {
        auth.login(token, user);
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create Account</h1>
        <p className="text-sm text-slate-600">
          Register to join the dealership platform
        </p>
      </div>

      {apiError && (
        <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {apiError}
        </div>
      )}

      {successMessage && (
        <div role="status" aria-live="polite" className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Registration Form">
        <FormField
          id="name"
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.name}
        />

        <FormField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@dealership.com"
          error={errors.email}
        />

        <FormField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
        />

        {/* Account Role Selector */}
        <div>
          <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Account Type
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-sm"
          >
            <option value="user">Customer (Standard User)</option>
            <option value="admin">Dealership Manager (Admin)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-center transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Account"}
        </button>
      </form>

      <p className="text-xs text-center text-slate-500 pt-3 border-t border-slate-100">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
