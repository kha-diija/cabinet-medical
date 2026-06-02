import { useState, useEffect } from "react";
import { MdDownload, MdCheck, MdCheckCircle, MdFilterList, MdRefresh, MdLock, MdLockOpen } from "react-icons/md";
import InvoicesService from "../services/InvoicesService";

export default function InvoicesManagement() {
  const [invoices, setInvoices] = useState([]);
  const [filterCabinet, setFilterCabinet] = useState("Tous les cabinets");
  const [filterStatut, setFilterStatut] = useState("Tous les status");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingInvoices, setEditingInvoices] = useState({}); // Pour suivre les factures en cours d'édition

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await InvoicesService.getAll();
      setInvoices(data);
      // Initialiser l'état d'édition
      const initialEditingState = {};
      data.forEach(invoice => {
        if (invoice.statut === "EN_ATTENTE") {
          initialEditingState[invoice.id] = {
            montant: invoice.montant || "",
            periode: invoice.periode || "",
            isEditing: true // Par défaut, les factures EN_ATTENTE sont éditables
          };
        } else {
          initialEditingState[invoice.id] = {
            montant: invoice.montant || "",
            periode: invoice.periode || "",
            isEditing: false // Les factures PAYEE ne sont pas éditables
          };
        }
      });
      setEditingInvoices(initialEditingState);
    } catch (err) {
      console.error("Erreur chargement factures:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // Mise à jour des valeurs d'édition
  const handleEditChange = (invoiceId, field, value) => {
    setEditingInvoices(prev => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        [field]: value
      }
    }));
  };

  // Basculer l'édition pour une facture PAYEE (optionnel, pour débloquer)
  const toggleEditing = (invoiceId, currentStatut) => {
    if (currentStatut === "PAYEE") {
      setEditingInvoices(prev => ({
        ...prev,
        [invoiceId]: {
          ...prev[invoiceId],
          isEditing: !prev[invoiceId].isEditing
        }
      }));
    }
  };

  // filtre dynamique et recherche 
  const filteredInvoices = invoices.filter(
    (invoice) =>
      (filterCabinet === "Tous les cabinets" || invoice.cabinetNom === filterCabinet) &&
      (filterStatut === "Tous les status" || invoice.statut === filterStatut) &&
      (searchTerm === "" ||
        invoice.id.toString().includes(searchTerm) ||
        (invoice.cabinetNom ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.cabinetEmail ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Statistiques
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.montant || 0), 0);
  const pendingCount = invoices.filter((inv) => inv.statut === "EN_ATTENTE").length;
  const paidCount = invoices.filter((inv) => inv.statut === "PAYEE").length;

  // Paiement
  const handleMarkAsPaid = async (id) => {
    try {
      await InvoicesService.markAsPaid(id);
      // Après marquer comme payé, désactiver l'édition
      setEditingInvoices(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          isEditing: false
        }
      }));
      loadInvoices();
    } catch (err) {
      console.error("Erreur marque payée:", err);
    }
  };

  // Mise à jour montant + période
  const handleUpdateInvoice = async (invoice) => {
    try {
      const editingData = editingInvoices[invoice.id];
      await InvoicesService.update(invoice.id, {
        montant: Number(editingData.montant),
        periode: editingData.periode,
      });
      loadInvoices();
    } catch (err) {
      console.error("Erreur mise à jour facture:", err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["ID Facture", "Cabinet", "Email", "Montant", "Période", "Date", "Statut"],
      ...invoices.map((inv) => [
        inv.id,
        inv.cabinetNom,
        inv.cabinetEmail,
        inv.montant || "",
        inv.periode || "",
        inv.dateCreation,
        inv.statut,
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(";"))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = "factures_export.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col p-6 space-y-8">
      {/* Header2 réorganisé avec plus d'espace */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Factures
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez et suivez toutes vos factures en temps réel
          </p>
        </div>
        
        {/* Boutons déplacés à droite */}
        <div className="flex gap-3">
          <button
            onClick={loadInvoices}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <MdRefresh size={18} className={isLoading ? "animate-spin" : ""} />
            Rafraîchir
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <MdDownload size={18} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Statistiques avec cartes plus carrées */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Vue d'ensemble</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 mb-3">Total Factures</p>
            <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500 mb-3">Montant Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalAmount.toLocaleString()} MAD
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <MdLockOpen className="text-amber-500" size={20} />
              <p className="text-sm text-gray-500">En Attente (Modifiable)</p>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2">{pendingCount}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <MdLock className="text-green-500" size={20} />
              <p className="text-sm text-gray-500">Payées (Verrouillées)</p>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">{paidCount}</p>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche avec champ de recherche plus grand */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Filtrer et Rechercher</h2>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          {/* Recherche - PLUS GRAND et sans icône */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3"></label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par ID, Cabinet, Email, Période, Statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors outline-none text-base placeholder-gray-400 text-gray-800"
                style={{ minHeight: "52px" }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                  aria-label="Effacer la recherche"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                cabinet
              </label>
              <div className="relative">
                <select
                  value={filterCabinet}
                  onChange={(e) => setFilterCabinet(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none appearance-none text-gray-800"
                >
                  <option className="text-gray-800">Tous les cabinets</option>
                  {Array.from(new Set(invoices.map((inv) => inv.cabinetNom))).map((cab) => (
                    <option key={cab} className="text-gray-800">{cab}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <MdFilterList className="text-gray-400" size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Statut
              </label>
              <div className="relative">
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none appearance-none text-gray-800"
                >
                  <option className="text-gray-800">Tous les status</option>
                  <option className="text-gray-800">PAYEE</option>
                  <option className="text-gray-800">EN_ATTENTE</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <MdFilterList className="text-gray-400" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau simplifié */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Liste des Factures
            <span className="text-gray-500 text-sm font-normal ml-2">
              ({filteredInvoices.length} résultat{filteredInvoices.length > 1 ? 's' : ''})
            </span>
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Payée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-600">En attente</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Chargement des factures</h3>
            <p className="text-gray-500">Récupération des données en cours...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune facture trouvée</h3>
            <p className="text-gray-500">Ajustez vos critères de recherche</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID Facture</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cabinet</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Montant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Période</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const isEditable = editingInvoices[invoice.id]?.isEditing || false;
                    const isPending = invoice.statut === "EN_ATTENTE";
                    
                    return (
                      <tr 
                        key={invoice.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">#{invoice.id}</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{invoice.cabinetNom}</div>
                        </td>
                        
                        <td className="px-6 py-4 text-gray-600">
                          {invoice.cabinetEmail}
                        </td>

                          {/* Montant input */}
                          <td className="px-6 py-4">
                              <div className="relative">
                                  <input
                                      type="number"
                                      value={editingInvoices[invoice.id]?.montant || ""}
                                      onChange={(e) => handleEditChange(invoice.id, "montant", e.target.value)}
                                      disabled={!isEditable}
                                      className={`w-full px-3 py-2 pr-12 border rounded transition-colors outline-none font-semibold text-base ${
                                          isEditable
                                              ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900"
                                              : "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-700"
                                      }`}
                                      placeholder="0.00"
                                      style={{ minWidth: "140px" }}
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                              {isEditable ? "MAD" : <MdLock size={14} className="text-gray-400" />}
                            </span>
                              </div>
                          </td>
                        {/* Période input */}
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editingInvoices[invoice.id]?.periode || ""}
                            onChange={(e) => handleEditChange(invoice.id, "periode", e.target.value)}
                            disabled={!isEditable}
                            className={`w-full px-3 py-2 border rounded transition-colors outline-none text-gray-800 ${
                              isEditable 
                                ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                : "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500"
                            }`}
                            placeholder="MM/AAAA"
                            style={{ minWidth: "140px" }}

                          />
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {invoice.dateCreation}
                        </td>

                        {/* Statut avec icône de verrouillage */}
                        <td className="px-6 py-4">
                          {invoice.statut === "PAYEE" ? (
                            <div className="flex items-center gap-2">
                              <MdCheckCircle className="text-green-600" size={18} />
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                                Payée
                                <MdLock size={12} />
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MdLockOpen className="text-amber-600" size={18} />
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                En Attente
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleMarkAsPaid(invoice.id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 transition-colors text-sm"
                                >
                                  <MdCheck size={16} />
                                  Marquer Payée
                                </button>
                                <button
                                  onClick={() => handleUpdateInvoice(invoice)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                                >
                                  Enregistrer
                                </button>
                              </>
                            ) : (
                              <>
                                {!isEditable ? (
                                  <button
                                    onClick={() => toggleEditing(invoice.id, invoice.statut)}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center gap-2 transition-colors text-sm"
                                    title="Déverrouiller pour modifier"
                                  >
                                    <MdLockOpen size={16} />
                                    Déverrouiller
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleUpdateInvoice(invoice)}
                                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                                    >
                                      Enregistrer
                                    </button>
                                    <button
                                      onClick={() => toggleEditing(invoice.id, invoice.statut)}
                                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center gap-2 transition-colors text-sm"
                                    >
                                      <MdLock size={16} />
                                      Verrouiller
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer du tableau */}
            {filteredInvoices.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    Affichage de <span className="font-medium text-gray-900">{filteredInvoices.length}</span> facture{filteredInvoices.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MdLockOpen className="text-amber-600" size={16} />
                      <span>En attente (modifiable): {pendingCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdLock className="text-green-600" size={16} />
                      <span>Payées (verrouillées): {paidCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}