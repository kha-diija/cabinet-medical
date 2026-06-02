import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, User, LogOut, Settings, Search, Palette, ChevronDown, Check } from 'lucide-react';
import { authService } from '../../../services/authService';
import notificationService from '../../../services/notificationService';
import cabinetService from '../../../services/cabinetService';
import patientService from '../../../services/patientService';
import DocumentService from '../documentService';


import { useTheme } from '../../../contexts';
import './Navbar.css';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [cabinet, setCabinet] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null); // ✅ AJOUTER CETTE LIGNE
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const colorPickerRef = useRef(null);

    const {
        currentPalette,
        isDarkMode,
        changePalette,
        toggleDarkMode,
        getCurrentPalette,
        getPalettesByType
    } = useTheme();

    // ✅ NOUVELLE FONCTION : Charger le logo avec authentification
    const loadCabinetLogo = async (logoPath) => {
        if (!logoPath) {
            console.log('📋 [Navbar] Pas de logo à charger');
            setLogoUrl(null);
            return;
        }

        try {
            console.log('🔍 [Navbar] Chargement du logo:', logoPath);
            const dataUrl = await DocumentService.loadAsDataUrl(logoPath); // ✅ Utiliser documentService
            setLogoUrl(dataUrl);
            console.log('✅ [Navbar] Logo chargé avec succès');
        } catch (error) {
            console.error('❌ [Navbar] Erreur chargement logo:', error);
            setLogoUrl(null);
        }
    };

    const parseDate = (dateString) => {
        if (!dateString) return null;

        const formats = [
            dateString,
            dateString.endsWith('Z') ? dateString : dateString + 'Z',
            dateString.replace(' ', 'T'),
            dateString.split('.')[0].replace(' ', 'T') + 'Z'
        ];

        for (const format of formats) {
            const date = new Date(format);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        const mysqlPattern = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
        const match = dateString.match(mysqlPattern);

        if (match) {
            const [_, year, month, day, hour, minute, second] = match;
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour),
                parseInt(minute),
                parseInt(second)
            );
        }

        return null;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date non disponible';

        const date = parseDate(dateString);
        if (!date) {
            console.warn('Date non parsable:', dateString);
            return 'Date non disponible';
        }

        try {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Erreur formatage:', error);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
    };

    const formatNotificationType = (type) => {
        const typeMap = {
            'RAPPEL_RDV': 'Rappel RDV',
            'PATIENT_EN_COURS': 'Patient en cours',
            'NOUVEAU_PATIENT': 'Nouveau patient',
            'AUTRE': 'Information'
        };
        return typeMap[type] || type;
    };

    const getNotificationTypeClass = (type) => {
        return type.toLowerCase();
    };

    const formatRelativeTime = (dateString) => {
        const date = parseDate(dateString);
        if (!date) return 'récemment';

        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffDay > 7) {
            return formatDate(dateString);
        } else if (diffDay > 0) {
            return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
        } else if (diffHour > 0) {
            return `il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
        } else if (diffMin > 0) {
            return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
        } else {
            return 'à l\'instant';
        }
    };

    const calculateAge = (dateNaissance) => {
        if (!dateNaissance) return 'N/A';
        const birthDate = new Date(dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const debounceSearch = useCallback(
        debounce(async (query) => {
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await patientService.searchPatients(query);
                    setSearchResults(results);
                } catch (error) {
                    console.error('Erreur recherche patients:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (searchQuery.trim()) {
            debounceSearch(searchQuery);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, debounceSearch]);

    useEffect(() => {
        loadUserAndCabinet();
        loadNotifications();

        const interval = setInterval(() => {
            loadUnreadCount();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
            }
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    // ✅ MODIFIÉ : Charger le cabinet ET son logo
    const loadUserAndCabinet = async () => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        try {
            const cabinetInfo = await cabinetService.getCabinetInfo();
            console.log('📋 [Navbar] Cabinet info reçu:', cabinetInfo);
            setCabinet(cabinetInfo);

            // ✅ Charger le logo si disponible
            if (cabinetInfo?.logo) {
                await loadCabinetLogo(cabinetInfo.logo);
            }
        } catch (error) {
            console.error('❌ [Navbar] Erreur chargement cabinet:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();

            const processedNotifications = data.map(notification => ({
                ...notification,
                parsedDate: parseDate(notification.dateNotification)
            })).sort((a, b) => {
                const dateA = a.parsedDate || new Date(0);
                const dateB = b.parsedDate || new Date(0);
                return dateB - dateA;
            });

            setNotifications(processedNotifications);
            setUnreadCount(processedNotifications.filter(n => !n.lu).length);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Erreur comptage notifications:', error);
        }
    };

    const handleNotificationClick = async (notificationId) => {
        await notificationService.markAsRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await notificationService.markAllAsRead();
        loadNotifications();
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePatientSelect = (patient) => {
        console.log('Patient sélectionné:', patient);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="logo-container">
                    {/* ✅ MODIFIÉ : Utiliser logoUrl au lieu de cabinet.logo */}
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`Logo ${cabinet?.nom || 'Cabinet'}`}
                            className="cabinet-logo"
                            onError={(e) => {
                                console.error("❌ [Navbar] Erreur affichage logo");
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}

                    <div
                        className="logo-placeholder"
                        style={{
                            display: logoUrl ? 'none' : 'flex'
                        }}
                    >
                        {cabinet?.nom?.charAt(0) || 'C'}
                    </div>

                    <div className="cabinet-info">
                        <h2 className="cabinet-name">{cabinet?.nom || 'Cabinet Médical'}</h2>
                        <p className="cabinet-specialty">{cabinet?.specialite || 'Médecine Générale'}</p>
                    </div>
                </div>
            </div>

            <div className="navbar-center">
                {/* Centre vide pour l'instant */}
            </div>

            <div className="navbar-right">
                {/* Recherche */}
                <div className="search-container" ref={searchRef}>
                    <button
                        className="search-btn"
                        onClick={() => setShowSearch(!showSearch)}
                        title="Rechercher un patient"
                    >
                        <Search size={20} />
                    </button>

                    {showSearch && (
                        <div className="search-dropdown">
                            <div className="search-input-container">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="search-input"
                                    placeholder="Rechercher un patient par nom, prénom ou CIN..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                                {isSearching && (
                                    <div className="search-spinner"></div>
                                )}
                            </div>

                            {searchResults.length > 0 && (
                                <div className="search-results">
                                    {searchResults.map(patient => (
                                        <div
                                            key={patient.id}
                                            className="search-result-item"
                                            onClick={() => handlePatientSelect(patient)}
                                        >
                                            <div className="patient-info">
                                                <div className="patient-name">
                                                    {patient.nom} {patient.prenom}
                                                </div>
                                                <div className="patient-details">
                                                    <span className="patient-cin">CIN: {patient.cin}</span>
                                                    <span className="patient-age">
                                                        {calculateAge(patient.dateNaissance)} ans
                                                    </span>
                                                    {patient.numTel && (
                                                        <span className="patient-phone">📱 {patient.numTel}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                <div className="no-results">
                                    Aucun patient trouvé pour "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sélecteur de palette */}
                <div className="color-picker-container" ref={colorPickerRef}>
                    <button
                        className="color-picker-btn"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        title="Changer le thème"
                    >
                        <Palette size={20} />
                        <ChevronDown size={14} className={`dropdown-icon ${showColorPicker ? 'rotate' : ''}`} />
                    </button>

                    {showColorPicker && (
                        <div className="color-picker-dropdown compact">
                            <div className="color-picker-header">
                                <h4>Thème</h4>
                                <button
                                    className="dark-mode-toggle"
                                    onClick={toggleDarkMode}
                                    title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
                                >
                                    {isDarkMode ? '🌙' : '☀️'}
                                </button>
                            </div>

                            {/* Palettes claires */}
                            <div className="palette-section">
                                <h5 className="palette-section-title">Clair</h5>
                                <div className="palette-grid">
                                    {getPalettesByType('light').map(palette => (
                                        <div
                                            key={palette.key}
                                            className={`palette-item ${currentPalette === palette.key ? 'selected' : ''}`}
                                            onClick={() => changePalette(palette.key)}
                                            title={palette.name}
                                        >
                                            <div className="palette-preview">
                                                <div
                                                    className="color-primary"
                                                    style={{ backgroundColor: palette.primary }}
                                                />
                                                <div
                                                    className="color-secondary"
                                                    style={{ backgroundColor: palette.secondary }}
                                                />
                                                <div
                                                    className="color-accent"
                                                    style={{ backgroundColor: palette.accent }}
                                                />
                                            </div>
                                            {currentPalette === palette.key && (
                                                <Check size={10} className="palette-check" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Palettes sombres */}
                            <div className="palette-section">
                                <h5 className="palette-section-title">Sombre</h5>
                                <div className="palette-grid">
                                    {getPalettesByType('dark').map(palette => (
                                        <div
                                            key={palette.key}
                                            className={`palette-item ${currentPalette === palette.key ? 'selected' : ''}`}
                                            onClick={() => changePalette(palette.key)}
                                            title={palette.name}
                                        >
                                            <div className="palette-preview dark">
                                                <div
                                                    className="color-primary"
                                                    style={{ backgroundColor: palette.primary }}
                                                />
                                                <div
                                                    className="color-secondary"
                                                    style={{ backgroundColor: palette.secondary }}
                                                />
                                                <div
                                                    className="color-accent"
                                                    style={{ backgroundColor: palette.accent }}
                                                />
                                            </div>
                                            {currentPalette === palette.key && (
                                                <Check size={10} className="palette-check" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Palette actuelle */}
                            <div className="current-palette-info">
                                <span className="current-palette-name" title={getCurrentPalette()?.name}>
                                    {getCurrentPalette()?.name || 'Thème par défaut'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="notifications-container" ref={notificationRef}>
                    <button
                        className="notification-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <div className="notifications-header">
                                <h3>Notifications ({notifications.length})</h3>
                                {unreadCount > 0 && (
                                    <button
                                        className="mark-all-read-btn"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                            </div>

                            <div className="notifications-list">
                                {notifications.length === 0 ? (
                                    <p className="no-notifications">Aucune notification</p>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.lu ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notification.id)}
                                        >
                                            <div className="notification-content">
                                                <span
                                                    className={`notification-type ${getNotificationTypeClass(notification.type)}`}
                                                    title={`Type: ${formatNotificationType(notification.type)}`}
                                                >
                                                    {formatNotificationType(notification.type)}
                                                </span>

                                                <p className="notification-message">{notification.message}</p>

                                                <span className="notification-time">
                                                    {formatRelativeTime(notification.dateNotification)}
                                                </span>
                                            </div>
                                            {!notification.lu && (
                                                <div className="unread-indicator"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profil utilisateur */}
                <div className="user-profile-container" ref={profileRef}>
                    <button
                        className="user-profile-btn"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="user-info">
                            <span className="user-name">
                                Dr. {user?.prenom} {user?.nom}
                            </span>
                            <span className="user-role">{user?.role?.toLowerCase()}</span>
                        </div>
                        <div className="user-avatar">
                            {user?.photo_profil ? (
                                <img src={user.photo_profil} alt="Profile" />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <ChevronDown size={14} className={`dropdown-icon ${showProfileMenu ? 'rotate' : ''}`} />
                    </button>

                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {user?.photo_profil ? (
                                        <img src={user.photo_profil} alt="Profile" />
                                    ) : (
                                        <User size={36} />
                                    )}
                                </div>
                                <div className="profile-info">
                                    <h4>Dr. {user?.prenom} {user?.nom}</h4>
                                    <p>{user?.email || user?.login}</p>
                                    <p className="profile-role">{user?.role}</p>
                                </div>
                            </div>

                            <div className="profile-menu">
                                <button className="profile-menu-item logout" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

// Fonction debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default Navbar;