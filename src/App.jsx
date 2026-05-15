import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit3, Trash2, Type, MoveVertical, 
  Image as ImageIcon, Upload, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';

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
  const [fontSize, setFontSize] = useState('12pt');
  const [lineHeight, setLineHeight] = useState('1.5');
  const [logo, setLogo] = useState(localStorage.getItem('clinica_logo') || '');

  const [docNom, setDocNom] = useState(localStorage.getItem('doc_nombre') || 'DRA. LEYDI NOVAS FELIZ');
  const [docEsp, setDocEsp] = useState(localStorage.getItem('doc_esp') || 'MÉDICO SONOGRAFISTA VASCULAR');
  const [docExq, setDocExq] = useState(localStorage.getItem('doc_exq') || '421-11');

  const editorRef = useRef(null);
  const modalEditorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPlantillas();
    const saved = localStorage.getItem('reporte_pro');
    if (saved && editorRef.current) editorRef.current.innerHTML = saved;
  }, []);

  async function fetchPlantillas() {
    const { data } = await supabase.from('plantillas').select('*').order('titulo');
    setPlantillas(data || []);
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        localStorage.setItem('clinica_logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const importarWords = async (files) => {
    if (!files.length) return;
    alert(`Procesando ${files.length} archivos...`);
    const nuevas = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
      nuevas.push({ titulo: file.name.replace(/\.docx|\.doc/g, "").toUpperCase(), contenido: value, categoria: "Importadas" });
    }
    const { error } = await supabase.from("plantillas").insert(nuevas);
    if (!error) { fetchPlantillas(); alert("Importación exitosa."); }
  };

  const guardar = async () => {
    const html = modalEditorRef.current.innerHTML;
    if (!currentP.titulo || !html) return alert("Completa los campos");
    const payload = { titulo: currentP.titulo, contenido: html, categoria: 'General' };
    if (isEditing) await supabase.from('plantillas').update(payload).eq('id', currentP.id);
    else await supabase.from('plantillas').insert([payload]);
    setShowForm(false); fetchPlantillas();
  };

  const eliminar = async (id) => {
    if (confirm("¿Eliminar esta plantilla?")) {
      await supabase.from('plantillas').delete().eq('id', id);
      fetchPlantillas();
    }
  };

  const format = (e, cmd) => { e.preventDefault(); document.execCommand(cmd, false, null); };
  const filtered = plantillas.filter(p => p.titulo.toLowerCase().includes(busqueda.toLowerCase()));
  const isPC = window.innerWidth >= 800;

  return (
    <div className="main-bg">
      <div className="no-print main-layout">
        
        {/* TABS PARA MÓVIL */}
        {!isPC && (
          <div className="mobile-nav">
            <button onClick={() => setMobileTab('biblioteca')} className={mobileTab === 'biblioteca' ? 'active' : ''}>Biblioteca</button>
            <button onClick={() => setMobileTab('editor')} className={mobileTab === 'editor' ? 'active' : ''}>Editor</button>
          </div>
        )}

        <div className="app-grid">
          {/* PANEL IZQUIERDO: BIBLIOTECA */}
          <div className={`side-panel ${isPC || mobileTab === 'biblioteca' ? 'visible' : 'hidden'}`}>
            <div className="glass-card header-area">
              <div className="flex-row-between">
                <h1 className="brand-title">SIGAP <span>PRO</span></h1>
                <div className="action-row">
                  <input type="file" ref={fileInputRef} onChange={handleLogoChange} hidden accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="icon-btn"><ImageIcon size={16}/> LOGO</button>
                  
                  <input type="file" id="bulk-word" multiple accept=".docx" hidden onChange={e => importarWords(e.target.files)} />
                  <label htmlFor="bulk-word" className="icon-btn cursor-pointer"><Upload size={16}/> WORD</label>

                  <button onClick={() => {setIsEditing(false); setCurrentP({id:null, titulo:''}); setShowForm(true); setTimeout(()=>modalEditorRef.current.innerHTML='',50)}} className="primary-btn">+ NUEVA</button>
                </div>
              </div>
              <input className="modern-search" placeholder="Buscar estudio..." onChange={e => setBusqueda(e.target.value)} />
            </div>
            
            <div className="templates-scroll">
              {filtered.map(p => (
                <div key={p.id} className="template-card shadow-sm">
                  <div className="card-controls">
                    <button onClick={() => {setIsEditing(true); setCurrentP(p); setShowForm(true); setTimeout(()=>modalEditorRef.current.innerHTML=p.contenido,50)}}><Edit3 size={15}/></button>
                    <button onClick={() => eliminar(p.id)} className="text-red-400"><Trash2 size={15}/></button>
                  </div>
                  <h3>{p.titulo}</h3>
                  <button className="use-btn" onClick={() => {editorRef.current.innerHTML += p.contenido; if(!isPC) setMobileTab('editor')}}>USAR PLANTILLA</button>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL DERECHO: EDITOR */}
          <div className={`editor-panel ${isPC || mobileTab === 'editor' ? 'visible' : 'hidden'}`}>
            <div className="patient-bar">
              <input className="patient-input" placeholder="PACIENTE" value={paciente} onChange={e=>setPaciente(e.target.value)}/>
              <input className="date-input" value={fecha} onChange={e=>setFecha(e.target.value)}/>
            </div>

            <div className="editor-toolbar">
              <div className="tool-group">
                <button onMouseDown={e=>format(e,'bold')}><b>B</b></button>
                <button onMouseDown={e=>format(e,'justifyLeft')}><AlignLeft size={16}/></button>
                <button onMouseDown={e=>format(e,'justifyCenter')}><AlignCenter size={16}/></button>
                <button onMouseDown={e=>format(e,'justifyFull')}><AlignJustify size={16}/></button>
              </div>
              <div className="tool-group">
                <select value={fontSize} onChange={e=>setFontSize(e.target.value)}><option value="10pt">10pt</option><option value="12pt">12pt</option><option value="14pt">14pt</option></select>
                <select value={lineHeight} onChange={e=>setLineHeight(e.target.value)}><option value="1">1.0</option><option value="1.5">1.5</option></select>
              </div>
            </div>

            <div ref={editorRef} contentEditable className="canvas" style={{fontSize, lineHeight}} onInput={e=>localStorage.setItem('reporte_pro', e.currentTarget.innerHTML)}></div>
            
            <div className="editor-footer">
              <div className="doc-info-grid">
                <input placeholder="MÉDICO" value={docNom} onChange={e=>{setDocNom(e.target.value); localStorage.setItem('doc_nombre', e.target.value)}}/>
                <input placeholder="EXQ" value={docExq} onChange={e=>{setDocExq(e.target.value); localStorage.setItem('doc_exq', e.target.value)}}/>
              </div>
              <button className="print-btn" onClick={() => {document.getElementById('print-body').innerHTML = editorRef.current.innerHTML; window.print()}}>GENERAR REPORTE PDF</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="modal-back">
          <div className="modal-box">
            <h2 className="modal-title">{isEditing ? 'Editar' : 'Nueva'} Plantilla</h2>
            <input className="modal-input" placeholder="TÍTULO" value={currentP.titulo} onChange={e=>setCurrentP({...currentP, titulo: e.target.value})} />
            <div ref={modalEditorRef} contentEditable className="modal-canvas" style={{fontSize, lineHeight}}></div>
            <div className="modal-actions">
              <button onClick={()=>setShowForm(false)} className="btn-cancel">CANCELAR</button>
              <button onClick={guardar} className="primary-btn">GUARDAR</button>
            </div>
          </div>
        </div>
      )}

      {/* IMPRESIÓN (NUEVO ENCABEZADO BASADO EN IMAGEN) */}
      <div className="print-only">
        <header className="pdf-header-new">
          <div className="pdf-header-left">
            {logo ? <img src={logo} alt="logo" /> : <div className="no-logo-print">LOGO</div>}
          </div>

          <div className="pdf-header-center">
            <h1 className="main-center-title">CENTRO DE IMÁGENES DIAGNÓSTICAS</h1>
            <div className="double-green-line"></div>
            <h2 className="sub-center-title">ORTEGA & GASSET</h2>
          </div>

          <div className="pdf-header-right">
            <h3 className="estudios-title">ESTUDIOS</h3>
            <ul className="estudios-list">
              <li>• RAYOS X DIGITAL</li>
              <li>• MAMOGRAFÍA DIGITAL</li>
              <li>• DENSITOMETRIA OSEA</li>
              <li>• SONOGRAFÍA VASCULAR</li>
              <li>• SONOGRAFÍA DIAGNÓSTICA</li>
              <li>• SONOGRAFÍA MUSCULO-ESQUELETICA</li>
              <li>• TOMOGRAFÍA AXIAL TRIDIMENSIONAL</li>
              <li>• ECOCARDIOGRAFÍA CON COLOR DOPPLER</li>
              <li>• RESONANCIA MAGNETICA</li>
            </ul>
          </div>
        </header>

        <div className="pdf-patient">
          <span>FECHA: {fecha}</span>
          <span>PACIENTE: {paciente.toUpperCase()}</span>
        </div>
        
        <main id="print-body" style={{ fontSize: fontSize, lineHeight: lineHeight, fontFamily: "'Times New Roman', serif", textAlign: 'justify' }}></main>
        
        {/* BLOQUE DE FIRMA MÁS PEQUEÑO Y COMPACTO */}
        <div className="pdf-sig">
          <div className="sig-box">
            <strong>{docNom}</strong><br/>
            <span style={{ fontSize: '9pt' }}>{docEsp}</span><br/>
            <span style={{ fontSize: '9pt' }}>EXQ. {docExq}</span>
          </div>
        </div>
      </div>

      <style>{`
        /* --- ESTILOS DE LA APLICACIÓN (PANTALLA) --- */
        .main-bg { height: 100vh; background: #f1f5f9; font-family: 'Inter', sans-serif; overflow: hidden; }
        .main-layout { height: 100%; display: flex; flex-direction: column; padding: 15px; box-sizing: border-box; }
        .app-grid { display: flex; flex: 1; gap: 20px; overflow: hidden; }
        
        .side-panel { flex: 1; display: flex; flex-direction: column; gap: 15px; }
        .header-area { background: white; padding: 20px; border-radius: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .flex-row-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .brand-title { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
        .brand-title span { color: #16a34a; }
        .action-row { display: flex; gap: 10px; }
        
        .primary-btn { background: #16a34a; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .primary-btn:hover { background: #15803d; }
        .icon-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 12px; font-size: 11px; font-weight: bold; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .icon-btn:hover { background: #f1f5f9; }
        
        .modern-search { width: 100%; padding: 12px 15px; border-radius: 15px; border: 1px solid #e2e8f0; background: #f8fafc; outline: none; font-size: 14px; }
        .templates-scroll { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; overflow-y: auto; padding-bottom: 20px; }
        
        .template-card { background: white; padding: 20px; border-radius: 22px; border: 1px solid #e2e8f0; position: relative; transition: 0.2s; }
        .template-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .card-controls { position: absolute; top: 12px; right: 12px; display: flex; gap: 8px; }
        .card-controls button { background: none; border: none; color: #cbd5e1; cursor: pointer; }
        .card-controls button:hover { color: #64748b; }
        .template-card h3 { font-size: 12px; margin: 0 0 15px 0; color: #334155; text-transform: uppercase; line-height: 1.4; padding-right: 40px; }
        .use-btn { width: 100%; background: #1e293b; color: white; border: none; padding: 10px; border-radius: 10px; font-size: 10px; font-weight: bold; cursor: pointer; }

        .editor-panel { width: 550px; background: white; border-radius: 30px; display: flex; flex-direction: column; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .patient-bar { padding: 20px; display: flex; gap: 10px; border-bottom: 1px solid #f1f5f9; }
        .patient-input { flex: 1; padding: 12px; background: #f8fafc; border: none; border-radius: 12px; font-weight: bold; font-size: 13px; outline: none; }
        .date-input { width: 110px; text-align: center; background: #f8fafc; border: none; border-radius: 12px; font-size: 12px; font-weight: bold; }
        
        .editor-toolbar { background: #f8fafc; padding: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; }
        .tool-group { display: flex; gap: 6px; align-items: center; }
        .tool-group button, .tool-group select { background: white; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
        
        .canvas { flex: 1; padding: 35px; outline: none; overflow-y: auto; text-align: justify; font-family: 'Times New Roman', serif; }
        .editor-footer { padding: 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        .doc-info-grid { display: flex; gap: 10px; margin-bottom: 15px; }
        .doc-info-grid input { flex: 1; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 11px; font-weight: bold; }
        .print-btn { width: 100%; background: #16a34a; color: white; border: none; padding: 16px; border-radius: 15px; font-weight: 800; font-size: 13px; cursor: pointer; }

        table { width: 100% !important; border-collapse: collapse !important; margin: 15px 0 !important; }
        td, th { border: 1px solid #cbd5e1 !important; padding: 10px !important; }

        .modal-back { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal-box { background: white; width: 100%; max-width: 800px; padding: 30px; border-radius: 35px; display: flex; flex-direction: column; gap: 15px; max-height: 90vh; }
        .modal-title { margin: 0; font-size: 18px; font-weight: 900; }
        .modal-input { padding: 15px; border-radius: 15px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; outline: none; }
        .modal-canvas { flex: 1; border: 1px solid #e2e8f0; padding: 25px; overflow-y: auto; outline: none; border-radius: 20px; background: white; font-family: 'Times New Roman', serif; }
        .modal-actions { display: flex; gap: 15px; }
        .btn-cancel { flex: 1; border: none; background: none; color: #94a3b8; font-weight: bold; cursor: pointer; }

        .hidden { display: none !important; }
        .visible { display: flex !important; }
        
        .mobile-nav { display: flex; background: white; padding: 5px; border-radius: 15px; margin-bottom: 15px; }
        .mobile-nav button { flex: 1; padding: 12px; border: none; background: none; border-radius: 10px; font-weight: bold; color: #64748b; }
        .mobile-nav button.active { background: #16a34a; color: white; }

        @media (max-width: 800px) {
          .editor-panel { width: 100% !important; border-radius: 20px; }
          .side-panel { width: 100% !important; }
          .app-grid { overflow-y: auto; }
          .patient-bar, .editor-toolbar { flex-wrap: wrap; }
          .tool-group { flex-wrap: wrap; justify-content: center; width: 100%; margin-bottom: 5px; }
        }

        /* --- ESTILOS EXCLUSIVOS PARA IMPRESIÓN --- */
        .print-only { display: none; }
        @media print {
          html, body, .main-bg, .main-layout, .app-grid { 
            height: auto !important; 
            min-height: auto !important;
            overflow: visible !important; 
            display: block !important; 
            background: white !important;
          }
          
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: letter; margin: 1cm 1.5cm; }

          .pdf-header-new { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            padding-bottom: 10px; 
            margin-bottom: 15px;
          }

          .pdf-header-left { width: 120px; }
          .pdf-header-left img { max-width: 100%; display: block; }
          .no-logo-print { width: 80px; height: 80px; border: 1px dashed #ccc; text-align: center; line-height: 80px; font-size: 10px; }

          .pdf-header-center { 
            flex: 1; 
            text-align: center; 
            padding: 0 10px; 
            margin-top: 25px;
          }
          .main-center-title { 
            color: #1e4a84 !important; 
            font-size: 20pt; 
            font-weight: 800; 
            margin: 0; 
            line-height: 1;
          }
          .double-green-line { 
            height: 6px; 
            border-top: 2px solid #16a34a !important; 
            border-bottom: 2px solid #16a34a !important; 
            margin: 8px auto;
            width: 90%;
          }
          .sub-center-title { 
            color: #1e4a84 !important; 
            font-size: 15pt; 
            font-weight: 700; 
            margin: 0;
            letter-spacing: 1px;
          }

          .pdf-header-right { 
            width: 210px; 
            text-align: right; 
          }
          .estudios-title { 
            color: #1e4a84 !important; 
            font-size: 11pt; 
            font-weight: 800; 
            margin: 0 0 5px 0; 
          }
          .estudios-list { 
            list-style: none; 
            padding: 0; 
            margin: 0; 
            color: #16a34a !important; 
            font-size: 7.8pt; 
            font-weight: 600;
            line-height: 1.1;
          }
          .estudios-list li { margin-bottom: 1px; }

          .pdf-patient { 
            display: flex; 
            justify-content: space-between; 
            margin: 15px 0; 
            font-size: 11pt; 
            font-weight: bold; 
            border-bottom: 1px solid #ccc !important; 
            padding-bottom: 5px; 
          }
          
          #print-body table { border: 1.5px solid black !important; width: 100% !important; border-collapse: collapse !important; }
          #print-body td { border: 1.5px solid black !important; padding: 8px !important; }
          
          /* FIRMA OPTIMIZADA */
          .pdf-sig { margin-top: 25px; text-align: center; page-break-inside: avoid; }
          .sig-box { 
            border-top: 1px solid black !important; 
            display: inline-block; 
            padding-top: 5px; 
            width: 220px; 
            font-size: 10pt;
          }
        }
      `}</style>
    </div>
  );
}