import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit3, X, Bold, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, List, Type, MoveVertical, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://yiujdwitgkzttzsvxvtg.supabase.co', 'sb_publishable_eOsYC8MnLYZtRjp-3_NlPQ_n76Dncix');

export default function App() {
  const [plantillas, setPlantillas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentP, setCurrentP] = useState({ id: null, titulo: '', contenido: '' });
  const [mobileTab, setMobileTab] = useState('biblioteca'); 
  const [paciente, setPaciente] = useState('');
  const [fecha, setFecha] = useState(new Date().toLocaleDateString('es-DO'));
  
  // VARIABLES DE FORMATO
  const [fontSize, setFontSize] = useState('12pt');
  const [lineHeight, setLineHeight] = useState('1.5');
  
  // ESTADO PARA EL LOGO
  const [logo, setLogo] = useState(localStorage.getItem('clinica_logo') || '');

  // DATOS DEL MÉDICO (Recupera de memoria o usa por defecto)
  const [docNom, setDocNom] = useState(localStorage.getItem('doc_nombre') || 'DRA. LEYDI NOVAS FELIZ');
  const [docEsp, setDocEsp] = useState(localStorage.getItem('doc_esp') || 'MÉDICO SONOGRAFISTA VASCULAR');
  const [docExq, setDocExq] = useState(localStorage.getItem('doc_exq') || '421-11');

  const editorRef = useRef(null);
  const modalEditorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPlantillas();
    if (editorRef.current) {
      const saved = localStorage.getItem('reporte_pro');
      if (saved) editorRef.current.innerHTML = saved;
    }
  }, []);

  async function fetchPlantillas() {
    const { data } = await supabase.from('plantillas').select('*').order('titulo');
    setPlantillas(data || []);
  }

  // FUNCIÓN PARA CAMBIAR EL LOGO
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLogo(base64String);
        localStorage.setItem('clinica_logo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarPlantilla = async () => {
    if (!currentP.titulo || !modalEditorRef.current.innerHTML) return alert("Llena el título y el contenido");
    const datos = { titulo: currentP.titulo, contenido: modalEditorRef.current.innerHTML, categoria: 'General' };
    if (isEditing) await supabase.from('plantillas').update(datos).eq('id', currentP.id);
    else await supabase.from('plantillas').insert([datos]);
    setShowForm(false); fetchPlantillas();
  };

  const eliminarPlantilla = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta plantilla?")) {
      await supabase.from('plantillas').delete().eq('id', id);
      fetchPlantillas();
    }
  };

  const execFormat = (e, cmd, val = null) => { 
    e.preventDefault(); 
    document.execCommand(cmd, false, val); 
  };

  const filtered = plantillas.filter(p => (p?.titulo||'').toLowerCase().includes(busqueda.toLowerCase()));
  const isPC = window.innerWidth >= 800;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', backgroundColor: '#f0f4f8', padding: '15px', boxSizing: 'border-box' }}>
      
      {/* INTERFAZ DE USUARIO */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        
        {!isPC && (
          <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '12px', padding: '5px', marginBottom: '10px', shrink: 0 }}>
            <button onClick={() => setMobileTab('biblioteca')} style={{ flex: 1, padding: '10px', fontWeight: 'bold', borderRadius: '8px', border: 'none', backgroundColor: mobileTab === 'biblioteca' ? '#16a34a' : 'transparent', color: mobileTab === 'biblioteca' ? 'white' : '#64748b' }}>Biblioteca</button>
            <button onClick={() => setMobileTab('editor')} style={{ flex: 1, padding: '10px', fontWeight: 'bold', borderRadius: '8px', border: 'none', backgroundColor: mobileTab === 'editor' ? '#16a34a' : 'transparent', color: mobileTab === 'editor' ? 'white' : '#64748b' }}>Editor</button>
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, gap: '20px', overflow: 'hidden' }}>
          
          {/* PANEL IZQUIERDO: BIBLIOTECA */}
          <div style={{ display: (isPC || mobileTab === 'biblioteca') ? 'flex' : 'none', flexDirection: 'column', flex: 1, gap: '15px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', shrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>PLANTILLAS PRO</h1>
                
                {/* BOTONES: LOGO Y NUEVA PLANTILLA */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="file" ref={fileInputRef} onChange={handleLogoChange} style={{ display: 'none' }} accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: logo ? '#f0fdf4' : '#f8fafc', border: `1px solid ${logo ? '#16a34a' : '#cbd5e1'}`, borderRadius: '10px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', color: logo ? '#16a34a' : '#64748b' }}>
                    <ImageIcon size={14} /> {logo ? 'CAMBIAR LOGO' : 'SUBIR LOGO'}
                  </button>
                  <button onClick={() => {setIsEditing(false); setCurrentP({id:null, titulo:''}); setShowForm(true); setTimeout(()=>modalEditorRef.current.innerHTML='',50);}} style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>+ NUEVA</button>
                </div>
              </div>
              <input style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none' }} placeholder="Buscar estudio..." onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            
            <div className="pc-col-grid" style={{ display: 'grid', gridTemplateColumns: isPC ? 'repeat(2, 1fr)' : '1fr', gap: '12px', overflowY: 'auto', paddingRight: '5px' }}>
              {filtered.map(p => (
                <div key={p.id} className="plantilla-card group" style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative', height: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="action-buttons" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', backgroundColor: 'white', padding: '3px', borderRadius: '8px' }}>
                    <button onClick={() => {setIsEditing(true); setCurrentP(p); setShowForm(true); setTimeout(()=>modalEditorRef.current.innerHTML=p.contenido,50)}} style={{ color: '#cbd5e1', border: 'none', background: 'none', cursor: 'pointer' }}><Edit3 size={16}/></button>
                    <button onClick={() => eliminarPlantilla(p.id)} style={{ color: '#cbd5e1', border: 'none', background: 'none', cursor: 'pointer' }} className="hover-red"><Trash2 size={16}/></button>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', paddingRight: '40px' }}>{p.titulo}</h3>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: p.contenido }} />
                  </div>
                  <button onClick={() => {editorRef.current.innerHTML += p.contenido; if(!isPC) setMobileTab('editor');}} style={{ width:'100%', padding: '8px', fontSize: '9px', fontWeight: 'bold', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>AGREGAR AL REPORTE</button>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DERECHO: EDITOR */}
          <div style={{ display: (isPC || mobileTab === 'editor') ? 'flex' : 'none', flexDirection: 'column', width: isPC ? '500px' : '100%', backgroundColor: 'white', borderRadius: '30px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            
            <div style={{ padding: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <input style={{ flex: 1, padding: '10px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} placeholder="PACIENTE" value={paciente} onChange={e=>setPaciente(e.target.value)}/>
              <input style={{ width: '110px', padding: '10px', backgroundColor: '#f8fafc', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }} value={fecha} onChange={e=>setFecha(e.target.value)}/>
            </div>

            {/* BARRA EDITOR PRINCIPAL COMPLETA */}
            <div style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <button onMouseDown={e=>execFormat(e,'bold')} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
              <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>
              <button onMouseDown={e=>execFormat(e,'justifyLeft')} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignLeft size={16}/></button>
              <button onMouseDown={e=>execFormat(e,'justifyCenter')} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignCenter size={16}/></button>
              <button onMouseDown={e=>execFormat(e,'justifyRight')} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignRight size={16}/></button>
              <button onMouseDown={e=>execFormat(e,'justifyFull')} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignJustify size={16}/></button>
              <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 2px' }}></div>
              <button onMouseDown={e=>execFormat(e,'insertUnorderedList')} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><List size={16}/></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '5px' }}>
                <Type size={14} color="#64748b"/>
                <select value={fontSize} onChange={e=>setFontSize(e.target.value)} style={{ fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}><option value="10pt">10pt</option><option value="12pt">12pt</option><option value="14pt">14pt</option></select>
                <MoveVertical size={14} color="#64748b" style={{ marginLeft: '5px' }}/>
                <select value={lineHeight} onChange={e=>setLineHeight(e.target.value)} style={{ fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}><option value="1">1.0</option><option value="1.5">1.5</option><option value="2">2.0</option></select>
              </div>
            </div>

            {/* ÁREA DE TEXTO */}
            <div ref={editorRef} contentEditable style={{ flex: 1, padding: '30px', outline: 'none', overflowY: 'auto', fontFamily: "'Times New Roman', serif", fontSize: fontSize, lineHeight: lineHeight, textAlign:"justify" }} onInput={e=>localStorage.setItem('reporte_pro', e.currentTarget.innerHTML)}></div>
            
            {/* DATOS DEL MÉDICO Y BOTÓN PDF */}
            <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ padding: '15px 20px 5px 20px', display: 'flex', gap: '10px' }}>
                <input style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }} placeholder="NOMBRE DEL MÉDICO" value={docNom} onChange={e=>{setDocNom(e.target.value); localStorage.setItem('doc_nombre', e.target.value)}}/>
                <input style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }} placeholder="ESPECIALIDAD" value={docEsp} onChange={e=>{setDocEsp(e.target.value); localStorage.setItem('doc_esp', e.target.value)}}/>
                <input style={{ width: '70px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', textAlign: 'center' }} placeholder="EXQ" value={docExq} onChange={e=>{setDocExq(e.target.value); localStorage.setItem('doc_exq', e.target.value)}}/>
              </div>
              <div style={{ padding: '15px 20px 20px 20px' }}>
                <button onClick={() => {document.getElementById('print-body').innerHTML = editorRef.current.innerHTML; window.print();}} style={{ width: '100%', padding: '15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>GENERAR PDF</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR - AHORA CON TAMAÑOS */}
      {showForm && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '700px', padding: '30px', borderRadius: '30px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{isEditing ? 'EDITAR' : 'NUEVA'} PLANTILLA</h2>
            <input style={{ width: '100%', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0', fontWeight: 'bold', outline: 'none' }} placeholder="TÍTULO DEL ESTUDIO" value={currentP.titulo} onChange={e=>setCurrentP({...currentP, titulo: e.target.value})} />
            
            {/* BARRA DE HERRAMIENTAS MODAL COMPLETA CON TAMAÑOS */}
            <div style={{ backgroundColor: '#f1f5f9', padding: '10px', border: '2px solid #e2e8f0', borderBottom: 'none', borderRadius: '15px 15px 0 0', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <button onMouseDown={e=>execFormat(e,'bold')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
                <div style={{ width: '2px', height: '20px', background: '#cbd5e1', margin: '0 5px' }}></div>
                <button onMouseDown={e=>execFormat(e,'justifyLeft')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignLeft size={16}/></button>
                <button onMouseDown={e=>execFormat(e,'justifyCenter')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignCenter size={16}/></button>
                <button onMouseDown={e=>execFormat(e,'justifyRight')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignRight size={16}/></button>
                <button onMouseDown={e=>execFormat(e,'justifyFull')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><AlignJustify size={16}/></button>
                <div style={{ width: '2px', height: '20px', background: '#cbd5e1', margin: '0 5px' }}></div>
                <button onMouseDown={e=>execFormat(e,'insertUnorderedList')} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><List size={16}/></button>
                
                {/* TAMAÑOS EN EL MODAL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '5px' }}>
                  <Type size={14} color="#64748b"/>
                  <select value={fontSize} onChange={e=>setFontSize(e.target.value)} style={{ fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}><option value="10pt">10pt</option><option value="12pt">12pt</option><option value="14pt">14pt</option></select>
                  <MoveVertical size={14} color="#64748b" style={{ marginLeft: '5px' }}/>
                  <select value={lineHeight} onChange={e=>setLineHeight(e.target.value)} style={{ fontSize: '11px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}><option value="1">1.0</option><option value="1.5">1.5</option><option value="2">2.0</option></select>
                </div>
            </div>
            
            <div ref={modalEditorRef} contentEditable style={{ height: '350px', padding: '25px', border: '2px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 15px 15px', outline: 'none', overflowY: 'auto', backgroundColor: '#fff', fontFamily: "'Times New Roman', serif", fontSize: fontSize, lineHeight: lineHeight, textAlign: 'justify' }}></div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={()=>setShowForm(false)} style={{ flex: 1, padding: '15px', fontWeight: 'bold', color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>CANCELAR</button>
              <button onClick={guardarPlantilla} style={{ flex: 2, padding: '15px', backgroundColor: '#16a34a', color: 'white', borderRadius: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>GUARDAR CAMBIOS</button>
            </div>
          </div>
        </div>
      )}

      {/* DISEÑO PDF MEMBRETADO CON LOGO DINÁMICO */}
      <div className="print-only">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #16a34a', paddingBottom: '15px', marginBottom: '25px' }}>
          
          <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {logo ? (
              <img src={logo} alt="Logo Clínica" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', border: '1px dashed #ccc' }}></div>
            )}
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ color: '#1e3a8a', fontSize: '22px', fontWeight: '900', margin: '0', letterSpacing: '-0.5px' }}>CENTRO DE IMÁGENES DIAGNÓSTICAS</h1>
            <h2 style={{ color: '#16a34a', fontSize: '18px', margin: '2px 0 0 0', fontWeight: '800' }}>ORTEGA & GASSET</h2>
          </div>

          <div style={{ width: '30%', textAlign: 'right', color: '#16a34a', fontSize: '8.5px', fontWeight: 'bold', lineHeight: '1.3' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '10px', borderBottom: '1px solid #16a34a', display: 'inline-block' }}>ESTUDIOS</p>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              <li>RAYOS X DIGITAL • MAMOGRAFÍA</li>
              <li>DENSITOMETRIA OSEA • VASCULAR</li>
              <li>SONOGRAFÍA DIAGNÓSTICA</li>
              <li>MUSCULO-ESQUELETICA • ECO</li>
              <li>RESONANCIA MAGNETICA</li>
            </ul>
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #eee', paddingBottom: '12px', marginBottom: '25px', fontSize: '11.5pt', fontWeight: 'bold' }}>
          <span>FECHA: {fecha}</span>
          <span>PACIENTE: {paciente.toUpperCase()}</span>
        </div>

        <main id="print-body" className="editor-medico" style={{ fontSize: fontSize, lineHeight: lineHeight, fontFamily: "'Times New Roman', serif", textAlign: 'justify' }}></main>

        <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', pageBreakInside: 'avoid' }}>
          <div style={{ width: '300px', borderTop: '1.5px solid black', textAlign: 'center', paddingTop: '8px' }}>
            <strong style={{ fontSize: '12.5pt' }}>{docNom}</strong><br/>
            <span style={{ fontSize: '11pt' }}>{docEsp}</span><br/>
            <span style={{ fontSize: '11pt' }}>EXQ. {docExq}</span>
          </div>
        </div>

        <footer style={{ position: 'fixed', bottom: '15px', width: '100%', textAlign: 'center', fontSize: '9.5px', color: '#16a34a', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>📍 Av. José Ortega y Gasset No. 90, Santo Domingo, Rep. Dom.</p>
          <p style={{ margin: 0 }}>📞 809-566-2271 Ext.: 130 / 809-563-1453 | ✉️ ccruzjiminian@hotmail.com</p>
        </footer>
      </div>

      <style>{`
        .print-only { display: none; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; margin: 0; }
          @page { size: letter; margin: 1.5cm 1.5cm 2.5cm 1.5cm; }
          .editor-medico table { width: 100%; border-collapse: collapse; margin: 20px 0; page-break-inside: auto; }
          .editor-medico tr { page-break-inside: avoid !important; }
          .editor-medico td, .editor-medico th { border: 1.5px solid black !important; padding: 8px !important; }
        }
        @media (min-width: 800px) {
          .plantilla-card:hover { box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
          .hover-red:hover { color: #ef4444 !important; }
        }
        .pc-col-grid::-webkit-scrollbar { width: 5px; }
        .pc-col-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}