import { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, where, addDoc, getDocs, writeBatch } from "firebase/firestore";

export type Rol = 'Odontólogo' | 'Asistente';
export type TipoTurno = 'Ordinario' | 'Extensión' | 'Urgencia Sábado' | 'Turno Ético';

export interface MiembroPersonal { id?: string; nombre: string; rol: Rol; }
export interface ProgramacionTurno {
  id?: string; fecha: string; tipo: TipoTurno; box: string;
  idOdontologo: string; nombreOdontologo: string;
  idAsistente: string; nombreAsistente: string;
}

export const useAgenda = (fechaSeleccionada: string) => {
  const [personal, setPersonal] = useState<MiembroPersonal[]>([]);
  const [turnos, setTurnos] = useState<ProgramacionTurno[]>([]);
  const [resumenHistorico, setResumenHistorico] = useState<any>({});

  useEffect(() => {
    const unsubP = onSnapshot(query(collection(db, "personal"), orderBy("nombre", "asc")), (snap) => {
      setPersonal(snap.docs.map(d => ({ id: d.id, ...d.data() } as MiembroPersonal)));
    });

    const unsubT = onSnapshot(query(collection(db, "turnos_programacion"), where("fecha", "==", fechaSeleccionada)), (snap) => {
      setTurnos(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramacionTurno)));
    });

    const unsubH = onSnapshot(collection(db, "turnos_programacion"), (snap) => {
      const nuevoConteo: any = {};
      snap.forEach(doc => {
        const data = doc.data();
        const tipo = data.tipo as TipoTurno;
        [data.idOdontologo, data.idAsistente].forEach(id => {
          if (id) {
            if (!nuevoConteo[id]) nuevoConteo[id] = { Total: 0, Ordinario: 0, Extensión: 0, "Urgencia Sábado": 0, "Turno Ético": 0 };
            nuevoConteo[id].Total++;
            if (nuevoConteo[id][tipo] !== undefined) nuevoConteo[id][tipo]++;
          }
        });
      });
      setResumenHistorico(nuevoConteo);
    });

    return () => { unsubP(); unsubT(); unsubH(); };
  }, [fechaSeleccionada]);

  const registrarStaff = async (nombre: string, rol: Rol) => {
    if (nombre.trim()) await addDoc(collection(db, "personal"), { nombre: nombre.trim(), rol });
  };

  const eliminarPersonal = async (id: string) => {
    if (id && window.confirm("¿Eliminar definitivamente a este profesional?")) await deleteDoc(doc(db, "personal", id));
  };

  const asignarTurno = async (data: Omit<ProgramacionTurno, 'id'>, semanal: boolean) => {
    if (!semanal) return await addDoc(collection(db, "turnos_programacion"), { ...data });
    const base = new Date(data.fecha + 'T12:00:00');
    const lunes = new Date(base);
    lunes.setDate(base.getDate() - (base.getDay() === 0 ? 6 : base.getDay() - 1));
    for (let i = 0; i < 5; i++) {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      await addDoc(collection(db, "turnos_programacion"), { ...data, fecha: dia.toISOString().split('T')[0] });
    }
  };

  const eliminarTurno = async (id: string) => await deleteDoc(doc(db, "turnos_programacion", id));

  const limpiarHistorialProfesional = async (id: string) => {
    if(!window.confirm("¿Resetear historial de este profesional?")) return;
    const batch = writeBatch(db);
    const q1 = query(collection(db, "turnos_programacion"), where("idOdontologo", "==", id));
    const q2 = query(collection(db, "turnos_programacion"), where("idAsistente", "==", id));
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    s1.forEach(d => batch.delete(d.ref));
    s2.forEach(d => batch.delete(d.ref));
    await batch.commit();
  };

  return { personal, turnos, resumenHistorico, registrarStaff, eliminarPersonal, asignarTurno, eliminarTurno, limpiarHistorialProfesional };
};