import { useState } from 'react';
import { useAgenda, type Rol, type TipoTurno } from './hooks/useAgenda';

const THEME = { header: '#0f172a', primary: '#1e40af', secondary: '#3b82f6', bg: '#f8fafc', border: '#e2e8f0', red: '#ef4444' };

export default function App() {
  const [tab, setTab] = useState<'agenda' | 'historial'>('agenda');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [semanal, setSemanal] = useState(false);
  const { personal, turnos, resumenHistorico, registrarStaff, eliminarPersonal, asignarTurno, eliminarTurno, limpiarHistorialProfesional } = useAgenda(fecha);
  
  const [fS, setFS] = useState({ nombre: '', rol: 'Odontólogo' as Rol });
  const [fT, setFT] = useState({ box: '', tipo: 'Ordinario' as TipoTurno, oId: '', aId: '' });
  const [idBorrar, setIdBorrar] = useState('');

  const inputS = { padding: '12px', borderRadius: '6px', border: `1px solid ${THEME.border}`, width: '100%', marginBottom: '10px', fontSize: '13px' };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; background: #fff; }
        .nav-btn { background: none; border: none; color: white; cursor: pointer; padding: 10px 25px; font-weight: bold; opacity: 0.6; border-bottom: 3px solid transparent; }
        .nav-btn.active { opacity: 1; border-bottom: 3px solid ${THEME.secondary}; }
        .excel-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid ${THEME.border}; }
        .excel-table th { background: ${THEME.header}; color: white; padding: 15px; font-size: 11px; text-transform: uppercase; border: 1px solid #334155; }
        .excel-table td { padding: 12px; border: 1px solid ${THEME.border}; font-size: 13px; text-align: center; }
        .btn-blue { width: 100%; padding: 12px; background: ${THEME.primary}; color: white; border: none; borderRadius: 6px; fontWeight: bold; cursor: pointer; }
      `}</style>
      
      <header style={{ background: THEME.header, padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: '800' }}>CODELCO N°1</h1>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button className={`nav-btn ${tab === 'agenda' ? 'active' : ''}`} onClick={() => setTab('agenda')}>AGENDA DIARIA</button>
          <button className={`nav-btn ${tab === 'historial' ? 'active' : ''}`} onClick={() => setTab('historial')}>HISTORIAL PROFESIONAL</button>
        </nav>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: tab === 'agenda' ? '380px 1fr' : '1fr', flex: 1 }}>
        {tab === 'agenda' && (
          <aside style={{ background: THEME.bg, padding: '25px', borderRight: `1px solid ${THEME.border}` }}>
            <section style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '10px', color: THEME.primary, fontWeight: '900', marginBottom: '15px' }}>GESTIÓN DE PERSONAL</div>
              <input style={inputS} placeholder="Nombre" value={fS.nombre} onChange={e => setFS({...fS, nombre: e.target.value})} />
              <select style={inputS} value={fS.rol} onChange={e => setFS({...fS, rol: e.target.value as Rol})}><option value="Odontólogo">Odontólogo</option><option value="Asistente">Asistente</option></select>
              <button className="btn-blue" onClick={() => { registrarStaff(fS.nombre, fS.rol); setFS({...fS, nombre: ''}); }} style={{ marginBottom: '15px' }}>Guardar</button>
              
              <select style={inputS} value={idBorrar} onChange={e => setIdBorrar(e.target.value)}>
                <option value="">Seleccionar para borrar...</option>
                {personal.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <button onClick={() => eliminarPersonal(idBorrar)} style={{ width: '100%', padding: '12px', background: 'none', border: `1px solid ${THEME.red}`, color: THEME.red, borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Eliminar Definitivamente</button>
            </section>

            <section>
              <div style={{ fontSize: '10px', color: THEME.primary, fontWeight: '900', marginBottom: '15px' }}>PROGRAMACIÓN</div>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputS} />
              <label style={{ display: 'flex', gap: '10px', background: '#e2e8f0', padding: '12px', borderRadius: '6px', marginBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                <input type="checkbox" checked={semanal} onChange={e => setSemanal(e.target.checked)} /> ASIGNAR SEMANA COMPLETA
              </label>
              <select style={inputS} value={fT.box} onChange={e => setFT({...fT, box: e.target.value})}><option value="">Box...</option>{[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Box {i+1}</option>)}</select>
              <select style={inputS} value={fT.tipo} onChange={e => setFT({...fT, tipo: e.target.value as TipoTurno})}><option value="Ordinario">Ordinario</option><option value="Extensión">Extensión</option><option value="Urgencia Sábado">Urgencia Sábado</option><option value="Turno Ético">Turno Ético</option></select>
              <select style={inputS} value={fT.oId} onChange={e => setFT({...fT, oId: e.target.value})}><option value="">Odontólogo...</option>{personal.filter(p => p.rol === 'Odontólogo').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
              <select style={inputS} value={fT.aId} onChange={e => setFT({...fT, aId: e.target.value})}><option value="">Asistente...</option>{personal.filter(p => p.rol === 'Asistente').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
              <button className="btn-blue" onClick={() => { 
                const o = personal.find(p => p.id === fT.oId); 
                const a = personal.find(p => p.id === fT.aId); 
                if(o && a && fT.box) { 
                  asignarTurno({fecha, box: fT.box, tipo: fT.tipo, idOdontologo: o.id!, nombreOdontologo: o.nombre, idAsistente: a.id!, nombreAsistente: a.nombre}, semanal); 
                  setFT({...fT, box: '', oId: '', aId: ''}); 
                } 
              }}>Confirmar Turno</button>
            </section>
          </aside>
        )}

        <main style={{ padding: '40px', overflowY: 'auto' }}>
          {tab === 'agenda' ? (
            <table className="excel-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Box</th>
                  <th>Tipo</th>
                  <th>Odontólogo</th>
                  <th>Asistente</th>
                  <th style={{ width: '80px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {turnos.sort((a,b) => Number(a.box) - Number(b.box)).map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 'bold', color: THEME.primary }}>{t.box}</td>
                    <td style={{ fontSize: '11px' }}>{t.tipo}</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{t.nombreOdontologo}</td>
                    <td style={{ textAlign: 'left' }}>{t.nombreAsistente}</td>
                    <td><button onClick={() => eliminarTurno(t.id!)} style={{ color: THEME.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="excel-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Nombre Profesional</th>
                  <th>Ord</th><th>Ext</th><th>Sáb</th><th>Ético</th>
                  <th style={{ background: THEME.primary }}>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {personal.map(p => { 
                  const h = resumenHistorico[p.id!] || { Total: 0, Ordinario: 0, Extensión: 0, "Urgencia Sábado": 0, "Turno Ético": 0 };
                  return (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'left', fontWeight: '700' }}>{p.nombre} ({p.rol[0]})</td>
                      <td>{h.Ordinario}</td><td>{h.Extensión}</td><td>{h["Urgencia Sábado"]}</td><td>{h["Turno Ético"]}</td>
                      <td style={{ fontWeight: '900', color: THEME.primary }}>{h.Total}</td>
                      <td><button onClick={() => limpiarHistorialProfesional(p.id!)} style={{ color: THEME.red, border: `1px solid ${THEME.red}`, background: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Reset</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}