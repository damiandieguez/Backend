import React, { useState } from 'react';

export default function ProfesionalesView({
  profesionales,
  user,
  onOpenLogin,
  onCreateProfesional,
  onDeleteProfesional
}) {
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [especialidadesStr, setEspecialidadesStr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    const especialidades = especialidadesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((nombreEsp) => ({
        nombre: nombreEsp,
        descripcion: `Atención y diagnóstico en ${nombreEsp}`
      }));

    const payload = {
      nombre,
      apellido,
      matricula,
      contacto: {
        email,
        telefono: tel
      },
      especialidades
    };

    await onCreateProfesional(payload);
    setModalOpen(false);
    setNombre('');
    setApellido('');
    setMatricula('');
    setEmail('');
    setTel('');
    setEspecialidadesStr('');
  };

  const filtrados = profesionales.filter((prof) => {
    const q = busqueda.toLowerCase();
    return (
      prof.nombre.toLowerCase().includes(q) ||
      prof.apellido.toLowerCase().includes(q) ||
      prof.matricula.toLowerCase().includes(q) ||
      prof.especialidades?.some((e) => e.nombre.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="section-toolbar">
        <div className="toolbar-title">
          <h2>Cuerpo Médico y Especialidades</h2>
          <p>Staff de profesionales médicos y sus especialidades habilitadas.</p>
        </div>
        <div className="toolbar-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por médico o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <span>+</span> Nuevo Profesional
          </button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍⚕️</div>
          <h3>No se encontraron profesionales</h3>
          <p>No hay médicos registrados con los criterios seleccionados.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtrados.map((prof) => (
            <div key={prof._id} className="custom-card">
              <div className="card-header-flex">
                <div>
                  <div className="card-title">
                    Dr(a). {prof.apellido}, {prof.nombre}
                  </div>
                  <div className="card-subtitle">
                    Matrícula: <strong>{prof.matricula}</strong>
                  </div>
                </div>
                <span className="badge badge-profesional">Médico</span>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <span>📧</span>
                  <span>{prof.contacto?.email || 'Sin correo registrado'}</span>
                </div>
                <div className="info-item">
                  <span>📞</span>
                  <span>{prof.contacto?.telefono || 'Sin teléfono'}</span>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Especialidades:
                </span>
                <div className="tags-wrap">
                  {prof.especialidades?.map((e, idx) => (
                    <span key={idx} className="tag-specialty">
                      {e.nombre}
                    </span>
                  )) || <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sin especialidades</span>}
                </div>
              </div>

              {user && (
                <div className="card-footer">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    ID: {prof._id.slice(-6)}
                  </span>
                  <button
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => onDeleteProfesional(prof._id)}
                    title="Eliminar profesional"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Registrar Profesional */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Profesional Médico</h3>
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
                    placeholder="Carlos"
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
                    placeholder="Rodríguez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Matrícula Profesional</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="MN-45892"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Profesional</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="carlos@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+54 11 3333-4444"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Especialidades (separar con comas)</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Cardiología, Medicina Interna, Pediatría..."
                  value={especialidadesStr}
                  onChange={(e) => setEspecialidadesStr(e.target.value)}
                />
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
                  Guardar Profesional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
