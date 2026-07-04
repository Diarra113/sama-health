// ⚠️ Pour les hôpitaux marqués "complément estimé", les spécialités de base
// (médecine générale, pédiatrie, etc.) ont été ajoutées par déduction raisonnable
// (taille/type d'établissement), faute de détail exhaustif dans la source.
// À vérifier/valider avant toute présentation officielle.
import hopitalPlaceholder from "../ressources/hopital-placeholder.jpg";

const hopitaux = [
  {
    id: 1,
    nom: "CHNU de Fann",
    adresse: "Avenue Cheikh Anta Diop, Fann, Dakar",
    telephone: "+221 33 869 18 18",
    photo: hopitalPlaceholder,
    specialites: ["Cardiologie", "Pneumologie", "ORL", "Infectiologie", "Gériatrie", "Psychiatrie", "Neurochirurgie", "Imagerie médicale", "Hématologie"],
    urgences24h: true,
  },
  {
    id: 2,
    nom: "Hôpital Principal de Dakar",
    adresse: "1, Avenue Nelson Mandela, Dakar-Plateau",
    telephone: "+221 33 839 50 50",
    photo: hopitalPlaceholder,
    specialites: ["Médecine interne", "Chirurgie générale", "Orthopédie-traumatologie", "Neurochirurgie", "Pédiatrie", "Cardiologie", "Ophtalmologie", "ORL", "Gastro-entérologie", "Néphrologie", "Endocrinologie", "Hématologie", "Dermatologie", "Neurologie"],
    urgences24h: true,
  },
  {
    id: 3,
    nom: "CHU Aristide Le Dantec",
    adresse: "30, Avenue Pasteur, Dakar-Plateau",
    telephone: "+221 33 889 38 00",
    photo: hopitalPlaceholder,
    // complément estimé : ORL, Pédiatrie, Cardiologie, Ophtalmologie
    specialites: ["Médecine générale", "Chirurgie", "Maternité", "ORL", "Pédiatrie", "Cardiologie", "Ophtalmologie"],
    urgences24h: true,
  },
  {
    id: 4,
    nom: "Hôpital National d'Enfants Albert Royer",
    adresse: "Avenue Cheikh Anta Diop, Fann, Dakar",
    telephone: "+221 33 825 03 08",
    photo: hopitalPlaceholder,
    specialites: ["Pédiatrie", "Chirurgie pédiatrique", "Cardiologie pédiatrique", "Pneumologie pédiatrique"],
    urgences24h: false,
  },
  {
    id: 5,
    nom: "CHU Abass Ndao",
    adresse: "Route de Fann, Dakar",
    telephone: "+221 33 849 78 00",
    photo: hopitalPlaceholder,
    // complément estimé : Chirurgie générale, Pédiatrie, Cardiologie, ORL, Gynécologie
    specialites: ["Médecine générale", "Chirurgie générale", "Pédiatrie", "Cardiologie", "ORL", "Gynécologie"],
    urgences24h: false,
  },
  {
    id: 6,
    nom: "Hôpital Général de Grand Yoff (HOGGY)",
    adresse: "Route du Front de Terre, Grand Yoff, Dakar",
    telephone: "+221 33 869 40 50",
    photo: hopitalPlaceholder,
    // complément estimé : Médecine générale, Chirurgie générale, Pédiatrie, ORL, Cardiologie
    specialites: ["Gynécologie-obstétrique", "Médecine générale", "Chirurgie générale", "Pédiatrie", "ORL", "Cardiologie"],
    urgences24h: true,
  },
  {
    id: 7,
    nom: "Centre Hospitalier National de Pikine",
    adresse: "Camp de Thiaroye, Pikine",
    telephone: "+221 33 834 25 66",
    photo: hopitalPlaceholder,
    specialites: ["Consultations externes", "Hospitalisation", "Analyses biologiques", "Imagerie médicale", "Pharmacie hospitalière", "Pédiatrie", "Médecine générale"],
    urgences24h: true,
  },
  {
    id: 8,
    nom: "Hôpital Elisabeth Diouf de Rufisque",
    adresse: "Rufisque",
    telephone: "+221 33 836 36 94",
    photo: hopitalPlaceholder,
    specialites: ["Consultations externes", "Hospitalisation", "Analyses biologiques", "Imagerie médicale", "Pharmacie hospitalière", "Médecine générale", "Gynécologie"],
    urgences24h: false,
  },
  {
    id: 9,
    nom: "Hôpital Psychiatrique de Thiaroye",
    adresse: "Km 18, Route de Rufisque, Thiaroye, Pikine",
    telephone: "+221 33 879 80 80",
    photo: hopitalPlaceholder,
    specialites: ["Psychiatrie", "Santé mentale", "Addictologie", "Psychologie clinique"],
    urgences24h: false,
  },
];

export default hopitaux;