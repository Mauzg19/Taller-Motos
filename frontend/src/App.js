import React, { useState, useRef } from 'react';
import './App.css';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import OrderManagement from './components/OrderManagement';
import AppointmentManagement from './components/AppointmentManagement';
import ReportManagement from './components/ReportManagement';
import LoyaltyManagement from './components/LoyaltyManagement';
import HistoricalMaintenance from './components/HistoricalMaintenance';
import AuthorizationManagement from './components/AuthorizationManagement';

function App() {
  const [authHeader, setAuthHeader] = useState(null);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const eventSourceRef = useRef(null);

  const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

  async function handleLogin(username, password) {
    const basic = 'Basic ' + btoa(username + ':' + password);
    setAuthHeader(basic);
    localStorage.setItem('authHeader', basic);
    // fetch current user
    const meResponse = await fetch(`${API_ORIGIN}/api/auth/me`, {headers: {Authorization: basic}});
    if (!meResponse.ok) {
      alert('Login fallido');
      setAuthHeader(null);
      localStorage.removeItem('authHeader');
      return;
    }
    const me = await meResponse.json();
    setUser(me);
    loadOrders(basic, me);
    if (me.role === 'ADMIN') {
      loadUsers(basic);
    }
    startSSE(basic, me);
  }

  async function loadOrders(basic, me) {
    const res = await fetch(`${API_ORIGIN}/api/orders`, {headers: {Authorization: basic}});
    if (res.ok) {
      const list = await res.json();
      setOrders(list);
    }
  }

  async function loadUsers(basic) {
    const res = await fetch(`${API_ORIGIN}/api/auth/users`, {headers: {Authorization: basic}});
    if (res.ok) {
      const list = await res.json();
      setUsers(list);
    }
  }

  function startSSE(basic, me) {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const roles = me && me.role ? me.role : '';
    const userParam = me && me.email ? encodeURIComponent(me.email) : encodeURIComponent(me.username);
    const esUrl = `${API_ORIGIN}/api/orders/stream?user=${userParam}&roles=${roles}`;
    const es = new EventSource(esUrl);
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      // update single order in list
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === data.id);
        if (idx >= 0) {
          const copy = [...prev]; copy[idx] = data; return copy;
        }
        return [data, ...prev];
      });
    };
    es.addEventListener('orden-update', (ev) => {
      const data = JSON.parse(ev.data);
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === data.id);
        if (idx >= 0) {
          const copy = [...prev]; copy[idx] = data; return copy;
        }
        return [data, ...prev];
      });
    });

    es.addEventListener('notification', (ev) => {
      const msg = ev.data;
      const item = { id: Date.now(), text: msg };
      setNotifications(prev => [item, ...prev]);
      // auto-dismiss
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== item.id)), 10000);
    });
    es.onerror = (err) => {
      console.error('SSE error', err);
      es.close();
      eventSourceRef.current = null;
    };
    eventSourceRef.current = es;
  }

  function logout() {
    setAuthHeader(null);
    setUser(null);
    setOrders([]);
    setUsers([]);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }

  async function handleCreateOrder(data) {
    const res = await fetch(`${API_ORIGIN}/api/orders`, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': authHeader},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const created = await res.json();
      setOrders(prev => [created, ...prev]);
    } else {
      alert('Error creando orden');
    }
  }

  async function addPart(orderId) {
    const name = window.prompt('Nombre del repuesto');
    if (!name) return; 
    const price = parseFloat(window.prompt('Precio', '0')) || 0;
    const qty = parseInt(window.prompt('Cantidad', '1')) || 1;
    const res = await fetch(`${API_ORIGIN}/api/orders/${orderId}/parts`, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': authHeader},
      body: JSON.stringify({nombre: name, precio: price, cantidad: qty})
    });
    if (!res.ok) alert('Error agregando repuesto');
  }

  async function addService(orderId) {
    const nombre = window.prompt('Nombre del servicio');
    if (!nombre) return;
    const descripcion = window.prompt('Descripción', '');
    const tiempoEstimado = parseInt(window.prompt('Tiempo estimado (min)', '0')) || 0;
    const costoManoObra = parseFloat(window.prompt('Costo mano de obra', '0')) || 0;
    const garantiaDuracion = parseInt(window.prompt('Duración garantía (meses)', '0')) || null;
    const garantiaInicio = window.prompt('Fecha inicio garantía (YYYY-MM-DD)', null);
    const res = await fetch(`${API_ORIGIN}/api/orders/${orderId}/services`, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': authHeader},
      body: JSON.stringify({
        nombre, descripcion, tiempoEstimado, costoManoObra, garantiaDuracion, garantiaInicio
      })
    });
    if (!res.ok) alert('Error agregando servicio');
  }

  async function updateStatus(orderId) {
    const status = window.prompt('Estado (DIAGNOSTICO, REPARACION, ESPERANDO_REPUESTOS, LISTO_PARA_ENTREGAR, ENTREGADO)');
    if (!status) return; 
    const res = await fetch(`${API_ORIGIN}/api/orders/${orderId}/status`, {
      method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': authHeader},
      body: JSON.stringify({estado: status})
    });
    if (!res.ok) alert('Error actualizando estado');
  }

  async function createUser(data) {
    const res = await fetch(`${API_ORIGIN}/api/auth/users`, {
      method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': authHeader},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const created = await res.json();
      setUsers(prev => [...prev, created]);
    } else {
      alert('Error creando usuario');
    }
  }

  async function authorizeService(orderId, servicioId, autorizado) {
    const res = await fetch(`${API_ORIGIN}/api/orders/${orderId}/services/${servicioId}/authorize?autorizado=${autorizado}`, {
      method: 'PUT', headers: {'Authorization': authHeader}
    });
    if (!res.ok) alert('Error al autorizar servicio');
  }

  async function updateServiceState(orderId, servicioId) {
    const estado = window.prompt('Estado servicio (PENDIENTE, EN_PROCESO, COMPLETADO)');
    if (!estado) return;
    const res = await fetch(`${API_ORIGIN}/api/orders/${orderId}/services/${servicioId}/state`, {
      method: 'PUT', headers: {'Content-Type': 'application/json', 'Authorization': authHeader},
      body: JSON.stringify(estado)
    });
    if (!res.ok) alert('Error actualizando estado del servicio');
  }

  return (
    <div className="App">
      <header className="hero">
        <h1>Taller de Motos</h1>
        <img className="hero-img" src={process.env.PUBLIC_URL + '/reparacion-motores.avif'} alt="Reparación de motores" />
      </header>
      {!user && <Login onLogin={handleLogin} />}
      {user && (
        <div>
          <div className="user-info">
            <p>Conectado como: {user.nombre || user.username} ({user.role})</p>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
          <div className="notifications-container">
            {notifications.map(n => (
              <div key={n.id} className="notification">{n.text}</div>
            ))}
          </div>
          <div className="main-content">
            <div className="component-card">
              <UserManagement user={user} users={users} onCreateUser={createUser} />
            </div>
            <div className="component-card">
              <OrderManagement
                user={user}
                orders={orders}
                onCreateOrder={handleCreateOrder}
                onUpdateStatus={updateStatus}
                onAddPart={addPart}
                onAddService={addService}
                onAuthorizeService={authorizeService}
                onUpdateServiceState={updateServiceState}
              />
            </div>
            <div className="component-card">
              <AppointmentManagement user={user} />
            </div>
            <div className="component-card">
              <ReportManagement user={user} />
            </div>
            <div className="component-card">
              <LoyaltyManagement user={user} />
            </div>
            <div className="component-card">
              <HistoricalMaintenance user={user} />
            </div>
            <div className="component-card">
              <AuthorizationManagement user={user} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
