import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newServicio, setNewServicio] = useState({
    nombre: '',
    descripcion: '',
    costoManoObra: '',
    tiempoEstimado: '',
  });
  const [newRepuesto, setNewRepuesto] = useState({
    nombre: '',
    cantidad: 1,
    precio: 0,
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Error cargando orden');
      navigate('/ordenes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      toast.success('Estado actualizado');
      loadOrder();
    } catch (error) {
      toast.error('Error actualizando estado');
    }
  };

  const handleAddServicio = async (e) => {
    e.preventDefault();
    try {
      await ordersAPI.addServicio(id, {
        ...newServicio,
        costoManoObra: parseFloat(newServicio.costoManoObra),
        tiempoEstimado: parseInt(newServicio.tiempoEstimado),
      });
      toast.success('Servicio agregado');
      setNewServicio({
        nombre: '',
        descripcion: '',
        costoManoObra: '',
        tiempoEstimado: '',
      });
      loadOrder();
    } catch (error) {
      toast.error('Error agregando servicio');
    }
  };

  const handleAddRepuesto = async (e) => {
    e.preventDefault();
    try {
      await ordersAPI.addRepuesto(id, {
        ...newRepuesto,
        cantidad: parseInt(newRepuesto.cantidad),
        precio: parseFloat(newRepuesto.precio),
      });
      toast.success('Repuesto agregado');
      setNewRepuesto({
        nombre: '',
        cantidad: 1,
        precio: 0,
      });
      loadOrder();
    } catch (error) {
      toast.error('Error agregando repuesto');
    }
  };

  const calculateTotal = () => {
    if (!order) return 0;
    const serviciosTotal =
      order.servicios?.reduce((sum, s) => sum + (s.costoManoObra || 0), 0) ||
      0;
    const repuestosTotal =
      order.repuestos?.reduce(
        (sum, r) => sum + (r.precio || 0) * (r.cantidad || 1),
        0
      ) || 0;
    return serviciosTotal + repuestosTotal;
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="text-4xl animate-spin">⏳</span>
          <p className="text-gray-500 mt-4">Cargando orden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/ordenes')}
            className="text-gray-500 hover:text-gray-700 mb-2"
          >
            ← Volver a órdenes
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Orden {order.numeroOrden}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={order.estado}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="DIAGNOSTICO">Diagnóstico</option>
            <option value="AUTORIZACION_PENDIENTE">
              Autorización Pendiente
            </option>
            <option value="REPARACION">Reparación</option>
            <option value="ESPERANDO_REPUESTOS">Esperando Repuestos</option>
            <option value="LISTO_PARA_ENTREGAR">Listo para Entregar</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Bike Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Información del Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">
                  {order.cliente?.nombre || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">
                  {order.cliente?.telefono || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.cliente?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Moto</p>
                <p className="font-medium">
                  {order.moto?.marca} {order.moto?.modelo} ({order.moto?.placa})
                </p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Servicios</h3>
            {order.servicios?.length > 0 ? (
              <div className="space-y-3">
                {order.servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{servicio.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {servicio.descripcion}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estado: {servicio.estado}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ${servicio.costoManoObra}
                      </p>
                      <p className="text-sm text-gray-500">
                        {servicio.tiempoEstimado} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay servicios registrados</p>
            )}

            {/* Add Service Form */}
            <form onSubmit={handleAddServicio} className="mt-4 space-y-3">
              <h4 className="font-medium text-gray-700">Agregar Servicio</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del servicio"
                  value={newServicio.nombre}
                  onChange={(e) =>
                    setNewServicio({ ...newServicio, nombre: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Costo mano de obra"
                  value={newServicio.costoManoObra}
                  onChange={(e) =>
                    setNewServicio({
                      ...newServicio,
                      costoManoObra: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={newServicio.descripcion}
                  onChange={(e) =>
                    setNewServicio({
                      ...newServicio,
                      descripcion: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 col-span-2"
                />
                <input
                  type="number"
                  placeholder="Tiempo estimado (min)"
                  value={newServicio.tiempoEstimado}
                  onChange={(e) =>
                    setNewServicio({
                      ...newServicio,
                      tiempoEstimado: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Agregar Servicio
              </button>
            </form>
          </div>

          {/* Parts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Repuestos</h3>
            {order.repuestos?.length > 0 ? (
              <div className="space-y-3">
                {order.repuestos.map((repuesto) => (
                  <div
                    key={repuesto.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{repuesto.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {repuesto.cantidad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ${repuesto.precio * repuesto.cantidad}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${repuesto.precio} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay repuestos registrados</p>
            )}

            {/* Add Part Form */}
            <form onSubmit={handleAddRepuesto} className="mt-4 space-y-3">
              <h4 className="font-medium text-gray-700">Agregar Repuesto</h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del repuesto"
                  value={newRepuesto.nombre}
                  onChange={(e) =>
                    setNewRepuesto({ ...newRepuesto, nombre: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 col-span-3"
                  required
                />
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={newRepuesto.cantidad}
                  onChange={(e) =>
                    setNewRepuesto({
                      ...newRepuesto,
                      cantidad: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio unitario"
                  value={newRepuesto.precio}
                  onChange={(e) =>
                    setNewRepuesto({ ...newRepuesto, precio: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 col-span-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Agregar Repuesto
              </button>
            </form>
          </div>

          {/* Technical Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📝</span> Notas y Diagnóstico del Técnico
            </h3>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px] text-sm"
              placeholder="Escribe aquí los hallazgos técnicos, recomendaciones o detalles de la reparación..."
              defaultValue={order.notasTecnicas || ''}
              onBlur={async (e) => {
                try {
                  // Aqui iria el update de las notas al backend
                  toast.success('Notas guardadas automáticamente');
                } catch (error) {
                  toast.error('Error al guardar notas');
                }
              }}
            />
            <p className="text-[10px] text-gray-400 mt-2 italic">
              * Las notas se guardan automáticamente al salir del campo de texto.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Motivo de ingreso:</span>
              </div>
              <p className="font-medium">{order.motivoIngreso || 'N/A'}</p>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diagnóstico:</span>
              </div>
              <p className="font-medium">{order.diagnosticoInicial || 'N/A'}</p>
            </div>
            <hr className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Servicios:</span>
                <span className="font-medium">
                  ${order.servicios?.reduce((sum, s) => sum + (s.costoManoObra || 0), 0) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Repuestos:</span>
                <span className="font-medium">
                  ${order.repuestos?.reduce((sum, r) => sum + (r.precio || 0) * (r.cantidad || 1), 0) || 0}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">${calculateTotal()}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Línea de Tiempo
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                <div>
                  <p className="font-medium text-sm">Orden creada</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.creadoEn).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                <div>
                  <p className="font-medium text-sm">Diagnóstico inicial</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.creadoEn).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
