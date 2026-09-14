import type { PlannedLeg, RouteSummary, TripDetail } from '../types/transit.js';
export interface RouteTrips { line: RouteSummary; trips: TripDetail[] }
export function distanceMeters(a: {lat:number;lng:number}, b: {lat:number;lng:number}) {
  const rad = Math.PI / 180;
  const x = Math.sin((b.lat-a.lat)*rad/2)**2 + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin((b.lng-a.lng)*rad/2)**2;
  return Math.round(6371000*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x)));
}
// Each edge follows a single source trip in its original stop order.
// Transfers require the same stop ID and coordinates; no proximity links are invented.
export function planJourney(network: RouteTrips[], origin: {lat:number;lng:number}, destination: {lat:number;lng:number}): PlannedLeg[] | null {
  const trips = network.flatMap(({line,trips}) => trips.map(trip => ({line,trip})));
  let frontier: {stopId:number;lat:number;lng:number;legs:PlannedLeg[]}[] = [];
  for (const {trip} of trips) for (const stop of trip.stops) {
    if (distanceMeters(origin,stop) <= 800) frontier.push({...stop,legs:[]});
  }
  const visited = new Set<number>();
  for (let depth=0; depth<4; depth++) {
    const next: typeof frontier = [];
    for (const current of frontier) {
      if (visited.has(current.stopId)) continue;
      visited.add(current.stopId);
      for (const {line,trip} of trips) {
        for (let i=0;i<trip.stops.length-1;i++) {
          const board=trip.stops[i];
          if (board.stopId!==current.stopId || distanceMeters(board,current)>30) continue;
          for (let j=i+1;j<trip.stops.length;j++) {
            const alight=trip.stops[j];
            const legs=[...current.legs,{line,trip,originStop:board,destStop:alight}];
            if (distanceMeters(alight,destination)<=800) return legs;
            next.push({...alight,legs});
          }
        }
      }
    }
    frontier=next;
  }
  return null;
}
