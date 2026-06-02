import { useState, useEffect } from "react";
import { 
  MdAdd, 
  MdEdit, 
  MdClose, 
  MdCheckCircle, 
  MdCancel, 
  MdEmail, 
  MdPhone, 
  MdLocationOn,
  MdFilterList 
} from "react-icons/md";
import CabinetService from "../services/CabinetService";

export default function MedicalManagement() {
  // Spécialités prédéfinies
  const specialites = [
    "Généraliste",
    "Cardiologie",
    "Dermatologie",
    "Pédiatrie",
    "Gynécologie",
    "Ophtalmologie",
    "Radiologie",
    "Dentiste",
    "ORL",
    "Neurologie",
    "Chirurgie",
    "Autre"
  ];

  // Filtres de statut
  const statutFilters = [
    { value: "all", label: "Tous les cabinets" },
    { value: "actif", label: "Cabinets actifs" },
    { value: "inactif", label: "Cabinets inactifs" }
  ];

  // Initialisation sécurisée avec un tableau vide
  const [cabinets, setCabinets] = useState([]);
  const [filteredCabinets, setFilteredCabinets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    tel: "",
    specialite: "",
    adresse: "",
    actif: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState("all"); // Filtre par statut

  const loadCabinets = async () => {
    try {
      setIsLoading(true);
      const data = await CabinetService.getAllCabinets();

      // ✅ CORRECTION 1 : Sécurité, on s'assure que c'est bien un tableau
      if (Array.isArray(data)) {
        setCabinets(data);
        setFilteredCabinets(data); // Initialise les cabinets filtrés
      } else {
        console.warn("Les données reçues ne sont pas un tableau", data);
        setCabinets([]);
        setFilteredCabinets([]);
      }
    } catch (e) {
      console.error("Erreur chargement:", e);
      setCabinets([]);
      setFilteredCabinets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCabinets();
  }, []);

  // Appliquer les filtres (recherche + statut)
  useEffect(() => {
    let result = cabinets;
    
    // Filtre par statut
    if (selectedStatut === "actif") {
      result = result.filter(cabinet => cabinet.actif);
    } else if (selectedStatut === "inactif") {
      result = result.filter(cabinet => !cabinet.actif);
    }
    
    // Filtre par recherche
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(cabinet =>
        (cabinet.nom && cabinet.nom.toLowerCase().includes(term)) ||
        (cabinet.specialite && cabinet.specialite.toLowerCase().includes(term)) ||
        (cabinet.email && cabinet.email.toLowerCase().includes(term)) ||
        (cabinet.tel && cabinet.tel.includes(term)) ||
        (cabinet.adresse && cabinet.adresse.toLowerCase().includes(term))
      );
    }
    
    setFilteredCabinets(result);
  }, [cabinets, searchTerm, selectedStatut]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatutFilter = (value) => {
    setSelectedStatut(value);
  };

  const openAddModal = () => {
    setForm({
      nom: "",
      email: "",
      tel: "",
      specialite: "",
      adresse: "",
      actif: true,
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (cabinet) => {
    setForm({
      ...cabinet,
      specialite: cabinet.specialite || "" // Assure une valeur par défaut
    });
    setEditingId(cabinet.id);
    setShowModal(true);
  };

  const saveCabinet = async () => {
    try {
      setIsLoading(true);
      if (editingId) {
        await CabinetService.modifierCabinet(editingId, form);
      } else {
        await CabinetService.ajouterCabinet(form);
      }
      setShowModal(false);
      await loadCabinets();
    } catch (e) {
      console.error("Erreur Save:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (cabinet) => {
    try {
      const newStatus = !cabinet.actif;
      await CabinetService.changerStatut(cabinet.id, newStatus);
      loadCabinets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col overflow-y-auto p-4 md:p-8 lg:p-12 font-sans bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gestion des Cabinets
          </h1>
          <p className="text-gray-600 text-xl">
            Gérez vos cabinets médicaux en toute simplicité
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <MdAdd size={22} />
          <span className="text-lg">Ajouter un Cabinet</span>
        </button>
      </div>

      {/* FILTRES ET RECHERCHE */}
      <div className="mb-16">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* 🔽 CHAMP DE RECHERCHE CORRIGÉ */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom, spécialité, email, téléphone, adresse..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-8 py-5 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-3 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-lg text-gray-900 placeholder:text-gray-600" // Changé placeholder:text-gray-500 à placeholder:text-gray-600
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <MdClose size={24} />
              </button>
            )}
          </div>

          {/* 🔽 FILTRE PAR STATUT AJOUTÉ */}
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <MdFilterList className="text-gray-700" size={20} />
                <label className="block text-base font-semibold text-gray-800">
                  Filtrer par statut
                </label>
              </div>
              <select
                value={selectedStatut}
                onChange={(e) => handleStatutFilter(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 appearance-none text-gray-900 font-medium"
              >
                {statutFilters.map((filter) => (
                  <option key={filter.value} value={filter.value} className="text-gray-900">
                    {filter.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none mt-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIQUES DES FILTRES */}
        <div className="flex flex-wrap items-center gap-6 text-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">
                <span className="font-bold">{cabinets.filter(c => c.actif).length}</span> actif{cabinets.filter(c => c.actif).length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">
                <span className="font-bold">{cabinets.filter(c => !c.actif).length}</span> inactif{cabinets.filter(c => !c.actif).length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {selectedStatut === "all" && "Affichage de tous les cabinets"}
            {selectedStatut === "actif" && "Affichage des cabinets actifs uniquement"}
            {selectedStatut === "inactif" && "Affichage des cabinets inactifs uniquement"}
            {searchTerm && ` • Recherche : "${searchTerm}"`}
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-blue-600 font-medium">Chargement...</div>
                </div>
              </div>
            </div>
          </div>
        ) : (!filteredCabinets || filteredCabinets.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 p-12">
            <div className="text-6xl mb-6 opacity-40">🏥</div>
            <p className="text-2xl font-semibold text-gray-700 mb-3">
              {searchTerm || selectedStatut !== "all" 
                ? "Aucun cabinet ne correspond aux critères" 
                : "Aucun cabinet trouvé"}
            </p>
            <p className="text-gray-600 text-lg mb-10 text-center max-w-md">
              {searchTerm || selectedStatut !== "all" 
                ? "Essayez de modifier vos critères de recherche ou de filtre" 
                : "Créez votre premier cabinet pour commencer"}
            </p>
            <button
              onClick={openAddModal}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow hover:shadow-md"
            >
              <MdAdd size={20} />
              <span className="font-medium">Créer un cabinet</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* EN-TÊTE DU TABLEAU */}
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-8 py-6 text-left text-base font-bold text-gray-800 uppercase tracking-wide">
                    Informations du Cabinet
                  </th>
                  <th className="px-8 py-6 text-left text-base font-bold text-gray-800 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-8 py-6 text-left text-base font-bold text-gray-800 uppercase tracking-wide">
                    Spécialité
                  </th>
                  <th className="px-8 py-6 text-left text-base font-bold text-gray-800 uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="px-8 py-6 text-left text-base font-bold text-gray-800 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* CORPS DU TABLEAU */}
              <tbody>
                {Array.isArray(filteredCabinets) && filteredCabinets.map((c, index) => (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-100 transition-all duration-300 hover:bg-blue-50/50 group ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {/* Informations */}
                    <td className="px-8 py-6">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{c.nom}</h3>
                          <div className="flex items-start gap-2 text-gray-600">
                            <MdLocationOn className="mt-1 flex-shrink-0" size={16} />
                            <span className="text-sm">{c.adresse}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-8 py-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mt-0.5">
                            <MdEmail size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-0.5">Email</div>
                            <div className="text-base text-gray-900 font-medium">{c.email}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600 mt-0.5">
                            <MdPhone size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-0.5">Téléphone</div>
                            <div className="text-base text-gray-900 font-medium">{c.tel}</div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Spécialité */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <span className="font-bold text-sm">S</span>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{c.specialite}</span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="px-8 py-6">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                          c.actif
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl"
                            : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {c.actif ? (
                          <>
                            <MdCheckCircle size={20} />
                            <span className="font-semibold">ACTIF</span>
                          </>
                        ) : (
                          <>
                            <MdCancel size={20} />
                            <span className="font-semibold">INACTIF</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(c)}
                          className="inline-flex items-center gap-3 px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 transform group-hover:translate-x-1"
                          title="Modifier"
                        >
                          <MdEdit size={18} />
                          <span className="font-medium">Modifier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}
        {Array.isArray(filteredCabinets) && filteredCabinets.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="text-base text-gray-700">
                  <span className="font-bold">{filteredCabinets.length}</span> cabinet{filteredCabinets.length > 1 ? 's' : ''} trouvé{filteredCabinets.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">
                      <span className="font-bold">{filteredCabinets.filter(c => c.actif).length}</span> actif{filteredCabinets.filter(c => c.actif).length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">
                      <span className="font-bold">{filteredCabinets.filter(c => !c.actif).length}</span> inactif{filteredCabinets.filter(c => !c.actif).length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL (gardé tel quel car déjà corrigé) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ease-in-out"
            onClick={() => !isLoading && setShowModal(false)}
          ></div>

          <div className="relative w-full max-w-2xl z-10 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ease-out scale-100 opacity-100">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? "Modifier Cabinet" : "Ajouter Cabinet"}
                  </h2>
                  <p className="text-gray-600 text-base mt-2">
                    {editingId ? "Mettez à jour les informations du cabinet" : "Remplissez les informations du nouveau cabinet"}
                  </p>
                </div>
                <button
                  onClick={() => !isLoading && setShowModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  <MdClose size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["nom", "email", "tel", "adresse"].map((field) => (
                  <div key={field} className="space-y-3">
                    <label className="block text-base font-semibold text-gray-800 capitalize">
                      {field} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form[field] || ""}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-500"
                      placeholder={`Entrez ${field}`}
                      disabled={isLoading}
                    />
                  </div>
                ))}

                <div className="space-y-3">
                  <label className="block text-base font-semibold text-gray-800">
                    Spécialité <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.specialite}
                      onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 appearance-none text-gray-900"
                      disabled={isLoading}
                    >
                      <option value="" className="text-gray-500">Sélectionnez une spécialité</option>
                      {specialites.map((spec) => (
                        <option key={spec} value={spec} className="text-gray-900">
                          {spec}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-semibold text-gray-800">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.actif ? "Actif" : "Inactif"}
                      onChange={(e) => setForm({ ...form, actif: e.target.value === "Actif" })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 appearance-none text-gray-900"
                      disabled={isLoading}
                    >
                      <option className="text-gray-900">Actif</option>
                      <option className="text-gray-900">Inactif</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-4">
                <button
                  onClick={() => !isLoading && setShowModal(false)}
                  className="flex-1 border-2 border-gray-400 py-3.5 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 hover:text-gray-900"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={saveCabinet}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 rounded-lg font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <MdAdd size={20} />
                      {editingId ? "Mettre à jour" : "Créer le cabinet"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style tag */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .overflow-x-auto {
          animation: fadeIn 0.5s ease-out;
        }
        
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
          margin: 0 8px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background 0.3s;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}