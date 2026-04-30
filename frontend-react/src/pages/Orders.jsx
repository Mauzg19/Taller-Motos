import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Error cargando órdenes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.estado === filter;
    const matchesSearch =
      order.numeroOrden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status) => {
    const styles = {
      DIAGNOSTICO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      AUTORIZACION_PENDIENTE: 'bg-red-100 text-red-800 border-red-200',
      REPARACION: 'bg-blue-100 text-blue-800 border-blue-200',
      ESPERANDO_REPUESTOS: 'bg-orange-100 text-orange-800 border-orange-200',
      LISTO_PARA_ENTREGAR: 'bg-purple-100 text-purple-800 border-purple-200',
      ENTREGADO: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Órdenes</h2>
        <Link
          to="/ordenes/nueva"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nueva Orden
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por número de orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="DIAGNOSTICO">Diagnóstico</option>
            <option value="REPARACION">Reparación</option>
            <option value="ESPERANDO_REPUESTOS">Esperando repuestos</option>
            <option value="LISTO_PARA_ENTREGAR">Listo para entregar</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Orden
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Cliente
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Moto
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Motivo
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Estado
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Fecha
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <span className="animate-spin text-2xl">⏳</span>
                    <p>Cargando órdenes...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No se encontraron órdenes
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Link
                        to={`/ordenes/${order.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {order.numeroOrden}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">
                          {order.cliente?.nombre || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.cliente?.telefono || ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">
                          {order.moto?.marca} {order.moto?.modelo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.moto?.placa || ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm max-w-xs truncate">
                      {order.motivoIngreso || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          order.estado
                        )}`}
                      >
                        {order.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(order.creadoEn).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/ordenes/${order.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
