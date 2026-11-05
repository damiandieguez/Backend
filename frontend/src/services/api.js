/**
 * API Service Client para comunicarse con el backend en Express
 */

const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`No se pudo conectar con el backend (HTTP ${response.status}). Asegúrate de que el servidor Express esté iniciado en el puerto 3000.`);
    }
    throw new Error('Respuesta inválida del servidor');
  }

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}: Solicitud fallida`);
  }

  return data;
}

// Usuarios & Auth
export const loginUser = (email, password) =>
  apiRequest('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

export const getUsuarios = (token) =>
  apiRequest('/usuarios', {}, token);

// Pacientes
export const getPacientes = () =>
  apiRequest('/pacientes');

export const createPaciente = (data, token) =>
  apiRequest('/pacientes', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);

export const deletePaciente = (id, token) =>
  apiRequest(`/pacientes/${id}`, {
    method: 'DELETE'
  }, token);

// Profesionales
export const getProfesionales = () =>
  apiRequest('/profesionales');

export const createProfesional = (data, token) =>
  apiRequest('/profesionales', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);

export const deleteProfesional = (id, token) =>
  apiRequest(`/profesionales/${id}`, {
    method: 'DELETE'
  }, token);

// Turnos
export const getTurnos = (token) =>
  apiRequest('/turnos', {}, token);

export const createTurno = (data, token) =>
  apiRequest('/turnos', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);

export const updateTurno = (id, data, token) =>
  apiRequest(`/turnos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, token);

export const deleteTurno = (id, token) =>
  apiRequest(`/turnos/${id}`, {
    method: 'DELETE'
  }, token);
