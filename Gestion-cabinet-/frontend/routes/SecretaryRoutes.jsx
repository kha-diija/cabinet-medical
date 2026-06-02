// C:\Users\assia\IdeaProjects\Tp2-jee\Gestion-cabinet-\frontend\routes\SecretaryRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages Secrétaire
import SecretaireDashboard from '../src/components/pages/secretaire/SecretaireDashboard.jsx';
import GestionPatients from '../src/components/pages/secretaire/GestionPatients.jsx';
import GestionRendezVous from '../src/components/pages/secretaire/GestionRendezVous';
import GestionFactures from '../src/components/pages/secretaire/GestionFactures';
import Messagerie from '../src/components/pages/secretaire/Messagerie';
import PatientDetails from '../src/components/pages/secretaire/PatientDetails';
import Parametres from '../src/components/pages/secretaire/Parametres.jsx';
import Notifications from  '../src/components/pages/secretaire/notifications.jsx';

const SecretaryRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<SecretaireDashboard />} />
            <Route path="/patients" element={<GestionPatients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/rendez-vous" element={<GestionRendezVous />} />
            <Route path="/factures" element={<GestionFactures />} />
            <Route path="/messagerie" element={<Messagerie />} />
            <Route path="/parametres" element={<Parametres />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="*" element={<Navigate to="/secretaire" replace />} />
        </Routes>
    );
};

export default SecretaryRoutes;