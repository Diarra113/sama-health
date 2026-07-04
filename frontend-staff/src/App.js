import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexte/AuthContext";
import Layout from "./composants/commun/Layout";
import LayoutAdmin from "./composants/commun/LayoutAdmin";
import LayoutResponsable from "./composants/commun/LayoutResponsable";
import LayoutMedecin from "./composants/commun/LayoutMedecin";
import Connexion from "./pages/Connexion";
import TableauDeBordAdmin from "./pages/admin/TableauDeBordAdmin";
import HopitauxAdmin from "./pages/admin/HopitauxAdmin";
import HopitalDetailAdmin from "./pages/admin/HopitalDetailAdmin";
import AdministrateursAdmin from "./pages/admin/AdministrateursAdmin";
import TableauDeBordResponsable from "./pages/responsable/TableauDeBordResponsable";
import FileDuJour from "./pages/responsable/FileDuJour";
import RendezVousResponsable from "./pages/responsable/RendezVousResponsable";
import TicketsResponsable from "./pages/responsable/TicketsResponsable";
import PlanningsResponsable from "./pages/responsable/PlanningsResponsable";
import MedecinsResponsable from "./pages/responsable/MedecinsResponsable";
import ParametresService from "./pages/responsable/ParametresService";
import TableauDeBordMedecin from "./pages/medecin/TableauDeBordMedecin";
import FileDuJourMedecin from "./pages/medecin/FileDuJourMedecin";
import PlanningMedecin from "./pages/medecin/PlanningMedecin";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Connexion />} />
          <Route element={<Layout />}>
            <Route path="/admin" element={<LayoutAdmin />}>
              <Route index element={<TableauDeBordAdmin />} />
              <Route path="hopitaux" element={<HopitauxAdmin />} />
              <Route path="hopitaux/:id" element={<HopitalDetailAdmin />} />
              <Route path="administrateurs" element={<AdministrateursAdmin />} />
            </Route>

            <Route path="/responsable" element={<LayoutResponsable />}>
              <Route index element={<TableauDeBordResponsable />} />
              <Route path="file-du-jour" element={<FileDuJour />} />
              <Route path="rendez-vous" element={<RendezVousResponsable />} />
              <Route path="tickets" element={<TicketsResponsable />} />
              <Route path="plannings" element={<PlanningsResponsable />} />
              <Route path="medecins" element={<MedecinsResponsable />} />
              <Route path="parametres" element={<ParametresService />} />
            </Route>

            <Route path="/medecin" element={<LayoutMedecin />}>
              <Route index element={<TableauDeBordMedecin />} />
              <Route path="file-du-jour" element={<FileDuJourMedecin />} />
              <Route path="planning" element={<PlanningMedecin />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;