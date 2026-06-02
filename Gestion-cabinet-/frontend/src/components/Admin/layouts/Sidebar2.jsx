import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiBriefcase, FiPackage, FiFileText, FiClipboard, FiLogOut, FiMenu } from "react-icons/fi";

export default function Sidebar2() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);

    const menuItems = [
        { id: "dashboard", icon: <FiHome />, label: "Dashboard", path: "/administrateur" },
        { id: "cabinets", icon: <FiBriefcase />, label: "Gestion Cabinets", path: "/administrateur/cabinets" },
        { id: "users", icon: <FiUsers />, label: "Gestion Utilisateurs", path: "/administrateur/utilisateurs" },
        { id: "medicaments", icon: <FiPackage />, label: "Médicaments", path: "/administrateur/medicaments" },
        { id: "invoices", icon: <FiFileText />, label: "Factures", path: "/administrateur/factures" },
        { id: "candidatures", icon: <FiClipboard />, label: "Candidatures", path: "/administrateur/candidatures" },
    ];

    const getActivePath = (path) => {
        if (path === "/administrateur" && location.pathname === "/administrateur") return true;
        if (path !== "/administrateur" && location.pathname.startsWith(path)) return true;
        return false;
    };

    // ✅ CORRECTION CRITIQUE : Fonction de déconnexion améliorée
    const handleLogout = () => {
        console.log("🚪 Déconnexion en cours...");

        // 1. Supprimer le token
        localStorage.removeItem("token");

        // 2. Supprimer toutes les autres données liées à la session si nécessaire
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        // 3. Naviguer vers la page de login
        // ✅ IMPORTANT: On utilise window.location au lieu de navigate()
        // pour forcer un rechargement complet de la page et éviter que
        // les composants React continuent d'exécuter leurs useEffect
        window.location.href = "/login";

        console.log("✅ Déconnexion réussie, redirection vers /login");
    };

    return (
        <aside className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col transition-all duration-300 ${isOpen ? "w-72" : "w-24"} shadow-xl h-screen sticky top-0`}>
            {/* Logo + Toggle */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-slate-700/50 relative overflow-hidden flex-shrink-0">
                {isOpen && (
                    <>
                        <div className="z-10">
              <span className="text-3xl font-bold tracking-wide bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                MediAdmin
              </span>
                            <p className="text-blue-300/60 text-sm mt-2 font-medium">Administration</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
                    </>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="z-10 p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                    <FiMenu size={28} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = getActivePath(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`
                relative flex items-center gap-5 px-6 py-4 rounded-xl transition-all duration-200 text-base font-medium w-full
                ${isActive
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/50"
                            }
                ${hoveredItem === item.id && !isActive ? 'transform translate-x-1' : ''}
              `}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl animate-pulse"></div>
                            )}

                            <div className={`text-2xl transition-transform duration-200 ${hoveredItem === item.id ? 'scale-105' : ''} flex-shrink-0`}>
                                {item.icon}
                            </div>

                            {isOpen && (
                                <div className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden">
                                    <span className="text-base font-medium truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-2 px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                      {item.badge}
                    </span>
                                    )}
                                </div>
                            )}

                            {isActive && isOpen && (
                                <div className="absolute right-2 w-1.5 h-3/4 bg-gradient-to-b from-white to-blue-100 rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout - ✅ CORRECTION ICI */}
            <div className="p-6 border-t border-slate-700/50 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="group relative flex items-center gap-5 w-full px-6 py-4 rounded-xl text-slate-300 hover:text-white transition-all duration-200 overflow-hidden text-base font-medium"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                    <FiLogOut className="text-2xl group-hover:scale-105 transition-transform duration-200 flex-shrink-0" />
                    {isOpen && <span className="flex-1 text-left">Déconnexion</span>}
                </button>
            </div>
        </aside>
    );
}