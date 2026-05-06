import { useEffect, useState } from 'react';
import { db } from './firebase/config'; // Solo importamos la base de datos
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

// 1. LOS TIPOS AQUÍ MISMO (Sin export, sin archivos externos)
type Rol = 'Odontólogo' | 'Asistente' | 'Aseo' | 'Guardia';

interface MiembroPersonal {
  id?: string;
  nombre: string;
  rol: Rol;
  turnosAcumulados: number;
}

function App() {
  const [personal, setPersonal] = useState<MiembroPersonal[]>([]);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<Rol>('Odontólogo');

  // 2. LA LÓGICA AQUÍ MISMO
  useEffect(() => {
    const q = query(collection(db, "personal"), orderBy("nombre", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MiembroPersonal));
      setPersonal(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      await addDoc(collection(db, "personal"), {
        nombre: nombre.trim(),
        rol,
        turnosAcumulados: 0
      });
      setNombre('');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>Programación Centro Odontológico</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Nombre del profesional" 
          style={{ padding: '8px', borderRadius: '4px', border: 'none' }} 
        />
        <select 
          value={rol} 
          onChange={(e) => setRol(e.target.value as Rol)} 
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="Odontólogo">Odontólogo</option>
          <option value="Asistente">Asistente</option>
          <option value="Aseo">Aseo</option>
          <option value="Guardia">Guardia</option>
        </select>
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Agregar
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
        {personal.map(p => (
          <div key={p.id} style={{ padding: '15px', backgroundColor: '#333', borderRadius: '8px', border: '1px solid #444' }}>
            <strong style={{ display: 'block', fontSize: '1.1em' }}>{p.nombre}</strong>
            <small style={{ color: '#aaa' }}>{p.rol}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;