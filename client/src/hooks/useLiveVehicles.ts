import { useState, useEffect } from 'react';
import type { LiveBus } from '../types/transit.js';
export function useLiveVehicles(routeId: string, routeCode: string) {
  const [vehicles,setVehicles]=useState<LiveBus[]>([]);
  const [isConnected,setIsConnected]=useState(false);
  const [lastUpdated,setLastUpdated]=useState<Date|null>(null);
  useEffect(()=>{
    setVehicles([]); setIsConnected(false); setLastUpdated(null);
    if (!routeId) return;
    let alive=true, polling=false, lastMessage=0;
    const controller=new AbortController();
    const es=new EventSource(`/api/live/stream?routeId=${encodeURIComponent(routeId)}&routeCode=${encodeURIComponent(routeCode)}`);
    const apply=(data:{vehicles?:LiveBus[]})=>{
      if (!alive || !Array.isArray(data.vehicles)) return;
      setVehicles(data.vehicles); setLastUpdated(new Date());
    };
    es.onmessage=event=>{try {apply(JSON.parse(event.data));lastMessage=Date.now();setIsConnected(true);}catch{setIsConnected(false);}};
    es.onerror=()=>{if(alive) setIsConnected(false);};
    const poll=async()=>{
      if(polling || (es.readyState===EventSource.OPEN && Date.now()-lastMessage<10000)) return;
      polling=true;
      try {
        const res=await fetch(`/api/lines/${encodeURIComponent(routeId)}/realtime?code=${encodeURIComponent(routeCode)}`,{signal:controller.signal});
        if(!res.ok) throw new Error('Unavailable');
        const data=await res.json();
        if(Date.now()-lastMessage>=5000) apply(data);
      } catch {if(alive){setVehicles([]);setIsConnected(false);setLastUpdated(null);}}
      finally {polling=false;}
    };
    void poll();
    const timer=setInterval(poll,5000);
    return ()=>{alive=false;controller.abort();clearInterval(timer);es.close();};
  },[routeId,routeCode]);
  return {vehicles,isConnected,lastUpdated};
}
