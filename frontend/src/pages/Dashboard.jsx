export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and manage current dealership listings
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full font-medium">
          Protected Page
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Inventory
          </p>
          <p className="text-3xl font-extrabold text-white mt-2">--</p>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Models
          </p>
          <p className="text-3xl font-extrabold text-blue-400 mt-2">--</p>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Categories
          </p>
          <p className="text-3xl font-extrabold text-cyan-400 mt-2">--</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <p className="text-lg font-medium text-slate-300">Dashboard View</p>
        <p className="text-sm text-slate-500 mt-1">
          Vehicle listings and search controls will render here.
        </p>
      </div>
    </div>
  );
}
