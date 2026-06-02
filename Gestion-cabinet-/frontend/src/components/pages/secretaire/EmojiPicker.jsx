import React from 'react';

const EmojiPicker = ({ onEmojiSelect }) => {
    const emojis = [
        '😊', '😂', '❤️', '👍', '🙏', '😢',
        '😡', '🎉', '💯', '🔥', '✅', '❌',
        '⚠️', '📝', '💊', '🏥', '🩺', '💉',
        '🤒', '😷', '🤕', '👨‍⚕️', '👩‍⚕️', '🚑'
    ];

    return (
        <div className="emoji-picker">
            {emojis.map((emoji, idx) => (
                <button
                    key={idx}
                    type="button"
                    className="emoji-btn"
                    onClick={() => onEmojiSelect(emoji)}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default EmojiPicker;