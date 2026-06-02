import api from './api';

export const authService = {
    login: (credentials) =>
        api.post('/auth/login', credentials),

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () =>
        localStorage.getItem('token')
};