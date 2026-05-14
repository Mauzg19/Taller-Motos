import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    notificationsEmail: true,
    notificationsPush: true,
    darkMode: false,
    language: 'es',
    twoFactor: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preferencia actualizada');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span>🔔</span> Notificaciones
          </h3>
          <p className="text-sm text-gray-500 mt-1">Controla cómo quieres recibir los avisos del taller.</p>
          
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibe resúmenes de tus órdenes y facturas por correo.</p>
              </div>
              <button 
                onClick={() => handleToggle('notificationsEmail')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.notificationsEmail ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notificationsEmail ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Recibe avisos en tiempo real sobre el estado de tu moto.</p>
              </div>
              <button 
                onClick={() => handleToggle('notificationsPush')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.notificationsPush ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notificationsPush ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span>🛡️</span> Seguridad y Privacidad
          </h3>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Autenticación de dos pasos (2FA)</p>
                <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta.</p>
              </div>
              <button 
                onClick={() => handleToggle('twoFactor')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.twoFactor ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.twoFactor ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end">
          <button 
            onClick={() => toast.success('Todas las configuraciones han sido guardadas')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 shadow-md shadow-primary-600/20"
          >
            Guardar Todo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
