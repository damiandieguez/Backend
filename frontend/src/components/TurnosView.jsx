import React, { useState } from 'react';

export default function TurnosView({
  turnos,
  pacientes,
  profesionales,
  user,
  onOpenLogin,
  onCreateTurno,
  onUpdateEstado,
  onDeleteTurno
}) {
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [pacienteId, setPacienteId] = useState('');
  const [profesionalId, setProfesionalId] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [motivo, setMotivo] = useState('');

  const handleProfesionalChange = (e) => {
    const pId = e.target.value;
    setProfesionalId(pId);
    const prof = profesionales.find((p) => p._id === pId);
    if (prof && prof.especialidades && prof.especialidades.length > 0) {
      setEspecialidad(prof.especialidades[0].nombre);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateTurno({
      paciente_id: pacienteId,
      profesional_id: profesionalId,
      especialidad,
      fecha_hora: fechaHora,
      motivo,
      estado: 'PENDIENTE'
    });
    setModalOpen(false);
    setPacienteId('');
    setProfesionalId('');
    setEspecialidad('');
    setFechaHora('');
    setMotivo('');
  };

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Autenticación Requerida</h3>
        <p>Inicie sesión con un usuario para visualizar y gestionar la agenda de turnos médicos.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onOpenLogin}>
          Iniciar Sesión
        </button>
      </div>
    );
  }

  let filtrados = turnos;
  if (filtroEstado !== 'TODOS') {
    filtrados = filtrados.filter((t) => t.estado === filtroEstado);
  }

  return (
    <div>
      <div className="section-toolbar">
        <div className="toolbar-title">
          <h2>Agenda de Turnos Médicos</h2>
          <p>Visualice, confirme o atienda las citas programadas en el centro.</p>
        </div>
        <div className="toolbar-controls">
          <select
            className="select-filter"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADO">Confirmados</option>
            <option value="ATENDIDO">Atendidos</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <span>+</span> Agendar Turno
          </button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No hay turnos registrados</h3>
          <p>No se encontraron citas con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filtrados.map((turno) => {
            const pacienteNombre = turno.paciente_id
              ? `${turno.paciente_id.nombre} ${turno.paciente_id.apellido}`
              : 'Paciente desconocido';
            const profesionalNombre = turno.profesional_id
              ? `Dr(a). ${turno.profesional_id.nombre} ${turno.profesional_id.apellido}`
              : 'Médico asignado';

            const fechaObj = new Date(turno.fecha_hora);
            const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const horaFormateada = fechaObj.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            const statusClass = `badge-status-${turno.estado ? turno.estado.toLowerCase() : 'pendiente'}`;

            return (
              <div key={turno._id} className="custom-card">
                <div className="card-header-flex">
                  <div>
                    <div className="card-title">{pacienteNombre}</div>
                    <div className="card-subtitle">{profesionalNombre}</div>
                  </div>
                  <span className={`badge ${statusClass}`}>{turno.estado}</span>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <span>🩺</span>
                    <span>
                      Especialidad: <strong>{turno.especialidad}</strong>
                    </span>
                  </div>
                  <div className="info-item">
                    <span>🗓️</span>
                    <span>
                      Fecha y Hora: <strong>{fechaFormateada} - {horaFormateada} hs</strong>
                    </span>
                  </div>
                  {turno.motivo && (
                    <div className="info-item">
                      <span>📝</span>
                      <span>
                        Motivo: <em>{turno.motivo}</em>
                      </span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {turno.estado === 'PENDIENTE' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onUpdateEstado(turno._id, 'CONFIRMADO')}
                      >
                        Confirmar
                      </button>
                    )}
                    {turno.estado === 'CONFIRMADO' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onUpdateEstado(turno._id, 'ATENDIDO')}
                      >
                        Atender
                      </button>
                    )}
                    {turno.estado !== 'CANCELADO' && turno.estado !== 'ATENDIDO' && (
                      <button
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => onUpdateEstado(turno._id, 'CANCELADO')}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                  <button
                    className="btn btn-danger-outline btn-sm"
                    onClick={() => onDeleteTurno(turno._id)}
                    title="Eliminar definitivamente"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Agendar Turno */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agendar Nuevo Turno Médico</h3>
              <button className="btn-close-modal" onClick={() => setModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Paciente</label>
                <select
                  className="form-control"
                  required
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                >
                  <option value="">Seleccione un paciente...</option>
                  {pacientes.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.apellido}, {p.nombre} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Médico / Profesional</label>
                <select
                  className="form-control"
                  required
                  value={profesionalId}
                  onChange={handleProfesionalChange}
                >
                  <option value="">Seleccione un profesional...</option>
                  {profesionales.map((prof) => (
                    <option key={prof._id} value={prof._id}>
                      Dr(a). {prof.apellido}, {prof.nombre} ({prof.matricula})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Especialidad</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Ej: Cardiología..."
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  required
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Motivo de la Consulta</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ej: Control periódico, revisión de laboratorio..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
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
                  Guardar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
