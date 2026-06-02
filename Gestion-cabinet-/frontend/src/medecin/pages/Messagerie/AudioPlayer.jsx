import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ audioPath }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(false);
    const audioRef = useRef(null);

    // Construire l'URL complète du fichier audio
    const audioUrl = audioPath ? `http://localhost:8080/uploads/${audioPath}` : null;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setError(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleError = () => {
            console.error('Erreur chargement audio:', audioUrl);
            setError(true);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioUrl]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => {
                console.error('Erreur lecture audio:', err);
                setError(true);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;

        const percent = e.target.value;
        const time = (percent / 100) * duration;
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!audioPath) {
        return <div className="audio-player-error">❌ Fichier audio introuvable</div>;
    }

    if (error) {
        return (
            <div className="audio-player-error">
                ⚠️ Impossible de lire l'audio
            </div>
        );
    }

    return (
        <div className="audio-player">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <button
                className="audio-play-btn"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Lecture'}
            >
                {isPlaying ? '⏸️' : '▶️'}
            </button>

            <div className="audio-progress-container">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="audio-progress-bar"
                />
                <div
                    className="audio-progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="audio-time">
                {formatTime(currentTime)} / {formatTime(duration)}
            </div>
        </div>
    );
};

export default AudioPlayer;