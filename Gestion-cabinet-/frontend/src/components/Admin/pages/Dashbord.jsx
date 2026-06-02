import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import StatCard from "../components/StatCard";
import {
  MdTrendingUp,
  MdWarning,
  MdPeople,
  MdAttachMoney,
} from "react-icons/md";
import DashboardService from "../services/DashboardService";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalCabinets: 0,
    activeUsers: 0,
    pendingAdminFactures: 0,
    totalRevenue: "0 MAD",
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ État de chargement
  const [error, setError] = useState(null); // ✅ État d'erreur

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await DashboardService.getDashboardData();

        // ✅ VÉRIFICATION: Afficher les données reçues
        console.log("📊 Données reçues du backend:", data);

        setDashboardData({
          totalCabinets: data.totalCabinets || 0,
          activeUsers: data.activeUsers || 0,
          pendingAdminFactures: data.pendingAdminFactures || 0,
          totalRevenue: data.totalRevenue || "0 MAD",
        });

        setMonthlyData(
            (data.monthlyData || []).map((m) => ({
              month: m.month,
              cabinets: m.cabinets,
              utilisateurs: m.utilisateurs,
              factures: m.adminFactures,
            }))
        );

        setRecentActivities(data.recentActivities || []);
      } catch (error) {
        console.error("❌ Erreur lors du chargement du dashboard:", error);
        setError("Impossible de charger les données du dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ AFFICHAGE PENDANT LE CHARGEMENT
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
          </div>
        </div>
    );
  }

  // ✅ AFFICHAGE EN CAS D'ERREUR
  if (error) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="p-8 space-y-10">
        {/* ===== STATS ===== */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Aperçu général
          </h2>

          <div className="grid grid-cols-4 gap-6">
            <StatCard
                title="Total Cabinets"
                value={dashboardData.totalCabinets}
                change="+8%"
                icon={<MdTrendingUp size={22} />}
            />

            <StatCard
                title="Utilisateurs actifs"
                value={dashboardData.activeUsers}
                change="+12%"
                icon={<MdPeople size={22} />}
            />

            <StatCard
                title="Factures en attente"
                value={dashboardData.pendingAdminFactures}
                change="-3%"
                icon={<MdWarning size={22} />}
            />

            <StatCard
                title="Revenus totaux"
                value={dashboardData.totalRevenue}
                change="+15%"
                icon={<MdAttachMoney size={22} />}
            />
          </div>
        </section>

        {/* ===== GRAPHS ===== */}
        <section>
          <h2 className="text-base font-semibold text-black mb-6 font-sans">
            Analyses & statistiques
          </h2>

          <div className="grid grid-cols-2 gap-8">
            {/* Croissance mensuelle */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <h3 className="text-xs font-medium text-blue-800 mb-4 font-sans">
                Croissance mensuelle
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#1e3a8a", fontFamily: "Poppins, sans-serif" }}
                  />
                  <YAxis
                      tick={{ fontSize: 10, fill: "#1e3a8a", fontFamily: "Poppins, sans-serif" }}
                  />
                  <Tooltip
                      contentStyle={{ fontSize: 10, color: "#1e3a8a", fontFamily: "Poppins, sans-serif" }}
                  />
                  <Bar dataKey="cabinets" fill="#1e40af" />
                  <Bar dataKey="utilisateurs" fill="#1e3a8a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenus mensuels */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <h3 className="text-xs font-medium text-blue-800 mb-4 font-sans">
                Revenus mensuels
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#1e3a8a", fontFamily: "Poppins, sans-serif" }}
                  />
                  <YAxis
                      tick={{ fontSize: 10, fill: "#1e3a8a", fontFamily: "Poppins, sans-serif" }}
                  />
                  <Tooltip
                      contentStyle={{ fontSize: 10, color: "#1e3a8a", fontFamily: "Poppins, sans-serif" }}
                  />
                  <Line
                      type="monotone"
                      dataKey="factures"
                      stroke="#1e40af"
                      strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ===== ACTIVITÉS RÉCENTES ===== */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-slate-900 mb-8 tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Activités récentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentActivities.length === 0 ? (
                <p className="col-span-3 text-center text-gray-500">
                  Aucune activité récente
                </p>
            ) : (
                recentActivities.map((activity, index) => {
                  // Déterminer l'icône selon le type d'activité
                  let icon;
                  let iconColor;
                  if (activity.action.toLowerCase().includes("facture")) {
                    icon = "💰";
                    iconColor = "text-green-500";
                  } else if (activity.action.toLowerCase().includes("utilisateur")) {
                    icon = "👤";
                    iconColor = "text-blue-500";
                  } else if (activity.action.toLowerCase().includes("cabinet")) {
                    icon = "🏥";
                    iconColor = "text-purple-500";
                  } else {
                    icon = "📝";
                    iconColor = "text-gray-500";
                  }

                  return (
                      <div
                          key={index}
                          className="relative bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center text-center min-h-[140px] group"
                      >
                        {/* Icône en haut */}
                        <div className={`text-3xl mb-3 ${iconColor}`}>{icon}</div>

                        {/* Action */}
                        <p className="font-semibold text-slate-900 text-base mb-1">
                          {activity.action}
                        </p>

                        {/* Détail (nom de l'utilisateur, cabinet, facture) */}
                        <p className="text-slate-500 text-sm mb-2">{activity.detail}</p>

                        {/* Heure - ✅ CORRECTION: timeAgo au lieu de time */}
                        <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded-full">
                    {activity.timeAgo}
                  </span>

                        {/* Overlay dynamique au hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                      </div>
                  );
                })
            )}
          </div>
        </section>
      </div>
  );
}