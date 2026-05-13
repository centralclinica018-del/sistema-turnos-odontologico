import React, { useMemo } from 'react';
import { UI, styles } from '../theme';

interface Props {
  turnos: any[];
}

export const ReporteNovedadesView = ({ turnos }: Props) => {
  
  const reporteData = useMemo(() => {
    const incidencias = turnos.filter(t => t.esCambio);

    const agrupado = incidencias.reduce((acc: any, t: any) => {
      const nombreTitular = t.nombreTitularOriginal || "No especificado";
      
      if (!acc[nombreTitular]) {
        acc[nombreTitular] = {
          total: 0,
          detalle: [],
          conteoMotivos: {} as Record<string, number>
        };
      }

      // MEJORA DE PRECISIÓN: 
      // Buscamos quién es el profesional que está ocupando el turno actualmente.
      // Si el titular era Andrés y el nombre en el turno es Iván, Iván es el reemplazo.
      let nombreReemplazo = "Sin asignar";
      
      if (t.nombreO !== nombreTitular && t.idTitularOriginal === t.idOdontologo) {
        // El cambio fue en el odontólogo
        nombreReemplazo = t.nombreO;
      } else if (t.nombreA !== nombreTitular && t.idTitularOriginal === t.idAsistente) {
        // El cambio fue en el asistente
        nombreReemplazo = t.nombreA;
      } else {
        // Caso genérico: si los IDs no coinciden, buscamos al que NO sea el titular
        nombreReemplazo = t.nombreO === nombreTitular ? t.nombreA : t.nombreO;
      }

      acc[nombreTitular].total += 1;
      acc[nombreTitular].detalle.push({
        fecha: t.fecha,
        motivo: t.motivoCambio,
        reemplazo: nombreReemplazo, // Ahora reflejará a Iván Soto correctamente
        autorizadoPor: t.quienCambio,
        fechaRegistro: t.fechaAccion
      });

      const m = t.motivoCambio || "Otros";
      acc[nombreTitular].conteoMotivos[m] = (acc[nombreTitular].conteoMotivos[m] || 0) + 1;

      return acc;
    }, {});

    return Object.entries(agrupado).sort((a: any, b: any) => b[1].total - a[1].total);
  }, [turnos]);

  if (reporteData.length === 0) {
    return (
      <div style={{ ...styles.card, textAlign: 'center', padding: '50px' }}>
        <h2 style={{ color: '#ccc' }}>📊 No hay novedades registradas aún</h2>
        <p style={{ color: '#888' }}>Todos los profesionales han cumplido sus turnos titulares.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: UI.primary }}>Gestión de Asistencia e Incidencias</h2>
          <p style={{ margin: 0, color: '#666' }}>Recuento detallado de licencias, permisos y cambios de turno.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: UI.danger }}>{turnos.filter(t => t.esCambio).length}</span>
            <br />
            <small style={{ color: '#888', fontWeight: 'bold' }}>TOTAL INCIDENCIAS</small>
        </div>
      </header>

      {reporteData.map(([nombre, data]: [any, any]) => (
        <div key={nombre} style={{ ...styles.card, padding: '0', overflow: 'hidden' }}>
          
          <div style={{ background: '#f8f9fa', padding: '20px', borderBottom: `1px solid ${UI.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{nombre}</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {Object.entries(data.conteoMotivos).map(([motivo, cant]: [any, any]) => (
                  <span key={motivo} style={{ fontSize: '10px', background: '#e9ecef', padding: '2px 8px', borderRadius: '4px' }}>
                    {motivo}: {cant}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ background: UI.danger, color: 'white', padding: '10px 20px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{data.total}</span>
              <br /><small style={{ fontSize: '9px' }}>FALLAS</small>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#fff', textAlign: 'left', color: '#888', fontSize: '11px' }}>
                <th style={{ padding: '15px', borderBottom: `1px solid ${UI.border}` }}>FECHA FALLA</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${UI.border}` }}>MOTIVO</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${UI.border}` }}>REEMPLAZADO POR</th>
                <th style={{ padding: '15px', borderBottom: `1px solid ${UI.border}` }}>AUTORIZADO POR</th>
              </tr>
            </thead>
            <tbody>
              {data.detalle.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: idx !== data.detalle.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{item.fecha}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ color: '#d35400', fontWeight: 'bold' }}>{item.motivo}</span>
                  </td>
                  <td style={{ padding: '15px', color: UI.primary }}>{item.reemplazo || 'N/A'}</td>
                  <td style={{ padding: '15px' }}>
                    {item.autorizadoPor} <br />
                    <small style={{ fontSize: '10px', color: '#ccc' }}>{item.fechaRegistro}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};