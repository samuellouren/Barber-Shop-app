import React from "react";
import { useAuth } from "../services/authContext";
import "../styles/topbar.css";

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1>Barbearia MB</h1>
        <span>Sistema interno de recepção</span>
      </div>
      <div className="topbar-user">
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>
        <button type="button" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Topbar;
