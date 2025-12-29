import React, { useState } from 'react';

function UserManagement({ user, users, onCreateUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    email: '',
    role: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateUser(formData);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      email: '',
      role: ''
    });
  };

  return (
    <div className="component-card">
      {(user.role === 'ADMIN' || user.role === 'RECEPCION') && (
        <div className="user-section">
          <h2 className="section-title">Crear Usuario</h2>
          <div className="card">
            <form className="user-form" onSubmit={handleSubmit}>
              <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
              />
              <input
                name="password"
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
              <input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-input"
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
              <select name="role" value={formData.role} onChange={handleChange} required className="form-input select-input">
                <option value="">Seleccionar rol</option>
                {user.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                {user.role === 'ADMIN' && <option value="RECEPCION">RECEPCION</option>}
                {user.role === 'ADMIN' && <option value="TECNICO">TECNICO</option>}
                <option value="CLIENTE">CLIENTE</option>
              </select>
              <div className="form-actions">
                <button className="btn primary" type="submit">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {user.role === 'ADMIN' && (
        <div className="user-list">
          <h2 className="section-title">Usuarios</h2>
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
