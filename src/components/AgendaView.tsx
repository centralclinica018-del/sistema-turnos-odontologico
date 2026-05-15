import { useState } from 'react';
import { UI, styles } from '../theme';
import type { Personal, Turno, Dupla } from '../types';

const OPCIONES_CAMBIO = [
  "Licencia Médica",
  "Permiso Administrativo",
  "Vacaciones",
  "Falta sin aviso",
  "Permuta entre colegas",
  "Capacitación",
  "Otro..."
];

interface Props {
  turnos: any[]; 
  personal: Personal[];
  duplas: Dupla[];
  fInicio: string;
  setFInicio: (d: string) => void;
  fFin: string;
  setFFin: (d: string) => void;
  actualizarTurno: (id: string, campo: string, valor: any) => void;
  eliminarTurno: (id: string) => void;
  asignarTurnoRango: (inicio: string, fin: string, data: any) => void;
}

export const AgendaView = ({ 
  turnos, personal, duplas, fInicio, setFInicio, fFin, setFFin, 
  actualizarTurno, eliminarTurno, asignarTurnoRango 
}: Props) => {
  const [fAsig, setFAsig] = useState({ inicio: '2026-05-12', fin: '2026-05-16' });
  const [fT, setFT] = useState({ box: '1', oId: '', aId: '', tipo: 'Ordinario' as any });
  
  const [filtroO, setFiltroO] = useState('');
  const [filtroA, setFiltroA] = useState('');

  const turnosAgrupados = turnos.reduce((acc: {[key: string]: any}, t) => {
    const clave = `${t.fecha}-${t.box}`;
    acc[clave] = t; 
    return acc;
  }, {});

  const listaTurnos = Object.values(turnosAgrupados)
    .filter(t => {
      const cumpleO = filtroO === '' || String(t.idOdontologo) === String(filtroO);
      const cumpleA = filtroA === '' || String(t.idAsistente) === String(filtroA);
      return cumpleO && cumpleA;
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const manejarCambioConMotivo = (t: any, pId: string, campoId: string, campoNombre: string) => {
    const pNuevo = personal.find(pers => String(pers.id) === String(pId));
    if (!pNuevo) return;

    const idActual = String(t[campoId]);
    const nombreActual = t[campoNombre] || "Profesional";
    
    if (String(pId) === idActual) return;

    const mensajeMenu = `¿Por qué reemplaza a ${nombreActual}?\n\n` + 
                        OPCIONES_CAMBIO.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    
    const seleccion = prompt(mensajeMenu, "1");

    if (seleccion !== null) {
      const indice = parseInt(seleccion) - 1;
      let motivoFinal = OPCIONES_CAMBIO[indice] || "Sustitución";

      if (motivoFinal === "Otro...") {
        const detalle = prompt("Especifique el motivo:");
        motivoFinal = detalle || "Otro motivo";
      }

      const operador = prompt("Nombre del administrativo que autoriza el cambio:", "Admin");

      if (operador) {
        if (!t.esCambio) {
          actualizarTurno(t.id, 'nombreTitularOriginal', nombreActual);
          actualizarTurno(t.id, 'idTitularOriginal', idActual);
          actualizarTurno(t.id, 'rolTitular', campoId === 'idOdontologo' ? 'Odontólogo' : 'Asistente');
        }

        actualizarTurno(t.id, campoId, pNuevo.id);
        actualizarTurno(t.id, campoNombre, pNuevo.nombre);
        actualizarTurno(t.id, 'esCambio', true); 
        actualizarTurno(t.id, 'motivoCambio', motivoFinal);
        actualizarTurno(t.id, 'quienCambio', operador);
        actualizarTurno(t.id, 'fechaAccion', new Date().toLocaleString());
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
      <aside>
        <div style={styles.card}>
          <h4 style={{ marginTop: 0, fontSize: '14px', color: UI.primary }}>RANGO VISTA</h4>
          <input type="date" value={fInicio} onChange={e => setFInicio(e.target.value)} style={styles.input} />
          <input type="date" value={fFin} onChange={e => setFFin(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.card}>
          <h4 style={{ marginTop: 0, fontSize: '14px', color: UI.primary }}>ASIGNAR TURNOS</h4>
          <input type="date" value={fAsig.inicio} onChange={e => setFAsig({...fAsig, inicio: e.target.value})} style={styles.input} />
          <input type="date" value={fAsig.fin} onChange={e => setFAsig({...fAsig, fin: e.target.value})} style={styles.input} />
          
          <select style={styles.input} value={fT.tipo} onChange={e => setFT({...fT, tipo: e.target.value as any})}>
            <option value="Ordinario">Ordinario</option>
            <option value="Ético">Ético</option>
            <option value="Extensión">Extensión</option>
            <option value="Fin de Semana">Fin de Semana</option>
          </select>

          <select style={styles.input} value={fT.oId} onChange={e => {
            const d = duplas.find(dup => String(dup.oId) === String(e.target.value));
            setFT({...fT, oId: e.target.value, aId: d?.aId || '', box: d?.boxPreferido || '1'});
          }}>
            <option value="">Odontólogo...</option>
            {personal.filter(p => String(p.rol).toLowerCase().includes('odont')).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select style={styles.input} value={fT.aId} onChange={e => setFT({...fT, aId: e.target.value})}>
            <option value="">Asistente...</option>
            {personal.filter(p => String(p.rol).toLowerCase().includes('asist')).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <button onClick={() => {
             const o = personal.find(p => String(p.id) === String(fT.oId));
             const a = personal.find(p => String(p.id) === String(fT.aId));
             if (o && a) {
               asignarTurnoRango(fAsig.inicio, fAsig.fin, { 
                 idOdontologo: o.id, nombreO: o.nombre, idAsistente: a.id, nombreA: a.nombre, box: fT.box, tipo: fT.tipo, esCambio: false 
               });
             } else { alert("Selecciona personal"); }
          }} style={{ ...styles.button, width: '100%' }}>CARGAR RANGO</button>
        </div>
      </aside>

      <div style={{ background: UI.white, borderRadius: '8px', border: `1px solid ${UI.border}`, overflow: 'hidden' }}>
        
        <div style={{ background: '#f1f1f1', padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>FILTRAR TABLA:</span>
          
          <select 
            style={{ ...styles.input, marginBottom: 0, width: '200px', fontSize: '12px' }} 
            value={filtroO} 
            onChange={e => setFiltroO(e.target.value)}
          >
            <option value="">Todos los Odontólogos</option>
            {personal.filter(p => String(p.rol).toLowerCase().includes('odont')).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select 
            style={{ ...styles.input, marginBottom: 0, width: '200px', fontSize: '12px' }} 
            value={filtroA} 
            onChange={e => setFiltroA(e.target.value)}
          >
            <option value="">Todos los Asistentes</option>
            {personal.filter(p => String(p.rol).toLowerCase().includes('asist')).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          {(filtroO || filtroA) && (
            <button 
              onClick={() => { setFiltroO(''); setFiltroA(''); }}
              style={{ background: 'none', border: 'none', color: UI.danger, cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#ccd5ae' }}>
            <tr style={{ textAlign: 'left', fontSize: '12px' }}>
              <th style={{ padding: '15px' }}>FECHA</th>
              <th style={{ padding: '15px' }}>TURNO / BOX</th>
              <th style={{ padding: '15px' }}>PROFESIONALES</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>ACC.</th>
            </tr>
          </thead>
          <tbody>
            {listaTurnos.length > 0 ? (
              listaTurnos.map((t: any) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${UI.border}`, background: t.esCambio ? '#fff9f0' : 'none' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{t.fecha}</td>
                  <td style={{ padding: '15px' }}>
                    {t.tipo} <br/><small>Box {t.box}</small>
                    {t.esCambio && (
                      <div style={{ fontSize: '10px', color: '#d35400', marginTop: '5px', padding: '5px', border: '1px dashed #e67e22', borderRadius: '4px' }}>
                        <strong>Motivo:</strong> {t.motivoCambio} <br/>
                        <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Orig: {t.nombreTitularOriginal}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      
                      {/* SELECTOR ODONTÓLOGO REFORZADO */}
                      <select 
                        value={String(t.idOdontologo || "")} 
                        onChange={e => manejarCambioConMotivo(t, e.target.value, 'idOdontologo', 'nombreO')}
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          backgroundColor: '#fff',
                          color: UI.primary,
                          cursor: 'pointer',
                          minWidth: '140px'
                        }}
                      >
                        <option value="">Seleccionar Odont.</option>
                        {personal
                          .filter(p => String(p.rol).toLowerCase().includes('odont'))
                          .map(p => (
                            <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                          ))
                        }
                      </select>

                      {/* SELECTOR ASISTENTE REFORZADO */}
                      <select 
                        value={String(t.idAsistente || "")} 
                        onChange={e => manejarCambioConMotivo(t, e.target.value, 'idAsistente', 'nombreA')}
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold', 
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          backgroundColor: '#fff',
                          color: UI.primary,
                          cursor: 'pointer',
                          minWidth: '140px'
                        }}
                      >
                        <option value="">Seleccionar Asist.</option>
                        {personal
                          .filter(p => String(p.rol).toLowerCase().includes('asist'))
                          .map(p => (
                            <option key={p.id} value={String(p.id)}>{p.nombre}</option>
                          ))
                        }
                      </select>

                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => eliminarTurno(t.id)} style={{ color: UI.danger, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                  No se encontraron turnos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};