import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete, isRecording, setIsRecording }) => {
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                onRecordingComplete(audioBlob);

                // Arrêter le stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Erreur microphone:', error);
            alert('❌ Impossible d\'accéder au microphone. Vérifiez les permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
            audioChunksRef.current = [];

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Arrêter le stream
            const stream = mediaRecorderRef.current.stream;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isRecording) {
        return (
            <div className="audio-recorder-active">
                <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    <span className="recording-time">{formatTime(recordingTime)}</span>
                </div>
                <button
                    type="button"
                    className="audio-cancel-btn"
                    onClick={cancelRecording}
                    title="Annuler"
                >
                    ❌
                </button>
                <button
                    type="button"
                    className="audio-stop-btn"
                    onClick={stopRecording}
                    title="Envoyer l'audio"
                >
                    ✅
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            className="messenger-audio-btn"
            onClick={startRecording}
            title="Enregistrer un message vocal"
        >
            🎤
        </button>
    );
};

export default AudioRecorder;