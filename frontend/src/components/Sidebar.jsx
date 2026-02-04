import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => (
  <aside className="sidebar">
    <div className="brand">
      <span>MB</span>
      <div>
        <strong>Barbearia MB</strong>
        <small>Recepção</small>
      </div>
    </div>
    <nav>
      <NavLink to="/" end>
        Dashboard
      </NavLink>
      <NavLink to="/clientes">Clientes</NavLink>
      <NavLink to="/agendamentos">Agendamentos</NavLink>
      <NavLink to="/barbeiros">Barbeiros</NavLink>
      <NavLink to="/servicos">Serviços</NavLink>
    </nav>
  </aside>
);

export default Sidebar;
