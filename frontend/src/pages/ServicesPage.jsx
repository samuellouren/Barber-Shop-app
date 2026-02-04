import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/services.css";

const ServicesPage = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: ""
  });

  const loadServices = async () => {
    const data = await apiRequest("/services", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setServices(data);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiRequest("/services", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      })
    });
    setFormData({ name: "", price: "", duration: "", description: "" });
    loadServices();
  };

  return (
    <section className="services-page">
      <header>
        <h2>Serviços</h2>
        <p>Gerencie valores e duração dos atendimentos.</p>
      </header>
      <div className="services-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Novo serviço</h3>
          <label>
            Nome
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Preço (R$)
            <input name="price" value={formData.price} onChange={handleChange} required />
          </label>
          <label>
            Duração (min)
            <input name="duration" value={formData.duration} onChange={handleChange} required />
          </label>
          <label>
            Descrição
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </label>
          <button type="submit">Salvar serviço</button>
        </form>
        <div className="card">
          <h3>Catálogo</h3>
          <ul className="service-list">
            {services.map((service) => (
              <li key={service.id}>
                <div>
                  <strong>{service.name}</strong>
                  <span>R$ {Number(service.price).toFixed(2)}</span>
                  <small>{service.duration} min</small>
                </div>
                <span className="tag">{service.description || "Sem descrição"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;
