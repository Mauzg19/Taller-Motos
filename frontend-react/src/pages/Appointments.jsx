import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAppointment, setNewAppointment] = useState({
    fecha: '',
    hora: '',
    cliente: '',
    servicio: '',
    tecnico: '',
  });

  const mockAppointments = [
    { id: 1, fecha: '2026-04-27', hora: '09:00', cliente: 'Juan Pérez', servicio: 'Cambio de aceite', tecnico: 'Carlos M.' },
    { id: 2, fecha: '2026-04-27', hora: '11:00', cliente: 'María García', servicio: 'Revisión frenos', tecnico: 'Luis R.' },
    { id: 3, fecha: '2026-04-27', hora: '14:00', cliente: 'Pedro Sánchez', servicio: 'Ajuste cadena', tecnico: 'Carlos M.' },
    { id: 4, fecha: '2026-04-28', hora: '10:00', cliente: 'Ana López', servicio: 'Mantenimiento general', tecnico: 'Luis R.' },
  ];

  useEffect(() => {
    setAppointments(mockAppointments);
  }, []);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    toast.success('Cita agendada');
    setShowModal(false);
    setNewAppointment({
      fecha: '',
      hora: '',
      cliente: '',
      servicio: '',
      tecnico: '',
    });
  };

  const filteredAppointments = appointments.filter(
    (apt) => apt.fecha === selectedDate
  );

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Agenda de Citas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nueva Cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Calendario</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
          />
          <div className="space-y-2">
            {['2026-04-27', '2026-04-28', '2026-04-29', '2026-04-30', '2026-05-01'].map((date) => {
              const count = appointments.filter((a) => a.fecha === date).length;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedDate === date
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedDate === date ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Citas para {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500"
                >
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-bold text-gray-800">{apt.hora}</p>
                    <p className="text-xs text-gray-500">
                      {parseInt(apt.hora) + 1}:00
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{apt.cliente}</p>
                    <p className="text-sm text-gray-600">{apt.servicio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Técnico</p>
                    <p className="font-medium text-gray-800">{apt.tecnico}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    ⋮
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl">📅</span>
              <p className="mt-2">No hay citas agendadas para este día</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nueva Cita</h3>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={newAppointment.fecha}
                  onChange={(e) => setNewAppointment({ ...newAppointment, fecha: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                <select
                  value={newAppointment.hora}
                  onChange={(e) => setNewAppointment({ ...newAppointment, hora: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar hora</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <input
                  type="text"
                  value={newAppointment.cliente}
                  onChange={(e) => setNewAppointment({ ...newAppointment, cliente: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                <input
                  type="text"
                  value={newAppointment.servicio}
                  onChange={(e) => setNewAppointment({ ...newAppointment, servicio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Tipo de servicio"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Técnico</label>
                <select
                  value={newAppointment.tecnico}
                  onChange={(e) => setNewAppointment({ ...newAppointment, tecnico: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar técnico</option>
                  <option value="Carlos M.">Carlos M.</option>
                  <option value="Luis R.">Luis R.</option>
                  <option value="Juan D.">Juan D.</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
