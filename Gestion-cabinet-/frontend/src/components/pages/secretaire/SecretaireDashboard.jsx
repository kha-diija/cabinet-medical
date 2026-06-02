import React, { useState, useEffect } from 'react';
import {
    Users, Calendar, FileText, MessageSquare,
    Clock, CheckCircle, AlertCircle, TrendingUp,
    Activity, DollarSign, UserCheck
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import apiService from '../../../services/apiService'; // ⬅️ AJOUTER CETTE LIGNE



const SecretaireDashboard = () => {
    const [stats, setStats] = useState({
        patientsTotal: 0,
        rdvAujourdhui: 0,
        facturesEnAttente: 0,
        messagesNonLus: 0
    });

    const [rdvProchains, setRdvProchains] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Données dynamiques pour les graphiques
    const [rdvSemaineData, setRdvSemaineData] = useState([]);
    const [patientsParMoisData, setPatientsParMoisData] = useState([]);
    const [statutsRdvData, setStatutsRdvData] = useState([]);
    const [revenusMensuelData, setRevenusMensuelData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Charger toutes les données en parallèle
            const [
                statsData,
                rdvData,
                rdvSemaine,
                rdvStatuts,
                patientsEvolution,
                revenusMensuels
            ] = await Promise.all([
                apiService.dashboard.getStats(),
                apiService.rendezVous.getDuJour(),
                apiService.dashboard.getRdvSemaine(),
                apiService.dashboard.getRdvStatuts(),
                apiService.dashboard.getPatientsEvolution(),
                apiService.dashboard.getRevenusMensuels()
            ]);

            // Mettre à jour les stats
            setStats(statsData);

            // Mettre à jour les RDV du jour
            setRdvProchains(Array.isArray(rdvData) ? rdvData : []);

            // Mettre à jour les données des graphiques
            setRdvSemaineData(rdvSemaine || []);
            setStatutsRdvData(rdvStatuts || []);
            setPatientsParMoisData(patientsEvolution || []);
            setRevenusMensuelData(revenusMensuels || [])

            console.log('✅ Revenus mensuels reçus :', revenusMensuels);

            console.log('✅ Dashboard chargé avec succès');
        } catch (err) {
            console.error('❌ Erreur lors du chargement des données:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 50,
                        height: 50,
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header2 */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Tableau de bord - Secrétaire
                </h1>
                <p style={{ color: '#6b7280' }}>
                    {new Date().toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Statistiques principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    icon={<Users size={24} />}
                    title="Patients"
                    value={stats.patientsTotal}
                    label="Total enregistrés"
                    color="#3b82f6"
                    bgColor="#dbeafe"
                />
                <StatCard
                    icon={<Calendar size={24} />}
                    title="Rendez-vous"
                    value={stats.rdvAujourdhui}
                    label="Aujourd'hui"
                    color="#10b981"
                    bgColor="#d1fae5"
                />
                <StatCard
                    icon={<FileText size={24} />}
                    title="Factures"
                    value={stats.facturesEnAttente}
                    label="En attente"
                    color="#f59e0b"
                    bgColor="#fef3c7"
                />
                <StatCard
                    icon={<MessageSquare size={24} />}
                    title="Messages"
                    value={stats.messagesNonLus}
                    label="Non lus"
                    color="#8b5cf6"
                    bgColor="#ede9fe"
                />
            </div>

            {/* Graphiques - Ligne 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Rendez-vous par jour */}
                <ChartCard title="Rendez-vous cette semaine">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={rdvSemaineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="jour" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Bar dataKey="rdv" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Statuts des rendez-vous */}
                <ChartCard title="Répartition des rendez-vous">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statutsRdvData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statutsRdvData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Graphiques - Ligne 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Nouveaux patients */}
                <ChartCard title="Évolution des patients (6 mois)">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={patientsParMoisData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="mois" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="patients"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Revenus mensuels */}
                <ChartCard title="Revenus mensuels (MAD)">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenusMensuelData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="mois" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => `${value.toLocaleString()} MAD`}
                            />
                            <Bar dataKey="montant" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Rendez-vous du jour */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} />
                        Rendez-vous du jour
                    </h2>
                    <a href="/secretaire/rendez-vous" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                        Voir tous →
                    </a>
                </div>

                {rdvProchains.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>Aucun rendez-vous prévu aujourd'hui</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {rdvProchains.map(rdv => (
                            <div key={rdv.idRendezVous} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginRight: '1.5rem',
                                    color: '#3b82f6',
                                    fontWeight: '600'
                                }}>
                                    <Clock size={16} />
                                    <span>{rdv.heureRdv}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                        {rdv.nomPatient} {rdv.prenomPatient}
                                    </h4>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                        {rdv.nomMedecin}
                                    </p>
                                    {rdv.motif && (
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: '0.5rem',
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {rdv.motif}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    backgroundColor: rdv.statut === 'CONFIRME' ? '#d1fae5' : '#fef3c7',
                                    color: rdv.statut === 'CONFIRME' ? '#065f46' : '#92400e'
                                }}>
                                    {rdv.statut === 'CONFIRME' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                    {rdv.statut.replace('_', ' ')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Composant StatCard
const StatCard = ({ icon, title, value, label, color, bgColor }) => (
    <div style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    }}>
        <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            backgroundColor: bgColor,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <h3 style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>{value}</p>
            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{label}</span>
        </div>
    </div>
);

// Composant ChartCard
const ChartCard = ({ title, children }) => (
    <div style={{
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            {title}
        </h3>
        {children}
    </div>
);

export default SecretaireDashboard;