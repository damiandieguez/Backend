import React from 'react';

export default function UsuariosView({ usuarios, user, onQuickLogin }) {
  if (!user || user.rol !== 'ADMIN') {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛡️</div>
        <h3>Acceso Exclusivo para Administradores</h3>
        <p>Para ver y gestionar los usuarios del sistema debe iniciar sesión con rol <strong>ADMIN</strong>.</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
          onClick={() => onQuickLogin('admin')}
        >
          Ingresar como Admin
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-toolbar">
        <div className="toolbar-title">
          <h2>Gestión de Cuentas y Accesos</h2>
          <p>Autenticación, contraseñas hasheadas con bcrypt y asignación de roles.</p>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>No hay usuarios registrados</h3>
        </div>
      ) : (
        <div className="cards-grid">
          {usuarios.map((u) => {
            const ultimoLogin = u.ultimo_login
              ? new Date(u.ultimo_login).toLocaleString('es-AR')
              : 'Nunca';

            return (
              <div key={u._id} className="custom-card">
                <div className="card-header-flex">
                  <div>
                    <div className="card-title">{u.email}</div>
                    <div className="card-subtitle">ID: {u._id}</div>
                  </div>
                  <span className={`badge badge-${u.rol ? u.rol.toLowerCase() : 'paciente'}`}>
                    {u.rol}
                  </span>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <span>⚡</span>
                    <span>
                      Estado: <strong>{u.activo ? 'Activo' : 'Inactivo'}</strong>
                    </span>
                  </div>
                  <div className="info-item">
                    <span>🕒</span>
                    <span>
                      Último acceso: <strong>{ultimoLogin}</strong>
                    </span>
                  </div>
                  {u.perfil_id && (
                    <div className="info-item">
                      <span>🔗</span>
                      <span>
                        Perfil Ref: <strong>{u.perfil_ref || 'Asociado'} ({u.perfil_id})</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
