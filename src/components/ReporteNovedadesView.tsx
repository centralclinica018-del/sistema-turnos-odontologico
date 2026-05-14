import React, { useMemo, useState } from 'react';
import { UI, styles } from '../theme';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Props {
  turnos: any[];
}

const MESES = [
  { val: "01", nombre: "Enero" }, { val: "02", nombre: "Febrero" },
  { val: "03", nombre: "Marzo" }, { val: "04", nombre: "Abril" },
  { val: "05", nombre: "Mayo" }, { val: "06", nombre: "Junio" },
  { val: "07", nombre: "Julio" }, { val: "08", nombre: "Agosto" },
  { val: "09", nombre: "Septiembre" }, { val: "10", nombre: "Octubre" },
  { val: "11", nombre: "Noviembre" }, { val: "12", nombre: "Diciembre" }
];

export const ReporteNovedadesView = ({ turnos }: Props) => {
  const [busqueda, setBusqueda] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');
  const [anioFiltro, setAnioFiltro] = useState('2026');

  const listaFuncionarios = useMemo(() => {
    const nombres = turnos
      .filter(t => t.esCambio === true || t.esCambio === 'true')
      .map(t => t.nombreTitularOriginal)
      .filter((n): n is string => !!n);
    return Array.from(new Set(nombres)).sort();
  }, [turnos]);

  const reporteData = useMemo(() => {
    const incidencias = turnos.filter(t => t.esCambio === true || t.esCambio === 'true');
    const agrupado = incidencias.reduce((acc: any, t: any) => {
      const nombreTitular = t.nombreTitularOriginal || "No especificado";
      const [anio, mes] = t.fecha.split('-'); 

      if ((busqueda && nombreTitular !== busqueda) || (mesFiltro && mes !== mesFiltro) || (anioFiltro && anio !== anioFiltro)) {
        return acc;
      }

      if (!acc[nombreTitular]) {
        acc[nombreTitular] = { total: 0, detalle: [], conteoMotivos: {} as Record<string, number> };
      }

      let nombreReemplazo = t.rolTitular === 'Asistente' ? t.nombreA : (t.rolTitular === 'Odontólogo' ? t.nombreO : (t.nombreO === nombreTitular ? t.nombreA : t.nombreO));

      acc[nombreTitular].total += 1;
      acc[nombreTitular].detalle.push({
        fecha: t.fecha,
        motivo: t.motivoCambio,
        reemplazo: nombreReemplazo, 
        autorizadoPor: t.quienCambio,
        fechaRegistro: t.fechaAccion
      });

      const m = t.motivoCambio || "Otros";
      acc[nombreTitular].conteoMotivos[m] = (acc[nombreTitular].conteoMotivos[m] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(agrupado).sort((a: any, b: any) => b[1].total - a[1].total);
  }, [turnos, busqueda, mesFiltro, anioFiltro]);

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Novedades');

    worksheet.mergeCells('A1:F1');
    const title = worksheet.getCell('A1');
    title.value = 'REPORTE DE ASISTENCIA E INCIDENCIAS';
    title.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1F4E78' } };

    const headerRow = worksheet.getRow(4);
    headerRow.values = ['FECHA', 'FUNCIONARIO', 'MOTIVO', 'REEMPLAZADO POR', 'AUTORIZADO POR', 'REGISTRO'];
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center' };
    });

    reporteData.forEach(([nombre, data]: any) => {
      data.detalle.forEach((det: any) => {
        worksheet.addRow([det.fecha, nombre, det.motivo, det.reemplazo, det.autorizadoPor, det.fechaRegistro]);
      });
    });

    worksheet.columns.forEach(col => col.width = 22);
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Dental_Pro.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: UI.primary }}>Gestión de Asistencia e Incidencias</h2>
          <p style={{ margin: 0, color: '#666' }}>Historial de reemplazos y novedades.</p>
        </div>
        
        {/* --- AQUÍ ESTÁ EL BOTÓN QUE BUSCAS --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
                onClick={exportarExcel}
                style={{ 
                    background: '#217346', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 25px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                📊 EXPORTAR A EXCEL
            </button>
            
            <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: UI.danger }}>
                  {reporteData.reduce((sum, [_, data]: [any, any]) => sum + data.total, 0)}
                </span>
                <br /><small style={{ color: '#888', fontWeight: 'bold' }}>TOTAL</small>
            </div>
        </div>
      </header>

      {/* BARRA DE FILTROS */}
      <div style={{ ...styles.card, padding: '15px', background: '#f1f1f1', display: 'flex', gap: '10px' }}>
        <select value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 2 }}>
          <option value="">-- Seleccionar Funcionario --</option>
          {listaFuncionarios.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} style={{ ...styles.input, marginBottom: 0, flex: 1 }}>
          <option value="">Todos los Meses</option>
          {MESES.map(m => <option key={m.val} value={m.val}>{m.nombre}</option>)}
        </select>

        {(busqueda || mesFiltro) && (
          <button 
            onClick={() => { setBusqueda(''); setMesFiltro(''); }}
            style={{ background: UI.danger, color: 'white', border: 'none', padding: '0 15px', borderRadius: '5px', cursor: 'pointer' }}
          >
            X
          </button>
        )}
      </div>

      {/* CUERPO DEL REPORTE */}
      {reporteData.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '50px', color: '#bbb' }}>
          <h3>No hay datos para mostrar</h3>
        </div>
      ) : (
        reporteData.map(([nombre, data]: [any, any]) => (
          <div key={nombre} style={{ ...styles.card, padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ background: '#f8f9fa', padding: '20px', borderBottom: `1px solid ${UI.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{nombre}</h3>
              <div style={{ background: UI.danger, color: 'white', padding: '5px 15px', borderRadius: '5px' }}>
                {data.total} FALLAS
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', background: '#fafafa', fontSize: '12px', color: '#777' }}>
                        <th style={{ padding: '12px 20px' }}>FECHA</th>
                        <th style={{ padding: '12px 20px' }}>MOTIVO</th>
                        <th style={{ padding: '12px 20px' }}>REEMPLAZO</th>
                    </tr>
                </thead>
                <tbody>
                    {data.detalle.map((item: any, idx: number) => (
                        <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                            <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{item.fecha}</td>
                            <td style={{ padding: '12px 20px', color: '#d35400' }}>{item.motivo}</td>
                            <td style={{ padding: '12px 20px', color: UI.primary }}>{item.reemplazo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};