import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('revenue');

  const revenueData = [
    { mes: 'Enero', ingresos: 8200, gastos: 5100, ganancia: 3100 },
    { mes: 'Febrero', ingresos: 9800, gastos: 6200, ganancia: 3600 },
    { mes: 'Marzo', ingresos: 12400, gastos: 7800, ganancia: 4600 },
    { mes: 'Abril', ingresos: 15400, gastos: 9200, ganancia: 6200 },
  ];

  const servicesData = [
    { nombre: 'Cambio de Aceite', cantidad: 45, ingresos: 4500000 },
    { nombre: 'Revisión de Frenos', cantidad: 32, ingresos: 3800000 },
    { nombre: 'Ajuste de Cadena', cantidad: 28, ingresos: 2100000 },
    { nombre: 'Mantenimiento General', cantidad: 18, ingresos: 5400000 },
    { nombre: 'Reparación de Motor', cantidad: 8, ingresos: 6200000 },
  ];

  const partsData = [
    { nombre: 'Aceites', count: 45 },
    { nombre: 'Filtros', count: 38 },
    { nombre: 'Pastillas de Freno', count: 25 },
    { nombre: 'Bujías', count: 22 },
    { nombre: 'Cadenas', count: 12 },
  ];

  const technicianData = [
    { nombre: 'Carlos M.', eficiencia: 95, ordenes: 42 },
    { nombre: 'Luis R.', eficiencia: 88, ordenes: 38 },
    { nombre: 'Juan D.', eficiencia: 92, ordenes: 35 },
    { nombre: 'Pedro S.', eficiencia: 85, ordenes: 28 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleExportPDF = () => {
    toast.success('Generando PDF...');
    // In production, this would call the backend API
  };

  const handleExportExcel = () => {
    toast.success('Generando Excel...');
    // In production, this would call the backend API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📄 Exportar PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'revenue', label: 'Ingresos y Ganancias', icon: '💰' },
            { id: 'services', label: 'Servicios Más Populares', icon: '🔧' },
            { id: 'parts', label: 'Repuestos Más Usados', icon: '⚙️' },
            { id: 'technicians', label: 'Eficiencia de Técnicos', icon: '👨‍🔧' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reportType === type.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportType === 'revenue' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Tendencia de Ingresos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="ganancia" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Resumen Mensual
              </h3>
              <div className="space-y-4">
                {revenueData.map((month) => (
                  <div key={month.mes} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">{month.mes}</span>
                      <span className="text-sm text-gray-500">
                        Ganancia: <span className="text-green-600 font-bold">
                          ${month.ganancia.toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-blue-600">Ingresos: ${month.ingresos.toLocaleString()}</span>
                      <span className="text-red-600">Gastos: ${month.gastos.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {reportType === 'services' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Servicios por Ingresos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={servicesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#3B82F6" name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Ranking de Servicios
              </h3>
              <div className="space-y-3">
                {servicesData
                  .sort((a, b) => b.ingresos - a.ingresos)
                  .map((service, index) => (
                    <div
                      key={service.nombre}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl font-bold text-gray-300 w-8">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{service.nombre}</p>
                        <p className="text-sm text-gray-500">{service.cantidad} realizados</p>
                      </div>
                      <span className="font-bold text-primary-600">
                        ${service.ingresos.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {reportType === 'parts' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Repuestos Más Utilizados
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={partsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nombre, count }) => `${nombre}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {partsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Lista de Repuestos
              </h3>
              <div className="space-y-3">
                {partsData
                  .sort((a, b) => b.count - a.count)
                  .map((part, index) => (
                    <div
                      key={part.nombre}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl font-bold text-gray-300 w-8">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{part.nombre}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        {part.count} unidades
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {reportType === 'technicians' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Eficiencia de Técnicos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={technicianData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="eficiencia" fill="#10B981" name="Eficiencia %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Ranking de Técnicos
              </h3>
              <div className="space-y-3">
                {technicianData
                  .sort((a, b) => b.eficiencia - a.eficiencia)
                  .map((tech, index) => (
                    <div
                      key={tech.nombre}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className={`text-2xl font-bold w-8 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-amber-600' : 'text-gray-300'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{tech.nombre}</p>
                        <p className="text-sm text-gray-500">{tech.ordenes} órdenes completadas</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          tech.eficiencia >= 90 ? 'bg-green-100 text-green-800' :
                          tech.eficiencia >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tech.eficiencia}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
