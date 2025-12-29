import React, { useState } from 'react';

function OrderManagement({ user, orders, onCreateOrder, onUpdateStatus, onAddPart, onAddService, onAuthorizeService, onUpdateServiceState }) {
  const [formData, setFormData] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    motivoIngreso: '',
    diagnosticoInicial: ''
  });
  const [expanded, setExpanded] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateOrder(formData);
    setFormData({
      nombreCliente: '',
      telefonoCliente: '',
      emailCliente: '',
      placa: '',
      marca: '',
      modelo: '',
      anio: '',
      kilometraje: '',
      motivoIngreso: '',
      diagnosticoInicial: ''
    });
  };

  return (
    <div>
      {/* Create Order Form */}
      {(user.role === 'ADMIN' || user.role === 'RECEPCION') && (
        <div>
          <h2>Registrar moto</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="nombreCliente"
              placeholder="Nombre cliente"
              value={formData.nombreCliente}
              onChange={handleChange}
              required
            />
            <input
              name="telefonoCliente"
              placeholder="Teléfono"
              value={formData.telefonoCliente}
              onChange={handleChange}
            />
            <input
              name="emailCliente"
              placeholder="Email"
              value={formData.emailCliente}
              onChange={handleChange}
              required
            />
            <input
              name="placa"
              placeholder="Placa"
              value={formData.placa}
              onChange={handleChange}
            />
            <input
              name="marca"
              placeholder="Marca"
              value={formData.marca}
              onChange={handleChange}
            />
            <input
              name="modelo"
              placeholder="Modelo"
              value={formData.modelo}
              onChange={handleChange}
            />
            <input
              name="anio"
              placeholder="Año"
              value={formData.anio}
              onChange={handleChange}
            />
            <input
              name="kilometraje"
              placeholder="Kilometraje"
              value={formData.kilometraje}
              onChange={handleChange}
            />
            <input
              name="motivoIngreso"
              placeholder="Motivo"
              value={formData.motivoIngreso}
              onChange={handleChange}
            />
            <input
              name="diagnosticoInicial"
              placeholder="Diagnóstico"
              value={formData.diagnosticoInicial}
              onChange={handleChange}
            />
            <button type="submit">Crear Orden</button>
          </form>
        </div>
      )}

      {/* Orders List */}
      <h2>Órdenes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Placa</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <React.Fragment key={o.id}>
              <tr>
                <td>{o.id}</td>
                <td>{o.nombreCliente} ({o.emailCliente})</td>
                <td>{o.placa} {o.marca} {o.modelo}</td>
                <td>{o.estado}</td>
                <td>
                  {(user.role === 'ADMIN' || user.role === 'TECNICO') && (
                    <button onClick={() => onUpdateStatus(o.id)}>Actualizar Estado</button>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'TECNICO') && (
                    <button onClick={() => onAddPart(o.id)}>Agregar Repuesto</button>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'TECNICO') && (
                    <button onClick={() => onAddService(o.id)}>Agregar Servicio</button>
                  )}
                  <button onClick={() => setExpanded(prev => ({ ...prev, [o.id]: !prev[o.id] }))}>{expanded[o.id] ? 'Ocultar' : 'Detalles'}</button>
                </td>
              </tr>
              {expanded[o.id] && (
                <tr>
                  <td colSpan={5}>
                    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                      <div style={{flex:1}}>
                        <h4>Servicios</h4>
                        <table className="users-table">
                          <thead><tr><th>Nombre</th><th>Estado</th><th>Autorizado</th><th>Acciones</th></tr></thead>
                          <tbody>
                            {(o.servicios||[]).map(s => (
                              <tr key={s.id}>
                                <td>{s.nombre}</td>
                                <td>{s.estado}</td>
                                <td>{s.requiereAutorizacion ? (s.autorizado ? 'Sí' : 'No') : '—'}</td>
                                <td>
                                  {(user.role === 'ADMIN' || user.role === 'RECEPCION') && s.requiereAutorizacion && !s.autorizado && (
                                    <button onClick={() => {
                                      if (window.confirm('¿Autorizar este servicio?')) {
                                        onAuthorizeService(o.id, s.id, true)
                                      }
                                    }}>Autorizar</button>
                                  )}
                                  {(user.role === 'TECNICO') && (
                                    <button onClick={() => onUpdateServiceState(o.id, s.id)}>Actualizar Estado</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{flex:1}}>
                        <h4>Repuestos</h4>
                        <table className="users-table">
                          <thead><tr><th>Nombre</th><th>Cantidad</th><th>Precio</th></tr></thead>
                          <tbody>
                            {(o.repuestos||[]).map(r => (
                              <tr key={r.id}><td>{r.nombre}</td><td>{r.cantidad}</td><td>{r.precio}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderManagement;
