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
    specialties: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBarberId, setEditingBarberId] = useState(null);

  const loadBarbers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/barbers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBarbers(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar barbeiros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadBarbers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
      };
      if (formData.email) payload.email = formData.email;
      if (formData.specialties) payload.specialties = formData.specialties;

      if (editingBarberId) {
        // Atualizar barbeiro
        await apiRequest(`/barbers/${editingBarberId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setEditingBarberId(null);
      } else {
        // Criar barbeiro
        await apiRequest("/barbers", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setFormData({ name: "", phone: "", email: "", specialties: "" });
      loadBarbers();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar barbeiro.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (barber) => {
    setEditingBarberId(barber.id);
    setFormData({
      name: barber.name,
      phone: barber.phone || "",
      email: barber.email || "",
      specialties: barber.specialties || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingBarberId(null);
    setFormData({ name: "", phone: "", email: "", specialties: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este barbeiro?")) return;

    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/barbers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBarbers();
    } catch (err) {
      console.error(err);
      setError("Erro ao deletar barbeiro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="barbers-page">
      <header>
        <h2>Barbeiros</h2>
        <p>Cadastre profissionais e acompanhe especialidades.</p>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="barbers-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editingBarberId ? "Editar barbeiro" : "Novo barbeiro"}</h3>

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
            <textarea
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              rows="3"
            />
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : editingBarberId ? "Atualizar" : "Salvar barbeiro"}
            </button>
            {editingBarberId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="card card-list">
          <h3>Equipe</h3>
          {loading && <p className="loading-text">Carregando barbeiros...</p>}
          <ul className="barber-list">
            {barbers.map((barber) => (
              <li key={barber.id} className="barber-item">
                <div className="barber-info">
                  <strong className="barber-name">{barber.name}</strong>
                  <span className="barber-phone">{barber.phone}</span>
                  <small className="barber-email">{barber.email || "—"}</small>
                </div>
                <div className="barber-right">
                  <span className={`barber-tag ${barber.specialties ? "has-specialty" : "no-specialty"}`}>
                    {barber.specialties || "Sem especialidades"}
                  </span>
                  <div className="barber-actions">
                    <button type="button" className="btn-editar" onClick={() => handleEdit(barber)}>Editar</button>
                    <button type="button" className="btn-excluir" onClick={() => handleDelete(barber.id)}>Excluir</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {barbers.length === 0 && !loading && <p className="empty-text">Nenhum barbeiro cadastrado.</p>}
        </div>
      </div>
    </section>
  );
};

export default BarbersPage;
