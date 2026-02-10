import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/dashboard.css";

const PLACEHOLDERS = "Use no texto: {{name}}, {{code}}, {{percent}}, {{expiresAt}}";

const DiscountsPage = () => {
  const { token } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadMessage = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/settings/birthday-message", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res?.data ?? res;
      setSubject(data.subject ?? "");
      setBody(data.body ?? "");
    } catch (err) {
      setError(err.message || "Erro ao carregar mensagem.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await apiRequest("/settings/birthday-message", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, body }),
      });
      setMessage("Mensagem salva com sucesso.");
    } catch (err) {
      setError(err.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendBirthday = async () => {
    if (!window.confirm("Enviar e-mails de desconto de aniversário para clientes que fazem aniversário hoje?")) return;
    setSending(true);
    setError("");
    setMessage("");
    try {
      const res = await apiRequest("/discounts/send-birthday", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ percent: 10 }),
      });
      const data = res?.data ?? {};
      const sent = data.sent?.length ?? 0;
      const errs = data.errors?.length ?? 0;
      setMessage(
        sent > 0 || errs > 0
          ? `${sent} e-mail(s) enviado(s). ${errs} erro(s).`
          : (res?.message || "Nenhum cliente com aniversário hoje e e-mail cadastrado.")
      );
    } catch (err) {
      setError(err.message || "Erro ao enviar e-mails.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <section className="dashboard">
      <header>
        <h2>Descontos e aniversário</h2>
        <p>Personalize a mensagem de desconto de aniversário e envie por e-mail.</p>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
        <h3>Mensagem de aniversário (e-mail)</h3>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
          {PLACEHOLDERS}
        </p>
        <form onSubmit={handleSave}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Assunto do e-mail
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Seu desconto de aniversário"
              style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem" }}
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            Corpo da mensagem
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Parabéns, {{name}}!..."
              style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem", resize: "vertical" }}
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar mensagem"}
          </button>
        </form>
      </div>

      <div className="card" style={{ textAlign: "left" }}>
        <h3>Enviar descontos de aniversário hoje</h3>
        <p style={{ marginBottom: "1rem", fontSize: "0.95rem", color: "#CBD5E1" }}>
          Clientes que fazem aniversário hoje e têm e-mail cadastrado receberão um código de desconto por e-mail (10%).
        </p>
        <button
          type="button"
          onClick={handleSendBirthday}
          disabled={sending}
        >
          {sending ? "Enviando..." : "Enviar e-mails de aniversário"}
        </button>
      </div>
    </section>
  );
};

export default DiscountsPage;
