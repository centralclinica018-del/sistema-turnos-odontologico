import { UI, styles } from '../theme';
import type { Turno, Dupla } from '../types';

interface Props {
  turnosAnuales: Turno[];
  duplas: Dupla[];
  generarAñoCompleto: (duplas: Dupla[]) => void;
  limpiarProgramacionAnual: () => void;
}

export const AnualView = ({ turnosAnuales, duplas, generarAñoCompleto, limpiarProgramacionAnual }: Props) => {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: UI.text }}>Planificación Anual 2026</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={limpiarProgramacionAnual} 
            style={{ ...styles.button, background: UI.danger }}
          >
            Limpiar Registros
          </button>
          <button 
            onClick={() => generarAñoCompleto(duplas)} 
            style={styles.button}
          >
            Generar Automático
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto', border: `1px solid ${UI.border}`, borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ background: '#ccd5ae', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>FECHA</th>
              <th style={{ padding: '12px' }}>TIPO</th>
              <th style={{ padding: '12px' }}>ODONTÓLOGO</th>
              <th style={{ padding: '12px' }}>ASISTENTE</th>
            </tr>
          </thead>
          <tbody>
            {turnosAnuales.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay turnos generados. Presiona "Generar Automático".
                </td>
              </tr>
            ) : (
              turnosAnuales.map((t) => {
                // Lógica de rescate: si el turno no tiene el nombre, lo buscamos en el array de duplas por el ID
                const duplaInfo = duplas.find(d => d.oId === t.idOdontologo || d.id === t.idOdontologo);
                
                const nombreO = t.nombreO || duplaInfo?.oNombre || "No encontrado";
                const nombreA = t.nombreA || duplaInfo?.aNombre || "No encontrado";

                return (
                  <tr key={t.id} style={{ borderBottom: `1px solid ${UI.border}`, background: '#fff' }}>
                    <td style={{ padding: '12px' }}>{t.fecha}</td>
                    <td style={{ padding: '12px' }}>{t.tipo}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: UI.primary }}>
                      {nombreO}
                    </td>
                    <td style={{ padding: '12px', color: UI.text }}>
                      {nombreA}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};