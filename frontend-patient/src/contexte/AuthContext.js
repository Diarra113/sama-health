import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenStocke = localStorage.getItem("token");
    const utilisateurStocke = localStorage.getItem("utilisateur");
    if (tokenStocke && utilisateurStocke) {
      setToken(tokenStocke);
      setUtilisateur(JSON.parse(utilisateurStocke));
    }
  }, []);

  const connecter = (token, utilisateur) => {
    localStorage.setItem("token", token);
    localStorage.setItem("utilisateur", JSON.stringify(utilisateur));
    setToken(token);
    setUtilisateur(utilisateur);
  };

  const mettreAJourUtilisateur = (nouvellesInfos) => {
    const utilisateurMisAJour = { ...utilisateur, ...nouvellesInfos };
    localStorage.setItem("utilisateur", JSON.stringify(utilisateurMisAJour));
    setUtilisateur(utilisateurMisAJour);
};

  const deconnecter = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setToken(null);
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, token, connecter, deconnecter, mettreAJourUtilisateur }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}