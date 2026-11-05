import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
      setEmail('');
      setPassword('');
      onClose();
    } catch {
      // Manejado en App
    } finally {
      setLoading(false);
    }
  };

  const fillPreset = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Iniciar Sesión</h3>
          <button className="btn-close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-modal-email">Correo Electrónico</label>
            <input
              id="login-modal-email"
              type="email"
              className="form-control"
              required
              placeholder="ejemplo@centrosalud.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-modal-pass">Contraseña</label>
            <input
              id="login-modal-pass"
              type="password"
              className="form-control"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.4rem' }}>
              Credenciales de prueba listas para rellenar:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                type="button"
                className="btn-demo-quick"
                style={{ textAlign: 'left', width: 'fit-content' }}
                onClick={() => fillPreset('admin@centrosalud.com', 'Admin123!')}
              >
                👑 <strong>Admin:</strong> admin@centrosalud.com / Admin123!
              </button>
              <button
                type="button"
                className="btn-demo-quick"
                style={{ textAlign: 'left', width: 'fit-content' }}
                onClick={() => fillPreset('carlos.rodriguez@hospital.com', 'Password123!')}
              >
                👨‍⚕️ <strong>Médico:</strong> carlos.rodriguez@hospital.com / Password123!
              </button>
              <button
                type="button"
                className="btn-demo-quick"
                style={{ textAlign: 'left', width: 'fit-content' }}
                onClick={() => fillPreset('juan.perez@email.com', 'Password123!')}
              >
                👤 <strong>Paciente:</strong> juan.perez@email.com / Password123!
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
