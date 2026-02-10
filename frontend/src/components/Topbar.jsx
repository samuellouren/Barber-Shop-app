import React from "react";
import { useAuth } from "../services/authContext";
import "../styles/topbar.css";

// Componente do menu do usuário
const UserMenu = ({ user, onLogout }) => (
  <div className="topbar-user">
    <div>
      <strong>{user?.name || "Usuário"}</strong>
      <small>{user?.role || "Função"}</small>
    </div>
    <button type="button" onClick={onLogout}>
      Sair
    </button>
  </div>
);

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1>Barbearia MB</h1>
        <span>Sistema interno de recepção</span>
      </div>

      <UserMenu user={user} onLogout={logout} />
    </header>
  );
};

export default Topbar;
