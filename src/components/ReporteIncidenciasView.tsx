import { useMemo, useState } from 'react';
import { UI, styles } from '../theme';

interface Props {
  turnos: any[]; // Se debe pasar 'turnosAnuales' desde App.tsx para que sea histórico
}

export const ReporteIncidenciasView = ({ turnos }: Props) => {
  const [filtroArea, setFiltroArea] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');

  // Lógica de filtrado histórico
  const incidencias = useMemo(() => {
    if (!turnos) return [];
    
    return turnos
      .filter(t => t.area !== 'DENTAL' && t.motivoCambio)
      .filter(t => filtroArea === 'TODAS' || t.area === filtroArea)
      .filter(t => 
        busqueda === '' || 
        t.nombreOriginal?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.nombreFuncionario?.toLowerCase().includes(busqueda.toLowerCase())
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [turnos, filtroArea, busqueda]);

  // Función para exportar los datos visibles
  const exportarCSV = () => {
    const encabezados = "Fecha,Area,Original,Reemplazo,Motivo\n";
    const filas = incidencias.map(i => 
      `${i.fecha},${i.area},${i.nombreOriginal},${i.nombreFuncionario},${i.motivoCambio}`
    ).join("\n");
    
    const blob = new Blob([encabezados + filas], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_incidencias_2026.csv`;
    a.click();
  };

  return (
    <div style={styles.card}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
        <div>
          <h2 style={{ margin: 0, color: UI.primary, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Historial Anual de Incidencias
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Resumen histórico de inasistencias y cambios (Independiente del calendario semanal)
          </p>
        </div>

        <button 
          onClick={exportarCSV}
          style={{ 
            padding: '8px 16px', background: '#27ae60', color: 'white', 
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
          }}
        >
          📥 Exportar CSV
        </button>
      </header>

      {/* Barra de Filtros Avanzada */}
      <div style={{ 
        display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', 
        background: '#f8f9fa', borderRadius: '8px', alignItems: 'center' 
      }}>
        <div style={{ flex: 1 }}>
          <input 
            type="text"
            placeholder="Buscar por nombre de funcionario..."
            style={{ ...styles.input, margin: 0, width: '100%' }}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Filtrar Área:</span>
          <select 
            style={{ ...styles.input, margin: 0, width: '160px' }}
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
          >
            <option value="TODAS">Todas</option>
            <option value="ASEO">Aseo</option>
            <option value="LABORATORIO">Laboratorio</option>
            <option value="ABASTECIMIENTO">Abastecimiento</option>
          </select>
        </div>

        <div style={{ borderLeft: `1px solid ${UI.border}`, paddingLeft: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#999', fontWeight: 'bold', textTransform: 'uppercase' }}>Resultados</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: UI.primary }}>{incidencias.length}</div>
        </div>
      </div>

      {/* Tabla con Scroll Independiente */}
      <div style={{ maxHeight: '550px', overflowY: 'auto', border: `1px solid ${UI.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#fff', fontSize: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
              <th style={{ padding: '15px', borderBottom: `2px solid ${UI.primary}`, color: UI.primary }}>FECHA</th>
              <th style={{ padding: '15px', borderBottom: `2px solid ${UI.primary}`, color: UI.primary }}>ÁREA</th>
              <th style={{ padding: '15px', borderBottom: `2px solid ${UI.primary}`, color: UI.primary }}>TITULAR ORIGINAL</th>
              <th style={{ padding: '15px', borderBottom: `2px solid ${UI.primary}`, color: UI.primary }}>REEMPLAZO</th>
              <th style={{ padding: '15px', borderBottom: `2px solid ${UI.primary}`, color: UI.primary }}>MOTIVO</th>
            </tr>
          </thead>
          <tbody>
            {incidencias.length > 0 ? incidencias.map(inc => (
              <tr key={inc.id} style={{ borderBottom: `1px solid ${UI.border}`, fontSize: '14px', transition: 'background 0.2s' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{inc.fecha}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    background: inc.area === 'ASEO' ? '#e3f2fd' : inc.area === 'LABORATORIO' ? '#f3e5f5' : '#fff3e0', 
                    color: '#333', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' 
                  }}>
                    {inc.area}
                  </span>
                </td>
                <td style={{ padding: '15px', color: UI.danger, fontWeight: '600' }}>{inc.nombreOriginal}</td>
                <td style={{ padding: '15px', color: '#2ecc71', fontWeight: '600' }}>{inc.nombreFuncionario}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ 
                    background: '#fdf2f2', color: '#c0392b', padding: '6px 12px', 
                    borderRadius: '6px', border: '1px solid #fadbd8', fontSize: '12px'
                  }}>
                    {inc.motivoCambio}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '100px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '30px' }}>🔎</div>
                  <p>No se encontraron registros históricos con esos criterios.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};