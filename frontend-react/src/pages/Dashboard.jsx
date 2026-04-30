import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { dashboardAPI, ordersAPI } from '../api/api';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const StatCard = ({ title, value, icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {trend && (
          <p
            className={`text-sm mt-2 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
          </p>
        )}
      </div>
      <div
        className={`w-16 h-16 rounded-full ${color} bg-opacity-10 flex items-center justify-center text-2xl`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrdenes: 0,
    ordenesActivas: 0,
    ordenesCompletadas: 0,
    ingresosMes: 0,
  });
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, revenueRes] = await Promise.all([
        dashboardAPI.getStats().catch(() => ({ data: mockStats })),
        ordersAPI.getAll().catch(() => ({ data: [] })),
        dashboardAPI.getRevenueByMonth().catch(() => ({ data: mockRevenue })),
      ]);

      // Calculate stats from orders
      const orders = ordersRes.data || [];
      const statsData = {
        totalOrdenes: orders.length,
        ordenesActivas: orders.filter(
          (o) => o.estado !== 'ENTREGADO'
        ).length,
        ordenesCompletadas: orders.filter((o) => o.estado === 'ENTREGADO')
          .length,
        ingresosMes: calculateRevenue(orders),
      };

      setStats(statsData);

      // Group orders by status
      const statusGroups = orders.reduce((acc, order) => {
        acc[order.estado] = (acc[order.estado] || 0) + 1;
        return acc;
      }, {});

      setOrdersByStatus(
        Object.entries(statusGroups).map(([name, value]) => ({
          name,
          value,
        }))
      );

      setRevenueData(revenueRes.data || mockRevenue);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = (orders) => {
    // Simplified revenue calculation
    return orders.reduce((acc, order) => {
      const serviciosTotal =
        order.servicios?.reduce(
          (sum, s) => sum + (s.costoManoObra || 0),
          0
        ) || 0;
      const repuestosTotal =
        order.repuestos?.reduce(
          (sum, r) => sum + (r.precio || 0) * (r.cantidad || 1),
          0
        ) || 0;
      return acc + serviciosTotal + repuestosTotal;
    }, 0);
  };

  const mockStats = {
    totalOrdenes: 24,
    ordenesActivas: 8,
    ordenesCompletadas: 16,
    ingresosMes: 15400,
  };

  const mockRevenue = [
    { name: 'Ene', ingresos: 8200 },
    { name: 'Feb', ingresos: 9800 },
    { name: 'Mar', ingresos: 12400 },
    { name: 'Abr', ingresos: 15400 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="text-4xl animate-spin">⏳</span>
          <p className="text-gray-500 mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Órdenes"
          value={stats.totalOrdenes}
          icon="📋"
          trend={12}
          color="bg-blue-500"
        />
        <StatCard
          title="Órdenes Activas"
          value={stats.ordenesActivas}
          icon="🔧"
          trend={8}
          color="bg-yellow-500"
        />
        <StatCard
          title="Completadas"
          value={stats.ordenesCompletadas}
          icon="✅"
          trend={15}
          color="bg-green-500"
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${stats.ingresosMes.toLocaleString()}`}
          icon="💰"
          trend={22}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Órdenes por Estado
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend - Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Tendencia de Ingresos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Órdenes Recientes
          </h3>
          <Link
            to="/ordenes"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Orden
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Moto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {mockRecentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium">
                    {order.numeroOrden}
                  </td>
                  <td className="py-3 px-4 text-sm">{order.cliente}</td>
                  <td className="py-3 px-4 text-sm">
                    {order.moto}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.estado} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {order.fecha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    DIAGNOSTICO: 'bg-yellow-100 text-yellow-800',
    REPARACION: 'bg-blue-100 text-blue-800',
    ESPERANDO_REPUESTOS: 'bg-orange-100 text-orange-800',
    LISTO_PARA_ENTREGAR: 'bg-purple-100 text-purple-800',
    ENTREGADO: 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const mockRecentOrders = [
  {
    id: 1,
    numeroOrden: 'ORD-001',
    cliente: 'Juan Pérez',
    moto: 'Yamaha MT-07',
    estado: 'DIAGNOSTICO',
    fecha: '27/04/2026',
  },
  {
    id: 2,
    numeroOrden: 'ORD-002',
    cliente: 'María García',
    moto: 'Honda CB-500',
    estado: 'REPARACION',
    fecha: '26/04/2026',
  },
  {
    id: 3,
    numeroOrden: 'ORD-003',
    cliente: 'Carlos López',
    moto: 'Kawasaki Ninja 400',
    estado: 'LISTO_PARA_ENTREGAR',
    fecha: '25/04/2026',
  },
  {
    id: 4,
    numeroOrden: 'ORD-004',
    cliente: 'Ana Martínez',
    moto: 'Suzuki GSX-R',
    estado: 'ENTREGADO',
    fecha: '24/04/2026',
  },
];

export default Dashboard;
