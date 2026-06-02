import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../src/components/Admin/layouts/AdminLayout'
import Dashbord from "../src/components/Admin/pages/Dashbord"
import MedicalRequests from "../src/components/Admin/pages/MedicalRequests"
import MedicalManagement from "../src/components/Admin/pages/MedicalManagement"
import UserManagement from "../src/components/Admin/pages/UserManagement"
import MedecinManagement from "../src/components/Admin/pages/MedecinManagement"
import InvoicesManagement from "../src/components/Admin/pages/InvoicesManagement"

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
      <Route index element={<Dashbord />} />
      <Route path="candidatures" element={<MedicalRequests />} />
      <Route path="cabinets" element={<MedicalManagement />} />
      <Route path="utilisateurs" element={<UserManagement />} />
      <Route path="medicaments" element={<MedecinManagement />} />
      <Route path="factures" element={<InvoicesManagement />} />
      </Route>
    </Routes>
  )
}
