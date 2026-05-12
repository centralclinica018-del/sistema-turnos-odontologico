import { useState } from 'react';
// IMPORTANTE: Los dos puntos (..) son para salir de la carpeta components y buscar en src
import { UI, styles } from '../theme';
import type { Personal, Dupla, Rol } from '../types';

interface Props {
  personal: Personal[];
  duplas: Dupla[];
  registrarStaff: (nombre: string, rol: Rol) => void;
  eliminarPersonal: (id: string) => void;
  crearDupla: (oId: string, oNombre: string, aId: string, aNombre: string, box: string) => void;
  eliminarDupla: (id: string) => void;
}

export const GestionView = ({ 
  personal, 
  duplas, 
  registrarStaff, 
  eliminarPersonal, 
  crearDupla, 
  eliminarDupla 
}: Props) => {
  // CORRECCIÓN: Quitamos el tilde a 'Odontologo' para que coincida con el tipo Rol
  const [fS, setFS] = useState({ nombre: '', rol: 'Odontologo' as Rol });
  const [fD, setFD] = useState({ oId: '', aId: '', box: '' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      {/* Columna Personal */}
      <div style={styles.card}>
        <h3 style={{ color: UI.primary, marginTop: 0 }}>Personal</h3>
        <input 
          style={styles.input} 
          placeholder="Nombre" 
          value={fS.nombre} 
          onChange={e => setFS({...fS, nombre: e.target.value})} 
        />
        <select 
          style={styles.input} 
          value={fS.rol} 
          onChange={e => setFS({...fS, rol: e.target.value as Rol})}
        >
          {/* CORRECCIÓN: value="Odontologo" sin tilde */}
          <option value="Odontologo">Odontólogo</option>
          <option value="Asistente">Asistente</option>
        </select>
        <button 
          onClick={() => { 
            if(!fS.nombre) return alert("Escribe un nombre");
            registrarStaff(fS.nombre, fS.rol); 
            setFS({nombre:'', rol:'Odontologo'}); 
          }} 
          style={{ ...styles.button, width: '100%' }}
        >
          Registrar
        </button>
        <div style={{ marginTop: '20px' }}>
          {personal.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${UI.border}` }}>
              <span>{p.nombre} ({p.rol})</span>
              <button onClick={() => eliminarPersonal(p.id)} style={{ color: UI.danger, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Duplas */}
      <div style={styles.card}>
        <h3 style={{ color: UI.primary, marginTop: 0 }}>Duplas</h3>
        <select style={styles.input} value={fD.oId} onChange={e => setFD({...fD, oId: e.target.value})}>
          <option value="">Odontólogo...</option>
          {/* Aquí es donde fallaba: p.rol debe ser 'Odontologo' */}
          {personal.filter(p => p.rol === 'Odontologo').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select style={styles.input} value={fD.aId} onChange={e => setFD({...fD, aId: e.target.value})}>
          <option value="">Asistente...</option>
          {personal.filter(p => p.rol === 'Asistente').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <input style={styles.input} placeholder="Box" value={fD.box} onChange={e => setFD({...fD, box: e.target.value})} />
        <button 
          onClick={() => { 
            const o = personal.find(p => p.id === fD.oId); 
            const a = personal.find(p => p.id === fD.aId); 
            if(o && a && fD.box) { 
              crearDupla(o.id, o.nombre, a.id, a.nombre, fD.box); 
              setFD({oId:'', aId:'', box:''}); 
            } else {
              alert("Selecciona odontólogo, asistente y escribe un box");
            }
          }} 
          style={{ ...styles.button, width: '100%' }}
        >
          Vincular
        </button>
        <div style={{ marginTop: '20px' }}>
          {duplas.map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${UI.border}` }}>
              <span>{d.oNombre} + {d.aNombre} (Box {d.boxPreferido})</span>
              <button onClick={() => eliminarDupla(d.id)} style={{ color: UI.danger, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};