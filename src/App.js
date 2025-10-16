import React from 'react';
import Chat from './components/Chat';

export default function App(){
  const apiBase = process.env.REACT_APP_API || "https://unicardealer-backend.onrender.com";
  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:32, background:'#f7fafc'}}>
      <header style={{marginBottom:12, textAlign:'center'}}>
        <h1 style={{margin:0}}>Unicardealer Service Assistant</h1>
        <p style={{margin:0, color:'#475569'}}>Chat di supporto tecnico</p>
      </header>
      <main style={{width:'100%', maxWidth:900}}>
        <div style={{background:'#fff', borderRadius:12, padding:20, boxShadow:'0 6px 20px rgba(15,23,42,0.06)'}}>
          <Chat apiBase={apiBase} />
        </div>
      </main>
      <footer style={{marginTop:24, color:'#64748b'}}>© Unicardealer</footer>
    </div>
  );
}
