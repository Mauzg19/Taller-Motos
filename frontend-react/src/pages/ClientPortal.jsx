import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientPortalAPI } from '../api/api';
import toast from 'react-hot-toast';

const ClientPortal = () => {
  const { numeroOrden } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (numeroOrden) {
      loadOrder();
    }
  }, [numeroOrden]);

  const loadOrder = async () => {
    try {
      const response = await clientPortalAPI.getOrderByNumber(numeroOrden);
      setOrder(response.data);

      // Mock historial - in production this would come from the API
      setHistorial([
        { fecha: new Date().toISOString(), evento: 'Orden creada', descripcion: 'La orden fue registrada en el sistema' },
        { fecha: new Date().toISOString(), evento: 'Diagnóstico inicial', descripcion: 'Se realizó el diagnóstico inicial de la moto' },
      ]);
    } catch (error) {
      toast.error('Orden no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const info = {
      DIAGNOSTICO: {
        label: 'En Diagnóstico',
        color: 'bg-yellow-500',
        description: 'Tu moto está siendo evaluada por nuestros técnicos',
      },
      AUTORIZACION_PENDIENTE: {
        label: 'Autorización Pendiente',
        color: 'bg-red-500',
        description: 'Esperamos tu autorización para proceder',
      },
      REPARACION: {
        label: 'En Reparación',
        color: 'bg-blue-500',
        description: 'Tu moto está siendo reparada',
      },
      ESPERANDO_REPUESTOS: {
        label: 'Esperando Repuestos',
        color: 'bg-orange-500',
        description: 'Estamos esperando la llegada de repuestos',
      },
      LISTO_PARA_ENTREGAR: {
        label: 'Lista para Entregar',
        color: 'bg-purple-500',
        description: 'Tu moto está lista, puedes pasar a retirarla',
      },
      ENTREGADO: {
        label: 'Entregado',
        color: 'bg-green-500',
        description: 'Tu moto ha sido entregada',
      },
    };
    return info[status] || { label: status, color: 'bg-gray-500', description: '' };
  };

  const steps = [
    { id: 'DIAGNOSTICO', label: 'Diagnóstico', icon: '🔍' },
    { id: 'AUTORIZACION_PENDIENTE', label: 'Autorización', icon: '📋' },
    { id: 'REPARACION', label: 'Reparación', icon: '🔧' },
    { id: 'ESPERANDO_REPUESTOS', label: 'Repuestos', icon: '📦' },
    { id: 'LISTO_PARA_ENTREGAR', label: 'Listo', icon: '✅' },
    { id: 'ENTREGADO', label: 'Entregado', icon: '🎉' },
  ];

  const getCurrentStep = (status) => {
    const order = steps.findIndex((s) => s.id === status);
    return order >= 0 ? order : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
        <div className="text-center text-white">
          <span className="text-4xl animate-spin">⏳</span>
          <p className="mt-4">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
        <div className="text-center text-white bg-white rounded-xl shadow-2xl p-8 max-w-md">
          <span className="text-4xl">❌</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4">Orden no encontrada</h2>
          <p className="text-gray-500 mt-2">
            El número de orden ingresado no existe en nuestro sistema.
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.estado);
  const currentStep = getCurrentStep(order.estado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🏍️ Estado de tu Moto
              </h1>
              <p className="text-gray-500 mt-1">
                Orden: <span className="font-bold text-primary-600">{order.numeroOrden}</span>
              </p>
            </div>
            <div className={`px-6 py-3 rounded-full ${statusInfo.color} text-white font-bold text-center`}>
              <p className="text-sm opacity-90">{statusInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Progreso del Servicio</h2>
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>

            {/* Progress Bar Filled */}
            <div
              className="absolute top-1/2 left-0 h-2 bg-primary-500 rounded-full transform -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                        isCompleted
                          ? `${step.id === 'ENTREGADO' ? 'bg-green-500' : 'bg-primary-500'} text-white`
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}`}
                    >
                      {isCompleted ? step.icon : '○'}
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        isCurrent ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6">
            {statusInfo.description}
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer & Bike Info */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Información de tu Moto</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Marca:</span>
                <span className="font-medium">{order.moto?.marca || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modelo:</span>
                <span className="font-medium">{order.moto?.modelo || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Placa:</span>
                <span className="font-medium">{order.moto?.placa || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Motivo de ingreso:</span>
                <span className="font-medium">{order.motivoIngreso || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Services Summary */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del Servicio</h3>
            <div className="space-y-3">
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
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-primary-600">
                  ${(order.servicios?.reduce((sum, s) => sum + (s.costoManoObra || 0), 0) || 0) +
                    (order.repuestos?.reduce((sum, r) => sum + (r.precio || 0) * (r.cantidad || 1), 0) || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Parts List */}
        {(order.servicios?.length > 0 || order.repuestos?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.servicios?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Servicios Realizados</h3>
                  <div className="space-y-2">
                    {order.servicios.map((servicio) => (
                      <div key={servicio.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800">{servicio.nombre}</p>
                        <p className="text-sm text-gray-500">${servicio.costoManoObra}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {order.repuestos?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Repuestos Utilizados</h3>
                  <div className="space-y-2">
                    {order.repuestos.map((repuesto) => (
                      <div key={repuesto.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800">
                          {repuesto.nombre} x{repuesto.cantidad}
                        </p>
                        <p className="text-sm text-gray-500">${repuesto.precio * repuesto.cantidad}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline/Historial */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Actualizaciones</h3>
          <div className="space-y-4">
            {historial.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.evento}</p>
                  <p className="text-sm text-gray-500">{item.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.fecha).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p>¿Tienes preguntas? Contáctanos al teléfono de soporte o responde a este correo.</p>
          <p className="mt-2">© 2026 Taller de Motos. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
