import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom'; // AJOUT: useLocation
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    FileText, 
    MessageSquare,
    Settings,
    Menu,
    X,
    Stethoscope,
    FileCheck
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation(); // AJOUT: pour obtenir le chemin actuel

    const menuItems = [
        {
            path: '/medecin/dashboard',
            icon: <LayoutDashboard size={22} />,
            label: 'Dashboard',
            exact: true
        },
        {
            path: '/medecin/patients',
            icon: <Users size={22} />,
            label: 'Patients'
        },
        {
            path: '/medecin/rendezvous',
            icon: <Calendar size={22} />,
            label: 'Rendez-vous'
        },
        {
            path: '/medecin/consultations',
            icon: <Stethoscope size={22} />,
            label: 'Consultations'
        },
        {
            path: '/medecin/Ordonnances',
            icon: <FileText size={22} />,
            label: 'Ordonnances'
        },
        {
            path: '/medecin/dossiers',
            icon: <FileCheck size={22} />,
            label: 'Dossiers Médicaux'
        },
        {
            path: '/medecin/messages',
            icon: <MessageSquare size={22} />,
            label: 'Messages',
            
        }
    ];

    const bottomMenuItems = [
        {
            path: '/medecin/parametres',
            icon: <Settings size={22} />,
            label: 'Paramètres'
        }
    ];

    // CORRECTION: Fermer la sidebar mobile lors du changement de route
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]); // CHANGEMENT: location.pathname au lieu de window.location.pathname

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
                                {item.badge && (
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