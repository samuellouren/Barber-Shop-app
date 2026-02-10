const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error.message || error.error || response.statusText || "Erro inesperado";
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
