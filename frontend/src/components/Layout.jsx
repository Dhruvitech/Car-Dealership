import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

// Pages where the footer should be hidden
const NO_FOOTER_ROUTES = ["/login", "/register"];

export default function Layout() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 flex flex-col font-sans antialiased">
      <Navbar />
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
        <Outlet />
      </main>
      {showFooter && (
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs font-medium text-slate-500 shadow-inner">
          © {new Date().getFullYear()} Car-Dealership Inventory System. All rights reserved.
        </footer>
      )}
    </div>
  );
}
