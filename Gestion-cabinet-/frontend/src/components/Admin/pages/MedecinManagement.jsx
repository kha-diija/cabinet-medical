import { useState, useEffect } from "react"
import { MdDelete, MdCloudUpload, MdDownload, MdAdd, MdEdit, MdClose, MdCheck } from "react-icons/md"
import MedicamentService from "../services/MedicamentService"

export default function MedecinManagement() {
  const [medicaments, setMedicaments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [medToDelete, setMedToDelete] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nom: "",
    forme: "",
    dosage: "",
    laboratoire: "",
    dci: "",
  })

  useEffect(() => {
    loadMedicaments()
  }, [])

  const loadMedicaments = async () => {
    try {
      setLoading(true)
      const data = await MedicamentService.getAllMedicaments()
      setMedicaments(data)
    } catch (err) {
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedicaments = medicaments.filter(
    (med) =>
      med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.forme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.laboratoire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dci.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (medicament = null) => {
    if (medicament) {
      setEditingId(medicament.id)
      setFormData(medicament)
    } else {
      setEditingId(null)
      setFormData({ nom: "", forme: "", dosage: "", laboratoire: "", dci: "" })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({ nom: "", forme: "", dosage: "", laboratoire: "", dci: "" })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const updated = await MedicamentService.modifierMedicament(editingId, formData)
        setMedicaments(medicaments.map(m => m.id === editingId ? updated : m))
      } else {
        const newMed = await MedicamentService.creerMedicament(formData)
        setMedicaments([...medicaments, newMed])
      }
      handleCloseModal()
    } catch (err) {
      console.error("Erreur:", err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const confirmDelete = (id) => {
    setMedToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!medToDelete) return
    
    try {
      await MedicamentService.supprimerMedicament(medToDelete)
      setMedicaments(medicaments.filter(m => m.id !== medToDelete))
      setShowDeleteConfirm(false)
      setMedToDelete(null)
    } catch (err) {
      console.error("Erreur:", err)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    if (!file.name.endsWith(".csv")) {
      alert("Veuillez sélectionner un fichier CSV valide")
      return
    }

    try {
      setUploadProgress(0)
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const result = await MedicamentService.importerCSV(file)
      
      clearInterval(interval)
      setUploadProgress(100)
      await loadMedicaments()

      alert(
        `Import réussi !\nMédicaments ajoutés: ${result.nombreAjoutes}\n${
          result.erreurs.length > 0
            ? "Erreurs: " + result.erreurs.join(", ")
            : ""
        }`
      )
      setUploadProgress(0)
    } catch (err) {
      alert("Erreur lors de l'import: " + err.message)
      setUploadProgress(0)
    }
  }

  const handleExportCSV = () => {
    if (!filteredMedicaments || filteredMedicaments.length === 0) {
      alert("Aucun médicament à exporter !")
      return
    }

    const headers = ["Nom", "Forme", "Dosage", "Laboratoire", "DCI", "Date Ajout"]
    const rows = filteredMedicaments.map((m) => [
      m.nom || "",
      m.forme || "",
      m.dosage || "",
      m.laboratoire || "",
      m.dci || "",
      m.dateAjout || "",
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(";"))
      .join("\r\n")

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "medicaments_export.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      
      {/* HEADER AMÉLIORÉ */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Gestion Médicaments</h1>
                <p className="text-gray-600 mt-2 text-lg">Gérez votre inventaire pharmaceutique</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 group"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                <MdAdd size={22} />
              </div>
              <span className="text-lg">Nouveau Médicament</span>
            </button>
          </div>
        </div>

        {/* BARRE DE RECHERCHE AMÉLIORÉE */}
        <div className="max-w-3xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Rechercher un médicament par nom, forme, dosage, laboratoire ou DCI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 py-5 bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-lg placeholder:text-gray-400 shadow-lg text-gray-800"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdClose size={22} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION IMPORT/EXPORT AMÉLIORÉE */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-xl p-8 mb-12 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Importation & Exportation</h2>
            <p className="text-gray-600 text-lg">Gérez vos données en masse avec des fichiers CSV</p>
          </div>
          
          <div className="flex gap-4">
            {/* BOUTON EXPORT CSV SEULEMENT - TEXTE RÉDUIT */}
            <button
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 group"
            >
              <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                <MdDownload size={20} />
              </div>
              <span className="text-base">Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* ZONE D'IMPORT AMÉLIORÉE */}
        <div className="mt-8">
          {uploadProgress === 0 ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 ${
                dragActive
                  ? "border-blue-500 bg-gradient-to-br from-blue-50/80 to-blue-100/50 shadow-inner"
                  : "border-gray-300/70 bg-gradient-to-br from-white to-gray-50/80 hover:border-blue-400 hover:shadow-lg"
              }`}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6 shadow-lg">
                <MdCloudUpload size={40} className="text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Glissez votre fichier CSV ici
              </h3>
              
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Ou sélectionnez un fichier depuis votre ordinateur pour importer des médicaments
              </p>
              
              <label className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-10 rounded-xl cursor-pointer inline-block transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
                Parcourir les fichiers
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              
              <p className="text-gray-500 text-sm mt-6">
                Formats supportés : .csv • Taille maximale : 10MB
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-10 border border-blue-200/50">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <MdCloudUpload size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Import en cours...</h3>
                      <p className="text-gray-600">Traitement de votre fichier CSV</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{uploadProgress}%</div>
                </div>
                
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                  <span>Début</span>
                  <span>En cours...</span>
                  <span>Terminé</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLEAU AMÉLIORÉ */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Liste des Médicaments</h2>
              <p className="text-gray-600 mt-2">
                {filteredMedicaments.length} médicament{filteredMedicaments.length !== 1 ? 's' : ''} disponible{filteredMedicaments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Chargement des données</h3>
              <p className="text-gray-600">Récupération de votre inventaire...</p>
            </div>
          </div>
        ) : filteredMedicaments.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? "Aucun résultat trouvé" : "Inventaire vide"}
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md">
                {searchTerm 
                  ? "Essayez avec d'autres termes de recherche" 
                  : "Commencez par ajouter votre premier médicament"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ajouter le premier médicament
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <span className="text-gray-600">💊</span>
                        </div>
                        <span>Nom du Médicament</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">Forme</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">Dosage</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">Laboratoire</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">DCI</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">Date Ajout</th>
                    <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicaments.map((med, index) => (
                    <tr
                      key={med.id}
                      className={`border-b border-gray-100/50 transition-all duration-300 hover:bg-blue-50/30 group ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl shadow-sm">
                            <span className="text-xl">💊</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{med.nom}</div>
                            <div className="text-sm text-gray-500 mt-1">ID: {med.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium">
                          {med.forme}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-semibold text-gray-900">{med.dosage}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-medium text-gray-800">{med.laboratoire}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-gray-700">{med.dci}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-gray-600">{med.dateAjout}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleOpenModal(med)}
                            className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md group"
                            title="Modifier"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            onClick={() => confirmDelete(med.id)}
                            className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md group"
                            title="Supprimer"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/50">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-700">
                  Affichage de <span className="font-bold">{filteredMedicaments.length}</span> médicament{filteredMedicaments.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL DE CONFIRMATION DE SUPPRESSION SIMPLE ET ÉLÉGANT */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>

          <div className="relative w-full max-w-sm z-10 transform transition-all duration-300 scale-100">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="p-8 text-center">
                {/* Icône simple */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
                  <span className="text-2xl">⚠️</span>
                </div>
                
                {/* Titre simple */}
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Supprimer définitivement ?
                </h2>
                
                {/* Message simple */}
                <p className="text-gray-600 mb-6">
                  Cette action est irréversible. Le médicament sera supprimé de votre inventaire.
                </p>

                {/* Boutons d'action simples */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AMÉLIORÉ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500"
            onClick={handleCloseModal}
          ></div>

          <div className="relative w-full max-w-md z-10 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 transform transition-all duration-500 scale-100">
            {/* Header2 du modal */}
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                    <span className="text-2xl">💊</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingId ? "Modifier le Médicament" : "Nouveau Médicament"}
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">
                      {editingId ? "Mettez à jour les informations" : "Remplissez les informations du médicament"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:rotate-90"
                >
                  <MdClose size={22} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nom du Médicament <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-800"
                    placeholder="Ex: Aspirine"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Forme <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="forme"
                    value={formData.forme}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-800"
                    placeholder="Ex: Comprimé"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-800"
                    placeholder="Ex: 500mg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Laboratoire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="laboratoire"
                    value={formData.laboratoire}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-800"
                    placeholder="Ex: Bayer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    DCI (Dénomination Commune Internationale) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dci"
                    value={formData.dci}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-800"
                    placeholder="Ex: Acide acétylsalicylique"
                    required
                  />
                </div>
              </div>

              {/* Footer du modal */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <div className="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <MdCheck size={18} />
                  </div>
                  <span>{editingId ? "Mettre à jour" : "Créer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
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
  )
}