import { useState } from 'react';
import { UI, styles } from '../theme';
import type { Personal, Turno, Dupla } from '../types';

// Lista de motivos estandarizados para el centro dental
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

  const turnosAgrupados = turnos.reduce((acc: {[key: string]: any}, t) => {
    const clave = `${t.fecha}-${t.box}`;
    acc[clave] = t; 
    return acc;
  }, {});
  const listaTurnos = Object.values(turnosAgrupados).sort((a, b) => a.fecha.localeCompare(b.fecha));

  const handleCargarRango = () => {
    const o = personal.find(p => p.id === fT.oId);
    const a = personal.find(p => p.id === fT.aId);

    if (o && a) {
      asignarTurnoRango(fAsig.inicio, fAsig.fin, { 
        idOdontologo: o.id, 
        nombreO: o.nombre, 
        idAsistente: a.id, 
        nombreA: a.nombre, 
        box: fT.box, 
        tipo: fT.tipo,
        esCambio: false 
      });
    } else {
      alert("Por favor selecciona Odontólogo y Asistente");
    }
  };

  const manejarCambioConMotivo = (t: any, pId: string, campoId: string, campoNombre: string) => {
    const pNuevo = personal.find(pers => pers.id === pId);
    if (!pNuevo) return;

    const idActual = campoId === 'idOdontologo' ? t.idOdontologo : t.idAsistente;
    const nombreActual = campoId === 'idOdontologo' ? t.nombreO : t.nombreA;
    
    if (pId === idActual) return;

    // 1. Motivo del cambio
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

      // 2. Registro de quién realiza la acción (Autoría)
      const operador = prompt("Nombre del administrativo que autoriza el cambio:", "Admin");

      if (operador) {
        if (!t.esCambio) {
          actualizarTurno(t.id, 'nombreTitularOriginal', nombreActual);
          actualizarTurno(t.id, 'idTitularOriginal', idActual);
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
            const d = duplas.find(dup => dup.oId === e.target.value);
            setFT({...fT, oId: e.target.value, aId: d?.aId || '', box: d?.boxPreferido || '1'});
          }}>
            <option value="">Odontólogo...</option>
            {personal.filter(p => String(p.rol).includes('Odontólogo')).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <select style={styles.input} value={fT.aId} onChange={e => setFT({...fT, aId: e.target.value})}>
            <option value="">Asistente...</option>
            {personal.filter(p => String(p.rol).includes('Asistente')).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <button onClick={handleCargarRango} style={{ ...styles.button, width: '100%' }}>CARGAR RANGO</button>
        </div>
      </aside>

      <div style={{ background: UI.white, borderRadius: '8px', border: `1px solid ${UI.border}`, overflow: 'hidden' }}>
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
            {listaTurnos.map((t: any) => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${UI.border}`, background: t.esCambio ? '#fff9f0' : 'none' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{t.fecha}</td>
                <td style={{ padding: '15px' }}>
                  {t.tipo} <br/><small>Box {t.box}</small>
                  {t.esCambio && (
                    <div style={{ fontSize: '10px', color: '#d35400', marginTop: '5px', padding: '5px', border: '1px dashed #e67e22', borderRadius: '4px' }}>
                      <strong>Motivo:</strong> {t.motivoCambio} <br/>
                      <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>Orig: {t.nombreTitularOriginal}</span> <br/>
                      <span style={{ color: '#666', fontStyle: 'italic' }}>Modificado por: {t.quienCambio}</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ borderLeft: t.esCambio ? '3px solid #e67e22' : 'none', paddingLeft: t.esCambio ? '8px' : '0' }}>
                      <select 
                        value={t.idOdontologo} 
                        onChange={e => manejarCambioConMotivo(t, e.target.value, 'idOdontologo', 'nombreO')}
                        style={{ fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: UI.primary }}
                      >
                        {personal.filter(p => String(p.rol).includes('Odontólogo')).map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ borderLeft: t.esCambio ? '3px solid #e67e22' : 'none', paddingLeft: t.esCambio ? '8px' : '0' }}>
                      <select 
                        value={t.idAsistente} 
                        onChange={e => manejarCambioConMotivo(t, e.target.value, 'idAsistente', 'nombreA')}
                        style={{ fontSize: '13px', fontWeight: 'bold', border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: UI.primary }}
                      >
                        {personal.filter(p => String(p.rol).includes('Asistente')).map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => eliminarTurno(t.id)} style={{ color: UI.danger, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};