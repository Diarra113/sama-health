import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexte/AuthContext";
import Layout from "./composants/commun/Layout";
import LayoutDashboard from "./composants/commun/LayoutDashboard";
import RouteProtegee from "./composants/commun/RouteProtegee";
import Accueil from "./pages/Accueil";
import Hopitaux from "./pages/Hopitaux";
import HopitalDetail from "./pages/HopitalDetail";
import APropos from "./pages/APropos";
import PourquoiSH from "./pages/PourquoiSH";
import Connexion from "./pages/Connexion";
import PriseRendezVous from "./pages/PriseRendezVous";
import AchatTicket from "./pages/AchatTicket";
import TableauDeBord from "./pages/espace-patient/TableauDeBord";
import MesRendezVous from "./pages/espace-patient/MesRendezVous";
import MesTickets from "./pages/espace-patient/MesTickets";
import MonProfil from "./pages/espace-patient/MonProfil";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Accueil />} />
            <Route path="/hopitaux" element={<Hopitaux />} />
            <Route path="/hopitaux/:id" element={<HopitalDetail />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/pourquoi-sama-health" element={<PourquoiSH />} />
            <Route path="/connexion" element={<Connexion />} />
          </Route>

          <Route element={<RouteProtegee />}>
            <Route element={<Layout />}>
              <Route path="/hopitaux/:id/rendez-vous" element={<PriseRendezVous />} />
              <Route path="/hopitaux/:id/ticket" element={<AchatTicket />} />
            </Route>

            <Route element={<LayoutDashboard />}>
              <Route path="/espace-patient" element={<TableauDeBord />} />
              <Route path="/espace-patient/rendez-vous" element={<MesRendezVous />} />
              <Route path="/espace-patient/tickets" element={<MesTickets />} />
              <Route path="/espace-patient/profil" element={<MonProfil />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;