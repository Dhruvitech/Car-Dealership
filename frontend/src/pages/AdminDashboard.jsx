export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Restock inventory and perform administrative controls
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs rounded-full font-medium">
          Admin Only
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <p className="text-lg font-medium text-purple-300">Admin Control Center</p>
        <p className="text-sm text-slate-500 mt-1">
          Vehicle management actions and restock options will render here.
        </p>
      </div>
    </div>
  );
}
