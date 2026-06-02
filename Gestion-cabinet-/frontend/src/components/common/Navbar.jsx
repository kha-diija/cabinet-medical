import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Palette, ChevronDown, Check } from 'lucide-react';
import { authService } from '../../services/authService';
import cabinetService from '../../medecin/services/cabinetService';
import { useTheme } from '../../medecin/contexts/useTheme';
import './Navbar.css';

// Service de chargement de documents
class DocumentService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api';
    }

    async loadAsDataUrl(documentPath) {
        if (!documentPath) {
            throw new Error('Aucun chemin de document fourni');
        }

        console.log('🔍 [DocumentService] Chargement:', documentPath);

        try {
            let fileName = documentPath;

            // ✅ Si c'est une URL Supabase complète, extraire le nom du fichier
            if (documentPath.includes('supabase.co')) {
                const match = documentPath.match(/logos\/(.+)$/);
                if (match) {
                    fileName = match[1];
                    console.log('📎 [DocumentService] Fichier extrait de Supabase:', fileName);
                }
            } else if (documentPath.includes('/')) {
                const urlParts = documentPath.split('/');
                fileName = urlParts[urlParts.length - 1];
            }

            // Utiliser l'endpoint backend
            const finalUrl = `${this.baseURL}/public/logos/${encodeURIComponent(fileName)}`;
            console.log('🌐 [DocumentService] URL API:', finalUrl);

            const response = await fetch(finalUrl, {
                method: 'GET'
            });

            console.log('📡 [DocumentService] Réponse:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [DocumentService] Erreur HTTP:', response.status, errorText);
                throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
            }

            const blob = await response.blob();
            console.log('📦 [DocumentService] Blob reçu:', blob.type, blob.size, 'bytes');

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    console.log('✅ [DocumentService] Conversion réussie');
                    resolve(reader.result);
                };
                reader.onerror = (error) => {
                    console.error('❌ [DocumentService] Erreur conversion:', error);
                    reject(new Error('Erreur conversion blob'));
                };
                reader.readAsDataURL(blob);
            });

        } catch (error) {
            console.error('❌ [DocumentService] Erreur:', error);
            throw error;
        }
    }
}

const documentService = new DocumentService();

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [cabinet, setCabinet] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const profileRef = useRef(null);
    const colorPickerRef = useRef(null);

    const {
        currentPalette,
        isDarkMode,
        changePalette,
        toggleDarkMode,
        getCurrentPalette,
        getPalettesByType
    } = useTheme();

    // Charger le logo avec authentification
    const loadCabinetLogo = async (logoPath) => {
        if (!logoPath) {
            console.log('📋 [Navbar] Pas de logo à charger');
            setLogoUrl(null);
            return;
        }

        try {
            console.log('🔍 [Navbar] Chargement du logo:', logoPath);
            const dataUrl = await documentService.loadAsDataUrl(logoPath);
            setLogoUrl(dataUrl);
            console.log('✅ [Navbar] Logo chargé avec succès');
        } catch (error) {
            console.error('❌ [Navbar] Erreur chargement logo:', error);
            setLogoUrl(null);
        }
    };

    useEffect(() => {
        loadUserAndCabinet();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUserAndCabinet = async () => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        try {
            const cabinetInfo = await cabinetService.getCabinetInfo();
            console.log('📋 [Navbar] Cabinet info reçu:', cabinetInfo);
            setCabinet(cabinetInfo);

            // Charger le logo si disponible
            if (cabinetInfo?.logo) {
                await loadCabinetLogo(cabinetInfo.logo);
            }
        } catch (error) {
            console.error('❌ [Navbar] Erreur chargement cabinet:', error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="logo-container">
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

                            <div className="current-palette-info">
                                <span className="current-palette-name" title={getCurrentPalette()?.name}>
                                    {getCurrentPalette()?.name || 'Thème par défaut'}
                                </span>
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
                                {user?.prenom} {user?.nom}
                            </span>
                            <span className="user-role">Secrétaire</span>
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
                                    <h4>{user?.prenom} {user?.nom}</h4>
                                    <p>{user?.email || user?.login}</p>
                                    <p className="profile-role">Secrétaire</p>
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

export default Navbar;