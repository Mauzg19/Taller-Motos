import React, { useState, useEffect } from 'react';

function HistoricalMaintenance({ user }) {
  const [mantenimientos, setMantenimientos] = useState([]);

  const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

  useEffect(() => {
    loadMantenimientos();
  }, []);

  async function loadMantenimientos() {
    const res = await fetch(`${API_ORIGIN}/api/mantenimiento/historico`, {
      headers: { Authorization: localStorage.getItem('authHeader') }
    });
    if (res.ok) {
      const list = await res.json();
      setMantenimientos(list);
    }
  }

  return (
    <div>
      <h2>Historial de Mantenimiento</h2>
      <div>
        <h3>Mantenimientos Realizados</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Moto</th>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientos.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.moto.placa}</td>
                <td>{m.fecha}</td>
                <td>{m.descripcion}</td>
                <td>{m.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoricalMaintenance;
