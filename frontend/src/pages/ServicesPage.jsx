import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/services.css";

const getData = (response) =>
  Array.isArray(response) ? response : response?.data ?? [];

const ServicesPage = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  });

  const loadServices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/services", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(getData(response));
    } catch (err) {
      setError(err.message || "Erro ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      duration: Number(formData.duration),
    };
    if (formData.description?.trim()) {
      payload.description = formData.description.trim();
    }

    try {
      await apiRequest("/services", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setFormData({
        name: "",
        price: "",
        duration: "",
        description: "",
      });
      await loadServices();
    } catch (err) {
      setError(err.message || "Erro ao criar serviço.");
    }
  };

  return (
    <section className="services-page">
      <header>
        <h2>Serviços</h2>
        <p>Gerencie valores e duração dos atendimentos.</p>
      </header>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Carregando...</p>
      ) : (
      <div className="services-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Novo serviço</h3>

          <label>
            Nome
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Preço (R$)
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Duração (min)
            <input
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Descrição
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
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
                <span className="tag">
                  {service.description || "Sem descrição"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      )}
    </section>
  );
};

export default ServicesPage;
