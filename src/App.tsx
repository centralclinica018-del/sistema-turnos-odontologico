import { useState } from 'react';
import { useAgenda } from './hooks/useAgenda';
import { UI } from './theme';

// Importación de componentes modulares
import { AgendaView } from './components/AgendaView';
import { AnualView } from './components/AnualView';
import { ReportesView } from './components/ReportesView';
import { GestionView } from './components/GestionView';
import { ReporteNovedadesView } from './components/ReporteNovedadesView'; // Importamos el nuevo componente

export default function App() {
  
  // Estados para el rango de fechas de la vista de Agenda
  const [fInicio, setFInicio] = useState('2026-05-12');
  const [fFin, setFFin] = useState('2026-05-16');
  
  // Control de pestañas - Añadimos 'novedades' al tipo
  const [tab, setTab] = useState<'agenda' | 'anual' | 'historial' | 'gestion' | 'novedades'>('agenda');

  // Hook principal
  const { 
    personal, duplas, turnos, turnosAnuales, resumenHistorico,
    actualizarTurno, registrarStaff, eliminarPersonal, crearDupla,
    eliminarDupla, eliminarTurno, asignarTurnoRango, generarAñoCompleto, 
    limpiarProgramacionAnual 
  } = useAgenda(fInicio, fFin);

  // Helper para renderizar los botones del Navbar
  const navBtn = (t: typeof tab, label: string, icon: string) => (
    <button 
      onClick={() => setTab(t)} 
      style={{ 
        background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', 
        color: tab === t ? UI.primary : UI.text, fontWeight: '700',
        borderBottom: tab === t ? `3px solid ${UI.primary}` : 'none',
        transition: 'all 0.3s'
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: UI.bg, fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      
      <header style={{ 
        background: '#fff', 
        borderBottom: `2px solid ${UI.border}`, 
        padding: '10px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            width: '35px', height: '35px', background: UI.primary, borderRadius: '6px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' 
          }}>
            D
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: UI.text }}>CENTRO DENTAL</div>
        </div>
        
        <nav style={{ display: 'flex', gap: '5px' }}>
          {navBtn('agenda', 'Agenda', '📅')}
          {navBtn('anual', 'Plan Anual', '📊')}
          {navBtn('historial', 'Reportes', '📄')}
          {/* NUEVA PESTAÑA DE NOVEDADES */}
          {navBtn('novedades', 'Inasistencias', '🚨')}
          {navBtn('gestion', 'Gestión', '⚙️')}
        </nav>
      </header>

      <main style={{ padding: '30px 40px' }}>
        {/* Vista de Agenda Semanal */}
        {tab === 'agenda' && (
          <AgendaView 
            turnos={turnos} 
            personal={personal} 
            duplas={duplas} 
            fInicio={fInicio} 
            setFInicio={setFInicio} 
            fFin={fFin} 
            setFFin={setFFin}
            actualizarTurno={actualizarTurno} 
            eliminarTurno={eliminarTurno} 
            asignarTurnoRango={asignarTurnoRango}
          />
        )}

        {/* Vista de Planificación Anual */}
        {tab === 'anual' && (
          <AnualView 
            turnosAnuales={turnosAnuales} 
            duplas={duplas} 
            generarAñoCompleto={generarAñoCompleto} 
            limpiarProgramacionAnual={limpiarProgramacionAnual} 
          />
        )}

        {/* Vista de Reportes de Turnos por Profesional */}
        {tab === 'historial' && (
          <ReportesView 
            personal={personal} 
            resumenHistorico={resumenHistorico} 
          />
        )}

        {/* NUEVA VISTA: Reporte de Inasistencias y Licencias */}
        {tab === 'novedades' && (
          <ReporteNovedadesView turnos={turnos} />
        )}

        {/* Vista de Configuración de Staff y Duplas */}
        {tab === 'gestion' && (
          <GestionView 
            personal={personal} 
            duplas={duplas} 
            registrarStaff={registrarStaff} 
            eliminarPersonal={eliminarPersonal} 
            crearDupla={crearDupla} 
            eliminarDupla={eliminarDupla} 
          />
        )}
      </main>
    </div>
  );
}