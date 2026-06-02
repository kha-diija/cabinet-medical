// src/components/Admin/layouts/Header2.jsx
import { useState, useEffect, useRef } from "react";
import {
    MdNotifications,
    MdArrowForward
} from "react-icons/md";
import NotificationService from "../services/NotificationService";
import { useNavigate } from "react-router-dom";

export default function Header2({ user }) {
    const [gradientPosition] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoading] = useState(false);

    const navigate = useNavigate();
    const intervalRef = useRef(null); // ✅ Référence pour l'intervalle

    useEffect(() => {
        // ✅ Vérifier si le token existe avant de charger
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("⚠️ Pas de token, pas de chargement des notifications");
            return;
        }

        loadNotifications();

        // ✅ Stocker l'intervalle dans une ref
        intervalRef.current = setInterval(() => {
            const currentToken = localStorage.getItem("token");
            if (currentToken) {
                loadNotifications();
            } else {
                // ✅ Si le token n'existe plus, arrêter l'intervalle
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    console.log("🛑 Intervalle de notifications arrêté (pas de token)");
                }
            }
        }, 30000);

        // ✅ CRITIQUE: Nettoyer l'intervalle au démontage du composant
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log("🧹 Intervalle de notifications nettoyé");
            }
        };
    }, []); // ✅ Dépendances vides pour n'exécuter qu'une fois

    const loadNotifications = async () => {
        try {
            // ✅ Double vérification du token avant l'appel
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("⚠️ Token absent, arrêt du chargement des notifications");
                return;
            }

            const [unreadNotifications, count] = await Promise.all([
                NotificationService.getUnreadNotifications(),
                NotificationService.getUnreadCount()
            ]);
            setNotifications(unreadNotifications);
            setUnreadCount(count);
        } catch (error) {
            // ✅ Ne plus logger les erreurs 403 après déconnexion
            if (error.response?.status === 403 || error.response?.status === 401) {
                console.log("🔒 Session expirée, arrêt des notifications");
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            } else {
                console.error('Erreur chargement notifications:', error);
            }
        }
    };

    const handleMarkAsRead = async (id) => {
        const success = await NotificationService.markAsRead(id);
        if (success) {
            setNotifications(notifications.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        if (notifications.length === 0) return;

        const ids = notifications.map(n => n.id);
        const success = await NotificationService.markAllAsRead(ids);
        if (success) {
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const navigateToDemandDetails = (notification) => {
        setShowNotifications(false);
        handleMarkAsRead(notification.id);
        navigate('/administrateur/candidatures'); // ✅ Correction du path
    };

    const navigateToAllAlerts = () => {
        setShowNotifications(false);
        navigate('/administrateur/candidatures'); // ✅ Correction du path
    };

    const navigateToAllDemands = () => {
        setShowNotifications(false);
        navigate('/administrateur/candidatures'); // ✅ Correction du path
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'NOUVELLE_DEMANDE_CABINET':
                return '🏥';
            case 'DOCUMENT_MANQUANT':
                return '📄';
            case 'DEMANDE_URGENTE':
                return '🚨';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'NOUVELLE_DEMANDE_CABINET':
                return 'bg-blue-500';
            case 'DOCUMENT_MANQUANT':
                return 'bg-yellow-500';
            case 'DEMANDE_URGENTE':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffHours < 1) {
            return 'À l\'instant';
        } else if (diffHours < 24) {
            return `Il y a ${diffHours} h`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    };

    return (
        <header
            className="h-16 flex items-center justify-between px-6 sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-white/10"
            style={{
                background: `linear-gradient(${gradientPosition}deg, rgba(12, 26, 54, 0.95), rgba(30, 58, 138, 0.95), rgba(30, 64, 175, 0.95))`,
                transition: "background 2s linear",
            }}
        >
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">
                    MediAdmin
                </h1>
                <p className="text-blue-100/80 text-xs font-medium mt-0.5">
                    Tableau de Bord Administratif
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Bouton Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-white hover:text-blue-200 transition-colors rounded-full hover:bg-white/10"
                        aria-label="Notifications"
                    >
                        <MdNotifications size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
                        )}
                    </button>

                    {/* Dropdown Notifications */}
                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowNotifications(false)}
                            />

                            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">
                                            Notifications
                                            {unreadCount > 0 && (
                                                <span className="ml-2 text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                        </span>
                                            )}
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllAsRead}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Tout marquer comme lu
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="px-4 py-8 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">Chargement...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <MdNotifications size={48} className="text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">Aucune notification</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                                                    onClick={() => navigateToDemandDetails(notification)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`${getNotificationColor(notification.type)} w-8 h-8 rounded-full flex items-center justify-center text-white text-sm`}>
                                                            {getNotificationIcon(notification.type)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-medium text-gray-900 text-sm">
                                                                    {notification.titre}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    <MdArrowForward
                                                                        size={14}
                                                                        className="text-gray-400 group-hover:text-blue-600 transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mt-1">
                                                                {notification.message}
                                                            </p>

                                                            {notification.nomDemandeur && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    De: {notification.nomDemandeur}
                                                                    {notification.emailDemandeur && ` (${notification.emailDemandeur})`}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">
                                  {formatDate(notification.dateCreation)}
                                </span>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkAsRead(notification.id);
                                                                    }}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    Marquer comme lu
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Cliquez pour voir la demande →
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={navigateToAllAlerts}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Toutes les alertes
                                            </button>
                                            <button
                                                onClick={navigateToAllDemands}
                                                className="text-green-600 hover:text-green-800 font-medium"
                                            >
                                                Toutes les demandes
                                            </button>
                                        </div>
                                        <span className="text-gray-500">
                      {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-white/20"></div>

                {/* Avatar */}
                <div className="relative group">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-white font-semibold text-sm">{user?.name || "Administrateur"}</p>
                            <p className="text-blue-100/70 text-xs">{user?.role || "Admin"}</p>
                        </div>

                        <div className="relative w-12 h-12 rounded-full cursor-pointer overflow-hidden">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-full h-full object-cover border-2 border-white/80 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-blue-100 text-blue-800 font-bold text-lg uppercase shadow-xl border-2 border-white/80 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    {user?.name
                                        ? user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                        : "AD"}
                                </div>
                            )}

                            <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30 blur-lg animate-pulse-slow pointer-events-none"></span>
                            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-md animate-pulse pointer-events-none"></span>

                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                        </div>
                    </div>

                    <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700/50 backdrop-blur-sm">
                            <div className="font-semibold mb-0.5">{user?.name || "Utilisateur"}</div>
                            <div className="text-slate-300 text-xs">{user?.email || "admin@mediadmin.com"}</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </header>
    );
}