import React, { useState, useEffect } from 'react';

function AppointmentManagement({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    cliente: '',
    servicio: '',
    tecnicoId: ''
  });

  const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    const res = await fetch(`${API_ORIGIN}/api/appointments`, {
      headers: { 'Authorization': localStorage.getItem('authHeader') }
    });
    if (res.ok) {
      const list = await res.json();
      setAppointments(list);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_ORIGIN}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('authHeader')
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const created = await res.json();
      setAppointments(prev => [created, ...prev]);
      setFormData({
        fecha: '',
        hora: '',
        cliente: '',
        servicio: '',
        tecnicoId: ''
      });
    } else {
      alert('Error creando cita');
    }
  };

  return (
    <div>
      <h2>Gestión de Citas</h2>
      {(user.role === 'ADMIN' || user.role === 'RECEPCION') && (
        <div>
          <h3>Programar Cita</h3>
          <form onSubmit={handleSubmit}>
            <input
              name="fecha"
              type="date"
              placeholder="Fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
            <input
              name="hora"
              type="time"
              placeholder="Hora"
              value={formData.hora}
              onChange={handleChange}
              required
            />
            <input
              name="cliente"
              placeholder="Cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
            />
            <input
              name="servicio"
              placeholder="Servicio"
              value={formData.servicio}
              onChange={handleChange}
              required
            />
            <input
              name="tecnicoId"
              placeholder="ID Técnico"
              value={formData.tecnicoId}
              onChange={handleChange}
            />
            <button type="submit">Crear Cita</button>
          </form>
        </div>
      )}

      <h3>Citas</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.fecha}</td>
              <td>{a.hora}</td>
              <td>{a.cliente}</td>
              <td>{a.servicio}</td>
              <td>{a.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentManagement;
