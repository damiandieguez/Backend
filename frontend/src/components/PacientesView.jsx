import React, { useState } from 'react';

export default function PacientesView({
  pacientes,
  user,
  onOpenLogin,
  onCreatePaciente,
  onDeletePaciente
}) {
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedHC, setExpandedHC] = useState({});

  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [dir, setDir] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [alergias, setAlergias] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const toggleHC = (id) => {
    setExpandedHC((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    const payload = {
      nombre,
      apellido,
      dni,
      fecha_nacimiento: fechaNac,
      contacto: {
        email,
        telefono: tel,
        direccion: dir
      },
      historia_clinica: {
        antecedentes: antecedentes ? antecedentes.split(',').map((s) => s.trim()) : [],
        alergias: alergias ? alergias.split(',').map((s) => s.trim()) : [],
        observaciones
      }
    };

    await onCreatePaciente(payload);
    setModalOpen(false);
    // Reset
    setNombre('');
    setApellido('');
    setDni('');
    setFechaNac('');
    setEmail('');
    setTel('');
    setDir('');
    setAntecedentes('');
    setAlergias('');
    setObservaciones('');
  };

  const filtrados = pacientes.filter((p) => {
    const q = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      p.dni.includes(q)
    );
  });

  return (
    <div>
      <div className="section-toolbar">
        <div className="toolbar-title">
          <h2>Padrón de Pacientes</h2>
          <p>Datos personales, información de contacto e historias clínicas embebidas.</p>
        </div>
        <div className="toolbar-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por apellido, nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <span>+</span> Registrar Paciente
          </button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No se encontraron pacientes</h3>
          <p>No hay pacientes registrados que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtrados.map((p) => {
            const fechaNacFormatted = new Date(p.fecha_nacimiento).toLocaleDateString('es-AR');
            const hc = p.historia_clinica || {};
            const ant = hc.antecedentes?.length ? hc.antecedentes.join(', ') : 'Sin antecedentes registrados';
            const ale = hc.alergias?.length ? hc.alergias.join(', ') : 'Sin alergias declaradas';
            const isHCExtended = !!expandedHC[p._id];

            return (
              <div key={p._id} className="custom-card">
                <div className="card-header-flex">
                  <div>
                    <div className="card-title">
                      {p.apellido}, {p.nombre}
                    </div>
                    <div className="card-subtitle">DNI: {p.dni}</div>
                  </div>
                  <span className="badge badge-paciente">Paciente</span>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <span>🎂</span>
                    <span>
                      Nacimiento: <strong>{fechaNacFormatted}</strong>
                    </span>
                  </div>
                  <div className="info-item">
                    <span>📧</span>
                    <span>{p.contacto?.email || 'Sin correo registrado'}</span>
                  </div>
                  <div className="info-item">
                    <span>📞</span>
                    <span>{p.contacto?.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="info-item">
                    <span>📍</span>
                    <span>{p.contacto?.direccion || 'Sin dirección'}</span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => toggleHC(p._id)}
                >
                  📋 {isHCExtended ? 'Ocultar' : 'Ver'} Historia Clínica Embebida
                </button>

                {isHCExtended && (
                  <div className="medical-history-panel">
                    <div className="history-subhead">🩺 Antecedentes Médicos</div>
                    <p style={{ marginBottom: '0.5rem', color: '#cbd5e1' }}>{ant}</p>

                    <div className="history-subhead">⚠️ Alergias</div>
                    <p style={{ marginBottom: '0.5rem', color: '#f87171' }}>{ale}</p>

                    <div className="history-subhead">📝 Observaciones</div>
                    <p style={{ color: '#94a3b8' }}>
                      {hc.observaciones || 'Sin observaciones registradas.'}
                    </p>
                  </div>
                )}

                {user && (
                  <div className="card-footer">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      ID: {p._id.slice(-6)}
                    </span>
                    <button
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => onDeletePaciente(p._id)}
                      title="Eliminar paciente"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Registrar Paciente */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Nuevo Paciente</h3>
              <button className="btn-close-modal" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Juan"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Pérez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>DNI</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="35123456"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={fechaNac}
                    onChange={(e) => setFechaNac(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email de Contacto</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="juan@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+54 11 1234-5678"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Av. Corrientes 1234, CABA"
                  value={dir}
                  onChange={(e) => setDir(e.target.value)}
                />
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--border-subtle)',
                  margin: '1.25rem 0'
                }}
              />
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                Historia Clínica Inicial
              </h4>

              <div className="form-group">
                <label>Antecedentes Médicos (separar con comas)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Hipertensión arterial, Cirugía apéndice..."
                  value={antecedentes}
                  onChange={(e) => setAntecedentes(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Alergias (separar con comas)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Penicilina, Polen..."
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Notas adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
