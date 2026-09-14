export interface CatalogRoute {
  id: string;
  code: string;
  name: string;
  category: 'troncal' | 'alimentadora' | 'circular' | 'interbairros' | 'convencional';
  color: string;
}

/**
 * Catálogo Canônico Oficial com TODAS as 238 Linhas Reais do Sistema de Transporte de Manaus
 * Extraído diretamente da API do Mobilibus / Sinetram
 */
export const MANAUS_OFFICIAL_CATALOG: CatalogRoute[] = [
  {
    "id": "20vd",
    "code": "001",
    "name": "001 - Interbairros I",
    "category": "interbairros",
    "color": "#D97706"
  },
  {
    "id": "20ve",
    "code": "002",
    "name": "002 - Interbairros II",
    "category": "interbairros",
    "color": "#D97706"
  },
  {
    "id": "ull0",
    "code": "003",
    "name": "003 - T7/ Campo Sales",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "20vg",
    "code": "004",
    "name": "004 - Circular / Educandos / T2 / Centro",
    "category": "circular",
    "color": "#7C3AED"
  },
  {
    "id": "20vh",
    "code": "005",
    "name": "005 - Vivenda Verde / T7",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "e01n",
    "code": "006",
    "name": "006 - E2 / Alvorada/ Cetur",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "6l8a",
    "code": "007",
    "name": "007 - Integração / UFAM",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "20vi",
    "code": "008",
    "name": "008 - Compensa / Efigênio Salles / São José / T5",
    "category": "interbairros",
    "color": "#D97706"
  },
  {
    "id": "20vf",
    "code": "009",
    "name": "009 - Marina Tauá / Rio Bello",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8eo",
    "code": "010",
    "name": "010 - Norte-Sul / Educandos / T2 / Cachoeirinha",
    "category": "circular",
    "color": "#7C3AED"
  },
  {
    "id": "aquk",
    "code": "011",
    "name": "011 - Balneários / Vivenda Verde / E3-E2-E1 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "k1qg",
    "code": "012",
    "name": "012 - Vivenda Verde / Ponta Negra / E2",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "20vl",
    "code": "013",
    "name": "013 - Compensa / T2 / Cachoeirinha",
    "category": "circular",
    "color": "#7C3AED"
  },
  {
    "id": "20vm",
    "code": "014",
    "name": "014 - Grande Circular / Estrada do Aleixo / T3 / T4",
    "category": "circular",
    "color": "#7C3AED"
  },
  {
    "id": "20vn",
    "code": "016",
    "name": "016 - Grande Circular / Av. André Araújo / T3 / T4",
    "category": "circular",
    "color": "#7C3AED"
  },
  {
    "id": "ihp1",
    "code": "017",
    "name": "017 - Jorge Teixeira / Com. Uberê",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "7u11",
    "code": "019",
    "name": "019 - E1 / São Jorge / Compensa",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "k78i",
    "code": "020",
    "name": "020 - T7 / Comunidade São João",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "k78m",
    "code": "021",
    "name": "021 - T7 / Ramal Pau Rosa",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "k7eb",
    "code": "022",
    "name": "022 - T7 / Com. Acará / Cj Viver Melhor",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "k7ec",
    "code": "023",
    "name": "023 - T7 / Cj Viver Melhor IV / Via Norte",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "jnbk",
    "code": "024",
    "name": "024 - T7 / Paraíso Novo",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vo",
    "code": "026",
    "name": "026 - T3 / Nilton Lins / Pq. das Laranjeiras",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "8h62",
    "code": "027",
    "name": "027 - T3 / Com. Acará",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vp",
    "code": "028",
    "name": "028 - Cj. Viver Melhor / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vq",
    "code": "029",
    "name": "029 - União da Vitória / Pq. Sta. Etelvina / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vu",
    "code": "033",
    "name": "033 - Com. Santa Cruz / Parque das Nações / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vv",
    "code": "034",
    "name": "034 - Shopping Via Norte / Terra Nova / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2100",
    "code": "035",
    "name": "035 - T3 / Mundo Novo / São Judas Tadeu",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2102",
    "code": "037",
    "name": "037 - T3 / Riacho Doce / Núcleo 11",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2103",
    "code": "038",
    "name": "038 - Lago Azul / T7",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2104",
    "code": "039",
    "name": "039 - Núcleo 12 / Núcleo 15 / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "b8ep",
    "code": "040",
    "name": "040 - T3 / Riacho Doce / Campo Dourado",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2106",
    "code": "041",
    "name": "041 - Cj. Viver Melhor / Av. das Flores / Nova Cidade / T4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2107",
    "code": "042",
    "name": "042 - Nova Cidade / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2108",
    "code": "043",
    "name": "043 - Novo Aleixo / Pq. das Garças / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2109",
    "code": "044",
    "name": "044 - Cj. Viver Melhor / Shopping Via Norte / T4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210a",
    "code": "045",
    "name": "045 - Amazonino Mendes / Via Perimetral Norte / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210b",
    "code": "046",
    "name": "046 - Cj. Canaranas / Vila Real / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210c",
    "code": "047",
    "name": "047 - Amazonino Mendes / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210d",
    "code": "048",
    "name": "048 - Aliança com Deus / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210e",
    "code": "049",
    "name": "049 - Amazonino Mendes / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210f",
    "code": "050",
    "name": "050 - Amazonino Mendes / Núcleo 23 / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210g",
    "code": "051",
    "name": "051 - Shopping Via Norte / Monte Pascoal / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210h",
    "code": "052",
    "name": "052 - Cidade de Deus / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210i",
    "code": "053",
    "name": "053 - T3 / T4 / Gustavo Nascimento",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "b8eq",
    "code": "054",
    "name": "054 - T3 / Nova Cidade / Com. Raio de Sol",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "b8f0",
    "code": "055",
    "name": "055 - T3 / Novo Israel / Jesus Me Deu / Viver Melhor IV",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210l",
    "code": "056",
    "name": "056 - Cj. Manôa / Monte Sinai / T3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "1108e",
    "code": "061",
    "name": "061 - T4/ Av. Tambaqui / R. Alfazema",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210p",
    "code": "062",
    "name": "062 - T4 / Jorge Teixeira",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210r",
    "code": "064",
    "name": "064 - T4 / Santa Inês",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210s",
    "code": "065",
    "name": "065 - T4 / Cidade de Deus / Valparaíso",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210t",
    "code": "066",
    "name": "066 - T4 / Brasileirinho",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210u",
    "code": "067",
    "name": "067 - Cj. Canaranas / Alfredo Nascimento / T4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210v",
    "code": "068",
    "name": "068 - Areal do Mindú / T4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2110",
    "code": "069",
    "name": "069 - T4 / Cidade de Deus / Aliança com Deus",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "u1as",
    "code": "070",
    "name": "070 - T4 / Val Paraíso / Ramal do Jambo",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2111",
    "code": "072",
    "name": "072 - T5 / São José II / Colina do Aleixo",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "b8ek",
    "code": "073",
    "name": "073 - T5 / Colônia Japonesa / Cj. Tiradentes / Av. das Torres",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "10fvn",
    "code": "074",
    "name": "074 - Terminal 5 / São José",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2113",
    "code": "080",
    "name": "080 - T5 / Armando Mendes / Via Zumbi II",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2114",
    "code": "081",
    "name": "081 - T5 / Cj. Castanheira / Nova Luz",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2115",
    "code": "082",
    "name": "082 - T5 / Zumbi III",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "v0ki",
    "code": "083",
    "name": "083 - T5 / Palmeira do Miriti / Coração de Mãe",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2116",
    "code": "084",
    "name": "084 - T5 / Fábrica de Cimento / Cj. Lula",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2117",
    "code": "085",
    "name": "085 - T5 / Colônia Antônio Aleixo",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2118",
    "code": "086",
    "name": "086 - T5 / Puraquequara",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2119",
    "code": "088",
    "name": "088 - T5 / Grande Vitória / Cidade do Leste",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "211a",
    "code": "089",
    "name": "089 - T5 / Nova Floresta",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "211b",
    "code": "091",
    "name": "091 - T5 / São José III / Novo Reino",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "211c",
    "code": "092",
    "name": "092 - T5 / Tancredo Neves / T4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "211d",
    "code": "093",
    "name": "093 - T5 / Bela Vista",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "211e",
    "code": "094",
    "name": "094 - T5 / Nova Vitória / T4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "9g9k",
    "code": "097",
    "name": "097 - Jorge Teixeira / Grande Vitória / T5",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "ffkq",
    "code": "099",
    "name": "099 - T4 / Novo Horizonte",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "211g",
    "code": "100",
    "name": "100 - São Raimundo / T1 / Praça da Saudade / Parque 10",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211h",
    "code": "101",
    "name": "101 - São Raimundo / Glória / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211i",
    "code": "102",
    "name": "102 - Vila da Prata / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211j",
    "code": "110",
    "name": "110 - Compensa / Centro / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211k",
    "code": "111",
    "name": "111 - Santo Antônio / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211l",
    "code": "112",
    "name": "112 - Santo Antônio / Aparecida / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211m",
    "code": "113",
    "name": "113 - Compensa / Av. Brasil / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211o",
    "code": "116",
    "name": "116 - Compensa / T1 / Praça da Saudade / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211p",
    "code": "118",
    "name": "118 - Santo Agostinho / São Jorge / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211q",
    "code": "119",
    "name": "119 - Vila Marinho / Compensa / Oscar Borel / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211r",
    "code": "120",
    "name": "120 - Ponta Negra / Av. São Jorge / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211s",
    "code": "121",
    "name": "121 - Vila Marinho / Rua Amazonas / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211t",
    "code": "122",
    "name": "122 - Santo Agostinho / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "211u",
    "code": "123",
    "name": "123 - Santo Agostinho / Av. Djalma Batista / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2120",
    "code": "125",
    "name": "125 - Campus Universitário / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2121",
    "code": "126",
    "name": "126 - Sipam / Avenida Brasil / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2122",
    "code": "127",
    "name": "127 - Santo Agostinho / Avenida Rio Negro / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2123",
    "code": "128",
    "name": "128 - Santo Agostinho / Alvorada / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2124",
    "code": "129",
    "name": "129 - Transportuária / Centro / Educandos / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "hfks",
    "code": "130",
    "name": "130 - Sipam / Av Brasil / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2127",
    "code": "203",
    "name": "203 - Bairro da Paz / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2129",
    "code": "205",
    "name": "205 - Planalto / Cj. Flamanal / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212b",
    "code": "207",
    "name": "207 - Redenção / Pedro Teixeira / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212d",
    "code": "209",
    "name": "209 - Ajuricaba / Raimundo Parente / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212f",
    "code": "211",
    "name": "211 - Augusto Montenegro / Av. São Jorge / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212g",
    "code": "212",
    "name": "212 - Jardim Versalles / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212h",
    "code": "213",
    "name": "213 - Augusto Montenegro / AV. Efigênio Salles / E2 / BR-319",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212i",
    "code": "214",
    "name": "214 - Cj. Hiléia / Dom Pedro / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212j",
    "code": "215",
    "name": "215 - Bairro da Paz / E2 / Aleixo / BR-319 / Distrito Industrial",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8es",
    "code": "216",
    "name": "216 - Augusto Montenegro / Lírio do Vale / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212l",
    "code": "217",
    "name": "217 - Bairro da Paz / Redenção / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212m",
    "code": "219",
    "name": "219 - Augusto Montenegro / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212n",
    "code": "221",
    "name": "221 - Nova Esperança / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212p",
    "code": "223",
    "name": "223 - Nova Esperança / Augusto Montenegro / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212r",
    "code": "227",
    "name": "227 - Alvorada III / E2 / Av. Djalma Batista / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212s",
    "code": "300",
    "name": "300 - Expresso Norte - T4/ T3/ Plataforma Manôa/ E4 / E3 /E2 / Fametro/ E1/ T1",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "b8er",
    "code": "302",
    "name": "302 - Centro / T1 / E1-E2-E3/ Fazenda Esperança/ Ramal Cueiras",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "212v",
    "code": "304",
    "name": "304 - Cj. Manôa / T3 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8ei",
    "code": "305",
    "name": "305 - Ponte Bolívia / KM-30 / KM-41 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8ev",
    "code": "306",
    "name": "306 - Aeroporto / Tarumã / E2 / E1 / E3 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2134",
    "code": "315",
    "name": "315 - Santa Etelvina / Samaúma / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2138",
    "code": "319",
    "name": "319 - Cj. João Paulo / Renato Sousa Pinto / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2139",
    "code": "320",
    "name": "320 - União da Vitória / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213a",
    "code": "321",
    "name": "321 - São João / BR-174 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213b",
    "code": "323",
    "name": "323 - União da Vitória / T7",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213c",
    "code": "324",
    "name": "324 - São Pedro / Av. Torquato Tapajós / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213g",
    "code": "329",
    "name": "329 - Com. Vitória Régia / Parque 10 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213h",
    "code": "330",
    "name": "330 - Lago Azul / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2b68",
    "code": "340",
    "name": "340 - T7 / E3-E2-E1 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2137",
    "code": "341",
    "name": "341 - T7 / E3 / AV. Mário Ypiranga / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213s",
    "code": "342",
    "name": "342 - T7 / E4 / T3 / Cidade Nova",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "216b",
    "code": "343",
    "name": "343 - T7 / Av Turismo / Ponta Negra",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213i",
    "code": "350",
    "name": "350 - T3 / Pq. das Laranjeiras / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213k",
    "code": "352",
    "name": "352 - T3 / T4 / Campus Universitário",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "jvbq",
    "code": "354",
    "name": "354 - Cj. Viver Melhor / Av Turismo / Ponta Negra",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8en",
    "code": "355",
    "name": "355 - T7 / Via Norte / C. Deus / T4 / T5 / Distrito",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213m",
    "code": "356",
    "name": "356 - Cj. Viver Melhor / E2 / E1 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "27mo",
    "code": "357",
    "name": "357 - Cj. Viver Melhor /  Av das Flores / E4 / E3 / T3 / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "213n",
    "code": "358",
    "name": "358 - Cj. Viver Melhor / E3 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "7vvm",
    "code": "359",
    "name": "359 - T3 / Parque 10 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213q",
    "code": "403",
    "name": "403 - Bairro da União / Parque 10 / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213t",
    "code": "409",
    "name": "409 - Jardim Primavera / Parque 10 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "213u",
    "code": "414",
    "name": "414 - Cj. Canaranas / T3 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "8phn",
    "code": "415",
    "name": "415 - T3 / E4-E3 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2140",
    "code": "418",
    "name": "418 - Oswald Américo / T3 / Ceasa",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "2141",
    "code": "422",
    "name": "422 - Oswaldo Américo / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2143",
    "code": "427",
    "name": "427 - Cj. Rio Maracanã / Av. Djalma Batista / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8ej",
    "code": "430",
    "name": "430 - Colônia Japonesa / AM-010 / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2145",
    "code": "439",
    "name": "439 - Núcleo 15 / Novo Aleixo / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2146",
    "code": "440",
    "name": "440 - Amazonino Mendes / Pq. das Laranjeiras / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2147",
    "code": "442",
    "name": "442 - T4 / Parque 10 / Av. Boulevard A. Maia / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2148",
    "code": "443",
    "name": "443 - Nova Cidade / E4-E3 / Av. Djalma Batista / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2149",
    "code": "444",
    "name": "444 - Aliança com Deus / E3-E2-E1 / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214a",
    "code": "446",
    "name": "446 - Nova Cidade / T3 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214b",
    "code": "447",
    "name": "447 - Amazonino Mendes / Aleixo / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214c",
    "code": "448",
    "name": "448 - Cidade de Deus / T3 / E4 / E2 / E1 / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "b8el",
    "code": "450",
    "name": "450 - Ponta Negra / Redenção / T3 / Núcleo 5",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214f",
    "code": "452",
    "name": "452 - Cj. Águas Claras / Pq. das Nações / Flores / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "214g",
    "code": "454",
    "name": "454 - Colônia Santo Antônio / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214h",
    "code": "455",
    "name": "455 - Rio Piorini / Santa Marta / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214j",
    "code": "457",
    "name": "457 - T3 / Cj. Águas Claras / Japiim / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "b8em",
    "code": "458",
    "name": "458 - Shopping Via Norte / Av. das Torres / T3 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214m",
    "code": "460",
    "name": "460 - Amazonino Mendes II / Av. das Torres / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214n",
    "code": "461",
    "name": "461 - Parque das Garças /  André Araújo / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "dfqp",
    "code": "465",
    "name": "465 - T3 / Av. das Torres / Aleixo / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214o",
    "code": "500",
    "name": "500 - Novo Israel/ E3 / E2 / E1 / Passarinho / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "214p",
    "code": "502",
    "name": "502 - Parque do Idoso / Cj. Vieiralves / T1 / Centro / T2",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214q",
    "code": "507",
    "name": "507 - Adrianópolis / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214r",
    "code": "515",
    "name": "515 - Coroado / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214s",
    "code": "517",
    "name": "517 - Ouro Verde / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214t",
    "code": "519",
    "name": "519 - T5 / Cj. Tiradentes / Petrópolis / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214u",
    "code": "535",
    "name": "535 - Armando Mendes / Distrito Industrial / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "214v",
    "code": "540",
    "name": "540 - Ouro Verde / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2150",
    "code": "541",
    "name": "541 - Ouro Verde / Adrianópolis / T1 / Praça da Saudade",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2151",
    "code": "542",
    "name": "542 - Ponta Negra / T2 / Japiim / Ouro Verde",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2152",
    "code": "550",
    "name": "550 - Novo Israel / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2153",
    "code": "560",
    "name": "560 - T4 / Cidade de Deus / Nova Cidade / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "b8eu",
    "code": "600",
    "name": "600 - T4 / T5 / Aleixo / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "hflu",
    "code": "602",
    "name": "602 - T4 / T5 /  Boulevard / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2158",
    "code": "604",
    "name": "604 - Colônia Antônio Aleixo / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2159",
    "code": "605",
    "name": "605 - Betânia/ Jardim Paulista / Manauara Shopping / T2",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215a",
    "code": "606",
    "name": "606 - São Francisco / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215b",
    "code": "608",
    "name": "608 - São Sebastião / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215c",
    "code": "609",
    "name": "609 - Japiinlândia / Praça 14 / T1 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215d",
    "code": "610",
    "name": "610 - Petrópolis / Av. Borba / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215e",
    "code": "611",
    "name": "611 - Japiim II / Av. Silves / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215f",
    "code": "612",
    "name": "612 - Japiim I / Polivalente / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215h",
    "code": "616",
    "name": "616 - Campus Universitário / UFAM / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215i",
    "code": "619",
    "name": "619 - Puraquequara / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215j",
    "code": "621",
    "name": "621 - Nova Vitória / Distrito II / T2 / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215k",
    "code": "623",
    "name": "623 - Jardim Petrópolis / Av. André Araújo / Terminal 1",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215l",
    "code": "624",
    "name": "624 - Nova República / Av. Buriti / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215m",
    "code": "625",
    "name": "625 - Nova República / Educandos / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215q",
    "code": "640",
    "name": "640 - T4 / T3 / E4 / E2 / E1 / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "b8et",
    "code": "641",
    "name": "641 - T4 / Aeroporto / T3 / Ponta Negra",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "e7ap",
    "code": "642",
    "name": "642 - T3 / E4 / Av. do Turismo / Ponta Negra",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "icic",
    "code": "643",
    "name": "643 - T4 / Via Norte / Tarumã / Ponta Negra",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "215s",
    "code": "650",
    "name": "650 - T4 / T5 / Japiim / T2 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "215t",
    "code": "651",
    "name": "651 - T4 / São José Operário / Aleixo / T2 / Centro / T5",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "215u",
    "code": "652",
    "name": "652 - T4 / T5 / Efigênio Salles / T1 / Centro",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "9g9l",
    "code": "654",
    "name": "654 - T4 / Nathan Xavier / Av. Nilton Lins / Parque 10 / E2",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2160",
    "code": "671",
    "name": "671 - T5 / Parque 10 / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2161",
    "code": "672",
    "name": "672 - Expresso Leste - T5 / F. Coroado/ Cond. Eph. Salles/ AM Shopping/ Fametro/E1/T1",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "2162",
    "code": "675",
    "name": "675 - T5 / Efigênio Salles / Ponta Negra",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2163",
    "code": "676",
    "name": "676 - Valparaíso / Aleixo / Av. João Valério / Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2164",
    "code": "677",
    "name": "677 - Jorge Teixeira / Autaz Mirim / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "aal5",
    "code": "678",
    "name": "678 - Ponta Negra / Efigênio Salles / T5 / T4",
    "category": "troncal",
    "color": "#2563EB"
  },
  {
    "id": "2167",
    "code": "680",
    "name": "680 - Jorge Teixeira / Armando Mendes / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "ssl4",
    "code": "690",
    "name": "690 - T5 / Av. Manaus 2000 / Manaus Moderna/ Centro",
    "category": "convencional",
    "color": "#2563EB"
  },
  {
    "id": "2168",
    "code": "704",
    "name": "704 - Betânia / Presidente Kennedy / Centro",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "2169",
    "code": "705",
    "name": "705 - Mauazinho / Morro da Liberdade / T2 / Centro",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "216a",
    "code": "706",
    "name": "706 - Mauazinho / Panair / Colônia O. Machado / Centro",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "216c",
    "code": "708",
    "name": "708 - São Lázaro / T2 / Centro",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "216d",
    "code": "711",
    "name": "711 - Mauazinho / T2 / Centro",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "216e",
    "code": "713",
    "name": "713 - Jardim Mauá / Santa Luzia / T2 / Centro",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "216g",
    "code": "715",
    "name": "715 - Jardim Mauá / T2 / Cachoeirinha",
    "category": "convencional",
    "color": "#475569"
  },
  {
    "id": "jemq",
    "code": "A025",
    "name": "A025 - Cj Ajuricaba / E3 / Colônia Terra Nova",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vr",
    "code": "A030",
    "name": "A030 - Santa Etelvina / Monte das Oliveiras / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "20vt",
    "code": "A032",
    "name": "A032 - Itaporanga / Com. Vitória Régia / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2101",
    "code": "A036",
    "name": "A036 - Santo Agostinho / Pedro Teixeira / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "210n",
    "code": "A059",
    "name": "A059 - Pq. São Pedro / Cidadão X / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2125",
    "code": "A200",
    "name": "A200 - Dom Pedro / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2126",
    "code": "A202",
    "name": "A202 - Bairro da Paz / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2128",
    "code": "A204",
    "name": "A204 - Parque Mosaico / Planalto / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "212a",
    "code": "A206",
    "name": "A206 - Redenção / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "212c",
    "code": "A208",
    "name": "A208 - Cj. Hiléia / E3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "212e",
    "code": "A210",
    "name": "A210 - Ajuricaba / Santa Bárbara / E3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "212o",
    "code": "A222",
    "name": "A222 - Alvorada / Promorar /  E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "212q",
    "code": "A225",
    "name": "A225 - Nova Esperança / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "212t",
    "code": "A301",
    "name": "A301 - Terra Nova / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2132",
    "code": "A307",
    "name": "A307 - Santa Etelvina / E3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "k84u",
    "code": "A308",
    "name": "A308 - T7 / Santa Etelvina",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2135",
    "code": "A316",
    "name": "A316 - Campo Sales / E3 - E2 - E1 / T1 / Praça da Saudade",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "2136",
    "code": "A317",
    "name": "A317 - Cj. Cidadão XII / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "213d",
    "code": "A325",
    "name": "A325 - Com. Vitória Régia / Parque Santa Etelvina / T7",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "213e",
    "code": "A326",
    "name": "A326 - Jesus Me Deu / E3",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "213f",
    "code": "A328",
    "name": "A328 - Cj. João Paulo / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "213p",
    "code": "A402",
    "name": "A402 - Bairro da União / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "213r",
    "code": "A407",
    "name": "A407 - Jardim Primavera / Parque 10 / E2",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "k623",
    "code": "A417",
    "name": "A417 - T4 / Cj Villa Nova / Ben-Hur",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "214i",
    "code": "A456",
    "name": "A456 - E.E Samuel Benchimol / Manoa / E4",
    "category": "alimentadora",
    "color": "#059669"
  },
  {
    "id": "215n",
    "code": "A626",
    "name": "A626 - Beija-Flor / E3",
    "category": "alimentadora",
    "color": "#059669"
  }
];
