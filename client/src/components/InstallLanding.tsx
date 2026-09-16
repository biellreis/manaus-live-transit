import {useEffect,useState} from 'react';

interface InstallPrompt extends Event {
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:'accepted'|'dismissed'}>;
}
export function InstallLanding({platform}:{platform:'ios'|'android'}){
  const [prompt,setPrompt]=useState<InstallPrompt|null>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    const available=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt);};
    const installed=()=>{setPrompt(null);setMessage('Manô adicionado. Abra pelo ícone na sua tela inicial.');};
    window.addEventListener('beforeinstallprompt',available);
    window.addEventListener('appinstalled',installed);
    return()=>{window.removeEventListener('beforeinstallprompt',available);window.removeEventListener('appinstalled',installed);};
  },[]);
  async function install(){
    if(!prompt||busy)return;
    setBusy(true);
    try{await prompt.prompt();const choice=await prompt.userChoice;setMessage(choice.outcome==='accepted'?'Continue a confirmação do navegador e abra o Manô pela tela inicial.':'Tudo bem. Você pode instalar pelo menu do navegador quando quiser.');}
    catch{setMessage('Use o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.');}
    finally{setPrompt(null);setBusy(false);}
  }
  return <main style={{position:'absolute',inset:0,overflowY:'auto',touchAction:'pan-y',background:'#09090b',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',padding:'max(env(safe-area-inset-top), 32px) 24px max(env(safe-area-inset-bottom), 32px)'}}>
    <div style={{maxWidth:370,textAlign:'center',width:'100%'}}>
      <img src="/ICONE-APLICATIVO.png" alt="" width={90} height={90} style={{borderRadius:23,margin:'0 auto 28px',display:'block'}}/>
      <p style={{fontSize:11,letterSpacing:2,color:'#3b82f6',marginBottom:18}}>MANÔ NA SUA TELA INICIAL</p>
      <h1 style={{fontSize:40,letterSpacing:-1.5,lineHeight:1.08,marginBottom:18}}>Sua cidade.<br/>Na sua mão.</h1>
      <p style={{fontSize:16,color:'#9c9ca8',lineHeight:1.6,marginBottom:30}}>Adicione o Manô e abra direto pelo ícone do aplicativo.</p>
      <ol style={{listStyle:'none',padding:0,textAlign:'left',display:'grid',gap:14}}>
        {(platform==='ios'?['Abra esta página no Safari.','Toque em Compartilhar e em Adicionar à Tela de Início.','Mantenha Abrir como App da Web, se aparecer, e toque em Adicionar.']:['Abra esta página no Chrome.','Toque em Instalar abaixo, se disponível, ou abra o menu ⋮ do navegador.','Escolha Instalar aplicativo ou Adicionar à tela inicial e confirme.']).map((step,index)=><li key={step} style={{display:'flex',gap:14,alignItems:'center',padding:16,background:'#15151b',border:'1px solid #ffffff12',borderRadius:15,fontSize:14,lineHeight:1.5}}><span style={{color:'#6da2ff',fontSize:18}}>{index+1}</span>{step}</li>)}
      </ol>
      {prompt&&platform==='android'&&<button onClick={install} disabled={busy} style={{width:'100%',padding:17,border:0,borderRadius:14,background:'#2563eb',color:'white',fontSize:16,marginTop:24}}>{busy?'Aguarde…':'Instalar Manô'}</button>}
      <p role="status" style={{color:'#a9b8d0',fontSize:13,lineHeight:1.5,marginTop:18}}>{message}</p>
      <a href="/" style={{display:'inline-block',color:'#9b9ba7',fontSize:13,marginTop:25}}>Continuar no navegador ↗</a>
    </div>
  </main>;
}
