import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { dashboardAPI, ordersAPI } from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Componente para tarjetas de estadisticas
const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-full ${color} bg-opacity-10 flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
);

// Componente para estados
const StatusBadge = ({ status }) => {
  const styles = {
    DIAGNOSTICO: 'bg-blue-100 text-blue-800',
    REPARACION: 'bg-yellow-100 text-yellow-800',
    ESPERANDO_REPUESTOS: 'bg-orange-100 text-orange-800',
    LISTO_PARA_ENTREGAR: 'bg-purple-100 text-purple-800',
    ENTREGADO: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const role = user?.role || 'CLIENTE';
  const isStaff = role === 'ADMIN' || role === 'RECEPCION';
  const isTecnico = role === 'TECNICO' || role === 'MECANICO';

  useEffect(() => {
    if (isStaff || isTecnico) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isStaff, isTecnico]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, revenueRes] = await Promise.all([
        dashboardAPI.getStats().catch(() => ({ data: mockStats })),
        ordersAPI.getAll().catch(() => ({ data: [] })),
        dashboardAPI.getRevenueByMonth().catch(() => ({ data: mockRevenue })),
      ]);

      const allOrders = ordersRes.data || [];
      setOrders(allOrders);

      setStats({
        totalOrdenes: allOrders.length,
        ordenesActivas: allOrders.filter(o => o.estado !== 'ENTREGADO').length,
        ordenesCompletadas: allOrders.filter(o => o.estado === 'ENTREGADO').length,
        ingresosMes: allOrders.reduce((acc, o) => acc + (o.total || 0), 0) || 12500000,
      });

      const statusGroups = allOrders.reduce((acc, order) => {
        acc[order.estado] = (acc[order.estado] || 0) + 1;
        return acc;
      }, {});

      setOrdersByStatus(Object.entries(statusGroups).map(([name, value]) => ({ name, value })));
      setRevenueData(revenueRes.data || mockRevenue);
    } catch (error) {
      toast.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder({
      id: order.id,
      numero: order.numeroOrden,
      moto: `${order.moto?.marca} ${order.moto?.modelo}`
    });
    setShowUpdateModal(true);
  };

  const saveStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
      await ordersAPI.updateStatus(selectedOrder.id, newStatus);
      
      toast.success(`Orden ${selectedOrder.numero} actualizada`);
      setShowUpdateModal(false);
      
      // Recargar datos para ver el cambio reflejado
      await loadDashboardData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-500">Cargando panel...</div>;

  // --- VISTA TÉCNICO ---
  if (isTecnico) {
    const activeOrders = orders.filter(o => o.estado !== 'ENTREGADO');

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">Panel Técnico: {user?.nombre}</h2>
          <p className="opacity-90">Gestiona las reparaciones activas del taller.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Órdenes Activas" value={activeOrders.length} icon="📋" color="bg-blue-500" />
          <StatCard title="En Reparación" value={activeOrders.filter(o => o.estado === 'REPARACION').length} icon="⚙️" color="bg-yellow-500" />
          <StatCard title="Por Entregar" value={activeOrders.filter(o => o.estado === 'LISTO_PARA_ENTREGAR').length} icon="✅" color="bg-green-500" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Trabajos en el Taller</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3">Orden</th>
                  <th className="pb-3">Moto</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeOrders.length > 0 ? (
                  activeOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold">{order.numeroOrden}</td>
                      <td className="py-4">{order.moto?.marca} {order.moto?.modelo}</td>
                      <td className="py-4"><StatusBadge status={order.estado} /></td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleUpdateStatus(order)}
                          className="text-primary-600 font-bold hover:underline"
                        >
                          Actualizar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-400 italic">No hay órdenes activas en este momento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Actualización de Estado */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Actualizar Orden {selectedOrder?.numero}</h3>
              <p className="text-sm text-gray-500 mb-6">Moto: {selectedOrder?.moto}</p>
              
              <div className="space-y-3">
                <button onClick={() => saveStatusUpdate('DIAGNOSTICO')} className="w-full py-3 px-4 text-left rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium flex items-center justify-between">
                  <span>Diagnóstico</span>
                  <span>🔍</span>
                </button>
                <button onClick={() => saveStatusUpdate('REPARACION')} className="w-full py-3 px-4 text-left rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all font-medium flex items-center justify-between">
                  <span>En Reparación</span>
                  <span>🔧</span>
                </button>
                <button onClick={() => saveStatusUpdate('ESPERANDO_REPUESTOS')} className="w-full py-3 px-4 text-left rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all font-medium flex items-center justify-between">
                  <span>Esperando Repuestos</span>
                  <span>📦</span>
                </button>
                <button onClick={() => saveStatusUpdate('LISTO_PARA_ENTREGAR')} className="w-full py-3 px-4 text-left rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all font-medium flex items-center justify-between">
                  <span>Listo para Entregar</span>
                  <span>✨</span>
                </button>
              </div>

              <button 
                onClick={() => setShowUpdateModal(false)}
                className="w-full mt-6 py-3 text-gray-500 font-medium hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA CLIENTE ---
  if (!isStaff) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">¡Hola, {user?.nombre}!</h2>
          <p className="opacity-90">Bienvenido a tu portal. Aquí puedes ver el estado de tus motos y puntos.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Mis Motos" value="2" icon="🏍️" color="bg-blue-500" />
          <StatCard title="Citas Hoy" value="1" icon="📅" color="bg-yellow-500" />
          <StatCard title="Mis Puntos" value="450" icon="🏆" color="bg-green-500" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Estado de mis Motos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-xl p-4 flex gap-4 bg-gray-50/50">
              <div className="text-4xl">🏍️</div>
              <div>
                <h4 className="font-bold">Yamaha MT-07</h4>
                <p className="text-sm text-gray-500 italic">ABC-123</p>
                <div className="mt-2"><StatusBadge status="ENTREGADO" /></div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 flex gap-4 bg-blue-50/30">
              <div className="text-4xl">🛵</div>
              <div>
                <h4 className="font-bold">Honda PCX 150</h4>
                <p className="text-sm text-gray-500 italic">XYZ-789</p>
                <div className="mt-2"><StatusBadge status="REPARACION" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA ADMIN / STAFF ---
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Órdenes" value={stats?.totalOrdenes || 0} icon="📋" trend={12} color="bg-blue-500" />
        <StatCard title="Activas" value={stats?.ordenesActivas || 0} icon="🔧" trend={8} color="bg-yellow-500" />
        <StatCard title="Completadas" value={stats?.ordenesCompletadas || 0} icon="✅" trend={15} color="bg-green-500" />
        <StatCard title="Ingresos" value={`$${(stats?.ingresosMes || 0).toLocaleString()}`} icon="💰" trend={22} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold mb-4">Órdenes por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={ordersByStatus} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                {ordersByStatus.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold mb-4">Tendencia de Ingresos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Ingresos']} />
              <Line type="monotone" dataKey="ingresos" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Datos Mock
const mockStats = { totalOrdenes: 25, ordenesActivas: 8, ordenesCompletadas: 17, ingresosMes: 12500000 };
const mockRevenue = [
  { name: 'Ene', ingresos: 8000000 }, { name: 'Feb', ingresos: 9500000 }, { name: 'Mar', ingresos: 11000000 }, { name: 'Abr', ingresos: 12500000 },
];

export default Dashboard;
