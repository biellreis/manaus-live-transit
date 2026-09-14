export function googleDirectionsUrl(origin:{lat:number;lng:number}, destination:{lat:number;lng:number}, mode:'transit'|'walking'='transit') {
  const query=new URLSearchParams({api:'1',origin:`${origin.lat},${origin.lng}`,destination:`${destination.lat},${destination.lng}`,travelmode:mode});
  return `https://www.google.com/maps/dir/?${query}`;
}
export function providerLineUrl(routeId:string, tripId?:number) {
  const fragment=encodeURIComponent(routeId)+(tripId!==undefined?`;${encodeURIComponent(tripId)}`:'');
  return `https://editor.mobilibus.com/web/detalhes-linha/4pc1e#${fragment}`;
}
