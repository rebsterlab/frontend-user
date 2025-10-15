import React, {useState, useRef, useEffect} from 'react';
import { motion } from 'framer-motion';

export default function Chat({apiBase}){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(()=>{ if(endRef.current) endRef.current.scrollIntoView({behavior:'smooth'}); }, [messages, loading]);

  const send = async ()=>{
    const q = input.trim();
    if(!q) return;
    setMessages(prev=>[...prev, {role:'user', text:q}]);
    setInput('');
    setLoading(true);
    try{
      const res = await fetch(`${apiBase}/query?question=${encodeURIComponent(q)}`);
      const data = await res.json();
      const answer = data.answer || data.response || 'Non ho trovato informazioni rilevanti.';
      setMessages(prev=>[...prev, {role:'assistant', text:answer, sources: data.sources || []}]);
    }catch(err){
      setMessages(prev=>[...prev, {role:'assistant', text:'Errore di rete: impossibile contattare il server.'}]);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <div style={{width:48,height:48,background:'#e2e8f0',borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center'}}>🤖</div>
        <div>
          <div style={{fontWeight:700}}>Unicardealer Assistant</div>
          <div style={{fontSize:13,color:'#64748b'}}>Assistenza tecnica</div>
        </div>
      </div>

      <div style={{height:420, overflow:'auto', padding:12, borderRadius:8, background:'#f8fafc', border:'1px solid #e6eef8'}}>
        {messages.length===0 && <div style={{textAlign:'center', color:'#94a3b8', marginTop:60}}>Benvenuto — chiedi un codice errore o una procedura.</div>}
        {messages.map((m,i)=>(
          <motion.div key={i} initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.15}} style={{marginBottom:12, textAlign: m.role==='user' ? 'right' : 'left'}}>
            <div style={{display:'inline-block', background: m.role==='user' ? '#0ea5e9' : '#fff', color: m.role==='user' ? '#fff' : '#0f1724', padding:'10px 14px', borderRadius:12, maxWidth:'78%'}}>
              <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
              {m.sources && m.sources.length>0 && (
                <div style={{marginTop:8, fontSize:13, color:'#475569'}}>
                  Fonti:
                  <ul style={{marginTop:6, marginLeft:16}}>
                    {m.sources.map((s,idx)=> <li key={idx}><a style={{color:'#0ea5e9'}} href={ (s.download_url || ('/download/'+s.file)) } target="_blank" rel="noreferrer">{s.file}</a></li>)}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && <div style={{color:'#64748b', textAlign:'center'}}>Digitando...</div>}
        <div ref={endRef} />
      </div>

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') send();}} placeholder="Scrivi la tua domanda..." style={{flex:1,padding:12,borderRadius:10,border:'1px solid #e6eef8'}} />
        <button onClick={send} disabled={loading} style={{background:'#0ea5e9', color:'#fff', padding:'10px 14px', borderRadius:10, fontWeight:700}}>{loading ? '...' : 'Invia'}</button>
      </div>
    </div>
  );
}
