import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoyaltyPoints = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(450);
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'BIENVENIDA50', discount: '$50.000', description: 'Descuento en mantenimiento general', expiry: '2026-12-31', used: false },
    { id: 2, code: 'ACEITEGRATIS', discount: '100%', description: 'Cambio de aceite mano de obra gratis', expiry: '2026-06-15', used: false }
  ]);

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <p className="text-lg opacity-90 font-medium">Tus Puntos Acumulados</p>
          <h2 className="text-5xl font-black mt-2">⭐ {points}</h2>
          <p className="mt-4 text-sm bg-white/20 inline-block px-3 py-1 rounded-full">
            ¡Estás a 50 puntos de tu próximo regalo!
          </p>
        </div>
        <div className="hidden md:block text-8xl opacity-20">🏆</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Coupons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🎟️ Mis Cupones Disponibles
          </h3>
          <div className="space-y-4">
            {coupons.map(coupon => (
              <div key={coupon.id} className="border-2 border-dashed border-primary-200 rounded-xl p-4 bg-primary-50/30 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600">{coupon.discount}</span>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded font-bold uppercase">OFF</span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1">{coupon.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Vence: {coupon.expiry}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code);
                    toast.success('Código copiado: ' + coupon.code);
                  }}
                  className="bg-white border border-primary-600 text-primary-600 px-4 py-2 rounded-lg font-bold hover:bg-primary-600 hover:text-white transition-all text-sm"
                >
                  {coupon.code}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How to earn more */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🚀 ¿Cómo ganar más puntos?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl shrink-0">🔧</div>
              <div>
                <p className="font-bold text-gray-800">Realiza mantenimientos</p>
                <p className="text-sm text-gray-500">Gana 1 punto por cada $1.000 consumidos en servicios.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl shrink-0">🤝</div>
              <div>
                <p className="font-bold text-gray-800">Refiere a un amigo</p>
                <p className="text-sm text-gray-500">Gana 100 puntos cuando tu referido realice su primer servicio.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl shrink-0">⭐</div>
              <div>
                <p className="font-bold text-gray-800">Califica nuestro servicio</p>
                <p className="text-sm text-gray-500">Gana 20 puntos por cada reseña en Google o Facebook.</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
            Compartir mi código de referido
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
