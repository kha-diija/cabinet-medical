import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  AlertCircle,
  User
} from 'lucide-react';
import ordonnanceService from '../../services/ordonnancepService';
import DocumentService from '../../components/layout/documentService';  // Ajouter cet import
import './OrdonnancesPage.css';

const OrdonnancesPage = () => {
  const [activeTab, setActiveTab] = useState('medicaments');
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  
  // État pour ordonnance médicaments
  const [contenuMedicaments, setContenuMedicaments] = useState('');
  const [medicamentSuggestions, setMedicamentSuggestions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // État pour ordonnance examens
  const [examens, setExamens] = useState([
    { typeExamen: '', indications: '', urgent: false }
  ]);
  
  // État pour les ordonnances sauvegardées
  const [ordonnancesSaved, setOrdonnancesSaved] = useState([]);
  const [saving, setSaving] = useState(false);

  // Récupérer les infos du cabinet
  const [cabinet, setCabinet] = useState(null);

  // ✅ Charger la consultation EN_COURS
  useEffect(() => {
    const fetchConsultationEnCours = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await ordonnanceService.getConsultationEnCours();
        
        // ✅ GESTION CLAIRE: Pas de consultation en cours
        if (!data) {
          setConsultation(null);
          setError(null); // Ne pas afficher d'erreur, juste l'état vide
          return;
        }

        setConsultation(data);
        
        // Charger les ordonnances existantes
        if (data.idConsultation) {
          await fetchOrdonnances(data.idConsultation);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setConsultation(null);
        setError(err.message || 'Erreur lors de la récupération de la consultation');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultationEnCours();
  }, []);

  // ✅ NOUVELLE FONCTION : Charger le logo avec authentification
const loadCabinetLogo = async (logoPath) => {
  if (!logoPath) {
    console.log('📋 [Ordonnance] Pas de logo à charger');
    setLogoDataUrl(null);
    return;
  }

  try {
    console.log('🔍 [Ordonnance] Chargement du logo:', logoPath);
    const dataUrl = await DocumentService.loadAsDataUrl(logoPath);
    setLogoDataUrl(dataUrl);
    console.log('✅ [Ordonnance] Logo chargé avec succès');
  } catch (error) {
    console.error('❌ [Ordonnance] Erreur chargement logo:', error);
    setLogoDataUrl(null);
  }
};

  // Charger les infos du cabinet
 // Charger les infos du cabinet
useEffect(() => {
  const loadCabinetInfo = async () => {
    try {
      const { default: cabinetService } = await import('../../services/cabinetService');
      const cabinetInfo = await cabinetService.getCabinetInfo();
      setCabinet(cabinetInfo);
      
      // ✅ AJOUTER : Charger le logo si disponible
      if (cabinetInfo?.logo) {
        await loadCabinetLogo(cabinetInfo.logo);
      }
    } catch (err) {
      console.error('Erreur chargement cabinet:', err);
    }
  };
  
  loadCabinetInfo();
}, []);

  // Charger les ordonnances existantes
  const fetchOrdonnances = async (consultationId) => {
    try {
      const data = await ordonnanceService.getOrdonnancesByConsultation(consultationId);
      setOrdonnancesSaved(data);
    } catch (err) {
      console.error('Erreur chargement ordonnances:', err);
    }
  };

  // Rechercher des médicaments
  const searchMedicaments = async (query) => {
    if (!query || query.length < 2) {
      setMedicamentSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const data = await ordonnanceService.searchMedicaments(query);
      setMedicamentSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error('Erreur recherche médicaments:', err);
      setMedicamentSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Gérer la saisie des médicaments avec autocomplétion
  const handleMedicamentInput = (e) => {
    const value = e.target.value;
    setContenuMedicaments(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      const lines = value.split('\n');
      const currentLine = lines[lines.length - 1];
      const lastWord = currentLine.trim();
      
      if (lastWord.length >= 2) {
        searchMedicaments(lastWord);
      } else {
        setMedicamentSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    setSearchTimeout(newTimeout);
  };

  // Insérer un médicament sélectionné
  const insertMedicament = (medicament) => {
    const lines = contenuMedicaments.split('\n');
    const lastLineIndex = lines.length - 1;
    
    const medicamentText = `${medicament.nom} ${medicament.forme || ''} ${medicament.dosage || ''}`.trim();
    lines[lastLineIndex] = medicamentText;
    
    setContenuMedicaments(lines.join('\n') + '\n');
    setMedicamentSuggestions([]);
    setShowSuggestions(false);
  };

  // Ajouter un examen
  const addExamen = () => {
    setExamens([...examens, { typeExamen: '', indications: '', urgent: false }]);
  };

  // Supprimer un examen
  const removeExamen = (index) => {
    const newExamens = examens.filter((_, i) => i !== index);
    setExamens(newExamens);
  };

  // Mettre à jour un examen
  const updateExamen = (index, field, value) => {
    const newExamens = [...examens];
    newExamens[index][field] = value;
    setExamens(newExamens);
  };

  // Sauvegarder ordonnance médicaments
  const saveOrdonnanceMedicaments = async () => {
    if (!contenuMedicaments.trim()) {
      setError('Veuillez saisir au moins un médicament');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!consultation || !consultation.idConsultation) {
      setError('Aucune consultation en cours. Veuillez créer une consultation d\'abord.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await ordonnanceService.createOrdonnanceMedicaments(contenuMedicaments);
      setSuccess('Ordonnance médicaments sauvegardée avec succès');
      setOrdonnancesSaved([...ordonnancesSaved, data]);
      setContenuMedicaments('');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Sauvegarder ordonnance examens
  const saveOrdonnanceExamens = async () => {
    const validExamens = examens.filter(e => e.typeExamen.trim());
    
    if (validExamens.length === 0) {
      setError('Veuillez ajouter au moins un examen');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!consultation || !consultation.idConsultation) {
      setError('Aucune consultation en cours. Veuillez créer une consultation d\'abord.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const contenu = validExamens.map(e => 
      `${e.typeExamen}${e.urgent ? ' (URGENT)' : ''}\n${e.indications || 'Aucune indication'}`
    ).join('\n\n');

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await ordonnanceService.createOrdonnanceExamens(contenu, validExamens);
      setSuccess('Ordonnance examens sauvegardée avec succès');
      setOrdonnancesSaved([...ordonnancesSaved, data]);
      setExamens([{ typeExamen: '', indications: '', urgent: false }]);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Télécharger l'ordonnance avec style moderne
  const printOrdonnance = async (ordonnance) => {
const logoUrl = logoDataUrl || '';  // ✅ Utiliser la Data URL chargée    const cabinetNom = cabinet?.nom || 'Cabinet Médical';
    const cabinetAdresse = cabinet?.adresse || '';
    const cabinetTel = cabinet?.tel || '';
    const cabinetEmail = cabinet?.email || 'contact@cabinet.ma';
    const cabinetSpecialite = cabinet?.specialite || 'Médecine Générale';
        const cabinetNom = cabinet?.nom || 'Cabinet Médical';

    const logoDisplay = logoUrl ? 
      `<img src="${logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;" />` : 
      `<div style="font-size: 180px; color: #3b82f6; opacity: 1;">⚕</div>`;
    
    const logoHeader = logoUrl ? 
      `<img src="${logoUrl}" alt="Logo" style="width: 50px; height: 50px; object-fit: contain;" />` : 
      `<span style="font-size: 35px; color: #3b82f6;">⚕</span>`;
    
    const content = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Ordonnance_${ordonnance.patientNom}_${ordonnance.patientPrenom}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4; margin: 0; }
          body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #1e293b; background: white; }
          .page { width: 210mm; height: 277mm; background: white; position: relative; display: flex; flex-direction: column; }          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 25px 30px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 4px solid #1e40af;
          }
          .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 5px; }
          .header p { font-size: 13px; opacity: 0.95; margin: 2px 0; }
          .logo-circle {
            width: 70px;
            height: 70px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          .content { padding: 20px 30px; position: relative; flex: 1; display: flex; flex-direction: column; }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 690px;
            height: 690px;
            opacity: 0.22;
            z-index: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .content-wrapper { position: relative; z-index: 1; }
          .ordonnance-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
          }
          .badge {
            display: inline-block;
            background: #ecf0f1;
            color: #3b82f6;
            padding: 8px 18px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .date-badge {
            background: white;
            color: #3b82f6;
            border: 2px solid #3b82f6;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          .patient-info {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            background: #f8fafc;
          }
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child { border: none; }
          .label {
            width: 140px;
            color: #64748b;
            font-size: 13px;
            font-weight: 600;
          }
          .value {
            flex: 1;
            color: #1e293b;
            font-weight: 600;
            font-size: 14px;
          }
          .prescription {
            min-height: 40px;
            padding: 5px 10px;
            font-size: 16px;
            line-height: 2.2;
            white-space: pre-line;
            border-top: 2px solid #e5e7eb;
            margin: 0px 0;
          }
          .signature {
            margin-top: 30px;
            text-align: right;
            transform: translateY(550%);
          }
          .sig-line {
            width: 220px;
            margin-left: auto;
            padding-top: 40px;
            border-top: 2px solid #bdc3c7;
            font-size: 11px;
            color: #7f8c8d;
            text-align: center;
            font-weight: 600;
          }
          .footer {
            padding: 15px 25px;
            margin-top: auto;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 20px 30px;
            color: white;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
          .footer-info { display: flex; gap: 25px; flex-wrap: wrap; }
          .footer-item { display: flex; align-items: center; gap: 6px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .page { margin: 0; box-shadow: none; }
            .footer { position: fixed; bottom: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div>
              <h1>Dr. ${ordonnance.medecinNom} ${ordonnance.medecinPrenom}</h1>
              <p>${cabinetSpecialite}</p>
              ${cabinetTel ? `<p>📞 ${cabinetTel}</p>` : ''}
            </div>
            <div class="logo-circle">${logoHeader}</div>
          </div>
          <div class="content">
            <div class="watermark">${logoDisplay}</div>
            <div class="content-wrapper">
              <div class="ordonnance-header">
                <span class="badge">
                  ${ordonnance.type === 'MEDICAMENTS' ? '💊 ORDONNANCE MÉDICALE' : '🔬 ORDONNANCE EXAMENS'}
                </span>
                <span class="date-badge">
                  ${new Date(ordonnance.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div class="patient-info">
                <div class="info-row">
                  <span class="label">Nom du Patient :</span>
                  <span class="value">${ordonnance.patientNom} ${ordonnance.patientPrenom}</span>
                </div>
                ${ordonnance.patientCin ? `
                <div class="info-row">
                  <span class="label">CIN :</span>
                  <span class="value">${ordonnance.patientCin}</span>
                </div>` : ''}
                ${ordonnance.patientDateNaissance ? `
                <div class="info-row">
                  <span class="label">Date de Naissance :</span>
                  <span class="value">${new Date(ordonnance.patientDateNaissance).toLocaleDateString('fr-FR')}</span>
                </div>` : ''}
                ${ordonnance.patientTel ? `
                <div class="info-row">
                  <span class="label">Téléphone :</span>
                  <span class="value">${ordonnance.patientTel}</span>
                </div>` : ''}
                <div class="info-row">
                  <span class="label">Date Consultation :</span>
                  <span class="value">${new Date(ordonnance.date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div class="prescription">${ordonnance.contenu}</div>
              <div class="signature">
                <div class="sig-line">SIGNATURE & CACHET</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <div>
              <div class="footer-title">${cabinetNom}</div>
              <div>${cabinetSpecialite}</div>
            </div>
            <div class="footer-info">
              ${cabinetTel ? `<div class="footer-item">📞 ${cabinetTel}</div>` : ''}
              ${cabinetAdresse ? `<div class="footer-item">📍 ${cabinetAdresse}</div>` : ''}
              ${cabinetEmail ? `<div class="footer-item">✉️ ${cabinetEmail}</div>` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ordonnance_${ordonnance.patientNom}_${ordonnance.patientPrenom}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="ordonnances-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ordonnances-page">
      {/* Header2 */}
      <div className="ordonnances-header">
        <div className="header-left">
          <FileText size={32} />
          <div>
            <h1>Ordonnances</h1>
            <p className="subtitle">Prescrire des médicaments et examens</p>
          </div>
        </div>
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <FileText size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* ✅ AFFICHAGE CONDITIONNEL: Pas de consultation en cours */}
      {!consultation ? (
        <div className="no-consultation-card">
          <User size={48} className="no-consultation-icon" />
          <h3>Pas encore de consultation pour ce patient</h3>
          <p>Veuillez créer une consultation depuis la page Consultation pour pouvoir prescrire des ordonnances.</p>
        </div>
      ) : (
        <div className="ordonnances-content">
          {/* Informations patient */}
          <div className="patient-info-card">
            <div className="patient-info-header">
              <User size={24} />
              <h3>Patient en consultation</h3>
            </div>
            <div className="patient-info-grid">
              <div className="patient-info-item">
                <span className="label">Nom complet</span>
                <span className="value">{consultation.patientNom} {consultation.patientPrenom}</span>
              </div>
              <div className="patient-info-item">
                <span className="label">CIN</span>
                <span className="value">{consultation.patientCin || 'Non renseigné'}</span>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="ordonnances-tabs-container">
            <div className="ordonnances-tabs">
              <button
                onClick={() => setActiveTab('medicaments')}
                className={`tab-button ${activeTab === 'medicaments' ? 'active' : ''}`}
              >
                Ordonnances Médicaments
              </button>
              <button
                onClick={() => setActiveTab('examens')}
                className={`tab-button ${activeTab === 'examens' ? 'active' : ''}`}
              >
                Ordonnances Examens
              </button>
            </div>

            <div className="tab-content">
              {/* Onglet Médicaments */}
              {activeTab === 'medicaments' && (
                <div className="tab-panel">
                  <h3>Prescription de médicaments</h3>
                  
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label htmlFor="medicaments">Médicaments prescrits</label>
                    <textarea
                      id="medicaments"
                      className="medicaments-textarea"
                      value={contenuMedicaments}
                      onChange={handleMedicamentInput}
                      onFocus={() => contenuMedicaments && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Commencez à taper le nom d'un médicament... (ex: Paracetamol)"
                      disabled={saving}
                    />
                    
                    {showSuggestions && medicamentSuggestions.length > 0 && (
                      <div className="medicament-suggestions">
                        {medicamentSuggestions.map((med) => (
                          <button
                            key={med.id}
                            onClick={() => insertMedicament(med)}
                            className="suggestion-item"
                            type="button"
                          >
                            <div className="suggestion-name">{med.nom}</div>
                            <div className="suggestion-details">
                              {med.forme} {med.dosage} {med.laboratoire && `- ${med.laboratoire}`}
                            </div>
                            {med.dci && (
                              <div className="suggestion-dci">DCI: {med.dci}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={saveOrdonnanceMedicaments}
                      className="btn btn-primary"
                      disabled={saving || !contenuMedicaments.trim()}
                    >
                      <Save size={20} />
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Examens */}
              {activeTab === 'examens' && (
                <div className="tab-panel">
                  <h3>Prescription d'examens complémentaires</h3>
                  
                  <div className="examens-list">
                    {examens.map((examen, index) => (
                      <div key={index} className="examen-card">
                        <div className="examen-header">
                          <h4>Examen {index + 1}</h4>
                          {examens.length > 1 && (
                            <button
                              onClick={() => removeExamen(index)}
                              className="btn-icon btn-danger"
                              type="button"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Type d'examen *</label>
                          <input
                            type="text"
                            value={examen.typeExamen}
                            onChange={(e) => updateExamen(index, 'typeExamen', e.target.value)}
                            placeholder="Ex: Radiographie thoracique, Bilan sanguin..."
                            disabled={saving}
                          />
                        </div>

                        <div className="form-group">
                          <label>Indications</label>
                          <textarea
                            value={examen.indications}
                            onChange={(e) => updateExamen(index, 'indications', e.target.value)}
                            placeholder="Indications médicales..."
                            rows={3}
                            disabled={saving}
                          />
                        </div>

                        <div className="form-checkbox">
                          <input
                            type="checkbox"
                            id={`urgent-${index}`}
                            checked={examen.urgent}
                            onChange={(e) => updateExamen(index, 'urgent', e.target.checked)}
                            disabled={saving}
                          />
                          <label htmlFor={`urgent-${index}`}>Examen urgent</label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={addExamen}
                      className="btn btn-secondary"
                      type="button"
                      disabled={saving}
                    >
                      <Plus size={20} />
                      Ajouter un examen
                    </button>
                    <button
                      onClick={saveOrdonnanceExamens}
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      <Save size={20} />
                      {saving ? 'Enregistrement...' : 'Enregistrer tous les examens'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ordonnances sauvegardées */}
          {ordonnancesSaved.length > 0 && (
            <div className="ordonnances-saved">
              <h3>Ordonnances de cette consultation</h3>
              <div className="ordonnances-list">
                {ordonnancesSaved.map((ord) => (
                  <div key={ord.id} className="ordonnance-item">
                    <div className="ordonnance-info">
                      <FileText size={20} />
                      <div>
                        <p className="ordonnance-type">
                          {ord.type === 'MEDICAMENTS' ? 'Ordonnance Médicaments' : 'Ordonnance Examens'}
                        </p>
                        <p className="ordonnance-date">
                          {new Date(ord.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => printOrdonnance(ord)}
                      className="btn btn-primary"
                    >
                      <Printer size={18} />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdonnancesPage;