import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newItem, setNewItem] = useState({
    nombre: '',
    categoria: '',
    cantidad: 1,
    precio: 0,
    costoCompra: 0,
    stockMinimo: 5,
    codigoInterno: '',
    codigoProveedor: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const mockInventory = [
    { id: 1, nombre: 'Aceite Motul 5W40', categoria: 'Aceites', cantidad: 24, precio: 45000, costoCompra: 30000, stockMinimo: 10, codigoInterno: 'ACE-001' },
    { id: 2, nombre: 'Filtro de Aire', categoria: 'Filtros', cantidad: 8, precio: 25000, costoCompra: 15000, stockMinimo: 10, codigoInterno: 'FLT-002' },
    { id: 3, nombre: 'Pastillas de Freno Delanteras', categoria: 'Frenos', cantidad: 15, precio: 85000, costoCompra: 55000, stockMinimo: 5, codigoInterno: 'FRN-003' },
    { id: 4, nombre: 'Cadena de Transmisión', categoria: 'Transmisión', cantidad: 3, precio: 180000, costoCompra: 120000, stockMinimo: 5, codigoInterno: 'TRN-004' },
    { id: 5, nombre: 'Bujía NGK', categoria: 'Encendido', cantidad: 50, precio: 15000, costoCompra: 8000, stockMinimo: 20, codigoInterno: 'ENC-005' },
    { id: 6, nombre: 'Kit de Embrague', categoria: 'Transmisión', cantidad: 2, precio: 350000, costoCompra: 250000, stockMinimo: 3, codigoInterno: 'TRN-006' },
  ];

  useEffect(() => {
    setInventory(mockInventory);
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setEditingId(item.id);
      setNewItem({ ...item });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setNewItem({
        nombre: '',
        categoria: '',
        cantidad: 1,
        precio: 0,
        costoCompra: 0,
        stockMinimo: 5,
        codigoInterno: '',
        codigoProveedor: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setInventory(inventory.map(item => item.id === editingId ? { ...newItem, id: editingId } : item));
      toast.success('Repuesto actualizado correctamente');
    } else {
      const id = inventory.length + 1;
      setInventory([...inventory, { ...newItem, id }]);
      toast.success('Repuesto agregado al inventario');
    }
    setShowModal(false);
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === 'low') return item.cantidad <= item.stockMinimo;
    if (filter === 'all') return true;
    return item.categoria === filter;
  });

  const categories = [...new Set(inventory.map((i) => i.categoria))];
  const lowStockItems = inventory.filter((i) => i.cantidad <= i.stockMinimo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Inventario de Repuestos</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nuevo Repuesto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Valor del Inventario</p>
          <p className="text-2xl font-bold text-gray-800">
            ${inventory.reduce((acc, i) => acc + i.costoCompra * i.cantidad, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Categorías</p>
          <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({inventory.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'low'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚠️ Stock Bajo ({lowStockItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Código</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Categoría</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">Stock</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Costo</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Precio</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Estado</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 text-sm font-mono text-gray-600">{item.codigoInterno}</td>
                <td className="py-4 px-4 font-medium">{item.nombre}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{item.categoria}</span>
                </td>
                <td className="text-center py-4 px-4">
                  <span className={`font-medium ${item.cantidad <= item.stockMinimo ? 'text-red-600' : 'text-gray-800'}`}>
                    {item.cantidad}
                  </span>
                  {item.cantidad <= item.stockMinimo && (
                    <span className="block text-xs text-red-600">Mín: {item.stockMinimo}</span>
                  )}
                </td>
                <td className="text-right py-4 px-4 text-sm text-gray-600">${item.costoCompra.toLocaleString()}</td>
                <td className="text-right py-4 px-4 text-sm font-medium text-gray-800">${item.precio.toLocaleString()}</td>
                <td className="py-4 px-4">
                  {item.cantidad <= item.stockMinimo ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Stock Bajo
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      En Stock
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm mr-3"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isEditing ? 'Editar Repuesto' : 'Nuevo Repuesto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newItem.nombre}
                    onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <input
                    type="text"
                    value={newItem.categoria}
                    onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Aceites, Frenos..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Interno</label>
                  <input
                    type="text"
                    value={newItem.codigoInterno}
                    onChange={(e) => setNewItem({ ...newItem, codigoInterno: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Proveedor</label>
                  <input
                    type="text"
                    value={newItem.codigoProveedor}
                    onChange={(e) => setNewItem({ ...newItem, codigoProveedor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Inicial</label>
                  <input
                    type="number"
                    value={newItem.cantidad}
                    onChange={(e) => setNewItem({ ...newItem, cantidad: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                  <input
                    type="number"
                    value={newItem.stockMinimo}
                    onChange={(e) => setNewItem({ ...newItem, stockMinimo: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Costo Compra</label>
                  <input
                    type="number"
                    value={newItem.costoCompra}
                    onChange={(e) => setNewItem({ ...newItem, costoCompra: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Venta</label>
                  <input
                    type="number"
                    value={newItem.precio}
                    onChange={(e) => setNewItem({ ...newItem, precio: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
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
                  {isEditing ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
