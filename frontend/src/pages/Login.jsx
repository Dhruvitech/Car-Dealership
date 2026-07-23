export default function Login() {
  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-slate-400">
          Sign in to access your inventory portal
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            disabled
            placeholder="admin@dealership.com"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 placeholder-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            disabled
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 placeholder-slate-500 cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          disabled
          className="w-full py-3 bg-blue-600/50 text-slate-300 font-medium rounded-lg cursor-not-allowed text-center transition"
        >
          Sign In (Placeholder)
        </button>
      </div>

      <p className="text-xs text-center text-slate-500 mt-6">
        Authentication logic to be implemented.
      </p>
    </div>
  );
}
