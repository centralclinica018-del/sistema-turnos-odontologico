import { UI, styles } from '../theme';
import type { Personal } from '../types';

interface Props {
  personal: Personal[];
  resumenHistorico: any[]; // Recibe el conteo procesado por el hook
}

export const ReportesView = ({ personal, resumenHistorico }: Props) => {
  return (
    <div style={styles.card}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: UI.text }}>
        Resumen de Turnos Realizados
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ background: '#ccd5ae' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>NOMBRE</th>
              <th style={{ padding: '12px' }}>ROL</th>
              <th style={{ padding: '12px' }}>TOTAL TURNOS</th>
              <th style={{ padding: '12px' }}>DESGLOSE POR TIPO</th>
            </tr>
          </thead>
          <tbody>
            {personal.map(p => {
              // Buscamos los datos del profesional en el resumen
              const stats = resumenHistorico.find(r => r.id === p.id) || { total: 0, tipos: {} };
              
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${UI.border}`, background: '#fff' }}>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{p.nombre}</td>
                  <td style={{ padding: '12px' }}>{p.rol}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: UI.primary, color: '#fff', padding: '2px 8px', 
                      borderRadius: '10px', fontWeight: 'bold' 
                    }}>
                      {stats.total}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '11px' }}>
                      {Object.entries(stats.tipos || {}).map(([tipo, cantidad]) => (
                        <span key={tipo} style={{ 
                          background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${UI.border}`
                        }}>
                          {tipo}: <strong>{cantidad as number}</strong>
                        </span>
                      ))}
                      {Object.keys(stats.tipos || {}).length === 0 && <span>Sin turnos registrados</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};