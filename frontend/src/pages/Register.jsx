import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Helpers & Constants ────────────────────────────────────────────────────────

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  password: "",
};

/**
 * Validates registration form inputs.
 * Returns an object containing error messages for invalid fields.
 */
function validateRegisterForm(formData) {
  const errors = {};
  if (!formData.name.trim())     errors.name = "Name is required";
  if (!formData.email.trim())    errors.email = "Email is required";
  if (!formData.password.trim()) errors.password = "Password is required";
  return errors;
}

/**
 * Extracts a displayable error message from an API catch error.
 */
function extractErrorMessage(err) {
  return err.response?.data?.error || "Registration failed. Please try again.";
}

// ── Reusable Input Component ───────────────────────────────────────────────────

function FormField({ id, name, label, type = "text", value, onChange, placeholder, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ── Main Register Page Component ───────────────────────────────────────────────

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
        navigate("/dashboard");
      }
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-sm text-slate-400">
          Register to join the dealership platform
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {apiError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-center transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-xs text-center text-slate-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
