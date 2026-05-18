import { useState, useMemo, useEffect } from 'react';
import type { Turno, Dupla } from '../types';

interface Props {
  turnosAnuales: Turno[];
  duplas: Dupla[];
  generarAñoCompleto: (duplas: Dupla[]) => void;
  limpiarProgramacionAnual: () => void;
  actualizarTurno: (
    id: string, 
    cambiosLimpios: Partial<Turno>, 
    metaData: { campo: 'O' | 'A'; valorAnterior: string; valorNuevo: string; fecha: string; tipo: string }
  ) => void;
  eliminarTurno: (id: string) => Promise<void> | void; // 👈 Agregada la prop del hook
}

export const AnualView = ({ turnosAnuales, duplas, generarAñoCompleto, limpiarProgramacionAnual, actualizarTurno, eliminarTurno }: Props) => {
  const [editState, setEditState] = useState<{ id: string, campo: 'O' | 'A' } | null>(null);
  const [verInforme, setVerInforme] = useState(false);

  // Estado local espejo para asegurar la reactividad síncrona de la UI
  const [turnosLocales, setTurnosLocales] = useState<Turno[]>([]);
  const [limiteRender, setLimiteRender] = useState(100);

  // Sincronizar cuando el padre cambie los datos generales
  useEffect(() => {
    if (turnosAnuales) {
      setTurnosLocales(turnosAnuales);
    }
  }, [turnosAnuales]);

  // Estados para filtros
  const [filtroProfesional, setFiltroProfesional] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // 🛠️ CORREGIDO: Separa los cambios del registro de los datos para actualizar el histórico
  const handleCambioLocal = (id: string, campo: 'O' | 'A', valorNuevo: string) => {
    // 1. Encontrar el estado exacto del turno antes del cambio
    const turnoOriginal = turnosLocales.find(t => t.id === id);
    if (!turnoOriginal) return;

    const valorAnterior = campo === 'O' ? (turnoOriginal.nombreO || '') : (turnoOriginal.nombreA || '');
    
    // Objeto limpio que va directo a actualizar la base de datos/documento del turno
    const cambiosLimpios = campo === 'O' ? { nombreO: valorNuevo } : { nombreA: valorNuevo };

    // 2. Actualización visual instantánea en la tabla local
    setTurnosLocales(prev => 
      prev.map(t => t.id === id ? { ...t, ...cambiosLimpios } : t)
    );
    
    // 3. Enviamos los cambios limpios y los metadatos necesarios para restar el viejo y sumar el nuevo en los contadores
    actualizarTurno(id, cambiosLimpios, {
      campo: campo,
      valorAnterior: valorAnterior, // El que se va (para eliminar del contador/historial)
      valorNuevo: valorNuevo,       // El que entra (para agregar al contador/historial)
      fecha: turnoOriginal.fecha || '',
      tipo: turnoOriginal.tipo || ''
    });
    
    // 4. Cerrar selector
    setEditState(null);
  };

  // Manejador local para eliminar de forma inmediata en la UI y luego en Firebase
  const handleEliminarLocal = async (id: string, fecha: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el turno del día ${fecha}?`)) return;
    
    // Optimistic UI update: removemos de inmediato de la lista visual
    setTurnosLocales(prev => prev.filter(t => t.id !== id));
    
    // Llamar al hook para borrar en Firestore
    await eliminarTurno(id);
  };

  const formatearNombreTurno = (tipo: string) => {
    const t = tipo?.toUpperCase() || '';
    if (t.includes('EXTENCION') || t.includes('EXTENSIÓN') || t.includes('URGENCIA')) {
      return 'URGENCIA';
    }
    return tipo;
  };

  const getHorario = (tipo: string) => {
    const t = tipo?.toUpperCase() || '';
    if (t.includes('ORDINARIO') || t.includes('NORMAL')) return { entrada: '08:30', salida: '18:30', color: '#3b82f6' };
    if (t.includes('URGENCIA') || t.includes('EXTENCION') || t.includes('EXTENSIÓN')) {
      return { entrada: '17:00', salida: '21:00', color: '#f59e0b' };
    }
    if (t.includes('ETICO') || t.includes('ÉTICO')) return { entrada: '08:00', salida: '13:00', color: '#ef4444' };
    if (t.includes('FIN DE SEMANA')) return { entrada: '09:00', salida: '14:00', color: '#8b5cf6' };
    return { entrada: '--:--', salida: '--:--', color: '#64748b' };
  };

  // Filtrado reactivo basado en el estado local
  const turnosFiltrados = useMemo(() => {
    return turnosLocales
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
  }, [turnosLocales, filtroProfesional, filtroTipo, fechaInicio, fechaFin]);

  useEffect(() => {
    setLimiteRender(100);
  }, [filtroProfesional, filtroTipo, fechaInicio, fechaFin]);

  const datosInformeSimplificado = useMemo(() => {
    const grupos: any = {};
    turnosFiltrados.forEach(t => {
      const pareja = `${t.nombreO || 'S/N'} & ${t.nombreA || 'S/N'}`;
      if (!grupos[pareja]) grupos[pareja] = [];
      const ultimoRango = grupos[pareja][grupos[pareja].length - 1];
      const tipoActualNormalizado = (t.tipo?.toUpperCase().includes('EXTENCION') || t.tipo?.toUpperCase().includes('EXTENSIÓN')) ? 'URGENCIA' : t.tipo;
      const ultimoTipoNormalizado = (ultimoRango?.tipo?.toUpperCase().includes('EXTENCION') || ultimoRango?.tipo?.toUpperCase().includes('EXTENSIÓN')) ? 'URGENCIA' : ultimoRango?.tipo;

      if (ultimoRango && ultimoTipoNormalizado === tipoActualNormalizado) {
        ultimoRango.fin = t.fecha;
      } else {
        grupos[pareja].push({ inicio: t.fecha, fin: t.fecha, tipo: t.tipo });
      }
    });
    return grupos;
  }, [turnosFiltrados]);

  const listaOdontologos = useMemo(() => {
    const nombres = new Set<string>();
    duplas.forEach(d => { if (d.oNombre) nombres.add(d.oNombre); });
    return Array.from(nombres).sort();
  }, [duplas]);

  const listaAsistentes = useMemo(() => {
    const nombres = new Set<string>();
    duplas.forEach(d => { if (d.aNombre) nombres.add(d.aNombre); });
    return Array.from(nombres).sort();
  }, [duplas]);

  const listaProfesionales = useMemo(() => {
    return Array.from(new Set([...listaOdontologos, ...listaAsistentes])).sort();
  }, [listaOdontologos, listaAsistentes]);

  const listaTiposDeTurno = useMemo(() => {
    const tipos = new Set<string>();
    turnosLocales.forEach(t => { if (t.tipo) tipos.add(t.tipo); });
    return Array.from(tipos).sort();
  }, [turnosLocales]);

  // Estilos UI
  const inputModernStyle = { padding: '8px 12px', fontSize: '13.5px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', outline: 'none', transition: 'all 0.2s ease', minHeight: '38px', boxSizing: 'border-box' as const };
  const cellInputStyle = { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', minHeight: '34px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' as const, transition: 'all 0.15s ease-in-out', color: '#334155' };
  const selectEditorStyle = { width: '100%', padding: '6px 12px', fontSize: '13px', borderRadius: '6px', border: `1.5px solid #3b82f6`, outline: 'none', minHeight: '34px', backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' };
  const btnEliminarStyle = { background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s ease' };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 59;
    const g = parseInt(hex.slice(3, 5), 16) || 130;
    const b = parseInt(hex.slice(5, 7), 16) || 246;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="anual-view-container">
      <style>{`
        @media print {
          *, *::before, *::after { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          nav, header, footer, aside, [role="tablist"], [class*="tabs"], [class*="nav"], [class*="menu"] { display: none !important; }
          .no-print { display: none !important; }
          .anual-view-container { border: none !important; box-shadow: none !important; background: transparent !important; margin: 0 !important; padding: 0 !important; }
          .print-scroll-expand { max-height: none !important; overflow-y: visible !important; height: auto !important; }
          .informe-card { border: 1px solid #cbd5e1 !important; box-shadow: none !important; page-break-inside: avoid; }
          body { background: #fff !important; color: #000 !important; }
        }
        .row-hover:hover { background-color: #f1f5f9 !important; }
        .cell-trigger:hover { border-color: #cbd5e1 !important; background-color: #f8fafc !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .interactive-select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .btn-delete-row:hover { background-color: #fee2e2 !important; border-color: #fca5a5 !important; transform: scale(1.03); }
      `}</style>

      {/* Cabecera */}
      <div style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#0f172a', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {verInforme ? '📋 Informe Simplificado por Periodos' : '📅 Programación Anual de Turnos'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <button onClick={() => setVerInforme(!verInforme)} style={{ padding: '8px 16px', fontSize: '13.5px', fontWeight: '600', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#334155', cursor: 'pointer' }}>
            {verInforme ? '✏️ Volver a Edición' : '📊 Generar Informe'}
          </button>
          {!verInforme && (
            <>
              <button onClick={limpiarProgramacionAnual} style={{ padding: '8px 14px', fontSize: '13.5px', fontWeight: '500', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>Limpiar Todo</button>
              <button onClick={() => generarAñoCompleto(duplas)} style={{ padding: '8px 16px', fontSize: '13.5px', fontWeight: '600', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#ffffff', cursor: 'pointer' }}>🔄 Re-Generar Distribución</button>
            </>
          )}
          {verInforme && (
            <button onClick={() => window.print()} style={{ padding: '8px 16px', fontSize: '13.5px', fontWeight: '600', borderRadius: '6px', border: 'none', background: '#10b981', color: '#ffffff', cursor: 'pointer' }}>🖨️ Imprimir PDF</button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="no-print" style={{ padding: '16px 28px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>RANGO:</span>
          <input type="date" className="interactive-select" style={inputModernStyle} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          <span style={{ color: '#cbd5e1', fontSize: '12px' }}>➔</span>
          <input type="date" className="interactive-select" style={inputModernStyle} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        <div style={{ height: '24px', width: '1px', background: '#e2e8f0' }}></div>
        <select className="interactive-select" style={{ ...inputModernStyle, flex: 1, minWidth: '180px' }} value={filtroProfesional} onChange={(e) => setFiltroProfesional(e.target.value)}>
          <option value="">🔍 Filtrar por Profesional...</option>
          {listaProfesionales.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="interactive-select" style={{ ...inputModernStyle, flex: 1, minWidth: '160px' }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">⚙️ Filtrar por Tipo de Turno...</option>
          {listaTiposDeTurno.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Cuerpo Principal */}
      <div className="print-scroll-expand" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', backgroundColor: '#ffffff' }}>
        {!verInforme ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 28px', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 2, width: '140px' }}>Fecha</th>
                <th style={{ padding: '14px 28px', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 2, width: '160px' }}>Tipo Turno / Horario</th>
                <th style={{ padding: '14px 28px', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 2 }}>Odontólogo Asignado</th>
                <th style={{ padding: '14px 28px', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 2 }}>Asistente Asignado</th>
                <th style={{ padding: '14px 28px', position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 2, width: '100px' }} className="no-print">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.slice(0, limiteRender).map((t) => {
                const horarioConfig = getHorario(t.tipo || '');
                const turnoActual = turnosLocales.find(tl => tl.id === t.id) || t;

                return (
                  <tr key={t.id} className="row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 28px', fontSize: '13.5px', color: '#334155', fontWeight: '500' }}>
                      {t.fecha}
                    </td>
                    <td style={{ padding: '14px 28px' }}>
                      <span style={{ display: 'inline-flex', flexDirection: 'column', background: hexToRgba(horarioConfig.color, 0.1), color: horarioConfig.color, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        {formatearNombreTurno(t.tipo || '')}
                        <span style={{ fontSize: '9px', fontWeight: '500', opacity: 0.85, marginTop: '1px' }}>({horarioConfig.entrada} - {horarioConfig.salida})</span>
                      </span>
                    </td>
                    
                    {/* CELDA ODONTÓLOGO */}
                    <td style={{ padding: '10px 28px', minWidth: '200px' }}>
                      {editState?.id === t.id && editState?.campo === 'O' ? (
                        <select
                          style={selectEditorStyle}
                          value={turnoActual.nombreO || ''}
                          autoFocus
                          onBlur={() => setEditState(null)}
                          onKeyDown={(e) => { if (e.key === 'Escape') setEditState(null); }}
                          onChange={(e) => handleCambioLocal(t.id, 'O', e.target.value)}
                        >
                          <option value="">--- Sin Asignación ---</option>
                          {listaOdontologos.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <div className="cell-trigger" style={cellInputStyle} onClick={() => setEditState({ id: t.id, campo: 'O' })}>
                          <span style={{ fontWeight: turnoActual.nombreO ? '600' : '400', color: turnoActual.nombreO ? '#1e293b' : '#94a3b8' }}>
                            {turnoActual.nombreO || 'Asignar profesional...'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
                        </div>
                      )}
                    </td>

                    {/* CELDA ASISTENTE */}
                    <td style={{ padding: '10px 28px', minWidth: '200px' }}>
                      {editState?.id === t.id && editState?.campo === 'A' ? (
                        <select
                          style={selectEditorStyle}
                          value={turnoActual.nombreA || ''}
                          autoFocus
                          onBlur={() => setEditState(null)}
                          onKeyDown={(e) => { if (e.key === 'Escape') setEditState(null); }}
                          onChange={(e) => handleCambioLocal(t.id, 'A', e.target.value)}
                        >
                          <option value="">--- Sin Asignación ---</option>
                          {listaAsistentes.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <div className="cell-trigger" style={cellInputStyle} onClick={() => setEditState({ id: t.id, campo: 'A' })}>
                          <span style={{ fontWeight: turnoActual.nombreA ? '600' : '400', color: turnoActual.nombreA ? '#1e293b' : '#94a3b8' }}>
                            {turnoActual.nombreA || 'Asignar asistente...'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
                        </div>
                      )}
                    </td>

                    {/* COLUMNA ACCIONES */}
                    <td style={{ padding: '10px 28px' }} className="no-print">
                      <button 
                        onClick={() => handleEliminarLocal(t.id, t.fecha)}
                        className="btn-delete-row"
                        style={btnEliminarStyle}
                        title="Eliminar este turno"
                      >
                        🗑️ Borrar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {turnosFiltrados.length > limiteRender && (
                <tr className="no-print">
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>
                    <button onClick={() => setLimiteRender(prev => prev + 100)} style={{ padding: '8px 24px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                      Cargar más turnos ({turnosFiltrados.length - limiteRender} restantes)
                    </button>
                  </td>
                </tr>
              )}

              {turnosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No se encontraron turnos con los criterios de filtrado seleccionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* ================= VISTA INFORME PERIODOS ================= */
          <div style={{ padding: '32px 28px', background: '#f8fafc' }}>
            {Object.entries(datosInformeSimplificado).map(([pareja, rangos]: any) => (
              <div key={pareja} className="informe-card" style={{ marginBottom: '28px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#f1f5f9', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>DUPLA LABORAL: {pareja.toUpperCase()}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ffffff', fontSize: '11px', fontWeight: '700', color: '#64748b', textAlign: 'left', borderBottom: '1.5px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 24px' }}>Inicio del Periodo</th>
                      <th style={{ padding: '14px 24px' }}>Término del Periodo</th>
                      <th style={{ padding: '14px 24px', width: '240px' }}>Modalidad de Turno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rangos.map((r: any, i: number) => {
                      const horarioRango = getHorario(r.tipo || '');
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 24px', fontSize: '13.5px', color: '#334155', fontWeight: '600' }}>{r.inicio}</td>
                          <td style={{ padding: '14px 24px', fontSize: '13.5px', color: '#334155', fontWeight: '600' }}>{r.fin}</td>
                          <td style={{ padding: '14px 24px' }}>
                            <span style={{ display: 'inline-block', background: hexToRgba(horarioRango.color, 0.12), color: horarioRango.color, padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                              {formatearNombreTurno(r.tipo || '')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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