import React from 'react';

export default function MetricCards({ pacientesCount, profesionalesCount, turnosCount, pendientesCount }) {
  return (
    <section className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon icon-blue">👥</div>
        <div className="metric-info">
          <h4>Pacientes Activos</h4>
          <div className="metric-value">{pacientesCount}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon icon-cyan">👨‍⚕️</div>
        <div className="metric-info">
          <h4>Médicos / Especialistas</h4>
          <div className="metric-value">{profesionalesCount}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon icon-emerald">📅</div>
        <div className="metric-info">
          <h4>Turnos Totales</h4>
          <div className="metric-value">{turnosCount}</div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon icon-amber">⏳</div>
        <div className="metric-info">
          <h4>Citas Pendientes</h4>
          <div className="metric-value">{pendientesCount}</div>
        </div>
      </div>
    </section>
  );
}
