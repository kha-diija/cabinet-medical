// src/medecin/pages/Parametres/Parametres.jsx
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import passwordService from '../../services/passwordService';
import authService from '../../services/authService';
import './Parametres.css';

const Parametres = () => {
  const [formData, setFormData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    ancien: false,
    nouveau: false,
    confirmation: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const currentUser = authService.getCurrentUser();

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculer la force du mot de passe en temps réel
    if (name === 'nouveauMotDePasse') {
      const strength = passwordService.calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Réinitialiser les erreurs du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.ancienMotDePasse) {
      newErrors.ancienMotDePasse = 'L\'ancien mot de passe est requis';
    }

    if (!formData.nouveauMotDePasse) {
      newErrors.nouveauMotDePasse = 'Le nouveau mot de passe est requis';
    } else {
      const validation = passwordService.validatePasswordStrength(formData.nouveauMotDePasse);
      if (!validation.isValid) {
        newErrors.nouveauMotDePasse = validation.errors[0];
      }
    }

    if (!formData.confirmationMotDePasse) {
      newErrors.confirmationMotDePasse = 'La confirmation est requise';
    } else if (formData.nouveauMotDePasse !== formData.confirmationMotDePasse) {
      newErrors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    }

    if (formData.ancienMotDePasse === formData.nouveauMotDePasse && formData.ancienMotDePasse) {
      newErrors.nouveauMotDePasse = 'Le nouveau mot de passe doit être différent de l\'ancien';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Veuillez corriger les erreurs dans le formulaire'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await passwordService.changePassword(
        formData.ancienMotDePasse,
        formData.nouveauMotDePasse,
        formData.confirmationMotDePasse
      );

      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message
        });

        // Réinitialiser le formulaire
        setFormData({
          ancienMotDePasse: '',
          nouveauMotDePasse: '',
          confirmationMotDePasse: ''
        });
        setPasswordStrength(0);

        // Rediriger après 3 secondes
        setTimeout(() => {
          window.location.href = '/medecin/dashboard';
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: response.message
        });
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setLoading(false);
    }
  };

  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const strengthInfo = passwordService.getStrengthLabel(passwordStrength);

  return (
    <div className="parametres-container">
      <div className="parametres-header">
        <h1>Paramètres du compte</h1>
        <p className="parametres-subtitle">
          Connecté en tant que <strong>{currentUser?.nom} {currentUser?.prenom}</strong>
        </p>
      </div>

      <div className="parametres-content">
        <div className="parametres-card">
          <div className="card-header">
            <Lock size={24} />
            <h2>Modifier le mot de passe</h2>
          </div>

          {message && (
            <div className={`message message-${message.type}`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="password-form">
            {/* Ancien mot de passe */}
            <div className="form-group">
              <label htmlFor="ancienMotDePasse">
                Ancien mot de passe <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type={showPasswords.ancien ? 'text' : 'password'}
                  id="ancienMotDePasse"
                  name="ancienMotDePasse"
                  value={formData.ancienMotDePasse}
                  onChange={handleChange}
                  className={errors.ancienMotDePasse ? 'error' : ''}
                  placeholder="Entrez votre ancien mot de passe"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('ancien')}
                  tabIndex="-1"
                >
                  {showPasswords.ancien ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.ancienMotDePasse && (
                <span className="error-message">{errors.ancienMotDePasse}</span>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="form-group">
              <label htmlFor="nouveauMotDePasse">
                Nouveau mot de passe <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type={showPasswords.nouveau ? 'text' : 'password'}
                  id="nouveauMotDePasse"
                  name="nouveauMotDePasse"
                  value={formData.nouveauMotDePasse}
                  onChange={handleChange}
                  className={errors.nouveauMotDePasse ? 'error' : ''}
                  placeholder="Entrez un nouveau mot de passe"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('nouveau')}
                  tabIndex="-1"
                >
                  {showPasswords.nouveau ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.nouveauMotDePasse && (
                <span className="error-message">{errors.nouveauMotDePasse}</span>
              )}

              {/* Indicateur de force */}
              {formData.nouveauMotDePasse && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${strengthInfo.className}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: strengthInfo.color }}>
                    {strengthInfo.label}
                  </span>
                </div>
              )}

              {/* Critères du mot de passe */}
              <div className="password-criteria">
                <p className="criteria-title">Le mot de passe doit contenir :</p>
                <ul>
                  <li className={formData.nouveauMotDePasse.length >= 8 ? 'valid' : ''}>
                    {formData.nouveauMotDePasse.length >= 8 ? '✓' : '○'} Au moins 8 caractères
                  </li>
                  <li className={/[A-Z]/.test(formData.nouveauMotDePasse) ? 'valid' : ''}>
                    {/[A-Z]/.test(formData.nouveauMotDePasse) ? '✓' : '○'} Une lettre majuscule
                  </li>
                  <li className={/[a-z]/.test(formData.nouveauMotDePasse) ? 'valid' : ''}>
                    {/[a-z]/.test(formData.nouveauMotDePasse) ? '✓' : '○'} Une lettre minuscule
                  </li>
                  <li className={/[0-9]/.test(formData.nouveauMotDePasse) ? 'valid' : ''}>
                    {/[0-9]/.test(formData.nouveauMotDePasse) ? '✓' : '○'} Un chiffre
                  </li>
                  <li className={/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(formData.nouveauMotDePasse) ? 'valid' : ''}>
                    {/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(formData.nouveauMotDePasse) ? '✓' : '○'} Un caractère spécial
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirmation */}
            <div className="form-group">
              <label htmlFor="confirmationMotDePasse">
                Confirmer le nouveau mot de passe <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type={showPasswords.confirmation ? 'text' : 'password'}
                  id="confirmationMotDePasse"
                  name="confirmationMotDePasse"
                  value={formData.confirmationMotDePasse}
                  onChange={handleChange}
                  className={errors.confirmationMotDePasse ? 'error' : ''}
                  placeholder="Confirmez le nouveau mot de passe"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => togglePasswordVisibility('confirmation')}
                  tabIndex="-1"
                >
                  {showPasswords.confirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmationMotDePasse && (
                <span className="error-message">{errors.confirmationMotDePasse}</span>
              )}
            </div>

            {/* Boutons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </form>

          {/* Avertissement de sécurité */}
          <div className="security-warning">
            <AlertCircle size={20} />
            <div>
              <strong>Conseil de sécurité :</strong>
              <p>Utilisez un mot de passe unique que vous n'utilisez nulle part ailleurs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;