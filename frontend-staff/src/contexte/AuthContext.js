import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenStocke = localStorage.getItem("token-staff");
    const utilisateurStocke = localStorage.getItem("utilisateur-staff");
    if (tokenStocke && utilisateurStocke) {
      setToken(tokenStocke);
      setUtilisateur(JSON.parse(utilisateurStocke));
    }
  }, []);

  const connecter = (token, utilisateur) => {
    localStorage.setItem("token-staff", token);
    localStorage.setItem("utilisateur-staff", JSON.stringify(utilisateur));
    setToken(token);
    setUtilisateur(utilisateur);
  };

  const deconnecter = () => {
    localStorage.removeItem("token-staff");
    localStorage.removeItem("utilisateur-staff");
    setToken(null);
    setUtilisateur(null);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, token, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}