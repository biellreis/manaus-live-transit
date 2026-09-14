import test from 'node:test';
import assert from 'node:assert/strict';
import { sliceTripCoordinates } from '../server/src/services/routeGeometry.js';
import { findCandidates, validPoint } from '../server/src/services/routePlannerService.js';
import { getStreetWalkingPolyline } from '../server/src/services/walkingRouter.js';
import { sinetram, type TripDetail, type StopInfo, type RouteSummary } from '../server/src/services/sinetramClient.js';
import { googleDirectionsUrl, providerLineUrl } from '../client/src/utils/mapLinks.js';

const stop=(id:number,lng:number,sequence=id):StopInfo=>({stopId:id,stopName:`Parada ${id}`,lat:-3.1,lng,sequence,distKm:0,timeSeconds:0});
const line=(id:string):RouteSummary=>({id,code:id,name:id,category:'convencional',color:'#2563EB'});
const trip=(stops:StopInfo[],coordinates=stops.map(s=>[s.lng,s.lat] as [number,number])):TripDetail=>({tripId:1,tripName:'Fonte',tripShortName:'1',directionType:'ida',totalTimeSeconds:0,totalDistanceKm:0,stops,coordinates});
const point=(lng:number)=>({name:'Teste',lat:-3.1,lng});

test('slices only the ordered source geometry, without including the full route',()=>{
  const stops=[stop(1,-60.1),stop(2,-60.08),stop(3,-60.06),stop(4,-60.04)];
  assert.deepEqual(sliceTripCoordinates(trip(stops),stops[1],stops[2]),[[-60.08,-3.1],[-60.06,-3.1]]);
  assert.deepEqual(sliceTripCoordinates(trip(stops),stops[2],stops[1]),[]);
});
test('loop and repeated stop IDs retain occurrence order',()=>{
  const stops=[stop(1,-60.1,1),stop(2,-60.08,2),stop(1,-60.1,3),stop(3,-60.06,4)];
  assert.deepEqual(sliceTripCoordinates(trip(stops),stops[2],stops[3]),[[-60.1,-3.1],[-60.06,-3.1]]);
});
test('missing or incompatible shape does not become a straight line',()=>{
  const stops=[stop(1,-60.1),stop(2,-60.08)];
  assert.deepEqual(sliceTripCoordinates(trip(stops,[]),...stops as [StopInfo,StopInfo]),[]);
});
test('closest origin stop cannot mask an earlier stop before the destination',()=>{
  const stops=[stop(1,-60.006),stop(2,-60.04),stop(3,-60),stop(4,-59.97)];
  const routes=[{code:'1',line:line('1'),trips:[trip(stops)]}];
  const result=findCandidates(routes,point(-60),point(-60.04));
  assert.equal(result[0][0].originStop.stopId,1);
  assert.equal(result[0][0].destStop.stopId,2);
});
test('one-way route does not imply a return journey',()=>{
  const routes=[{code:'1',line:line('1'),trips:[trip([stop(1,-60.1),stop(2,-60.06)])]}];
  assert.deepEqual(findCandidates(routes,point(-60.06),point(-60.1)),[]);
});
test('transfers require the same actual stop, not merely a nearby terminal',()=>{
  const first={code:'1',line:line('1'),trips:[trip([stop(1,-60.1),stop(2,-60.06)])]};
  const second={code:'2',line:line('2'),trips:[trip([stop(9,-60.06),stop(3,-60.02)])]};
  assert.deepEqual(findCandidates([first,second],point(-60.1),point(-60.02)),[]);
  second.trips=[trip([stop(2,-60.06,1),stop(3,-60.02,2)])];
  assert.equal(findCandidates([first,second],point(-60.1),point(-60.02))[0].length,2);
});
test('invalid coordinates and empty network do not generate stops',()=>{
  assert.equal(validPoint({name:'Teste',lat:999,lng:0}),false);
  assert.equal(validPoint({name:'Teste',lat:null,lng:0}),false);
  assert.deepEqual(findCandidates([],point(-60.1),point(-60)),[]);
});
test('feed failure, empty feed, and unknown telemetry never create buses',async()=>{
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async()=>new Response(JSON.stringify({vehicles:[]}),{status:200});
    assert.deepEqual(await sinetram.getRealtimeVehicles('test-empty','test'),[]);
    globalThis.fetch=async()=>{throw new Error('test offline');};
    assert.deepEqual(await sinetram.getRealtimeVehicles('test-failed','test'),[]);
    assert.deepEqual(await sinetram.getRouteItinerary('test-no-itinerary'),[]);
    globalThis.fetch=async()=>new Response(JSON.stringify({vehicles:[{id:'test',lat:-3.1,lon:-60.02,pt:123}]}),{status:200});
    const [vehicle]=await sinetram.getRealtimeVehicles('test-live','test');
    assert.equal(vehicle.speedKmh,undefined);
    assert.equal(vehicle.crowding,undefined);
    assert.equal(vehicle.hasAirConditioning,undefined);
  } finally {globalThis.fetch=original;}
});
test('walking failure never invents street corners',async()=>{
  const original=globalThis.fetch;
  try {globalThis.fetch=async()=>{throw new Error('test offline');};
    assert.equal(await getStreetWalkingPolyline(-60,-3.1,-60.01,-3.1),null);
  } finally {globalThis.fetch=original;}
});
test('provider map links preserve the source route and trip identifiers',()=>{
  assert.equal(providerLineUrl('213t',5027640),'https://editor.mobilibus.com/web/detalhes-linha/4pc1e#213t;5027640');
  const url=new URL(googleDirectionsUrl(point(-60.1),point(-60.02)));
  assert.equal(url.searchParams.get('origin'),'-3.1,-60.1');
  assert.equal(url.searchParams.get('destination'),'-3.1,-60.02');
  assert.equal(url.searchParams.get('travelmode'),'transit');
});
