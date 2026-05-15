import { useState, useMemo } from 'react';
import { UI, styles } from '../theme';
import type { Turno, Dupla } from '../types';

interface Props {
  turnosAnuales: Turno[];
  duplas: Dupla[];
  generarAñoCompleto: (duplas: Dupla[]) => void;
  limpiarProgramacionAnual: () => void;
  actualizarTurno: (id: string, cambios: Partial<Turno>) => void;
}

export const AnualView = ({ turnosAnuales, duplas, generarAñoCompleto, limpiarProgramacionAnual, actualizarTurno }: Props) => {
  const [editState, setEditState] = useState<{ id: string, campo: 'O' | 'A' } | null>(null);
  const [verInforme, setVerInforme] = useState(false);

  // Estados para filtros y rangos
  const [filtroProfesional, setFiltroProfesional] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const getHorario = (tipo: string) => {
    const t = tipo?.toUpperCase() || '';
    if (t.includes('ORDINARIO') || t.includes('NORMAL')) return { entrada: '08:00', salida: '17:00', color: '#4a90e2' };
    if (t.includes('EXTENCION') || t.includes('EXTENSIÓN')) return { entrada: '17:00', salida: '21:00', color: '#f5a623' };
    if (t.includes('ETICO') || t.includes('ÉTICO')) return { entrada: '08:00', salida: '13:00', color: UI.danger };
    if (t.includes('FIN DE SEMANA')) return { entrada: '09:00', salida: '14:00', color: '#7b61ff' };
    return { entrada: '--:--', salida: '--:--', color: '#999' };
  };

  // 1. LÓGICA DE FILTRADO Y AGRUPACIÓN POR RANGOS (SIMPLIFICACIÓN)
  const datosInformeSimplificado = useMemo(() => {
    const turnosBase = (turnosAnuales || [])
      .filter(t => {
        const f = new Date(t.fecha + 'T00:00:00');
        const inicio = fechaInicio ? new Date(fechaInicio + 'T00:00:00') : null;
        const fin = fechaFin ? new Date(fechaFin + 'T00:00:00') : null;
        
        const cumpleRango = (!inicio || f >= inicio) && (!fin || f <= fin);
        const cumplePro = filtroProfesional === '' || t.nombreO === filtroProfesional || t.nombreA === filtroProfesional;
        const cumpleTipo = filtroTipo === '' || t.tipo === filtroTipo;
        
        return cumpleRango && cumplePro && cumpleTipo;
      })
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const grupos: any = {};

    turnosBase.forEach(t => {
      const pareja = `${t.nombreO || 'S/N'} & ${t.nombreA || 'S/N'}`;
      if (!grupos[pareja]) grupos[pareja] = [];
      
      const ultimoRango = grupos[pareja][grupos[pareja].length - 1];

      // Si es el mismo tipo de turno consecutivo, extendemos el rango
      if (ultimoRango && ultimoRango.tipo === t.tipo) {
        ultimoRango.fin = t.fecha;
      } else {
        // Si cambia el tipo o es el primero de la dupla, creamos nueva entrada
        grupos[pareja].push({
          inicio: t.fecha,
          fin: t.fecha,
          tipo: t.tipo
        });
      }
    });

    return grupos;
  }, [turnosAnuales, filtroProfesional, filtroTipo, fechaInicio, fechaFin]);

  const listaProfesionales = useMemo(() => {
    const nombres = new Set<string>();
    duplas.forEach(d => {
      if (d.oNombre) nombres.add(d.oNombre);
      if (d.aNombre) nombres.add(d.aNombre);
    });
    return Array.from(nombres).sort();
  }, [duplas]);

  const cellInputStyle = {
    border: `1px solid ${UI.border}`,
    borderRadius: '4px',
    padding: '6px 10px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    minHeight: '32px',
    cursor: 'pointer'
  };

  return (
    <div style={{ ...styles.card, padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: `1px solid ${UI.border}` }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: UI.text }}>
            {verInforme ? '📋 Informe Simplificado por Periodos' : '📅 Programación Anual'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setVerInforme(!verInforme)} style={{ ...styles.button, background: verInforme ? '#666' : UI.primary }}>
            {verInforme ? 'Volver a Edición' : 'Generar Informe'}
          </button>
          
          {/* BOTONES DE GESTIÓN RECUPERADOS */}
          {!verInforme && (
            <>
              <button 
                onClick={limpiarProgramacionAnual} 
                style={{ ...styles.button, background: 'none', color: UI.danger, border: `1px solid ${UI.danger}`, padding: '8px 15px' }}
              >
                Limpiar Todo
              </button>
              <button 
                onClick={() => generarAñoCompleto(duplas)} 
                style={{ ...styles.button, padding: '8px 15px' }}
              >
                Re-Generar Año
              </button>
            </>
          )}

          {verInforme && <button onClick={() => window.print()} style={{ ...styles.button, background: UI.success }}>🖨️ Imprimir</button>}
        </div>
      </div>

      {/* Barra de Filtros y Rango de Fechas */}
      <div style={{ padding: '15px 25px', background: '#fcfcfc', borderBottom: `1px solid ${UI.border}`, display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>DESDE:</label>
          <input type="date" style={{ ...styles.input, margin: 0 }} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <label style={{ fontSize: '11px', fontWeight: 'bold' }}>HASTA:</label>
          <input type="date" style={{ ...styles.input, margin: 0 }} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        <select style={{ ...styles.input, margin: 0, flex: 1 }} value={filtroProfesional} onChange={(e) => setFiltroProfesional(e.target.value)}>
          <option value="">🔍 Filtrar Profesional...</option>
          {listaProfesionales.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {!verInforme ? (
          /* VISTA EDICIÓN: TABLA COMPLETA */
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px' }}>Fecha</th>
                <th style={{ padding: '12px 20px' }}>Tipo</th>
                <th style={{ padding: '12px 20px' }}>Odontólogo</th>
                <th style={{ padding: '12px 20px' }}>Asistente</th>
              </tr>
            </thead>
            <tbody>
              {(turnosAnuales || []).slice(0, 150).map((t, index) => ( 
                <tr key={t.id} style={{ borderBottom: `1px solid ${UI.border}` }}>
                  <td style={{ padding: '12px 20px', fontSize: '13px' }}>{t.fecha}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ background: getHorario(t.tipo).color, color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px' }}>{t.tipo}</span>
                  </td>
                  <td style={{ padding: '10px 20px' }} onClick={() => setEditState({ id: t.id, campo: 'O' })}>
                    <div style={cellInputStyle}><strong>{t.nombreO || '---'}</strong> ▼</div>
                  </td>
                  <td style={{ padding: '10px 20px' }} onClick={() => setEditState({ id: t.id, campo: 'A' })}>
                    <div style={cellInputStyle}>{t.nombreA || '---'} ▼</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* VISTA INFORME: RANGOS SIMPLIFICADOS */
          <div style={{ padding: '25px' }}>
            {Object.entries(datosInformeSimplificado).map(([pareja, rangos]: any) => (
              <div key={pareja} style={{ marginBottom: '30px', border: `1px solid ${UI.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#f1f5f9', padding: '12px 20px', fontWeight: 'bold' }}>DUPLA: {pareja.toUpperCase()}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fff', fontSize: '11px', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '10px 20px' }}>INICIO PERIODO</th>
                      <th style={{ padding: '10px 20px' }}>TÉRMINO PERIODO</th>
                      <th style={{ padding: '10px 20px' }}>TIPO DE TURNO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangos.map((r: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '12px 20px', fontSize: '14px' }}>{r.inicio}</td>
                        <td style={{ padding: '12px 20px', fontSize: '14px' }}>{r.fin}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <b style={{ color: getHorario(r.tipo).color }}>{r.tipo}</b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};