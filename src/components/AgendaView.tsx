import { useState } from 'react';
import { UI, styles } from '../theme';
import type { Personal, Turno, Dupla } from '../types';

interface Props {
  turnos: Turno[];
  personal: Personal[];
  duplas: Dupla[];
  fInicio: string;
  setFInicio: (d: string) => void;
  fFin: string;
  setFFin: (d: string) => void;
  actualizarTurno: (id: string, campo: string, valor: string) => void;
  eliminarTurno: (id: string) => void;
  asignarTurnoRango: (inicio: string, fin: string, data: any) => void;
}

export const AgendaView = ({ 
  turnos, personal, duplas, fInicio, setFInicio, fFin, setFFin, 
  actualizarTurno, eliminarTurno, asignarTurnoRango 
}: Props) => {
  const [fAsig, setFAsig] = useState({ inicio: '2026-05-12', fin: '2026-05-16' });
  const [fT, setFT] = useState({ box: '1', oId: '', aId: '', tipo: 'Ordinario' as any });

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
            {personal.filter(p => p.rol === 'Odontólogo').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>

          <select style={styles.input} value={fT.aId} onChange={e => setFT({...fT, aId: e.target.value})}>
            <option value="">Asistente...</option>
            {personal.filter(p => p.rol === 'Asistente').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>

          <button onClick={() => {
            const o = personal.find(p => p.id === fT.oId);
            const a = personal.find(p => p.id === fT.aId);
            if(o && a) asignarTurnoRango(fAsig.inicio, fAsig.fin, { idOdontologo: o.id, nombreO: o.nombre, idAsistente: a.id, nombreA: a.nombre, box: fT.box, tipo: fT.tipo });
          }} style={{ ...styles.button, width: '100%' }}>CARGAR RANGO</button>
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
            {turnos.map(t => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${UI.border}`, background: t.estadoO === 'Licencia' || t.estadoA === 'Licencia' ? UI.rowLicencia : t.estadoO === 'Permiso' || t.estadoA === 'Permiso' ? UI.rowPermiso : 'none' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{t.fecha}</td>
                <td style={{ padding: '15px' }}>{t.tipo} <br/><small>Box {t.box}</small></td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{t.nombreO}</span><br/>
                      <select value={t.estadoO || 'Presente'} onChange={e => actualizarTurno(t.id, 'estadoO', e.target.value)} style={{ fontSize: '10px', border: 'none', background: 'none' }}>
                        <option value="Presente">Presente</option><option value="Licencia">Licencia</option><option value="Permiso">Permiso</option>
                      </select>
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{t.nombreA}</span><br/>
                      <select value={t.estadoA || 'Presente'} onChange={e => actualizarTurno(t.id, 'estadoA', e.target.value)} style={{ fontSize: '10px', border: 'none', background: 'none' }}>
                        <option value="Presente">Presente</option><option value="Licencia">Licencia</option><option value="Permiso">Permiso</option>
                      </select>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}><button onClick={() => eliminarTurno(t.id)} style={{ color: UI.danger, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};