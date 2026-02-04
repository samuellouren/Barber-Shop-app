import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/barbers.css";

const BarbersPage = () => {
  const { token } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    specialties: ""
  });

  const loadBarbers = async () => {
    const data = await apiRequest("/barbers", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBarbers(data);
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiRequest("/barbers", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    setFormData({ name: "", phone: "", email: "", specialties: "" });
    loadBarbers();
  };

  return (
    <section className="barbers-page">
      <header>
        <h2>Barbeiros</h2>
        <p>Cadastre profissionais e acompanhe especialidades.</p>
      </header>
      <div className="barbers-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Novo barbeiro</h3>
          <label>
            Nome
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Telefone
            <input name="phone" value={formData.phone} onChange={handleChange} required />
          </label>
          <label>
            E-mail
            <input name="email" value={formData.email} onChange={handleChange} type="email" />
          </label>
          <label>
            Especialidades
            <textarea name="specialties" value={formData.specialties} onChange={handleChange} rows="3" />
          </label>
          <button type="submit">Salvar barbeiro</button>
        </form>
        <div className="card">
          <h3>Equipe</h3>
          <ul className="barber-list">
            {barbers.map((barber) => (
              <li key={barber.id}>
                <div>
                  <strong>{barber.name}</strong>
                  <span>{barber.phone}</span>
                  <small>{barber.email}</small>
                </div>
                <span className="tag">{barber.specialties || "Sem especialidades"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BarbersPage;
