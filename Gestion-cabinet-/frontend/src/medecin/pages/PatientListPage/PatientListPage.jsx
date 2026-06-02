import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, UserPlus, Phone, Calendar, MapPin, Mail } from 'lucide-react';
import patientService from '../../services/patientService';
import { debounce } from 'lodash';
import './PatientListPage.css';

const PatientListPage = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);

    // Calculer l'âge
    const calculateAge = (dateNaissance) => {
        if (!dateNaissance) return 'N/A';
        const birthDate = new Date(dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Formater la date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    // Charger tous les patients au démarrage
    useEffect(() => {
        loadAllPatients();
    }, []);

    const loadAllPatients = async () => {
        setIsLoading(true);
        try {
            const data = await patientService.getAllPatients();
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            console.error('Erreur chargement patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Recherche avec debounce
    const debounceSearch = useCallback(
        debounce(async (query) => {
            if (query.length >= 2) {
                setIsSearching(true);
                try {
                    const results = await patientService.searchPatients(query);
                    setFilteredPatients(results);
                } catch (error) {
                    console.error('Erreur recherche patients:', error);
                    setFilteredPatients([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                // Si la recherche est vide, afficher tous les patients
                setFilteredPatients(patients);
            }
        }, 300),
        [patients]
    );

    useEffect(() => {
        if (searchQuery.trim()) {
            debounceSearch(searchQuery);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchQuery, debounceSearch, patients]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePatientClick = (patient) => {
        console.log('Patient cliqué:', patient);
        // Ici vous pouvez naviguer vers la page de détails du patient
        // navigate(`/patients/${patient.id}`);
    };

    if (isLoading) {
        return (
            <div className="patient-list-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Chargement des patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-list-container">
            <div className="patient-list-header">
                <div className="header-title">
                    <h1>Liste des Patients</h1>
                    <span className="patient-count">
                        {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''}
                    </span>
                </div>
                
            </div>

            <div className="search-section">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="search-input-field"
                        placeholder="Rechercher par nom, prénom ou CIN..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {isSearching && (
                        <div className="search-loading-spinner"></div>
                    )}
                </div>
            </div>

            <div className="patients-grid">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                        <div 
                            key={patient.id} 
                            className="patient-card"
                            onClick={() => handlePatientClick(patient)}
                        >
                            <div className="patient-card-header">
                                <div className="patient-avatar">
                                    {patient.nom?.charAt(0)}{patient.prenom?.charAt(0)}
                                </div>
                                <div className="patient-main-info">
                                    <h3 className="patient-fullname">
                                        {patient.nom} {patient.prenom}
                                    </h3>
                                    <span className="patient-cin-badge">
                                        CIN: {patient.cin}
                                    </span>
                                </div>
                            </div>

                            <div className="patient-card-body">
                                <div className="patient-info-row">
                                    <Calendar size={16} />
                                    <span>{calculateAge(patient.dateNaissance)} ans</span>
                                    <span className="info-separator">•</span>
                                    <span>{patient.sexe === 'HOMME' ? 'Homme' : 'Femme'}</span>
                                </div>

                                {patient.numTel && (
                                    <div className="patient-info-row">
                                        <Phone size={16} />
                                        <span>{patient.numTel}</span>
                                    </div>
                                )}

                                {patient.email && (
                                    <div className="patient-info-row">
                                        <Mail size={16} />
                                        <span>{patient.email}</span>
                                    </div>
                                )}

                                {patient.adresse && (
                                    <div className="patient-info-row">
                                        <MapPin size={16} />
                                        <span>{patient.adresse}</span>
                                    </div>
                                )}

                                {patient.typeMutuelle && (
                                    <div className="patient-mutuelle">
                                        <span className="mutuelle-badge">{patient.typeMutuelle}</span>
                                    </div>
                                )}
                            </div>

                            <div className="patient-card-footer">
                                <span className="creation-date">
                                    Créé le {formatDate(patient.dateCreation)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-patients">
                        {searchQuery ? (
                            <>
                                <Search size={48} />
                                <p>Aucun patient trouvé pour "{searchQuery}"</p>
                            </>
                        ) : (
                            <>
                                <UserPlus size={48} />
                                <p>Aucun patient enregistré</p>
                                <button className="btn-add-patient">
                                    Ajouter un patient
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientListPage;