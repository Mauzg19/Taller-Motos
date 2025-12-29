import React, { useState, useEffect, useCallback } from 'react';

function ReportManagement({ user }) {
  const [reports, setReports] = useState({});

  const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

  const fetchReport = useCallback(async (endpoint, key) => {
    const res = await fetch(`${API_ORIGIN}/api/reports/${endpoint}`, {
      headers: { 'Authorization': localStorage.getItem('authHeader') }
    });
    if (res.ok) {
      const data = await res.json();
      setReports(prev => ({ ...prev, [key]: data }));
    }
  }, [API_ORIGIN]);

  useEffect(() => {
    if (user.role === 'ADMIN') {
      fetchReport('most-damaged-parts', 'damagedParts');
      fetchReport('revenue-by-service', 'revenue');
      fetchReport('technician-efficiency', 'efficiency');
      fetchReport('average-repair-time', 'avgTime');
    }
  }, [user, fetchReport]);

  return (
    <div>
      <h2>Reportes Inteligentes</h2>
      {user.role === 'ADMIN' && (
        <div>
          <h3>Partes Más Dañadas</h3>
          <ul>
            {reports.damagedParts && reports.damagedParts.map((item, idx) => (
              <li key={idx}>{item.part}: {item.count}</li>
            ))}
          </ul>

          <h3>Ingresos por Servicio</h3>
          <ul>
            {reports.revenue && reports.revenue.map((item, idx) => (
              <li key={idx}>{item.service}: ${item.revenue}</li>
            ))}
          </ul>

          <h3>Eficiencia de Técnicos</h3>
          <ul>
            {reports.efficiency && reports.efficiency.map((item, idx) => (
              <li key={idx}>{item.technician}: {item.efficiency}</li>
            ))}
          </ul>

          <h3>Tiempo Promedio de Reparación</h3>
          <p>{reports.avgTime && reports.avgTime.averageRepairTime} minutos</p>
        </div>
      )}
    </div>
  );
}

export default ReportManagement;
