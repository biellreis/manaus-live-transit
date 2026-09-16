import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
const screens = {home:'02_inicio_home',lines:'03_linhas_catalogo',search:'05_linhas_busca_640',nearby:'06_terminais_paradas_proximas',terminals:'07_terminais_integracao_t1_t6',stations:'08_estacoes_transferencia_e1_e4',alerts:'09_alertas_transito_todos',planner:'11_planejador_viagens_como_chegar',ida:'12_rota_linha_640_ida',volta:'13_rota_linha_640_volta',journey:'20_detalhes_rota_rua_kobe_caminhada_osm'};
await mkdir('public/screens',{recursive:true});
await mkdir('public/brand',{recursive:true});
for(const [name,source] of Object.entries(screens)) {
  await sharp(`../screenshots/${source}.png`).resize({width:768}).webp({quality:86}).toFile(`public/screens/${name}.webp`);
}
// Android presentation uses only app content, excluding the iOS system bar.
await sharp('../screenshots/12_rota_linha_640_ida.png').extract({left:0,top:185,width:1206,height:2437}).resize({width:768}).webp({quality:86}).toFile('public/screens/android-route.webp');
await sharp('../client/public/ICONE-APLICATIVO.png').resize(128,128).png().toFile('public/brand/icon.png');
await copyFile('../client/public/favicon.svg','public/brand/favicon.svg');
console.log('Prepared 12 screen derivatives and brand assets. Originals preserved.');
