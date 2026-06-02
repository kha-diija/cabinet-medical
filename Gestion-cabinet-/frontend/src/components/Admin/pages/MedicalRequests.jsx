import { useState, useEffect } from "react";
import { 
  MdClose, 
  MdCheck, 
  MdVisibility, 
  MdDownload, 
  MdUpload,
  MdBusiness,
  MdLocalHospital,
  MdEmail,
  MdPhone,
  MdPerson,
  MdLocationOn,
  MdAssignment,
  MdBadge,
  MdSchool,
  MdDescription,
  MdError,
  MdWarning,
  MdInfo
} from "react-icons/md";
import DemandeService from "../services/DemandeService";
import DocumentService from "../services/DocumentService"; // ✅ AJOUTER CETTE LIGNE

export default function MedicalRequests() {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState("TOUS");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  // Modales personnalisées
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [rejectComment, setRejectComment] = useState("");
  const [selectedAppForAction, setSelectedAppForAction] = useState(null);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "error" // "error" | "success" | "warning" | "info"
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    // Calcul des statistiques
    if (applications.length > 0) {
      const pending = applications.filter(app => app.statut === "EN_ATTENTE").length;
      const approved = applications.filter(app => app.statut === "APPROUVEE").length;
      const rejected = applications.filter(app => app.statut === "REJETEE").length;
      
      setStats({
        total: applications.length,
        pending,
        approved,
        rejected
      });
    }
  }, [applications]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await DemandeService.getAll();
      setApplications(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes :", error);
      showModal("Erreur", "Erreur lors du chargement des demandes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour afficher les modales personnalisées
  const showModal = (title, message, type = "error") => {
    setModalContent({ title, message, type });
    setShowErrorModal(true);
  };

  const showSuccess = (message) => {
    setModalContent({ 
      title: "Succès", 
      message, 
      type: "success" 
    });
    setShowSuccessModal(true);
  };

  const getStatusColor = (statut) => {
    if (statut === "APPROUVEE") return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (statut === "EN_ATTENTE") return "bg-gradient-to-r from-amber-500 to-orange-600";
    return "bg-gradient-to-r from-red-500 to-rose-600";
  };

  const getStatusTextColor = (statut) => {
    if (statut === "APPROUVEE") return "text-green-700";
    if (statut === "EN_ATTENTE") return "text-amber-700";
    return "text-red-700";
  };

  const getStatusBgColor = (statut) => {
    if (statut === "APPROUVEE") return "bg-green-50 border-green-200";
    if (statut === "EN_ATTENTE") return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getStatusIcon = (statut) => {
    if (statut === "APPROUVEE") return <MdCheck className="text-green-600" size={18} />;
    if (statut === "EN_ATTENTE") return <div className="text-amber-600 text-lg animate-pulse">⏳</div>;
    return <MdClose className="text-red-600" size={18} />;
  };

  const getStatusText = (statut) => {
    const texts = {
      "APPROUVEE": "Approuvée",
      "EN_ATTENTE": "En attente",
      "REJETEE": "Rejetée"
    };
    return texts[statut] || statut;
  };

  const openApproveModal = (app) => {
    setSelectedAppForAction(app);
    setShowApproveModal(true);
  };

  const openRejectModal = (app) => {
    setSelectedAppForAction(app);
    setRejectComment("");
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedAppForAction) return;
    
    try {
      // Mettez à jour cette ligne selon votre service
      await DemandeService.approuver(selectedAppForAction.id);

      
      // Mettre à jour localement l'état de la demande
      setApplications(prev => prev.map(app => 
        app.id === selectedAppForAction.id ? { ...app, statut: "APPROUVEE" } : app
      ));
      
      if (selectedApp && selectedApp.id === selectedAppForAction.id) {
        setSelectedApp(prev => ({ ...prev, statut: "APPROUVEE" }));
      }
      
      setShowApproveModal(false);
      setShowDetails(false);
      showSuccess("Demande approuvée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'approbation :", error);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = "Erreur lors de l'approbation";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Un utilisateur avec ce login existe déjà")) {
        errorMessage = "Impossible d'approuver : Un utilisateur avec ce login existe déjà dans le système. Veuillez vérifier les identifiants.";
      } else if (error.message.includes("exists")) {
        errorMessage = "Impossible d'approuver : Des informations dupliquées existent déjà dans le système.";
      }
      
      showModal("Erreur d'approbation", errorMessage, "error");
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      showModal("Erreur", "Veuillez saisir un motif de rejet", "warning");
      return;
    }
    
    try {
      await DemandeService.rejeter(selectedAppForAction.id, rejectComment);

      
      // Mettre à jour localement l'état de la demande
      setApplications(prev => prev.map(app => 
        app.id === selectedAppForAction.id ? { 
          ...app, 
          statut: "REJETEE", 
          commentaireAdmin: rejectComment 
        } : app
      ));
      
      if (selectedApp && selectedApp.id === selectedAppForAction.id) {
        setSelectedApp(prev => ({ 
          ...prev, 
          statut: "REJETEE", 
          commentaireAdmin: rejectComment 
        }));
      }
      
      setShowRejectModal(false);
      setShowDetails(false);
      showSuccess("Demande rejetée avec succès !");
    } catch (error) {
      console.error("Erreur lors du rejet :", error);
      
      let errorMessage = "Erreur lors du rejet";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("TransientObjectException")) {
        errorMessage = "Erreur technique lors du rejet. Veuillez contacter l'administrateur système.";
      }
      
      showModal("Erreur de rejet", errorMessage, "error");
    }
  };

  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowDetails(true);
  };


  const renderDocumentButton = (documentUrl, label) => {
  if (!documentUrl) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
        <MdDescription className="text-gray-400" size={20} />
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xs text-gray-400">Non fourni</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex gap-2">
      {/* Bouton Voir */}
      <button
        onClick={() => DocumentService.viewDocument(documentUrl)}
        className="group flex-1 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-all duration-200 hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <MdVisibility className="text-blue-600" size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900">{label}</p>
            <p className="text-xs text-blue-600">Cliquez pour visualiser</p>
          </div>
        </div>
        <div className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
          Voir →
        </div>
      </button>
      
      {/* Bouton Télécharger */}
      <button
  onClick={() => DocumentService.downloadDocument(documentUrl, label)}
  className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-lg transition-all duration-200 hover:shadow-md"
  title="Télécharger le document"
>
  <MdDownload className="text-green-600" size={20} />
</button>
    </div>
  );
}

  const filteredApplications = filterStatus === "TOUS"
    ? applications
    : applications.filter((app) => app.statut === filterStatus);

  const getModalIcon = (type) => {
    switch(type) {
      case "error": return <MdError className="text-red-600" size={48} />;
      case "success": return <MdCheck className="text-green-600" size={48} />;
      case "warning": return <MdWarning className="text-amber-600" size={48} />;
      case "info": return <MdInfo className="text-blue-600" size={48} />;
      default: return <MdError className="text-red-600" size={48} />;
    }
  };

  const getModalColor = (type) => {
    switch(type) {
      case "error": return "bg-red-50 border-red-200";
      case "success": return "bg-green-50 border-green-200";
      case "warning": return "bg-amber-50 border-amber-200";
      case "info": return "bg-blue-50 border-blue-200";
      default: return "bg-red-50 border-red-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      {/* Styles d'animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      {/* Header2 */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
              Gestion des Demandes de Cabinet
            </h1>
            <p className="text-slate-600 text-lg">Examen et validation des candidatures médicales</p>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-inner mb-3">
                <MdBusiness className="text-blue-600" size={24} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.total}</p>
              <p className="text-slate-500 text-sm font-medium">Demandes totales</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-inner mb-3">
                <div className="text-amber-600 text-xl">⏳</div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-amber-600 mb-1">{stats.pending}</p>
              <p className="text-slate-500 text-sm font-medium">En attente</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-inner mb-3">
                <MdCheck className="text-green-600" size={24} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{stats.approved}</p>
              <p className="text-slate-500 text-sm font-medium">Approuvées</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-inner mb-3">
                <MdClose className="text-red-600" size={24} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-red-600 mb-1">{stats.rejected}</p>
              <p className="text-slate-500 text-sm font-medium">Rejetées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et liste */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Liste des demandes</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-6 py-3 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none text-slate-700 font-medium"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="APPROUVEE">Approuvées</option>
                <option value="REJETEE">Rejetées</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {filteredApplications.length} demande{filteredApplications.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-[3px] border-blue-600 border-t-transparent mb-6"></div>
            <h3 className="text-xl font-medium text-slate-700 mb-3">Chargement des demandes</h3>
            <p className="text-slate-500">Récupération des données en cours...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <MdBusiness className="text-slate-400" size={48} />
            </div>
            <h3 className="text-2xl font-medium text-slate-700 mb-3">Aucune demande trouvée</h3>
            <p className="text-slate-500 text-lg mb-6">Aucune demande ne correspond aux critères sélectionnés</p>
            <button
              onClick={() => setFilterStatus("TOUS")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* En-tête avec statut coloré */}
                <div className={`h-2 ${getStatusColor(app.statut)}`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-inner">
                          <MdLocalHospital className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 truncate max-w-[200px]">
                            {app.nomCabinet}
                          </h3>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBgColor(app.statut)} ${getStatusTextColor(app.statut)} border`}>
                            {getStatusIcon(app.statut)}
                            <span>{getStatusText(app.statut)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Infos principales */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MdAssignment className="text-slate-500" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Spécialité</p>
                        <p className="text-sm font-medium text-slate-900">{app.specialite}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MdPerson className="text-slate-500" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Médecin</p>
                        <p className="text-sm font-medium text-slate-900">
                          {app.nomMedecin} {app.prenomMedecin}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <MdEmail className="text-slate-500" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                          {app.emailCabinet}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDetails(app)}
                    className="group relative w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <MdVisibility size={20} className="relative z-10" />
                    <span className="relative z-10">Voir les détails</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {showDetails && selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête du modal */}
            <div className="relative">
              <div className={`h-3 ${getStatusColor(selectedApp.statut)}`}></div>
              <div className="p-8 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-inner">
                      <MdLocalHospital className="text-blue-600" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedApp.nomCabinet}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getStatusBgColor(selectedApp.statut)} ${getStatusTextColor(selectedApp.statut)} border`}>
                          {getStatusIcon(selectedApp.statut)}
                          <span>{getStatusText(selectedApp.statut)}</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          ID: <span className="font-mono">{selectedApp.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-3 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:rotate-90"
                  >
                    <MdClose size={24} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenu défilant */}
            <div className="overflow-y-auto p-8 max-h-[calc(90vh-200px)]">
              {/* Sections d'informations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Informations du cabinet */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MdBusiness className="text-blue-600" />
                    Informations du cabinet
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Nom du cabinet</p>
                      <p className="text-slate-900 font-medium">{selectedApp.nomCabinet}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Spécialité</p>
                      <p className="text-slate-900 font-medium">{selectedApp.specialite}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Adresse</p>
                      <p className="text-slate-900 font-medium">{selectedApp.adresseCabinet}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Téléphone</p>
                      <p className="text-slate-900 font-medium">{selectedApp.telCabinet}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Email</p>
                      <p className="text-slate-900 font-medium">{selectedApp.emailCabinet}</p>
                    </div>
                  </div>
                </div>

                {/* Informations du médecin */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MdPerson className="text-emerald-600" />
                    Informations du médecin
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Nom complet</p>
                      <p className="text-slate-900 font-medium">{selectedApp.nomMedecin} {selectedApp.prenomMedecin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">CIN</p>
                      <p className="text-slate-900 font-medium">{selectedApp.cinMedecin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Téléphone</p>
                      <p className="text-slate-900 font-medium">{selectedApp.telMedecin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Email</p>
                      <p className="text-slate-900 font-medium">{selectedApp.emailMedecin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Login</p>
                      <p className="text-slate-900 font-medium">{selectedApp.loginMedecin}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de la secrétaire */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MdAssignment className="text-purple-600" />
                  Informations de la secrétaire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Nom complet</p>
                    <p className="text-slate-900 font-medium">{selectedApp.nomSecretaire} {selectedApp.prenomSecretaire}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">CIN</p>
                    <p className="text-slate-900 font-medium">{selectedApp.cinSecretaire}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Téléphone</p>
                      <p className="text-slate-900 font-medium">{selectedApp.telSecretaire}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Email</p>
                    <p className="text-slate-900 font-medium">{selectedApp.emailSecretaire}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Login</p>
                    <p className="text-slate-900 font-medium">{selectedApp.loginSecretaire}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MdDescription className="text-slate-600" />
                  Documents fournis
                </h3>
                <div className="space-y-4">
                  {renderDocumentButton(selectedApp.documentLicence, "Licence médicale")}
                  {renderDocumentButton(selectedApp.documentDiplome, "Diplôme")}
                  {renderDocumentButton(selectedApp.documentCinMedecin, "CIN médecin")}
                    {renderDocumentButton(selectedApp.logoCabinet, "Logo cabinet")}

                </div>
              </div>

              {/* Actions */}
              {selectedApp.statut === "EN_ATTENTE" && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Validation de la demande</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => openApproveModal(selectedApp)}
                      className="flex-1 group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 overflow-hidden flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <MdCheck size={24} className="relative z-10" />
                      <span className="relative z-10">Approuver la demande</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(selectedApp)}
                      className="flex-1 group relative bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-4 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 overflow-hidden flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <MdClose size={24} className="relative z-10" />
                      <span className="relative z-10">Rejeter la demande</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Commentaire admin si rejetée */}
              {selectedApp.statut === "REJETEE" && selectedApp.commentaireAdmin && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-2xl border border-red-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Motif du rejet</h3>
                  <p className="text-slate-700">{selectedApp.commentaireAdmin}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'approbation */}
      {showApproveModal && selectedAppForAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-inner">
                  <MdCheck className="text-green-600" size={32} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
                Confirmer l'approbation
              </h3>
              
              <p className="text-slate-600 text-center mb-6">
                Êtes-vous sûr de vouloir approuver la demande de <strong>{selectedAppForAction.nomCabinet}</strong> ?
              </p>
              
              <p className="text-sm text-slate-500 text-center mb-6">
                Cette action créera le cabinet et les comptes utilisateurs pour le médecin et la secrétaire.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transition-all duration-200"
                >
                  Confirmer l'approbation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && selectedAppForAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-inner">
                  <MdClose className="text-red-600" size={32} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
                Motif du rejet
              </h3>
              
              <p className="text-slate-600 text-center mb-6">
                Veuillez indiquer le motif du rejet pour la demande de <strong>{selectedAppForAction.nomCabinet}</strong>
              </p>
              
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Saisissez ici le motif du rejet..."
                className="w-full h-32 px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 resize-none"
              />
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectComment.trim()}
                  className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all duration-200 ${
                    rejectComment.trim()
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur/succès/information */}
      {(showErrorModal || showSuccessModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[70] p-4 animate-fadeIn">
          <div 
            className={`rounded-2xl shadow-2xl max-w-md w-full animate-slideUp ${getModalColor(modalContent.type)} border`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                {getModalIcon(modalContent.type)}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-4">
                {modalContent.title}
              </h3>
              
              <div className="text-center mb-6">
                <p className="text-slate-700 whitespace-pre-line">{modalContent.message}</p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setShowSuccessModal(false);
                  }}
                  className={`px-8 py-3 font-bold rounded-xl transition-all duration-200 ${
                    modalContent.type === 'error' 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-lg'
                      : modalContent.type === 'success'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}