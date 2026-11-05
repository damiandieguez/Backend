/**
 * Centro de Salud - Frontend Client Application
 * Conexión completa a la API RESTful de Express y Mongoose
 */

const API_BASE = '/api';

// Estado global reactivo
const state = {
  token: localStorage.getItem('cs_token') || null,
  user: JSON.parse(localStorage.getItem('cs_user') || 'null'),
  pacientes: [],
  profesionales: [],
  turnos: [],
  usuarios: [],
  filtroTurnoEstado: 'TODOS',
  busquedaPaciente: '',
  busquedaProfesional: ''
};

// ==========================================
// API Helper con inyección de JWT
// ==========================================
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: Solicitud fallida`);
    }

    return data;
  } catch (error) {
    console.error(`API Error en ${endpoint}:`, error);
    showToast(error.message, 'error');
    throw error;
  }
}

// ==========================================
// Toasts & Notificaciones
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <span style="font-weight: bold;">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// Autenticación & Manejo de Sesión
// ==========================================
async function login(email, password) {
  try {
    const res = await apiFetch('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.token = res.data.token;
    state.user = res.data.usuario;

    localStorage.setItem('cs_token', state.token);
    localStorage.setItem('cs_user', JSON.stringify(state.user));

    updateAuthUI();
    showToast(`¡Bienvenido, ${state.user.email}!`, 'success');
    closeModal('modal-login');
    await loadInitialData();
  } catch (error) {
    // Error ya manejado por apiFetch
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('cs_token');
  localStorage.removeItem('cs_user');
  updateAuthUI();
  showToast('Sesión cerrada correctamente', 'info');
  loadInitialData();
}

function updateAuthUI() {
  const userBadge = document.getElementById('user-profile-badge');
  const loginBtn = document.getElementById('btn-open-login');

  if (state.token && state.user) {
    loginBtn.style.display = 'none';
    userBadge.style.display = 'flex';
    document.getElementById('logged-user-email').textContent = state.user.email;
    
    const roleBadge = document.getElementById('logged-user-role');
    roleBadge.textContent = state.user.rol;
    roleBadge.className = `badge badge-${state.user.rol.toLowerCase()}`;

    // Avatar inicial
    const initial = state.user.email.charAt(0).toUpperCase();
    document.getElementById('logged-user-avatar').textContent = initial;
  } else {
    loginBtn.style.display = 'inline-flex';
    userBadge.style.display = 'none';
  }
}

// Login rápido para pruebas
window.quickLogin = function (role) {
  if (role === 'admin') {
    login('admin@centrosalud.com', 'Admin123!');
  } else if (role === 'profesional') {
    login('carlos.rodriguez@hospital.com', 'Password123!');
  } else if (role === 'paciente') {
    login('juan.perez@email.com', 'Password123!');
  }
};

// ==========================================
// Carga de Datos Iniciales
// ==========================================
async function loadInitialData() {
  await Promise.allSettled([
    fetchPacientes(),
    fetchProfesionales(),
    fetchTurnos(),
    fetchUsuarios()
  ]);
  renderMetrics();
  populateDropdowns();
}

async function fetchPacientes() {
  try {
    const res = await apiFetch('/pacientes');
    state.pacientes = res.data || [];
    renderPacientes();
  } catch (err) {
    state.pacientes = [];
    renderPacientes();
  }
}

async function fetchProfesionales() {
  try {
    const res = await apiFetch('/profesionales');
    state.profesionales = res.data || [];
    renderProfesionales();
  } catch (err) {
    state.profesionales = [];
    renderProfesionales();
  }
}

async function fetchTurnos() {
  if (!state.token) {
    state.turnos = [];
    renderTurnos();
    return;
  }
  try {
    const res = await apiFetch('/turnos');
    state.turnos = res.data || [];
    renderTurnos();
  } catch (err) {
    state.turnos = [];
    renderTurnos();
  }
}

async function fetchUsuarios() {
  if (!state.token || state.user?.rol !== 'ADMIN') {
    state.usuarios = [];
    renderUsuarios();
    return;
  }
  try {
    const res = await apiFetch('/usuarios');
    state.usuarios = res.data || [];
    renderUsuarios();
  } catch (err) {
    state.usuarios = [];
    renderUsuarios();
  }
}

// ==========================================
// Renderizado de Métricas KPI
// ==========================================
function renderMetrics() {
  document.getElementById('metric-pacientes').textContent = state.pacientes.length;
  document.getElementById('metric-profesionales').textContent = state.profesionales.length;
  document.getElementById('metric-turnos').textContent = state.turnos.length;

  const pendientes = state.turnos.filter(t => t.estado === 'PENDIENTE').length;
  document.getElementById('metric-pendientes').textContent = pendientes;
}

// ==========================================
// Renderizado de Turnos
// ==========================================
function renderTurnos() {
  const container = document.getElementById('turnos-list');
  if (!container) return;

  if (!state.token) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔒</div>
        <h3>Autenticación Requerida</h3>
        <p>Inicie sesión con un usuario para visualizar y gestionar la agenda de turnos médicos.</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="openModal('modal-login')">Iniciar Sesión</button>
      </div>
    `;
    return;
  }

  let turnosFiltrados = state.turnos;
  if (state.filtroTurnoEstado !== 'TODOS') {
    turnosFiltrados = turnosFiltrados.filter(t => t.estado === state.filtroTurnoEstado);
  }

  if (turnosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📅</div>
        <h3>No hay turnos registrados</h3>
        <p>No se encontraron citas con el filtro seleccionado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = turnosFiltrados.map(turno => {
    const pacienteNombre = turno.paciente_id ? `${turno.paciente_id.nombre} ${turno.paciente_id.apellido}` : 'Paciente desconocido';
    const profesionalNombre = turno.profesional_id ? `Dr(a). ${turno.profesional_id.nombre} ${turno.profesional_id.apellido}` : 'Médico asignado';
    const fechaObj = new Date(turno.fecha_hora);
    const fechaFormateada = fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    const horaFormateada = fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const statusBadgeClass = `badge-status-${turno.estado.toLowerCase()}`;

    return `
      <div class="custom-card">
        <div class="card-header-flex">
          <div>
            <div class="card-title">${pacienteNombre}</div>
            <div class="card-subtitle">${profesionalNombre}</div>
          </div>
          <span class="badge ${statusBadgeClass}">${turno.estado}</span>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span>🩺</span>
            <span>Especialidad: <strong>${turno.especialidad}</strong></span>
          </div>
          <div class="info-item">
            <span>🗓️</span>
            <span>Fecha y Hora: <strong>${fechaFormateada} - ${horaFormateada} hs</strong></span>
          </div>
          ${turno.motivo ? `
            <div class="info-item">
              <span>📝</span>
              <span>Motivo: <em>${turno.motivo}</em></span>
            </div>
          ` : ''}
        </div>

        <div class="card-footer">
          <div style="display: flex; gap: 0.4rem;">
            ${turno.estado === 'PENDIENTE' ? `
              <button class="btn btn-secondary btn-sm" onclick="cambiarEstadoTurno('${turno._id}', 'CONFIRMADO')">Confirmar</button>
            ` : ''}
            ${turno.estado === 'CONFIRMADO' ? `
              <button class="btn btn-primary btn-sm" onclick="cambiarEstadoTurno('${turno._id}', 'ATENDIDO')">Atender</button>
            ` : ''}
            ${turno.estado !== 'CANCELADO' && turno.estado !== 'ATENDIDO' ? `
              <button class="btn btn-danger-outline btn-sm" onclick="cambiarEstadoTurno('${turno._id}', 'CANCELADO')">Cancelar</button>
            ` : ''}
          </div>
          <button class="btn btn-danger-outline btn-sm" onclick="eliminarTurno('${turno._id}')" title="Eliminar definitivamente">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Renderizado de Pacientes
// ==========================================
function renderPacientes() {
  const container = document.getElementById('pacientes-list');
  if (!container) return;

  let filtrados = state.pacientes;
  if (state.busquedaPaciente) {
    const q = state.busquedaPaciente.toLowerCase();
    filtrados = filtrados.filter(p => 
      p.nombre.toLowerCase().includes(q) || 
      p.apellido.toLowerCase().includes(q) || 
      p.dni.includes(q)
    );
  }

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">👥</div>
        <h3>No se encontraron pacientes</h3>
        <p>No hay pacientes que coincidan con la búsqueda.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtrados.map(p => {
    const fechaNac = new Date(p.fecha_nacimiento).toLocaleDateString('es-AR');
    const hc = p.historia_clinica || {};
    const antecedentes = (hc.antecedentes && hc.antecedentes.length > 0) ? hc.antecedentes.join(', ') : 'Sin antecedentes registrados';
    const alergias = (hc.alergias && hc.alergias.length > 0) ? hc.alergias.join(', ') : 'Sin alergias declaradas';

    return `
      <div class="custom-card">
        <div class="card-header-flex">
          <div>
            <div class="card-title">${p.apellido}, ${p.nombre}</div>
            <div class="card-subtitle">DNI: ${p.dni}</div>
          </div>
          <span class="badge badge-paciente">Paciente</span>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span>🎂</span>
            <span>Nacimiento: <strong>${fechaNac}</strong></span>
          </div>
          <div class="info-item">
            <span>📧</span>
            <span>${p.contacto?.email || 'Sin correo registrado'}</span>
          </div>
          <div class="info-item">
            <span>📞</span>
            <span>${p.contacto?.telefono || 'Sin teléfono'}</span>
          </div>
          <div class="info-item">
            <span>📍</span>
            <span>${p.contacto?.direccion || 'Sin dirección'}</span>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 0.5rem;" onclick="toggleHistoriaClinica('${p._id}')">
          📋 Historia Clínica Embebida
        </button>

        <div id="hc-${p._id}" class="medical-history-panel">
          <div class="history-subhead">🩺 Antecedentes Médicos</div>
          <p style="margin-bottom: 0.5rem; color: #cbd5e1;">${antecedentes}</p>
          
          <div class="history-subhead">⚠️ Alergias</div>
          <p style="margin-bottom: 0.5rem; color: #f87171;">${alergias}</p>

          <div class="history-subhead">📝 Observaciones</div>
          <p style="color: #94a3b8;">${hc.observaciones || 'Sin observaciones registradas.'}</p>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Renderizado de Profesionales
// ==========================================
function renderProfesionales() {
  const container = document.getElementById('profesionales-list');
  if (!container) return;

  let filtrados = state.profesionales;
  if (state.busquedaProfesional) {
    const q = state.busquedaProfesional.toLowerCase();
    filtrados = filtrados.filter(p => 
      p.nombre.toLowerCase().includes(q) || 
      p.apellido.toLowerCase().includes(q) || 
      p.matricula.toLowerCase().includes(q) ||
      p.especialidades.some(e => e.nombre.toLowerCase().includes(q))
    );
  }

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">👨‍⚕️</div>
        <h3>No se encontraron profesionales</h3>
        <p>No hay médicos registrados con los criterios seleccionados.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtrados.map(prof => {
    return `
      <div class="custom-card">
        <div class="card-header-flex">
          <div>
            <div class="card-title">Dr(a). ${prof.apellido}, ${prof.nombre}</div>
            <div class="card-subtitle">Matrícula: <strong>${prof.matricula}</strong></div>
          </div>
          <span class="badge badge-profesional">Médico</span>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span>📧</span>
            <span>${prof.contacto?.email || 'Sin correo registrado'}</span>
          </div>
          <div class="info-item">
            <span>📞</span>
            <span>${prof.contacto?.telefono || 'Sin teléfono'}</span>
          </div>
        </div>

        <div style="margin-top: 0.5rem;">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Especialidades:</span>
          <div class="tags-wrap">
            ${prof.especialidades?.map(e => `<span class="tag-specialty">${e.nombre}</span>`).join('') || '<span style="font-size:0.8rem;color:#64748b;">Sin especialidades</span>'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Renderizado de Usuarios (ADMIN)
// ==========================================
function renderUsuarios() {
  const container = document.getElementById('usuarios-list');
  if (!container) return;

  if (!state.token || state.user?.rol !== 'ADMIN') {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🛡️</div>
        <h3>Acceso Exclusivo para Administradores</h3>
        <p>Para ver y gestionar los usuarios del sistema debe iniciar sesión con rol <strong>ADMIN</strong>.</p>
        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="quickLogin('admin')">Ingresar como Admin</button>
      </div>
    `;
    return;
  }

  if (state.usuarios.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">👤</div>
        <h3>No hay usuarios registrados</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = state.usuarios.map(u => {
    const ultimoLogin = u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-AR') : 'Nunca';
    return `
      <div class="custom-card">
        <div class="card-header-flex">
          <div>
            <div class="card-title">${u.email}</div>
            <div class="card-subtitle">ID: ${u._id}</div>
          </div>
          <span class="badge badge-${u.rol.toLowerCase()}">${u.rol}</span>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span>⚡</span>
            <span>Estado: <strong>${u.activo ? 'Activo' : 'Inactivo'}</strong></span>
          </div>
          <div class="info-item">
            <span>🕒</span>
            <span>Último acceso: <strong>${ultimoLogin}</strong></span>
          </div>
          ${u.perfil_id ? `
            <div class="info-item">
              <span>🔗</span>
              <span>Perfil Ref: <strong>${u.perfil_ref || 'Asociado'} (${u.perfil_id})</strong></span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Selects dinámicos para formularios
// ==========================================
function populateDropdowns() {
  const selectPaciente = document.getElementById('turno-paciente-select');
  const selectProfesional = document.getElementById('turno-profesional-select');

  if (selectPaciente) {
    selectPaciente.innerHTML = '<option value="">Seleccione un paciente...</option>' +
      state.pacientes.map(p => `<option value="${p._id}">${p.apellido}, ${p.nombre} (DNI: ${p.dni})</option>`).join('');
  }

  if (selectProfesional) {
    selectProfesional.innerHTML = '<option value="">Seleccione un profesional...</option>' +
      state.profesionales.map(prof => `<option value="${prof._id}">Dr(a). ${prof.apellido}, ${prof.nombre} (${prof.matricula})</option>`).join('');
  }
}

// Auto-completar especialidad según médico seleccionado
window.handleProfesionalSelectChange = function (select) {
  const profId = select.value;
  const prof = state.profesionales.find(p => p._id === profId);
  const especialidadInput = document.getElementById('turno-especialidad');
  if (prof && prof.especialidades && prof.especialidades.length > 0 && especialidadInput) {
    especialidadInput.value = prof.especialidades[0].nombre;
  }
};

// ==========================================
// Operaciones CRUD
// ==========================================
window.cambiarEstadoTurno = async function (id, nuevoEstado) {
  try {
    await apiFetch(`/turnos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    showToast(`Estado del turno actualizado a ${nuevoEstado}`, 'success');
    await fetchTurnos();
    renderMetrics();
  } catch (error) {
    // Error capturado
  }
};

window.eliminarTurno = async function (id) {
  if (!confirm('¿Confirma que desea eliminar este turno?')) return;
  try {
    await apiFetch(`/turnos/${id}`, {
      method: 'DELETE'
    });
    showToast('Turno eliminado correctamente', 'success');
    await fetchTurnos();
    renderMetrics();
  } catch (error) {
    // Error capturado
  }
};

window.toggleHistoriaClinica = function (pacienteId) {
  const panel = document.getElementById(`hc-${pacienteId}`);
  if (panel) {
    panel.classList.toggle('visible');
  }
};

// ==========================================
// Control de Modales
// ==========================================
window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
};

// ==========================================
// Event Listeners y Formularios
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadInitialData();

  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Filtro de turnos
  const filtroTurno = document.getElementById('filtro-turno-estado');
  if (filtroTurno) {
    filtroTurno.addEventListener('change', (e) => {
      state.filtroTurnoEstado = e.target.value;
      renderTurnos();
    });
  }

  // Buscador de pacientes
  const searchPac = document.getElementById('search-pacientes');
  if (searchPac) {
    searchPac.addEventListener('input', (e) => {
      state.busquedaPaciente = e.target.value;
      renderPacientes();
    });
  }

  // Buscador de profesionales
  const searchProf = document.getElementById('search-profesionales');
  if (searchProf) {
    searchProf.addEventListener('input', (e) => {
      state.busquedaProfesional = e.target.value;
      renderProfesionales();
    });
  }

  // Formulario de Login
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      await login(email, pass);
    });
  }

  // Formulario Nuevo Turno
  const formTurno = document.getElementById('form-nuevo-turno');
  if (formTurno) {
    formTurno.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!state.token) {
        showToast('Debe iniciar sesión para agendar un turno', 'error');
        openModal('modal-login');
        return;
      }

      const payload = {
        paciente_id: document.getElementById('turno-paciente-select').value,
        profesional_id: document.getElementById('turno-profesional-select').value,
        especialidad: document.getElementById('turno-especialidad').value,
        fecha_hora: document.getElementById('turno-fecha-hora').value,
        motivo: document.getElementById('turno-motivo').value,
        estado: 'PENDIENTE'
      };

      try {
        await apiFetch('/turnos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Turno agendado exitosamente', 'success');
        closeModal('modal-nuevo-turno');
        formTurno.reset();
        await fetchTurnos();
        renderMetrics();
      } catch (err) {
        // Error manejado en apiFetch
      }
    });
  }

  // Formulario Nuevo Paciente
  const formPaciente = document.getElementById('form-nuevo-paciente');
  if (formPaciente) {
    formPaciente.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!state.token) {
        showToast('Debe iniciar sesión para registrar pacientes', 'error');
        openModal('modal-login');
        return;
      }

      const payload = {
        nombre: document.getElementById('pac-nombre').value,
        apellido: document.getElementById('pac-apellido').value,
        dni: document.getElementById('pac-dni').value,
        fecha_nacimiento: document.getElementById('pac-fecha-nac').value,
        contacto: {
          email: document.getElementById('pac-email').value,
          telefono: document.getElementById('pac-tel').value,
          direccion: document.getElementById('pac-dir').value
        },
        historia_clinica: {
          antecedentes: document.getElementById('pac-antecedentes').value ? document.getElementById('pac-antecedentes').value.split(',').map(s => s.trim()) : [],
          alergias: document.getElementById('pac-alergias').value ? document.getElementById('pac-alergias').value.split(',').map(s => s.trim()) : [],
          observaciones: document.getElementById('pac-observaciones').value
        }
      };

      try {
        await apiFetch('/pacientes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Paciente registrado con éxito', 'success');
        closeModal('modal-nuevo-paciente');
        formPaciente.reset();
        await fetchPacientes();
        populateDropdowns();
        renderMetrics();
      } catch (err) {
        // Error manejado
      }
    });
  }

  // Formulario Nuevo Profesional
  const formProfesional = document.getElementById('form-nuevo-profesional');
  if (formProfesional) {
    formProfesional.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!state.token) {
        showToast('Debe iniciar sesión para registrar profesionales', 'error');
        openModal('modal-login');
        return;
      }

      const especialidadesArray = document.getElementById('prof-especialidades').value
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)
        .map(nombre => ({ nombre, descripcion: `Atención en ${nombre}` }));

      const payload = {
        nombre: document.getElementById('prof-nombre').value,
        apellido: document.getElementById('prof-apellido').value,
        matricula: document.getElementById('prof-matricula').value,
        contacto: {
          email: document.getElementById('prof-email').value,
          telefono: document.getElementById('prof-tel').value
        },
        especialidades: especialidadesArray
      };

      try {
        await apiFetch('/profesionales', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Profesional registrado con éxito', 'success');
        closeModal('modal-nuevo-profesional');
        formProfesional.reset();
        await fetchProfesionales();
        populateDropdowns();
        renderMetrics();
      } catch (err) {
        // Error manejado
      }
    });
  }

  // Logout button
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', logout);
  }
});
