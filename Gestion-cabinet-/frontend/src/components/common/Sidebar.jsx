import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    MessageSquare,
    Settings,
    Menu,
    X,
    Bell
} from 'lucide-react';
import apiService from '../../services/apiService.js';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await apiService.messagerie.countMessagesNonLus();
                setUnreadCount(count || 0);
            } catch (error) {
                console.error('Erreur lors de la récupération des messages non lus:', error);
                setUnreadCount(0);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        {
            path: '/secretaire',
            icon: <LayoutDashboard size={22} />,
            label: 'Dashboard',
            exact: true
        },
        {
            path: '/secretaire/patients',
            icon: <Users size={22} />,
            label: 'Patients'
        },
        {
            path: '/secretaire/rendez-vous',
            icon: <Calendar size={22} />,
            label: 'Rendez-vous'
        },
        {
            path: '/secretaire/messagerie',
            icon: <MessageSquare size={22} />,
            label: 'Messagerie',
            badge: unreadCount
        },
        {
            path: '/secretaire/factures',
            icon: <CreditCard size={22} />,
            label: 'Factures'
        },
        {
            path: '/secretaire/notifications',
            icon: <Bell size={22} />,
            label: 'Notifications'
        },
        {
            path: '/secretaire/parametres',
            icon: <Bell size={22} />,
            label: 'parametres'
        }
    ];

    const bottomMenuItems = [
        {
            path: '/secretaire/parametres',
            icon: <Settings size={22} />,
            label: 'Paramètres'
        }
    ];

    // Fermer la sidebar mobile lors du changement de route
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Gérer la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = useCallback(() => {
        if (window.innerWidth <= 768) {
            setIsMobileOpen(prev => !prev);
        } else {
            setIsCollapsed(prev => !prev);
        }
    }, []);

    const closeMobileSidebar = useCallback(() => {
        if (window.innerWidth <= 768) {
            setIsMobileOpen(false);
        }
    }, []);

    return (
        <>
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    {!isCollapsed && (
                        <h2 className="sidebar-title">Menu</h2>
                    )}
                    <button
                        className="toggle-btn"
                        onClick={toggleSidebar}
                        title={isCollapsed ? 'Développer' : 'Réduire'}
                    >
                        {isCollapsed || isMobileOpen ? <Menu size={24} /> : <X size={24} />}
                    </button>
                </div>

                <div className="sidebar-menu">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `menu-item ${isActive ? 'active' : ''}`
                            }
                            data-label={item.label}
                            end={item.exact}
                            onClick={closeMobileSidebar}
                        >
                            <div className="menu-icon">
                                {item.icon}
                                {item.badge > 0 && (
                                    <span className="menu-badge">{item.badge}</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <span className="menu-label">{item.label}</span>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer">
                    {bottomMenuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `menu-item ${isActive ? 'active' : ''}`
                            }
                            data-label={item.label}
                            onClick={closeMobileSidebar}
                        >
                            <div className="menu-icon">{item.icon}</div>
                            {!isCollapsed && (
                                <span className="menu-label">{item.label}</span>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Overlay pour mobile */}
            {isMobileOpen && (
                <div
                    className="sidebar-overlay active"
                    onClick={closeMobileSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;