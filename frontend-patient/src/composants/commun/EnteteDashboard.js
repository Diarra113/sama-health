import "./EnteteDashboard.css";

function EnteteDashboard({ titre, sousTitre }) {
  return (
    <div className="entete-dashboard">
      <h1 className="entete-dashboard-titre">{titre}</h1>
      {sousTitre && <p className="entete-dashboard-soustitre">{sousTitre}</p>}
    </div>
  );
}

export default EnteteDashboard;