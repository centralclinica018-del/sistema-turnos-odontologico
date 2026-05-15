import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase'; 
import { 
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc 
} from 'firebase/firestore'; 
import type { Personal, Dupla, Turno, Rol } from '../types';

export const useAgenda = (fInicio: string, fFin: string) => {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [duplas, setDuplas] = useState<Dupla[]>([]);
  const [allTurnos, setAllTurnos] = useState<Turno[]>([]);

  useEffect(() => {
    const unsubP = onSnapshot(collection(db, 'personal'), (s) => 
      setPersonal(s.docs.map(d => ({ id: d.id, ...d.data() } as Personal))));
    const unsubD = onSnapshot(collection(db, 'duplas'), (s) => 
      setDuplas(s.docs.map(d => ({ id: d.id, ...d.data() } as Dupla))));
    const unsubT = onSnapshot(collection(db, 'turnos'), (s) => 
      setAllTurnos(s.docs.map(d => ({ id: d.id, ...d.data() } as Turno))));
    return () => { unsubP(); unsubD(); unsubT(); };
  }, []);

  const vincularDatos = (lista: Turno[]) => lista.map(t => {
    // Si el turno no es del área dental, no buscamos duplas para evitar N/A innecesarios
    if (t.area !== 'DENTAL' && t.area !== undefined) return t;

    const d = duplas.find(dup => dup.oId === t.idOdontologo || dup.id === t.idOdontologo);
    return { 
      ...t, 
      nombreO: t.nombreO || d?.oNombre || 'N/A', 
      nombreA: t.nombreA || d?.aNombre || 'N/A', 
      box: t.box || d?.boxPreferido || '1' 
    };
  });

  const turnos = useMemo(() => vincularDatos(allTurnos.filter(t => t.fecha >= fInicio && t.fecha <= fFin)), [allTurnos, fInicio, fFin, duplas]);
  const turnosAnuales = useMemo(() => vincularDatos([...allTurnos].sort((a, b) => a.fecha.localeCompare(b.fecha))), [allTurnos, duplas]);

  const resumenHistorico = useMemo(() => {
    return personal.map(p => {
      const susTurnos = allTurnos.filter(t => t.idOdontologo === p.id || t.idAsistente === p.id);
      const tipos: Record<string, number> = {};
      susTurnos.forEach(t => { 
        // MEJORA: Se asegura que t.tipo no sea undefined para evitar error de índice
        const claveTipo = t.tipo || 'Ordinario';
        tipos[claveTipo] = (tipos[claveTipo] || 0) + 1; 
      });
      return { id: p.id, nombre: p.nombre, total: susTurnos.length, tipos };
    });
  }, [personal, allTurnos]);

  const asignarTurnoRango = async (inicio: string, fin: string, data: any) => {
    let actual = new Date(inicio + 'T12:00:00');
    const tope = new Date(fin + 'T12:00:00');

    while (actual <= tope) {
      const fechaStr = actual.toISOString().split('T')[0];
      await addDoc(collection(db, 'turnos'), {
        ...data,
        fecha: fechaStr,
        estadoO: data.area === 'DENTAL' ? 'Presente' : null,
        estadoA: data.area === 'DENTAL' ? 'Presente' : null
      });
      actual.setDate(actual.getDate() + 1);
    }
  };

  const generarAñoCompleto = async (listaDuplas: Dupla[]) => {
    if (listaDuplas.length === 0) return alert("Crea las duplas primero en Gestión.");
    const año = 2026;
    let fecha = new Date(año, 0, 1);
    let dIdx = 0;

    try {
      while (fecha.getFullYear() === año) {
        const dia = fecha.getDay();
        if (dia === 1 && fecha > new Date(año, 0, 1)) dIdx = (dIdx + 1) % listaDuplas.length;

        if (dia !== 0) {
          const d = listaDuplas[dIdx];
          await addDoc(collection(db, 'turnos'), {
            fecha: fecha.toISOString().split('T')[0],
            area: 'DENTAL',
            tipo: dia === 6 ? "Fin de Semana" : "Extensión",
            idOdontologo: d.oId,
            nombreO: d.oNombre,
            idAsistente: d.aId,
            nombreA: d.aNombre,
            box: d.boxPreferido || '1',
            estadoO: 'Presente',
            estadoA: 'Presente'
          });
        }
        fecha.setDate(fecha.getDate() + 1);
      }
      alert("Calendario 2026 generado.");
    } catch (e) { alert("Error: " + e); }
  };

  return {
    personal, duplas, turnos, turnosAnuales, resumenHistorico, generarAñoCompleto,
    asignarTurnoRango,
    // MEJORA: Soporta tanto strings individuales como objeto (para Servicios)
    registrarStaff: (p: any, r?: Rol) => {
      const data = typeof p === 'object' 
        ? { nombre: p.nombre, rol: p.rol, area: p.area || 'DENTAL' }
        : { nombre: p, rol: r, area: 'DENTAL' };
      return addDoc(collection(db, 'personal'), data);
    },
    eliminarPersonal: (id: string) => deleteDoc(doc(db, 'personal', id)),
    crearDupla: (oI: string, oN: string, aI: string, aN: string, b: string) => 
      addDoc(collection(db, 'duplas'), { oId: oI, oNombre: oN, aId: aI, aNombre: aN, boxPreferido: b }),
    // MEJORA: Evita error si id es undefined
    eliminarDupla: (id: string) => id && deleteDoc(doc(db, 'duplas', id)),
    // MEJORA: Soporta actualizar un campo o un objeto completo (para incidencias)
    actualizarTurno: (id: string, c: any, v?: any) => {
      if (typeof c === 'object') {
        return updateDoc(doc(db, 'turnos', id), c);
      }
      return updateDoc(doc(db, 'turnos', id), { [c]: v });
    },
    eliminarTurno: (id: string) => deleteDoc(doc(db, 'turnos', id)),
    limpiarProgramacionAnual: async () => {
      if(!confirm("¿Borrar todo?")) return;
      // MEJORA: Borrado más eficiente
      const promesas = allTurnos.map(t => deleteDoc(doc(db, 'turnos', t.id)));
      await Promise.all(promesas);
    }
  };
};