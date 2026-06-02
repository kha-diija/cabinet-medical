import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import React from "react";
import MedecinDashboard from "../src/medecin/pages/Dashboard/Dashboard";
import Layout from "../src/medecin/components/layout/Layout/Layout";
import { ThemeProvider } from '../src/medecin/contexts';
import RendezVousPage from "../src/medecin/pages/RendezVousPage/RendezVousPage";
import authService from '../src/medecin/services/authService';
import PatientListPage from "../src/medecin/pages/PatientListPage/PatientListPage";
import ConsultationPage from "../src/medecin/pages/ConsultationPage/ConsultationPage";
import OrdonnancesPage from "../src/medecin/pages/OrdonnancesPage/OrdonnancesPage";
import Messagerie from  "../src/medecin/pages/Messagerie/Messagerie";
import Parametres from "../src/medecin/pages/Parametres/Parametres"; // ✅ AJOUT
import DossierMedicalPage from "../src/medecin/pages/DossierMedicalPage/DossierMedicalPage";


// Composants pour les autres pages
const DossiersPage = () => <div>Dossiers Médicaux Page</div>;
const MessagesPage = () => <div>Messages Page</div>;
const ParametresPage = () => <div>Paramètres Page</div>;

// Composant Layout avec protection
const ProtectedLayout = () => {
  // Vérification d'authentification
  if (!authService.isAuthenticated()) {
    console.log('❌ Non authentifié, redirection vers /');
    return <Navigate to="/" replace />;
  }
  
  if (!authService.hasRole('MEDECIN')) {
    console.log('❌ Pas le bon rôle');
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ Accès autorisé au layout médecin');
  
  // Retourne le Layout avec un Outlet pour afficher le contenu des routes
  return (
    <Layout>
      <Outlet /> {/* Ceci affichera le contenu de la route actuelle */}
    </Layout>
  );
};

const MedecinRoutes = () => {
  console.log('🚀 MedecinRoutes monté');
  
  return (
    <ThemeProvider>
      <Routes>
        {/* Route principale avec le layout protégé */}
        <Route element={<ProtectedLayout />}>
          {/* Routes enfants - s'affichent dans l'Outlet du ProtectedLayout */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MedecinDashboard />} />
          <Route path="rendezvous" element={<RendezVousPage />} />
          <Route path="consultations" element={<ConsultationPage />} />
          <Route path="Ordonnances" element={<OrdonnancesPage />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="messages" element={<Messagerie />} />
          <Route path="patients" element={<PatientListPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="dossiers" element={<DossierMedicalPage />} />

          {/* Catch-all : redirige vers dashboard si route inconnue */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default MedecinRoutes;