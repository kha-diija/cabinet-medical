import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/apiService.js';
import Avatar from './Avatar';
import EmojiPicker from './EmojiPicker';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import './Messagerie.css';

const Messagerie = () => {
    const [activeTab, setActiveTab] = useState('recus');
    const [messages, setMessages] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [selectedDestinataire, setSelectedDestinataire] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        loadMessages();
        loadMedecins();
    }, [activeTab]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        if (activeTab === 'nouveau') return;

        setLoading(true);
        setError(null);
        try {
            const data = activeTab === 'recus'
                ? await apiService.messagerie.getMessagesRecus()
                : await apiService.messagerie.getMessagesEnvoyes();

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMedecins = async () => {
        try {
            const data = await apiService.messagerie.getMedecinsDisponibles();
            setMedecins(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('⚠️ Impossible de charger les médecins');
            setMedecins([]);
        }
    };

    const loadConversation = async (utilisateurId) => {
        try {
            const data = await apiService.messagerie.getConversation(utilisateurId);
            setConversation(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur conversation:', err);
            setConversation([]);
        }
    };

    const handleMarquerLu = async (id) => {
        try {
            await apiService.messagerie.marquerCommeLu(id);
            loadMessages();
        } catch (err) {
            console.error('Marquage lu échoué', err);
        }
    };

    const handleSupprimerMessage = async (messageId) => {
        if (!window.confirm('Supprimer ce message ?')) return;

        try {
            await apiService.messagerie.supprimerMessage(messageId);
            setConversation(prev => prev.filter(msg => msg.id !== messageId));
            loadMessages();

            if (conversation.length <= 1) {
                setSelectedMessage(null);
                setSelectedDestinataire(null);
            }
        } catch (err) {
            alert(`Erreur : ${err.message}`);
        }
    };

    const handleSelectContact = (msg) => {
        setSelectedMessage(msg);
        const contactId = activeTab === 'recus' ? msg.idExpediteur : msg.idDestinataire;
        const contactName = activeTab === 'recus'
            ? `${msg.nomExpediteur || ''} ${msg.prenomExpediteur || ''}`
            : `${msg.nomDestinataire || ''} ${msg.prenomDestinataire || ''}`;

        setSelectedDestinataire({ id: contactId, nom: contactName.trim() });
        loadConversation(contactId);

        if (!msg.lu && activeTab === 'recus') {
            handleMarquerLu(msg.id);
        }
    };

    const handleNewConversation = (medecin) => {
        setSelectedDestinataire({
            id: medecin.id,
            nom: `Dr. ${medecin.nom || ''} ${medecin.prenom || ''}`.trim()
        });
        setConversation([]);
        setSelectedMessage(null);
    };

    const handleEnvoyerMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedDestinataire) return;

        try {
            const newMsg = await apiService.messagerie.envoyerMessage({
                idDestinataire: selectedDestinataire.id,
                objet: 'Conversation',
                contenu: messageText
            });

            setConversation([...conversation, newMsg]);
            setMessageText('');
            setShowEmojiPicker(false);
            loadMessages();
        } catch (err) {
            alert(`❌ ${err.message}`);
        }
    };

    const handleAudioRecorded = async (audioBlob) => {
        if (!selectedDestinataire) {
            alert('Sélectionnez un destinataire');
            return;
        }

        setIsRecording(false);

        try {
            const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
                type: 'audio/webm'
            });

            const newMsg = await apiService.messagerie.envoyerMessageAvecFichier({
                idDestinataire: selectedDestinataire.id,
                objet: 'Message vocal',
                contenu: '🎤 Message vocal'
            }, audioFile);

            setConversation([...conversation, newMsg]);
            loadMessages();
        } catch (err) {
            alert(`❌ Erreur envoi audio: ${err.message}`);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setMessageText(prev => prev + emoji);
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        if (diff < 604800000) {
            return d.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const contactName = (msg) => {
        if (activeTab === 'recus') {
            return `${msg.nomExpediteur || ''} ${msg.prenomExpediteur || ''}`.trim() || 'Inconnu';
        }
        return `${msg.nomDestinataire || ''} ${msg.prenomDestinataire || ''}`.trim() || 'Inconnu';
    };

    const getCurrentUserId = () => {
        // Essayer plusieurs sources possibles

        // 1. localStorage 'userId'
        let userId = localStorage.getItem('userId');
        if (userId) {
            console.log('✅ User ID trouvé dans localStorage.userId:', userId);
            return parseInt(userId);
        }

        // 2. localStorage 'user' (objet JSON)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.userId) {
                    console.log('✅ User ID trouvé dans localStorage.user:', user.userId);
                    return parseInt(user.userId);
                }
                if (user && user.id) {
                    console.log('✅ User ID trouvé dans localStorage.user.id:', user.id);
                    return parseInt(user.id);
                }
            } catch (e) {
                console.error('❌ Erreur parsing user:', e);
            }
        }

        // 3. sessionStorage
        userId = sessionStorage.getItem('userId');
        if (userId) {
            console.log('✅ User ID trouvé dans sessionStorage:', userId);
            return parseInt(userId);
        }

        console.error('❌ User ID introuvable dans localStorage/sessionStorage');
        return null;
    };

    const isAudioMessage = (msg) => {
        return msg.pieceJointe && (
            msg.pieceJointe.endsWith('.webm') ||
            msg.pieceJointe.endsWith('.mp3') ||
            msg.pieceJointe.endsWith('.wav') ||
            msg.contenu?.includes('🎤')
        );
    };

    return (
        <div className="messenger-container">
            {/* Header */}
            <div className="messenger-header">
                <h1 className="messenger-title">💬 Messagerie</h1>
                <div className="messenger-tabs">
                    <button
                        className={`messenger-tab ${activeTab === 'recus' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recus')}
                    >
                        📥 Reçus
                    </button>
                    <button
                        className={`messenger-tab ${activeTab === 'envoyes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('envoyes')}
                    >
                        📤 Envoyés
                    </button>
                    <button
                        className={`messenger-tab ${activeTab === 'nouveau' ? 'active' : ''}`}
                        onClick={() => setActiveTab('nouveau')}
                    >
                        ✉️ Nouveau
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="messenger-body">
                {/* Sidebar */}
                <div className="messenger-sidebar">
                    {activeTab === 'nouveau' ? (
                        <div className="messenger-contacts">
                            <div className="messenger-contacts-header">
                                <h3>📋 Sélectionnez un médecin</h3>
                            </div>
                            {medecins.length === 0 ? (
                                <div className="messenger-empty">Aucun médecin disponible</div>
                            ) : (
                                medecins.map(medecin => (
                                    <div
                                        key={medecin.id}
                                        className={`messenger-contact ${selectedDestinataire?.id === medecin.id ? 'selected' : ''}`}
                                        onClick={() => handleNewConversation(medecin)}
                                    >
                                        <Avatar name={`${medecin.nom} ${medecin.prenom}`} />
                                        <div className="messenger-contact-info">
                                            <div className="messenger-contact-name">
                                                Dr. {medecin.nom} {medecin.prenom}
                                            </div>
                                            {medecin.cabinetNom && (
                                                <div className="messenger-contact-subtitle">
                                                    🏥 {medecin.cabinetNom}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <>
                            {loading ? (
                                <div className="messenger-loading">
                                    <div className="spinner"></div>
                                    Chargement...
                                </div>
                            ) : error ? (
                                <div className="messenger-error">
                                    <span>⚠️</span> {error}
                                    <button className="messenger-retry" onClick={loadMessages}>Réessayer</button>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="messenger-empty">
                                    📭 Aucun message {activeTab === 'recus' ? 'reçu' : 'envoyé'}
                                </div>
                            ) : (
                                <div className="messenger-conversations">
                                    {messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`messenger-conversation ${selectedMessage?.id === msg.id ? 'selected' : ''} ${
                                                !msg.lu && activeTab === 'recus' ? 'unread' : ''
                                            }`}
                                            onClick={() => handleSelectContact(msg)}
                                        >
                                            <Avatar name={contactName(msg)} />
                                            <div className="messenger-conv-info">
                                                <div className="messenger-conv-name">{contactName(msg)}</div>
                                                <div className="messenger-conv-preview">
                                                    {isAudioMessage(msg) ? '🎤 Message vocal' : msg.contenu?.substring(0, 50) + '…'}
                                                </div>
                                            </div>
                                            <div className="messenger-conv-meta">
                                                <div className="messenger-conv-time">{formatTime(msg.dateEnvoi)}</div>
                                                {!msg.lu && activeTab === 'recus' && (
                                                    <div className="messenger-unread-badge"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Chat Zone */}
                <div className="messenger-chat">
                    {selectedDestinataire || selectedMessage ? (
                        <>
                            <div className="messenger-chat-header">
                                <Avatar name={selectedDestinataire?.nom || contactName(selectedMessage)} size="md" />
                                <div className="messenger-chat-header-info">
                                    <h3>{selectedDestinataire?.nom || contactName(selectedMessage)}</h3>
                                    <span className="messenger-status">En ligne</span>
                                </div>
                            </div>
                            <div className="messenger-messages">
                                {conversation.length === 0 && selectedMessage ? (
                                    <div className={`messenger-message ${
                                        selectedMessage.idExpediteur !== getCurrentUserId() ? 'received' : 'sent'
                                    }`}>
                                        <div className="messenger-message-content">
                                            {isAudioMessage(selectedMessage) ? (
                                                <AudioPlayer audioPath={selectedMessage.pieceJointe} />
                                            ) : (
                                                <div className="messenger-message-text">
                                                    {selectedMessage.contenu}
                                                </div>
                                            )}
                                            <div className="messenger-message-time">
                                                {formatTime(selectedMessage.dateEnvoi)}
                                            </div>
                                        </div>
                                        <button
                                            className="messenger-message-delete"
                                            onClick={() => handleSupprimerMessage(selectedMessage.id)}
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ) : (
                                    conversation.map((msg, idx) => {
                                        const currentUserId = getCurrentUserId();
                                        const isReceived = msg.idDestinataire === currentUserId;

                                        return (
                                            <div
                                                key={idx}
                                                className={`messenger-message ${isReceived ? 'received' : 'sent'}`}
                                            >
                                                <div className="messenger-message-content">
                                                    {isAudioMessage(msg) ? (
                                                        <AudioPlayer audioPath={msg.pieceJointe} />
                                                    ) : (
                                                        <div className="messenger-message-text">
                                                            {msg.contenu}
                                                        </div>
                                                    )}
                                                    <div className="messenger-message-time">
                                                        {formatTime(msg.dateEnvoi)}
                                                    </div>
                                                </div>
                                                <button
                                                    className="messenger-message-delete"
                                                    onClick={() => handleSupprimerMessage(msg.id)}
                                                    title="Supprimer"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="messenger-input-container">
                                {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}

                                <form onSubmit={handleEnvoyerMessage} className="messenger-input-form">
                                    <button
                                        type="button"
                                        className="messenger-emoji-btn"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        title="Ajouter un emoji"
                                    >
                                        😊
                                    </button>

                                    <textarea
                                        ref={textareaRef}
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        className="messenger-textarea"
                                        rows="1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleEnvoyerMessage(e);
                                            }
                                        }}
                                    />

                                    <AudioRecorder
                                        onRecordingComplete={handleAudioRecorded}
                                        isRecording={isRecording}
                                        setIsRecording={setIsRecording}
                                    />

                                    <button
                                        type="submit"
                                        className="messenger-send-btn"
                                        disabled={!messageText.trim()}
                                        title="Envoyer (Entrée)"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="messenger-placeholder">
                            <div className="messenger-placeholder-icon">💬</div>
                            <h3>Aucune conversation sélectionnée</h3>
                            <p>Choisissez une conversation ou créez-en une nouvelle</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messagerie;