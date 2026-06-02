import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;