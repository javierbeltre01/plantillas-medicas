import { useState } from 'react';
import { supabase } from '../supabaseClient';

const EditorPlantillas = ({ plantilla, alCerrar, alGuardar }) => {
  const [contenido, setContenido] = useState(plantilla.contenido);
  const [cargando, setCargando] = useState(false);

  const guardarCambios = async () => {
    setCargando(true);
    
    // Aquí usamos 'plantillas' entre comillas porque es el nombre de la tabla
    const { error } = await supabase
      .from('plantillas') 
      .update({ contenido: contenido })
      .eq('id', plantilla.id);

    if (error) {
      alert("Error al actualizar la plantilla: " + error.message);
    } else {
      alert("¡Plantilla actualizada correctamente!");
      alGuardar(); 
      alCerrar();  
    }
    setCargando(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#333' }}>
      <h3 style={{ marginTop: 0 }}>Editando: {plantilla.titulo}</h3>
      <textarea
        style={{ width: '100%', minHeight: '300px', padding: '10px', fontSize: '14px', fontFamily: 'monospace' }}
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
      />
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={guardarCambios} 
          disabled={cargando} 
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {cargando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button 
          onClick={alCerrar} 
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditorPlantillas;