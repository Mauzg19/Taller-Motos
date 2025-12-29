import React, { useState, useEffect, useCallback } from 'react';

function LoyaltyManagement({ user }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

  const loadClientes = useCallback(async () => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/clientes`, {
        headers: { 'Authorization': localStorage.getItem('authHeader') }
      });
      if (res.ok) setClientes(await res.json());
    } catch (err) {
      console.error('Error cargando clientes', err);
    }
  }, [API_ORIGIN]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/clientes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ nombre: '', email: '', telefono: '' });
        loadClientes();
      } else {
        alert('Error creando cliente');
      }
    } catch (err) {
      console.error(err);
      alert('Error creando cliente');
    }
  };

  const addPuntos = async (clienteId) => {
    const puntos = parseInt(window.prompt('Puntos a agregar', '0'), 10);
    if (!Number.isFinite(puntos)) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/clientes/${clienteId}/puntos?puntos=${puntos}`, {
        method: 'PUT',
        headers: { 'Authorization': localStorage.getItem('authHeader') }
      });
      if (res.ok) loadClientes(); else alert('Error agregando puntos');
    } catch (err) { console.error(err); alert('Error agregando puntos'); }
  };

  const verCupones = async (clienteId) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/cupones/${clienteId}`, {
        headers: { 'Authorization': localStorage.getItem('authHeader') }
      });
      if (res.ok) {
        const cupones = await res.json();
        alert(JSON.stringify(cupones, null, 2));
      } else alert('Error obteniendo cupones');
    } catch (err) { console.error(err); alert('Error obteniendo cupones'); }
  };

  const crearCupon = async (clienteId) => {
    const descuento = parseFloat(window.prompt('Descuento (%)', '10')) || 0;
    const validoHasta = window.prompt('Fecha válida hasta (YYYY-MM-DD)', '2025-12-31');
    if (!validoHasta) return;
    try {
      const body = { cliente: { id: clienteId }, descuento, validoHasta };
      const res = await fetch(`${API_ORIGIN}/api/loyalty/cupones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('authHeader')
        },
        body: JSON.stringify(body)
      });
      if (res.ok) alert('Cupón creado'); else alert('Error creando cupón');
    } catch (err) { console.error(err); alert('Error creando cupón'); }
  };

  const usarCupon = async (cuponId) => {
    if (!window.confirm('Marcar cupón como usado?')) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/cupones/${cuponId}/usar`, { method: 'PUT' });
      if (res.ok) alert('Cupón usado'); else alert('Error usando cupón');
    } catch (err) { console.error(err); alert('Error usando cupón'); }
  };

  const archiveCliente = async (clienteId) => {
    if (!window.confirm('¿Archivar cliente?')) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/clientes/${clienteId}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': localStorage.getItem('authHeader') }
      });
      if (res.ok) {
        loadClientes();
        alert('Cliente archivado');
      } else alert('Error archivando cliente');
    } catch (err) { console.error(err); alert('Error archivando cliente'); }
  };

  const unarchiveCliente = async (clienteId) => {
    if (!window.confirm('¿Desarchivar cliente?')) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/clientes/${clienteId}/unarchive`, {
        method: 'PUT',
        headers: { 'Authorization': localStorage.getItem('authHeader') }
      });
      if (res.ok) {
        loadClientes();
        alert('Cliente desarchivado');
      } else alert('Error desarchivando cliente');
    } catch (err) { console.error(err); alert('Error desarchivando cliente'); }
  };

  const deleteCliente = async (clienteId) => {
    if (!window.confirm('¿Eliminar cliente permanentemente? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/loyalty/clientes/${clienteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': localStorage.getItem('authHeader') }
      });
      if (res.ok) {
        loadClientes();
        alert('Cliente eliminado');
      } else alert('Error eliminando cliente');
    } catch (err) { console.error(err); alert('Error eliminando cliente'); }
  };

  return (
    <div className="loyalty">
      <h2 className="loyalty-title">Gestión de Fidelidad</h2>
      {(user.role === 'ADMIN' || user.role === 'RECEPCION') && (
        <div className="loyalty-form-container">
          <h3>Crear Cliente</h3>
          <form className="loyalty-form" onSubmit={handleCreate}>
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
            <button className="btn primary" type="submit">Crear</button>
          </form>
        </div>
      )}

      <h3 className="loyalty-subtitle">Clientes</h3>
      <div className="table-wrap">
        <table className="loyalty-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>{c.email}</td>
                <td>{c.puntos}</td>
                <td>{c.archivado ? 'Archivado' : 'Activo'}</td>
                <td className="actions">
                  {(user.role === 'ADMIN' || user.role === 'RECEPCION') && <button className="btn" onClick={() => addPuntos(c.id)}>Agregar Puntos</button>}
                  <button className="btn" onClick={() => verCupones(c.id)}>Ver Cupones</button>
                  {(user.role === 'ADMIN' || user.role === 'RECEPCION') && <button className="btn" onClick={() => crearCupon(c.id)}>Crear Cupón</button>}
                  {user.role === 'ADMIN' && (
                    <>
                      {!c.archivado ? (
                        <button className="btn warning" onClick={() => archiveCliente(c.id)}>Archivar</button>
                      ) : (
                        <button className="btn info" onClick={() => unarchiveCliente(c.id)}>Desarchivar</button>
                      )}
                      <button className="btn danger" onClick={() => deleteCliente(c.id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoyaltyManagement;
