import React, { useState, useEffect } from 'react';
import './PatientFormModal.css';

const PatientFormModal = ({ patient, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        cin: '',
        dateNaissance: '',
        telephone: '',
        email: '',
        adresse: '',
        sexe: 'HOMME',
        groupeSanguin: '',
        antecedentsMedicaux: '',
        allergies: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (patient) {
            setFormData({
                nom: patient.nom || '',
                prenom: patient.prenom || '',
                cin: patient.cin || '',
                dateNaissance: patient.dateNaissance || '',
                telephone: patient.telephone || '',
                email: patient.email || '',
                adresse: patient.adresse || '',
                sexe: patient.sexe || 'HOMME',
                groupeSanguin: patient.groupeSanguin || '',
                antecedentsMedicaux: patient.antecedentsMedicaux || '',
                allergies: patient.allergies || ''
            });
        }
    }, [patient]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nom?.trim()) {
            newErrors.nom = 'Le nom est requis';
        }
        if (!formData.prenom?.trim()) {
            newErrors.prenom = 'Le prénom est requis';
        }
        if (!formData.cin?.trim()) {
            newErrors.cin = 'Le CIN est requis';
        } else if (!/^[A-Z]{1,2}[0-9]{6}$/i.test(formData.cin)) {
            newErrors.cin = 'Format CIN invalide (ex: AB123456)';
        }
        if (!formData.dateNaissance) {
            newErrors.dateNaissance = 'La date de naissance est requise';
        }


        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email invalide';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content patient-form-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{patient ? '✏️ Modifier Patient' : '➕ Nouveau Patient'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="patient-form">
                    <div className="form-section">
                        <h3>📋 Informations Personnelles</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nom">Nom *</label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className={errors.nom ? 'error' : ''}
                                    placeholder="Nom de famille"
                                />
                                {errors.nom && <span className="error-message">{errors.nom}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="prenom">Prénom *</label>
                                <input
                                    type="text"
                                    id="prenom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    className={errors.prenom ? 'error' : ''}
                                    placeholder="Prénom"
                                />
                                {errors.prenom && <span className="error-message">{errors.prenom}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="cin">CIN *</label>
                                <input
                                    type="text"
                                    id="cin"
                                    name="cin"
                                    value={formData.cin}
                                    onChange={handleChange}
                                    className={errors.cin ? 'error' : ''}
                                    placeholder="AB123456"
                                    maxLength={8}
                                />
                                {errors.cin && <span className="error-message">{errors.cin}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="dateNaissance">Date de Naissance *</label>
                                <input
                                    type="date"
                                    id="dateNaissance"
                                    name="dateNaissance"
                                    value={formData.dateNaissance}
                                    onChange={handleChange}
                                    className={errors.dateNaissance ? 'error' : ''}
                                />
                                {errors.dateNaissance && <span className="error-message">{errors.dateNaissance}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="sexe">Sexe *</label>
                                <select
                                    id="sexe"
                                    name="sexe"
                                    value={formData.sexe}
                                    onChange={handleChange}
                                >
                                    <option value="HOMME">Homme</option>
                                    <option value="FEMME">Femme</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="groupeSanguin">Groupe Sanguin</label>
                                <select
                                    id="groupeSanguin"
                                    name="groupeSanguin"
                                    value={formData.groupeSanguin}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>📞 Coordonnées</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="telephone">Téléphone *</label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className={errors.telephone ? 'error' : ''}
                                    placeholder="0612345678"
                                />
                                {errors.telephone && <span className="error-message">{errors.telephone}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    placeholder="email@exemple.com"
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="adresse">Adresse</label>
                            <input
                                type="text"
                                id="adresse"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                placeholder="Adresse complète"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>🏥 Informations Médicales</h3>

                        <div className="form-group">
                            <label htmlFor="antecedentsMedicaux">Antécédents Médicaux</label>
                            <textarea
                                id="antecedentsMedicaux"
                                name="antecedentsMedicaux"
                                value={formData.antecedentsMedicaux}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Maladies chroniques, opérations passées..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="allergies">Allergies</label>
                            <textarea
                                id="allergies"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Allergies médicamenteuses ou alimentaires..."
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Annuler
                        </button>
                        <button type="button" className="btn-primary" onClick={handleSubmit}>
                            {patient ? '💾 Enregistrer' : '➕ Créer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientFormModal;