import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

// Configuración directa de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyAXlPrZiATHuszcdL3hrQwyRvd4SIHBnXA",
  authDomain: "inventario-pro-86a3b.firebaseapp.com",
  projectId: "inventario-pro-86a3b",
  storageBucket: "inventario-pro-86a3b.firebasestorage.app",
  messagingSenderId: "1007545365827",
  appId: "1:1007545365827:web:646b555a68cfa331d1abf6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Definimos los tipos aquí mismo para matar el error de exportación
export type Rol = 'Odontólogo' | 'Asistente' | 'Aseo' | 'Guardia';
export interface MiembroPersonal {
  id?: string;
  nombre: string;
  rol: Rol;
  turnosAcumulados: number;
}

const personalRef = collection(db, "personal");

export const agregarPersonal = async (persona: Omit<MiembroPersonal, 'id'>) => {
  await addDoc(personalRef, persona);
};

export const suscribirPersonal = (callback: (data: MiembroPersonal[]) => void) => {
  // Mantenemos el orden alfabético que pediste
  const q = query(personalRef, orderBy("nombre", "asc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MiembroPersonal));
    callback(data);
  });
};