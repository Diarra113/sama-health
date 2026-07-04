import axios from "axios";

export async function telechargerPDF(url, token, nomFichier) {
  const reponse = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

  const lienBlob = window.URL.createObjectURL(new Blob([reponse.data]));
  const lien = document.createElement("a");
  lien.href = lienBlob;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  window.URL.revokeObjectURL(lienBlob);
}