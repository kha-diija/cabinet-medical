import React, { useState, useEffect } from 'react';
import { AlertCircle, FileText, Save, X, User, Edit2, Heart, Pill, Activity, Cigarette, Info } from 'lucide-react';
import dossierMedicalService from '../../services/dossierMedicalService';
import dashboardService from '../../services/dashboardService';
import './DossierMedicalPage.css';

const DossierMedicalPage = () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [dossierMedical, setDossierMedical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewDossier, setIsNewDossier] = useState(true);

  const [formData, setFormData] = useState({
    antMedicaux: '',
    antChirug: '',
    allergies: '',
    traitement: '',
    habitudes: ''
  });

  useEffect(() => {
    loadCurrentPatientAndDossier();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPatient && isEditing) {
        dossierMedicalService.saveDraft(formData);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, currentPatient, isEditing]);

  const loadCurrentPatientAndDossier = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboard = await dashboardService.getDashboardData();
      
      if (!dashboard.currentPatient) {
        setError('Aucun patient en cours. Veuillez sélectionner un patient depuis le tableau de bord.');
        setLoading(false);
        return;
      }

      setCurrentPatient(dashboard.currentPatient);

      const dossier = await dossierMedicalService.getCurrentPatientDossierMedical();
      
      if (dossier && dossier.idDossier) {
        setDossierMedical(dossier);
        setIsNewDossier(false);
        setIsEditing(false);
        setFormData({
          antMedicaux: dossier.antMedicaux || '',
          antChirug: dossier.antChirug || '',
          allergies: dossier.allergies || '',
          traitement: dossier.traitement || '',
          habitudes: dossier.habitudes || ''
        });
      } else {
        setDossierMedical(dossier);
        setIsNewDossier(true);
        setIsEditing(true);
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    if (isNewDossier) {
      setFormData({
        antMedicaux: '',
        antChirug: '',
        allergies: '',
        traitement: '',
        habitudes: ''
      });
    } else {
      setFormData({
        antMedicaux: dossierMedical.antMedicaux || '',
        antChirug: dossierMedical.antChirug || '',
        allergies: dossierMedical.allergies || '',
        traitement: dossierMedical.traitement || '',
        habitudes: dossierMedical.habitudes || ''
      });
      setIsEditing(false);
    }
    dossierMedicalService.clearDraft();
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPatient) {
      setError('Aucun patient sélectionné');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result;
      
      if (isNewDossier) {
        result = await dossierMedicalService.createDossierMedical(formData);
        setSuccess('Dossier médical créé avec succès !');
        setIsNewDossier(false);
      } else {
        result = await dossierMedicalService.updateDossierMedical(formData);
        setSuccess('Dossier médical mis à jour avec succès !');
      }
      
      setDossierMedical(result);
      setIsEditing(false);
      dossierMedicalService.clearDraft();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return '';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  if (loading) {
    return (
      <div className="dossier-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="dossier-page">
        <div className="no-patient">
          <User size={40} />
          <h3>Aucun patient en cours</h3>
          <p>Veuillez sélectionner un patient depuis le tableau de bord.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dossier-page">
      <div className="page-header">
        <div className="header-content">
          <FileText size={28} />
          <div>
            <h1>Dossier Médical</h1>
            <p>{isNewDossier ? 'Créer le dossier' : (isEditing ? 'Modifier le dossier' : 'Consulter le dossier')}</p>
          </div>
        </div>
        
        {!isNewDossier && !isEditing && (
          <button onClick={handleEdit} className="btn-edit">
            <Edit2 size={18} />
            Modifier
          </button>
        )}
      </div>

      {error && (
        <div className="alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert success">
          <FileText size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="patient-card">
        <div className="patient-header">
          <User size={20} />
          <h3>Patient en cours</h3>
          {isNewDossier && <span className="badge new">Nouveau dossier</span>}
          {!isNewDossier && !isEditing && <span className="badge existing">Dossier existant</span>}
          {!isNewDossier && isEditing && <span className="badge edit">En modification</span>}
        </div>
        <div className="patient-grid">
          <div className="info-item">
            <span className="label">Nom complet</span>
            <span className="value">{dossierMedical?.patientNom} {dossierMedical?.patientPrenom}</span>
          </div>
          <div className="info-item">
            <span className="label">CIN</span>
            <span className="value">{dossierMedical?.patientCin}</span>
          </div>
          <div className="info-item">
            <span className="label">Date de naissance</span>
            <span className="value">
              {dossierMedical?.patientDateNaissance && 
                new Date(dossierMedical.patientDateNaissance).toLocaleDateString('fr-FR')}
              {dossierMedical?.patientDateNaissance && (
                <span className="age">{calculateAge(dossierMedical.patientDateNaissance)}</span>
              )}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Téléphone</span>
            <span className="value">{dossierMedical?.patientTel || 'Non renseigné'}</span>
          </div>
        </div>
      </div>

      {!isEditing && !isNewDossier ? (
        <div className="dossier-view">
          <div className="view-section">
            <div className="section-header">
              <Heart size={18} />
              <h3>Antécédents médicaux</h3>
            </div>
            <p className="section-content">{dossierMedical?.antMedicaux || 'Aucune information'}</p>
          </div>

          <div className="view-section">
            <div className="section-header">
              <Activity size={18} />
              <h3>Antécédents chirurgicaux</h3>
            </div>
            <p className="section-content">{dossierMedical?.antChirug || 'Aucune information'}</p>
          </div>

          <div className="view-section">
            <div className="section-header">
              <AlertCircle size={18} />
              <h3>Allergies</h3>
            </div>
            <p className="section-content allergies">{dossierMedical?.allergies || 'Aucune allergie connue'}</p>
          </div>

          <div className="view-section">
            <div className="section-header">
              <Pill size={18} />
              <h3>Traitement en cours</h3>
            </div>
            <p className="section-content">{dossierMedical?.traitement || 'Aucun traitement'}</p>
          </div>

          <div className="view-section">
            <div className="section-header">
              <Cigarette size={18} />
              <h3>Habitudes de vie</h3>
            </div>
            <p className="section-content">{dossierMedical?.habitudes || 'Non renseigné'}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="dossier-form">
          <div className="form-section">
            <div className="section-header">
              <Heart size={18} />
              <h3>Antécédents médicaux</h3>
            </div>
            <textarea
              name="antMedicaux"
              value={formData.antMedicaux}
              onChange={handleInputChange}
              rows={4}
              placeholder="Maladies, pathologies chroniques..."
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <Activity size={18} />
              <h3>Antécédents chirurgicaux</h3>
            </div>
            <textarea
              name="antChirug"
              value={formData.antChirug}
              onChange={handleInputChange}
              rows={4}
              placeholder="Opérations, interventions..."
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <AlertCircle size={18} />
              <h3>Allergies</h3>
            </div>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              rows={3}
              placeholder="Allergies connues..."
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <Pill size={18} />
              <h3>Traitement en cours</h3>
            </div>
            <textarea
              name="traitement"
              value={formData.traitement}
              onChange={handleInputChange}
              rows={4}
              placeholder="Médicaments actuels..."
            />
          </div>

          <div className="form-section">
            <div className="section-header">
              <Cigarette size={18} />
              <h3>Habitudes de vie</h3>
            </div>
            <textarea
              name="habitudes"
              value={formData.habitudes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Tabac, alcool, activité physique..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel" disabled={saving}>
              <X size={18} />
              Annuler
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              <Save size={18} />
              {saving ? 'Enregistrement...' : (isNewDossier ? 'Créer' : 'Enregistrer')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DossierMedicalPage;