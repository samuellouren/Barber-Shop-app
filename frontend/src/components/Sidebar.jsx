import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

// Links da sidebar em um array para facilitar manutenção
const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/clientes", label: "Clientes" },
  { to: "/agendamentos", label: "Agendamentos" },
  { to: "/barbeiros", label: "Barbeiros" },
  { to: "/servicos", label: "Serviços" },
  { to: "/descontos", label: "Descontos" },
];

// Componente de Link individual para sidebar
const SidebarLink = ({ to, label, end }) => (
  <NavLink to={to} end={end}>
    {label}
  </NavLink>
);

const Sidebar = () => (
  <aside className="sidebar">
    <div className="brand">
      <span>MB</span>
      <div>
        <strong>Barbearia MB</strong>
        <small> Recepção</small>
      </div>
    </div>

    <nav>
      {navLinks.map((link) => (
        <SidebarLink
          key={link.to}
          to={link.to}
          label={link.label}
          end={link.end}
        />
      ))}
    </nav>
  </aside>
);

export default Sidebar;
