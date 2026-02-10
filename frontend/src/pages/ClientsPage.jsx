import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/clients.css";

const ClientsPage = () => {
  const { token } = useAuth();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    preferences: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingClientId, setEditingClientId] = useState(null); // estado para edição

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/clients?search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClients();
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { name: formData.name, phone: formData.phone };
      if (formData.email) payload.email = formData.email;
      if (formData.birthDate) payload.birthDate = formData.birthDate;
      if (formData.preferences) payload.preferences = formData.preferences;

      if (editingClientId) {
        // Atualizar cliente existente
        await apiRequest(`/clients/${editingClientId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        setEditingClientId(null);
      } else {
        // Criar novo cliente
        await apiRequest("/clients", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      setFormData({
        name: "",
        phone: "",
        email: "",
        birthDate: "",
        preferences: "",
      });

      loadClients();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar cliente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    setLoading(true);
    setError(null);

    try {
      await apiRequest(`/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadClients();
    } catch (err) {
      console.error(err);
      setError("Erro ao deletar cliente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingClientId(client.id);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      birthDate: client.birthDate ? client.birthDate.split("T")[0] : "",
      preferences: client.preferences || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingClientId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      birthDate: "",
      preferences: "",
    });
  };

  return (
    <section className="clients-page">
      <header>
        <h2>Clientes</h2>
        <p>Cadastre clientes e acompanhe preferências e histórico.</p>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="clients-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editingClientId ? "Editar cliente" : "Novo cliente"}</h3>

          <label htmlFor="name">
            Nome
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="phone">
            Telefone
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="email">
            E-mail
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="birthDate">
            Data de nascimento
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </label>

          <label htmlFor="preferences">
            Preferências
            <textarea
              id="preferences"
              name="preferences"
              rows="3"
              value={formData.preferences}
              onChange={handleChange}
            />
          </label>

          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingClientId ? "Atualizar" : "Salvar cliente"}
            </button>
            {editingClientId && (
              <button type="button" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <div className="search">
            <input
              placeholder="Buscar por nome, telefone ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading && <div>Carregando clientes...</div>}

          <ul className="client-list">
            {clients.map((client) => (
              <li key={client.id}>
                <div>
                  <strong>{client.name}</strong>
                  <span>{client.phone}</span>
                  {client.email && <small>{client.email}</small>}
                </div>
                <div className="client-actions">
                  <span className="tag">{client.loyaltyPoints || 0} pontos</span>
                  <button onClick={() => handleEdit(client)}>Editar</button>
                  <button onClick={() => handleDelete(client.id)}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>

          {clients.length === 0 && !loading && <p>Nenhum cliente encontrado.</p>}
        </div>
      </div>
    </section>
  );
};

export default ClientsPage;
