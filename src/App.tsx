import { useState } from 'react';
import { useAgenda } from './hooks/useAgenda';
import { UI } from './theme';

import { AgendaView } from './components/AgendaView';
import { AnualView } from './components/AnualView';
import { ReportesView } from './components/ReportesView';
import { GestionView } from './components/GestionView';
import { ReporteNovedadesView } from './components/ReporteNovedadesView'; 

export default function App() {
  const [fInicio, setFInicio] = useState('2026-05-12');
  const [fFin, setFFin] = useState('2026-05-16');
  const [tab, setTab] = useState<'agenda' | 'anual' | 'historial' | 'gestion' | 'novedades'>('agenda');

  const { 
    personal, duplas, turnos, turnosAnuales, resumenHistorico,
    actualizarTurno, registrarStaff, eliminarPersonal, crearDupla,
    eliminarDupla, eliminarTurno, asignarTurnoRango, generarAñoCompleto, 
    limpiarProgramacionAnual 
  } = useAgenda(fInicio, fFin);

  const navBtn = (t: typeof tab, label: string, icon: string) => (
    <button 
      onClick={() => setTab(t)} 
      style={{ 
        background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', 
        color: tab === t ? UI.primary : UI.text, fontWeight: '700',
        borderBottom: tab === t ? `3px solid ${UI.primary}` : 'none',
        transition: 'all 0.3s',
        fontSize: '14px'
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: UI.bg, fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <header style={{ 
        background: '#fff', borderBottom: `2px solid ${UI.border}`, padding: '10px 40px', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', height: '32px', background: UI.primary, borderRadius: '6px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' 
          }}>S</div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: UI.text, letterSpacing: '0.5px' }}>
            CENTRO ODONTOLÓGICO SINDICATO N°1
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '5px' }}>
          {navBtn('agenda', 'Agenda', '📅')}
          {navBtn('anual', 'Plan Anual', '📊')}
          {navBtn('historial', 'Reportes', '📄')}
          {navBtn('novedades', 'Inasistencias', '🚨')}
          {navBtn('gestion', 'Gestión', '⚙️')}
        </nav>
      </header>

      <main style={{ padding: '30px 40px' }}>
        {tab === 'agenda' && (
          <AgendaView 
            turnos={turnos} personal={personal} duplas={duplas} fInicio={fInicio} 
            setFInicio={setFInicio} fFin={fFin} setFFin={setFFin}
            actualizarTurno={actualizarTurno} eliminarTurno={eliminarTurno} asignarTurnoRango={asignarTurnoRango}
          />
        )}

        {tab === 'anual' && (
          <AnualView 
            turnosAnuales={turnosAnuales} 
            duplas={duplas} 
            generarAñoCompleto={generarAñoCompleto} 
            limpiarProgramacionAnual={limpiarProgramacionAnual} 
            actualizarTurno={actualizarTurno}
            eliminarTurno={eliminarTurno} // 🛠️ CORREGIDO: Se pasa la función para que borre de verdad en el Plan Anual
          />
        )}

        {tab === 'historial' && (
          <ReportesView personal={personal} resumenHistorico={resumenHistorico} />
        )}

        {tab === 'novedades' && (
          <ReporteNovedadesView turnos={turnosAnuales} />
        )}

        {tab === 'gestion' && (
          <GestionView 
            personal={personal} duplas={duplas} registrarStaff={registrarStaff} 
            eliminarPersonal={eliminarPersonal} crearDupla={crearDupla} eliminarDupla={eliminarDupla} 
          />
        )}
      </main>
    </div>
  );
}