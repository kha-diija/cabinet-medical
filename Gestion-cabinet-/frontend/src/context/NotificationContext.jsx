import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        const notification = { id, message, type };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove après 5 secondes
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const success = (message) => addNotification(message, 'success');
    const error = (message) => addNotification(message, 'error');
    const warning = (message) => addNotification(message, 'warning');
    const info = (message) => addNotification(message, 'info');

    const value = {
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
};

const NotificationContainer = ({ notifications, onRemove }) => {
    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '8px',
                        backgroundColor: getColor(notif.type),
                        color: 'white',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        minWidth: '300px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>{notif.message}</span>
                    <button
                        onClick={() => onRemove(notif.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

const getColor = (type) => {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        case 'info': return '#3b82f6';
        default: return '#6b7280';
    }
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};