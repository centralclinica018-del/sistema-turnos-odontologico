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
  area: string;
  // Propiedades Dentales (opcionales para servicios)
  nombreO?: string;
  nombreA?: string;
  box?: string;
  tipo?: string; 
  idOdontologo?: string;
  idAsistente?: string;
  // Propiedades de Servicios (opcionales para dental)
  nombreFuncionario?: string;
  motivoCambio?: string;
  nombreOriginal?: string;
}