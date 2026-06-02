import { Outlet } from "react-router-dom";
import Header2 from "./Header2.jsx";
import Sidebar2 from "./Sidebar2.jsx";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar2 */}
      <Sidebar2 />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header2 */}
        <Header2 />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8"> {/* padding augmenté pour plus d'espace */}
          <div className="ml-24 space-y-8">
            {/* ml-6 → espace entre sidebar et contenu */}
            {/* space-y-8 → espace vertical entre sections */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
