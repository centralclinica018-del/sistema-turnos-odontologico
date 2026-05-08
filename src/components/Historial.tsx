import type { MiembroPersonal } from '../hooks/useAgenda';

interface Props {
  personal: MiembroPersonal[];
  resumen: any;
  onEliminar: (id: string) => void;
}

export const Historial = ({ personal, resumen, onEliminar }: Props) => (
  <div style={{ padding: '40px' }}>
    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '30px' }}>Historial de Personal</h2>
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
          <tr>
            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Profesional</th>
            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Total</th>
            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personal.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '15px', fontWeight: '700' }}>{p.nombre}</td>
              <td style={{ padding: '15px', textAlign: 'center', fontWeight: '800', color: '#1e40af' }}>
                {resumen[p.id!]?.Total || 0}
              </td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <button onClick={() => onEliminar(p.id!)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);