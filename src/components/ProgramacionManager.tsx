import { useState, useMemo } from 'react';
import { UI, styles } from '../theme';
import type { Turno, Dupla } from '../types';

// --- SUB-COMPONENTE: INFORME SEMANAL PARA IMPRIMIR ---
const InformeSemanalView = ({ turnosAnuales }: { turnosAnuales: Turno[] }) => {
  const infoSemanal = useMemo(() => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    const turnosDeLaSemana = (turnosAnuales || []).filter(t => {
      const fechaT = new Date(t.fecha);
      return fechaT >= inicioSemana && fechaT <= finSemana;
    });

    const grupos = turnosDeLaSemana.reduce((acc: any, t) => {
      const llaveDupla = `${t.nombreO || '---'} / ${t.nombreA || '---'}`;
      if (!acc[llaveDupla]) acc[llaveDupla] = [];
      acc[llaveDupla].push(t);
      return acc;
    }, {});

    return { 
      rango: `${inicioSemana.toLocaleDateString()} al ${finSemana.toLocaleDateString()}`, 
      grupos 
    };
  }, [turnosAnuales]);

  const getDetalleTurno = (tipo: string) => {
    const t = tipo?.toUpperCase();
    if (t.includes('ORDINARIO') || t.includes('NORMAL')) return { entrada: '08:00', salida: '17:00', color: '#4a90e2' };
    if (t.includes('EXTENCION')) return { entrada: '17:00', salida: '21:00', color: '#f5a623' };
    if (t.includes('ETICO')) return { entrada: '08:00', salida: '13:00', color: UI.danger };
    if (t.includes('FIN DE SEMANA')) return { entrada: '09:00', salida: '14:00', color: '#7b61ff' };
    return { entrada: '--:--', salida: '--:--', color: '#999' };
  };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', border: `1px solid ${UI.border}` }}>
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: `2px solid ${UI.primary}`, paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, color: UI.text }}>INFORME SEMANAL DE ENTURNO</h2>
        <p style={{ color: '#666' }}>Semana: <strong>{infoSemanal.rango}</strong></p>
      </div>

      {Object.entries(infoSemanal.grupos).map(([pareja, turnos]: any) => (
        <div key={pareja} style={{ marginBottom: '25px', border: `1px solid ${UI.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: '#f8f9fa', padding: '10px 15px', fontWeight: '800', borderBottom: `1px solid ${UI.border}` }}>
            PROFESIONALES: {pareja}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#fafafa', fontSize: '11px', color: '#888' }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left' }}>DÍA / FECHA</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>TIPO</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>INICIO</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>TÉRMINO</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t: Turno) => {
                const det = getDetalleTurno(t.tipo);
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 10px', fontSize: '13px' }}>
                      {new Date(t.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: det.color, color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{t.tipo}</span>
                    </td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{det.entrada}</td>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{det.salida}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={() => window.print()} style={{ ...styles.button, width: '100%', height: '50px', fontSize: '16px' }}>🖨️ IMPRIMIR REPORTE SEMANAL</button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: PROGRAMACION MANAGER ---
export const ProgramacionManager = ({ turnosAnuales, duplas, generarAñoCompleto, limpiarProgramacionAnual, actualizarTurno }: any) => {
  const [tab, setTab] = useState<'EDICION' | 'INFORME'>('EDICION');
  const [filtroProfesional, setFiltroProfesional] = useState('');
  const [editState, setEditState] = useState<{ id: string, campo: 'O' | 'A' } | null>(null);

  // Lista de profesionales para el buscador simple
  const listaProfesionales = useMemo(() => {
    const nombres = new Set<string>();
    duplas.forEach((d: any) => { if (d.oNombre) nombres.add(d.oNombre); if (d.aNombre) nombres.add(d.aNombre); });
    return Array.from(nombres).sort();
  }, [duplas]);

  const turnosFiltrados = useMemo(() => {
    return (turnosAnuales || []).filter((t: Turno) => 
      filtroProfesional === '' || t.nombreO === filtroProfesional || t.nombreA === filtroProfesional
    );
  }, [turnosAnuales, filtroProfesional]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      {/* PESTAÑAS SUPERIORES */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: `2px solid ${UI.border}` }}>
        <button 
          onClick={() => setTab('EDICION')} 
          style={{ flex: 1, padding: '15px', border: 'none', cursor: 'pointer', background: tab === 'EDICION' ? '#fff' : 'transparent', borderBottom: tab === 'EDICION' ? `4px solid ${UI.primary}` : '4px solid transparent', fontWeight: 'bold', color: tab === 'EDICION' ? UI.primary : '#888' }}
        >
          ⚙️ GESTIÓN Y EDICIÓN ANUAL
        </button>
        <button 
          onClick={() => setTab('INFORME')} 
          style={{ flex: 1, padding: '15px', border: 'none', cursor: 'pointer', background: tab === 'INFORME' ? '#fff' : 'transparent', borderBottom: tab === 'INFORME' ? `4px solid ${UI.primary}` : '4px solid transparent', fontWeight: 'bold', color: tab === 'INFORME' ? UI.primary : '#888' }}
        >
          📋 INFORME PARA PERSONAL
        </button>
      </div>

      {tab === 'EDICION' ? (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Control de Turnos</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                style={{ ...styles.input, margin: 0, width: '250px', border: `2px solid ${UI.primary}` }}
                value={filtroProfesional}
                onChange={(e) => setFiltroProfesional(e.target.value)}
              >
                <option value="">🔍 Seleccionar Profesional...</option>
                {listaProfesionales.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button onClick={() => generarAñoCompleto(duplas)} style={styles.button}>Re-Generar Año</button>
            </div>
          </div>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto', border: `1px solid ${UI.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f4f4f4', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left' }}>FECHA</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>TURNO</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ODONTÓLOGO</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ASISTENTE</th>
                </tr>
              </thead>
              <tbody>
                {turnosFiltrados.map((t: Turno) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontSize: '13px' }}>{t.fecha}</td>
                    <td style={{ padding: '10px' }}><span style={{ fontSize: '10px', fontWeight: 'bold' }}>{t.tipo}</span></td>
                    {/* Celda Editable Odontólogo */}
                    <td style={{ padding: '10px' }} onClick={() => setEditState({ id: t.id, campo: 'O' })}>
                      {editState?.id === t.id && editState?.campo === 'O' ? (
                        <select autoFocus onBlur={() => setEditState(null)} style={{ width: '100%' }} onChange={(e) => {
                          const s = duplas.find((d:any) => d.oId === e.target.value);
                          if(s) actualizarTurno(t.id, { nombreO: s.oNombre, idOdontologo: s.oId });
                          setEditState(null);
                        }}>
                          {Array.from(new Set(duplas.map((d:any)=>d.oId))).map((id:any)=><option key={id} value={id}>{duplas.find((dup:any)=>dup.oId===id)?.oNombre}</option>)}
                        </select>
                      ) : <div style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '4px' }}>{t.nombreO} ▼</div>}
                    </td>
                    {/* Celda Editable Asistente */}
                    <td style={{ padding: '10px' }} onClick={() => setEditState({ id: t.id, campo: 'A' })}>
                      {editState?.id === t.id && editState?.campo === 'A' ? (
                        <select autoFocus onBlur={() => setEditState(null)} style={{ width: '100%' }} onChange={(e) => {
                          const s = duplas.find((d:any) => d.aId === e.target.value);
                          if(s) actualizarTurno(t.id, { nombreA: s.aNombre });
                          setEditState(null);
                        }}>
                          {Array.from(new Set(duplas.map((d:any)=>d.aId))).map((id:any)=><option key={id} value={id}>{duplas.find((dup:any)=>dup.aId===id)?.aNombre}</option>)}
                        </select>
                      ) : <div style={{ border: '1px solid #ddd', padding: '5px', borderRadius: '4px' }}>{t.nombreA} ▼</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <InformeSemanalView turnosAnuales={turnosAnuales} />
      )}
    </div>
  );
};