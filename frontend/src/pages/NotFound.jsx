import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-8xl font-black text-slate-800 tracking-widest">404</h1>
      <h2 className="text-2xl font-bold text-slate-200 mt-4">Page Not Found</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-sm">
        The route you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
