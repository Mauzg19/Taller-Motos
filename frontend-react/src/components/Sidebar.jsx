import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/ordenes', label: 'Órdenes', icon: '📋' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/citas', label: 'Citas', icon: '📅' },
  { path: '/inventario', label: 'Inventario', icon: '📦' },
  { path: '/reportes', label: 'Reportes', icon: '📈' },
];

const Sidebar = ({ user }) => {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-primary-400">
          🏍️ Taller Motos
        </h1>
        <p className="text-xs text-gray-400 mt-1">Sistema de Gestión</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800 bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.username || 'Usuario'}</p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.roles?.[0]?.replace('ROLE_', '') || 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          v1.0.0 © 2026
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
