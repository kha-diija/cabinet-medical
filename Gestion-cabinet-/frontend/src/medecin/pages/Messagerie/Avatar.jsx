import React from 'react';

const Avatar = ({ name, size = 'sm' }) => {
    const getInitials = (n) => {
        if (!n) return '?';
        return n
            .split(' ')
            .map(w => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

    return (
        <div className={`messenger-avatar ${sizeClass}`}>
            {getInitials(name)}
        </div>
    );
};

export default Avatar;