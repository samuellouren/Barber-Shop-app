import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../styles/layout.css";

const Layout = () => (
  <div className="app-shell">
    <Sidebar />
    <div className="content">
      <Topbar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;
