import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-username">Usuario</label>
            <input
              id="login-username"
              name="username"
              placeholder="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="login-input"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              name="password"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="login-input"
              required
            />
          </div>

          <button className="login-button" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
