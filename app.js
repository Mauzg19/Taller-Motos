const API = (window.API_ORIGIN ?? 'http://localhost:8080') + '/api';
const estados = ["DIAGNOSTICO", "REPARACION", "ESPERANDO_REPUESTOS", "LISTO_PARA_ENTREGAR", "ENTREGADO"];

function createSelectOptions(selected) {
  return estados.map(e => `<option value="${e}" ${e === selected ? 'selected' : ''}>${e}</option>`).join('');
}

function renderRow(o) {
  const id = o.id;
  const tr = document.createElement('tr');
  tr.id = `orden-${id}`;
  tr.innerHTML = `
    <td>${id}</td>
    <td>${o.numeroOrden}</td>
    <td>${o.nombreCliente || ''} <br><small>${o.telefonoCliente || ''}</small></td>
    <td>${o.marca || ''} ${o.modelo || ''} <br><small>${o.placa || ''}</small></td>
    <td>${o.motivoIngreso || ''}</td>
    <td>${o.diagnosticoInicial || ''}</td>
    <td class="estado">${o.estado}</td>
    <td><select id="select-${id}">${createSelectOptions(o.estado)}</select> <button data-id="${id}" class="update-btn">Actualizar</button></td>`;
  return tr;
}

async function fetchOrders(){
  const res = await fetch(`${API}/orders`);
  const list = await res.json();
  const tbody = document.querySelector('#ordenes-table tbody');
  tbody.innerHTML = '';
  list.forEach(o => tbody.appendChild(renderRow(o)));
  attachListeners();
}

function attachListeners(){
  document.querySelectorAll('.update-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      const select = document.getElementById(`select-${id}`);
      const estado = select.value;
      await fetch(`${API}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
    };
  });
}

function subscribeSSE(){
  const es = new EventSource(`${API}/orders/stream`.replace('/api','/api')); // event source
  es.addEventListener('orden-update', e => {
    const orden = JSON.parse(e.data);
    const existing = document.getElementById(`orden-${orden.id}`);
    if(existing){
      existing.replaceWith(renderRow(orden));
      attachListeners();
    } else {
      document.querySelector('#ordenes-table tbody').appendChild(renderRow(orden));
      attachListeners();
    }
  });
  es.onerror = err => console.warn('SSE error', err);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchOrders();
  subscribeSSE();
  const form = document.getElementById('create-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form); const obj = {};
    fd.forEach((v,k)=> obj[k]=v);
    const res = await fetch(`${API}/orders`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(obj)});
    if(res.ok) form.reset(); else alert('Error al crear');
  };
});
