export type Rol = 'Odontologo' | 'Asistente';

export interface Personal {
  id: string;
  nombre: string;
  rol: Rol;
}

export interface Dupla {
  id: string;
  oId: string;
  oNombre: string;
  aId: string;
  aNombre: string;
  boxPreferido: string;
}

export interface Turno {
  id: string;
  fecha: string;
  tipo: string;
  idOdontologo: string;
  nombreO: string;
  idAsistente: string;
  nombreA: string;
  box: string;
  estadoO: string;
  estadoA: string;
}