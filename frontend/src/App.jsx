import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import TurnosView from './components/TurnosView';
import PacientesView from './components/PacientesView';
import ProfesionalesView from './components/ProfesionalesView';
import UsuariosView from './components/UsuariosView';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';

import {
  loginUser,
  getPacientes,
  createPaciente,
  deletePaciente,
  getProfesionales,
  createProfesional,
  deleteProfesional,
  getTurnos,
  createTurno,
  updateTurno,
  deleteTurno,
  getUsuarios
} from './services/api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('cs_token') || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cs_user') || 'null');
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('turnos');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Data collections
  const [pacientes, setPacientes] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Toast helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch functions
  const loadPacientes = useCallback(async () => {
    try {
      const res = await getPacientes();
      setPacientes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadProfesionales = useCallback(async () => {
    try {
      const res = await getProfesionales();
      setProfesionales(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadTurnos = useCallback(async (authToken) => {
    if (!authToken) {
      setTurnos([]);
      return;
    }
    try {
      const res = await getTurnos(authToken);
      setTurnos(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadUsuarios = useCallback(async (authToken, currentUser) => {
    if (!authToken || currentUser?.rol !== 'ADMIN') {
      setUsuarios([]);
      return;
    }
    try {
      const res = await getUsuarios(authToken);
      setUsuarios(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadAllData = useCallback(async (authToken, currentUser) => {
    await Promise.allSettled([
      loadPacientes(),
      loadProfesionales(),
      loadTurnos(authToken),
      loadUsuarios(authToken, currentUser)
    ]);
  }, [loadPacientes, loadProfesionales, loadTurnos, loadUsuarios]);

  useEffect(() => {
    loadAllData(token, user);
  }, [token, user, loadAllData]);

  // Auth Handlers
  const handleLogin = async (email, password) => {
    try {
      const res = await loginUser(email, password);
      const { usuario, token: jwtToken } = res.data;

      setToken(jwtToken);
      setUser(usuario);
      localStorage.setItem('cs_token', jwtToken);
      localStorage.setItem('cs_user', JSON.stringify(usuario));

      addToast(`¡Bienvenido, ${usuario.email}!`, 'success');
      setLoginModalOpen(false);
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setTurnos([]);
    setUsuarios([]);
    addToast('Sesión finalizada', 'info');
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      handleLogin('admin@centrosalud.com', 'Admin123!');
    } else if (role === 'profesional') {
      handleLogin('carlos.rodriguez@hospital.com', 'Password123!');
    } else if (role === 'paciente') {
      handleLogin('juan.perez@email.com', 'Password123!');
    }
  };

  // Turnos Actions
  const handleCreateTurno = async (data) => {
    try {
      await createTurno(data, token);
      addToast('Turno agendado exitosamente', 'success');
      loadTurnos(token);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateTurnoEstado = async (id, nuevoEstado) => {
    try {
      await updateTurno(id, { estado: nuevoEstado }, token);
      addToast(`Turno actualizado a estado ${nuevoEstado}`, 'success');
      loadTurnos(token);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTurno = async (id) => {
    if (!confirm('¿Confirma que desea eliminar este turno?')) return;
    try {
      await deleteTurno(id, token);
      addToast('Turno eliminado correctamente', 'success');
      loadTurnos(token);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Pacientes Actions
  const handleCreatePaciente = async (data) => {
    try {
      await createPaciente(data, token);
      addToast('Paciente registrado con éxito', 'success');
      loadPacientes();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeletePaciente = async (id) => {
    if (!confirm('¿Confirma que desea eliminar este paciente?')) return;
    try {
      await deletePaciente(id, token);
      addToast('Paciente eliminado', 'success');
      loadPacientes();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Profesionales Actions
  const handleCreateProfesional = async (data) => {
    try {
      await createProfesional(data, token);
      addToast('Profesional registrado con éxito', 'success');
      loadProfesionales();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProfesional = async (id) => {
    if (!confirm('¿Confirma que desea eliminar este profesional?')) return;
    try {
      await deleteProfesional(id, token);
      addToast('Profesional eliminado', 'success');
      loadProfesionales();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const pendientesCount = turnos.filter((t) => t.estado === 'PENDIENTE').length;

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
      />

      <MetricCards
        pacientesCount={pacientes.length}
        profesionalesCount={profesionales.length}
        turnosCount={turnos.length}
        pendientesCount={pendientesCount}
      />

      {/* Tabs Switcher */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'turnos' ? 'active' : ''}`}
          onClick={() => setActiveTab('turnos')}
        >
          <span>📅</span> Turnos y Citas
        </button>
        <button
          className={`tab-btn ${activeTab === 'pacientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pacientes')}
        >
          <span>👥</span> Pacientes e Historial
        </button>
        <button
          className={`tab-btn ${activeTab === 'profesionales' ? 'active' : ''}`}
          onClick={() => setActiveTab('profesionales')}
        >
          <span>👨‍⚕️</span> Profesionales y Especialidades
        </button>
        <button
          className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <span>🛡️</span> Usuarios y Accesos
        </button>
      </nav>

      {/* Tab Contents */}
      <main>
        {activeTab === 'turnos' && (
          <TurnosView
            turnos={turnos}
            pacientes={pacientes}
            profesionales={profesionales}
            user={user}
            onOpenLogin={() => setLoginModalOpen(true)}
            onCreateTurno={handleCreateTurno}
            onUpdateEstado={handleUpdateTurnoEstado}
            onDeleteTurno={handleDeleteTurno}
          />
        )}

        {activeTab === 'pacientes' && (
          <PacientesView
            pacientes={pacientes}
            user={user}
            onOpenLogin={() => setLoginModalOpen(true)}
            onCreatePaciente={handleCreatePaciente}
            onDeletePaciente={handleDeletePaciente}
          />
        )}

        {activeTab === 'profesionales' && (
          <ProfesionalesView
            profesionales={profesionales}
            user={user}
            onOpenLogin={() => setLoginModalOpen(true)}
            onCreateProfesional={handleCreateProfesional}
            onDeleteProfesional={handleDeleteProfesional}
          />
        )}

        {activeTab === 'usuarios' && (
          <UsuariosView
            usuarios={usuarios}
            user={user}
            onQuickLogin={handleQuickLogin}
          />
        )}
      </main>

      {/* Modals & Toasts */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
