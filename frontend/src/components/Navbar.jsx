import React from 'react';

export default function Navbar({ user, onOpenLogin, onLogout, onQuickLogin }) {
  return (
    <header className="main-header">
      <div className="brand">
        <div className="brand-icon">🏥</div>
        <div className="brand-text">
          <h1>Centro de Salud</h1>
          <span>
            <span className="status-dot"></span>
            API RESTful Conectada &middot; React + Express
          </span>
        </div>
      </div>

      <div className="header-actions">
        {/* Acceso rápido Demo para pruebas de roles */}
        <div className="demo-pills">
          <span>Demo:</span>
          <button
            className="btn-demo-quick"
            onClick={() => onQuickLogin('admin')}
            title="Iniciar sesión como ADMIN"
          >
            👑 Admin
          </button>
          <button
            className="btn-demo-quick"
            onClick={() => onQuickLogin('profesional')}
            title="Iniciar sesión como Médico"
          >
            👨‍⚕️ Médico
          </button>
          <button
            className="btn-demo-quick"
            onClick={() => onQuickLogin('paciente')}
            title="Iniciar sesión como Paciente"
          >
            👤 Paciente
          </button>
        </div>

        {user ? (
          <div className="user-profile-badge">
            <div className="avatar">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <span className={`badge badge-${user.rol ? user.rol.toLowerCase() : 'paciente'}`}>
                {user.rol}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-danger-outline btn-sm"
              title="Cerrar Sesión"
            >
              Salir
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onOpenLogin}>
            🔑 Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}
