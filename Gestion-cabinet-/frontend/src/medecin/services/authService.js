// authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Créez et exportez l'instance api
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CORRECTION: Intercepteur pour ajouter le token - VERSION CORRIGÉE
api.interceptors.request.use(
  (config) => {
    //  Utilisez une fonction synchrone pour récupérer le token
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 [Interceptor] Token récupéré:', token ? `OUI (${token.substring(0, 20)}...)` : 'NON');
      
      if (token) {
        // CORRECTION: Assurez-vous que le header est bien ajouté
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 [Interceptor] Header2 Authorization ajouté:', config.headers.Authorization.substring(0, 30) + '...');
        
        // 🔥 AJOUT: Debug supplémentaire pour les routes protégées
        const isMedecinRoute = config.url?.includes('/api/medecin/') || config.baseURL?.includes('/api/medecin/');
        if (isMedecinRoute) {
          console.log('👨‍⚕️ [Interceptor] Route médecin détectée:', config.url);
          console.log('   → Token length:', token.length);
          console.log('   → Full headers:', config.headers);
        }
      } else {
        console.warn('⚠️ [Interceptor] Aucun token trouvé dans localStorage');
        console.warn('⚠️ [Interceptor] Contenu localStorage:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user')
        });
        
        // 🔥 AJOUT: Vérifier si on est sur une route qui nécessite un token
        const protectedRoutes = ['/api/medecin/', '/api/admin/', '/api/secretary/'];
        const currentUrl = config.url || '';
        const isProtected = protectedRoutes.some(route => currentUrl.includes(route));
        
        if (isProtected) {
          console.error('❌ [Interceptor] ATTENTION: Route protégée sans token!');
          console.error('   → Route:', currentUrl);
          console.error('   → Méthode:', config.method);
        }
      }
    } catch (error) {
      console.error('❌ [Interceptor] Erreur lors de la récupération du token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [Interceptor] Erreur dans request interceptor:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log('✅ [Interceptor] Réponse reçue:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ [Interceptor] Erreur de réponse:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 [Interceptor] Déconnexion (401)');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.log('🚫 [Interceptor] Accès interdit (403)');
      console.log('🔍 [Interceptor] Headers envoyés:', error.config?.headers);
      console.log('👤 [Interceptor] Utilisateur:', localStorage.getItem('user'));
      
      // 🔥 AJOUT: Analyse détaillée de l'erreur 403
      console.error('🔍 [Interceptor] Analyse erreur 403:');
      console.error('   → URL complète:', error.config?.baseURL + error.config?.url);
      console.error('   → Méthode:', error.config?.method);
      console.error('   → Token présent:', localStorage.getItem('token') ? 'OUI' : 'NON');
      console.error('   → User role:', JSON.parse(localStorage.getItem('user') || '{}').role);
      console.error('   → Data envoyée:', error.config?.data);
      console.error('   → Timestamp:', new Date().toISOString());
      
      // 🔥 AJOUT: Vérifier le format du token
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔑 [Interceptor] Analyse token:');
        console.log('   → Longueur:', token.length);
        console.log('   → Commence par "Bearer "?:', token.startsWith('Bearer '));
        console.log('   → Contient "eyJ"?:', token.includes('eyJ')); // JWT commence souvent par eyJ
        
        try {
          // Essayer de décoder le token JWT pour vérification
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            console.log('   → JWT payload:', {
              sub: payload.sub,
              exp: new Date(payload.exp * 1000),
              role: payload.role,
              userId: payload.userId
            });
            console.log('   → Token expiré?:', payload.exp * 1000 < Date.now());
          }
        } catch (e) {
          console.error('   → Token non JWT ou invalide:', e.message);
        }
      }
      
      // Vérifier si c'est un problème de token
      if (!token) {
        console.error('❌ [Interceptor] Token manquant - Redirection vers login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        // 🔥 AJOUT: Événement personnalisé pour gérer l'erreur 403
        try {
          const event = new CustomEvent('api-forbidden-error', {
            detail: {
              url: error.config?.url,
              method: error.config?.method,
              status: 403,
              timestamp: new Date().toISOString()
            }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.log('⚠️ [Interceptor] Impossible de dispatcher l\'événement:', e.message);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // CORRECTION: Méthode login améliorée
  login: async (login, password, role, cabinetId) => {
    try {
      console.log('🔐 [Auth] Tentative de connexion:', { login, role, cabinetId });
      
      // Utilisez axios directement pour le login (pas via l'instance api)
      const response = await axios.post(`${API_URL}/auth/login`, { 
        login, 
        password, 
        role, 
        cabinetId: cabinetId || null 
      });
      
      console.log('✅ [Auth] Connexion réussie, réponse:', response.data);
      
      if (response.data.token) {
        // CORRECTION: Sauvegardez le token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        console.log('💾 [Auth] Token sauvegardé dans localStorage');
        
        // CORRECTION: Configurez le header pour les futures requêtes
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('⚙️ [Auth] Header2 configuré pour api instance');
        
        // Vérification
        console.log('🔍 [Auth] Vérification:', {
          tokenInStorage: localStorage.getItem('token') ? 'OUI' : 'NON',
          headerConfigured: api.defaults.headers.common['Authorization'] ? 'OUI' : 'NON'
        });
        
        // 🔥 AJOUT: Déclencher un événement de connexion réussie
        try {
          const event = new CustomEvent('auth-login-success', {
            detail: { userId: response.data.userId, role: response.data.role }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.log('⚠️ [Auth] Impossible de dispatcher l\'événement:', e.message);
        }
      } else {
        console.error('❌ [Auth] Pas de token dans la réponse');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [Auth] Erreur de connexion:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  logout: () => {
    console.log('🚪 [Auth] Déconnexion');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    
    // 🔥 AJOUT: Événement de déconnexion
    try {
      const event = new CustomEvent('auth-logout');
      window.dispatchEvent(event);
    } catch (e) {
      console.log('⚠️ [Auth] Impossible de dispatcher l\'événement:', e.message);
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    console.log('🔍 [Auth] Authentifié?', token ? 'OUI' : 'NON');
    return !!token;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('👤 [Auth] Utilisateur actuel:', user?.login);
    return user;
  },

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    const hasRole = user && user.role === role;
    console.log(`🎭 [Auth] Rôle ${role}?`, hasRole);
    return hasRole;
  },

  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    console.log('🔑 [Auth] Token pour header:', token ? 'OUI' : 'NON');
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
  
  getToken: () => {
    const token = localStorage.getItem('token');
    console.log('🔑 [Auth] Token récupéré:', token ? `OUI (${token.substring(0, 20)}...)` : 'NON');
    return token;
  },

  // NOUVELLE: Méthode pour vérifier l'état d'authentification
  checkAuthStatus: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 [Auth] État complet:', {
      tokenPresent: !!token,
      tokenLength: token ? token.length : 0,
      userPresent: !!user,
      userData: user ? JSON.parse(user) : null,
      apiHeaders: api.defaults.headers.common
    });
    
    return {
      isAuthenticated: !!token,
      token,
      user: user ? JSON.parse(user) : null
    };
  },
  
  // NOUVELLE: Méthode pour forcer la configuration des headers
  forceSetupHeaders: () => {
    const token = localStorage.getItem('token');
    console.log('⚙️ [Auth] Configuration forcée des headers');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ [Auth] Header2 forcé configuré');
    } else {
      console.warn('⚠️ [Auth] Pas de token pour configurer les headers');
      delete api.defaults.headers.common['Authorization'];
    }
  },
  
  // 🔥 AJOUT: NOUVELLE méthode pour diagnostiquer les problèmes d'authentification
  diagnoseAuthIssue: () => {
    console.log('🔍 [Auth] Diagnostic des problèmes d\'authentification:');
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const diagnostics = {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasUser: !!user,
      userRole: user?.role,
      userId: user?.userId,
      apiHeaderSet: !!api.defaults.headers.common['Authorization'],
      localStorageKeys: Object.keys(localStorage),
      tokenStartsWithBearer: token ? token.startsWith('Bearer ') : false,
      isTokenJWT: token ? token.split('.').length === 3 : false,
      currentTime: new Date().toISOString()
    };
    
    console.table(diagnostics);
    
    // Vérifier si le token est un JWT valide
    if (token && token.split('.').length === 3) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('🔑 [Auth] Décodage JWT:');
        console.log('   → Subject:', payload.sub);
        console.log('   → Expiration:', new Date(payload.exp * 1000));
        console.log('   → Rôles:', payload.roles || payload.role);
        console.log('   → Expiré?:', payload.exp * 1000 < Date.now());
        
        diagnostics.jwtPayload = payload;
        diagnostics.tokenExpired = payload.exp * 1000 < Date.now();
      } catch (e) {
        console.error('   → Erreur décodage JWT:', e.message);
        diagnostics.jwtError = e.message;
      }
    }
    
    return diagnostics;
  },
  
  // 🔥 AJOUT: NOUVELLE méthode pour tester une requête
  testProtectedRequest: async (url = '/api/medecin/test') => {
    console.log('🧪 [Auth] Test de requête protégée vers:', url);
    
    try {
      const response = await api.get(url);
      console.log('✅ [Auth] Test réussi:', {
        status: response.status,
        data: response.data
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ [Auth] Test échoué:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  },
  
  // 🔥 AJOUT: NOUVELLE méthode pour rafraîchir le token
  refreshTokenIfNeeded: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ [Auth] Pas de token à rafraîchir');
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Si le token expire dans moins de 5 minutes, le rafraîchir
      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('🔄 [Auth] Token expirant bientôt, tentative de rafraîchissement...');
        // Ici vous devriez appeler votre endpoint de rafraîchissement de token
        // Exemple: const response = await api.post('/api/auth/refresh', { token });
        console.log('⚠️ [Auth] Fonctionnalité de rafraîchissement à implémenter');
        return false;
      }
      
      console.log('✅ [Auth] Token valide encore pour', Math.floor(timeUntilExpiry / 60000), 'minutes');
      return true;
    } catch (e) {
      console.error('❌ [Auth] Erreur vérification token:', e);
      return false;
    }
  }
};

// Initialiser les headers au chargement
authService.forceSetupHeaders();

// 🔥 AJOUT: Écouter les erreurs 403 depuis d'autres parties de l'application
window.addEventListener('api-forbidden-error', (event) => {
  console.log('🚨 [Auth] Événement erreur 403 reçu:', event.detail);
  
  // Vous pouvez ajouter ici une logique pour afficher une notification à l'utilisateur
  if (window.showNotification) {
    window.showNotification('Accès refusé. Vérifiez vos permissions.', 'error');
  }
});

export default authService;