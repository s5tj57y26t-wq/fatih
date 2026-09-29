/* 20 oynanabilir ülke: ligler (2026-27 formatları), kupalar, süper kupalar, alt lig havuzları.
   Kaynak: 2026-27 sezonu için web araması ile doğrulanan takım listeleri ve formatlar (bkz. README). */
(function (G) {
  'use strict';
  const CM = G.CM;

  // wf: maaş çarpanı, tv: kulüp başına sezonluk ortalama yayın geliri (€), yl: ceza için sarı kart sınırı
  // split: normal sezon sonrası gruplara ayrılma {groups:[boyutlar], rr:[devre], halve:puanlar yarıya}
  // rel: doğrudan düşen, relPO: sondan (rel+1). takım baraj oynar, promo: doğrudan çıkan, po: play-off (sıra aralığı, çıkacak takım)
  CM.LEAGUES = {
    ENG1: { n: 'Premier League', cty: 'ENG', tier: 1, rr: 2, rel: 3, down: 'ENG2', start: '08-22', end: '05-23', wf: 2.5, tv: 150e6, yl: 5 },
    ENG2: { n: 'Sky Bet Championship', cty: 'ENG', tier: 2, rr: 2, up: 'ENG1', promo: 2, po: { from: 3, to: 6, legs: 2 }, rel: 3, pool: 'ENG3', start: '08-08', end: '05-02', wf: 0.7, tv: 10e6, yl: 5 },
    ESP1: { n: 'LALIGA EA SPORTS', cty: 'ESP', tier: 1, rr: 2, rel: 3, down: 'ESP2', start: '08-15', end: '05-23', wf: 1.8, tv: 70e6, yl: 5 },
    ESP2: { n: 'LALIGA HYPERMOTION', cty: 'ESP', tier: 2, rr: 2, up: 'ESP1', promo: 2, po: { from: 3, to: 6, legs: 2 }, rel: 4, pool: 'ESP3', start: '08-15', end: '05-30', wf: 0.45, tv: 6e6, yl: 5 },
    GER1: { n: 'Bundesliga', cty: 'GER', tier: 1, rr: 2, rel: 2, relPO: true, down: 'GER2', start: '08-28', end: '05-22', wf: 1.6, tv: 65e6, yl: 5, winter: ['12-21', '01-08'] },
    GER2: { n: '2. Bundesliga', cty: 'GER', tier: 2, rr: 2, up: 'GER1', promo: 2, upPO: true, rel: 2, relPO: true, pool: 'GER3', start: '08-07', end: '05-23', wf: 0.5, tv: 12e6, yl: 5, winter: ['12-21', '01-15'] },
    ITA1: { n: 'Serie A Enilive', cty: 'ITA', tier: 1, rr: 2, rel: 3, down: 'ITA2', start: '08-23', end: '05-30', wf: 1.6, tv: 55e6, yl: 5 },
    ITA2: { n: 'Serie BKT', cty: 'ITA', tier: 2, rr: 2, up: 'ITA1', promo: 2, po: { from: 3, to: 8, legs: 2 }, rel: 4, pool: 'ITA3', start: '08-22', end: '05-15', wf: 0.35, tv: 4e6, yl: 5 },
    FRA1: { n: "Ligue 1 McDonald's", cty: 'FRA', tier: 1, rr: 2, rel: 2, relPO: true, down: 'FRA2', start: '08-22', end: '05-22', wf: 1.3, tv: 30e6, yl: 5, winter: ['12-21', '01-03'] },
    FRA2: { n: 'Ligue 2 BKT', cty: 'FRA', tier: 2, rr: 2, up: 'FRA1', promo: 2, upPO: true, rel: 2, pool: 'FRA3', start: '08-01', end: '05-15', wf: 0.35, tv: 4e6, yl: 5 },
    TUR1: { n: 'Trendyol Süper Lig', cty: 'TUR', tier: 1, rr: 2, rel: 3, down: 'TUR2', start: '08-15', end: '05-23', wf: 1.1, tv: 15e6, yl: 4, foreign: 14, winter: ['12-27', '01-15'] },
    TUR2: { n: 'Trendyol 1. Lig', cty: 'TUR', tier: 2, rr: 2, up: 'TUR1', promo: 2, po: { from: 3, to: 6, legs: 1 }, rel: 4, pool: 'TUR3', start: '08-07', end: '05-08', wf: 0.2, tv: 1.5e6, yl: 4, winter: ['12-27', '01-15'] },
    POR1: { n: 'Liga Portugal Betclic', cty: 'POR', tier: 1, rr: 2, rel: 2, relPO: true, pool: 'POR2', start: '08-08', end: '05-23', wf: 0.7, tv: 12e6, yl: 5 },
    NED1: { n: 'VriendenLoterij Eredivisie', cty: 'NED', tier: 1, rr: 2, rel: 2, relPO: true, pool: 'NED2', start: '08-08', end: '05-16', wf: 0.6, tv: 10e6, yl: 5, winter: ['12-21', '01-10'] },
    BEL1: { n: 'Jupiler Pro League', cty: 'BEL', tier: 1, rr: 2, rel: 2, pool: 'BEL2', start: '07-25', end: '05-16', wf: 0.5, tv: 8e6, yl: 5 },
    SCO1: { n: 'William Hill Premiership', cty: 'SCO', tier: 1, rr: 3, split: { groups: [6, 6], rr: [1, 1] }, rel: 1, relPO: true, pool: 'SCO2', start: '07-31', end: '05-16', wf: 0.45, tv: 5e6, yl: 5 },
    AUT1: { n: 'ADMIRAL Bundesliga', cty: 'AUT', tier: 1, rr: 2, split: { groups: [6, 6], rr: [2, 2], halve: true }, rel: 1, pool: 'AUT2', start: '07-31', end: '05-23', wf: 0.45, tv: 4e6, yl: 5, winter: ['12-14', '02-05'] },
    SUI1: { n: 'Super League', cty: 'SUI', tier: 1, rr: 3, split: { groups: [6, 6], rr: [1, 1] }, rel: 1, relPO: true, pool: 'SUI2', start: '07-25', end: '05-23', wf: 0.55, tv: 4e6, yl: 4, winter: ['12-20', '01-24'] },
    GRE1: { n: 'Stoiximan Super League', cty: 'GRE', tier: 1, rr: 2, split: { groups: [4, 4, 6], rr: [2, 2, 1] }, rel: 2, pool: 'GRE2', start: '08-22', end: '05-23', wf: 0.5, tv: 5e6, yl: 5 },
    CZE1: { n: 'Chance Liga', cty: 'CZE', tier: 1, rr: 2, split: { groups: [6, 4, 6], rr: [1, 1, 1] }, rel: 1, relPO: true, pool: 'CZE2', start: '07-25', end: '05-23', wf: 0.35, tv: 3e6, yl: 5, winter: ['12-14', '02-05'] },
    DEN1: { n: '3F Superliga', cty: 'DEN', tier: 1, rr: 2, split: { groups: [6, 6], rr: [2, 2] }, rel: 2, pool: 'DEN2', start: '07-24', end: '05-30', wf: 0.45, tv: 4e6, yl: 5, winter: ['12-07', '02-12'] },
    POL1: { n: 'PKO BP Ekstraklasa', cty: 'POL', tier: 1, rr: 2, rel: 3, pool: 'POL2', start: '07-24', end: '05-23', wf: 0.4, tv: 5e6, yl: 4, winter: ['12-14', '01-30'] },
    CRO1: { n: 'SuperSport HNL', cty: 'CRO', tier: 1, rr: 4, rel: 1, pool: 'CRO2', start: '07-31', end: '05-23', wf: 0.3, tv: 2e6, yl: 5, winter: ['12-21', '01-24'] },
    SRB1: { n: 'Mozzart Bet Superliga', cty: 'SRB', tier: 1, rr: 2, split: { groups: [7, 7], rr: [1, 1] }, rel: 4, pool: 'SRB2', start: '07-25', end: '05-23', wf: 0.25, tv: 2e6, yl: 4, winter: ['12-14', '02-05'] },
    UKR1: { n: 'Ukrayna Premier Ligi', cty: 'UKR', tier: 1, rr: 2, rel: 2, relPO: true, pool: 'UKR2', start: '08-01', end: '05-30', wf: 0.25, tv: 2e6, yl: 4, winter: ['12-12', '02-25'] },
    KSA1: { n: 'Roshn Saudi League', cty: 'KSA', tier: 1, rr: 2, rel: 3, pool: 'KSA2', start: '08-27', end: '05-27', wf: 3.0, tv: 15e6, yl: 4, foreign: 10 }
  };

  // Ülkeler: ad, ligler, kupa ve süper kupa, 2026 UEFA ülke puanı (başlangıç)
  CM.COUNTRIES = {
    ENG: { leagues: ['ENG1', 'ENG2'], cup: { n: 'Emirates FA Cup', sh: 'FA Cup', final: '05-15', venue: 'Wembley', sfLegs: 1 }, lcup: { n: 'Carabao Cup', sh: 'Lig Kupası', final: '03-14', venue: 'Wembley', sfLegs: 2 }, sup: { n: 'FA Community Shield', size: 2, when: 'aug' }, coef: 115.196 },
    ESP: { leagues: ['ESP1', 'ESP2'], cup: { n: 'Copa del Rey', sh: 'Kral Kupası', final: '04-17', venue: 'La Cartuja', sfLegs: 2 }, sup: { n: 'Supercopa de España', size: 4, when: 'jan' }, coef: 94.453 },
    GER: { leagues: ['GER1', 'GER2'], cup: { n: 'DFB-Pokal', sh: 'Almanya Kupası', final: '05-29', venue: 'Olympiastadion Berlin', sfLegs: 1 }, sup: { n: 'Franz Beckenbauer Supercup', size: 2, when: 'aug' }, coef: 86.331 },
    ITA: { leagues: ['ITA1', 'ITA2'], cup: { n: 'Coppa Italia Frecciarossa', sh: 'İtalya Kupası', final: '05-12', venue: 'Stadio Olimpico', sfLegs: 2 }, sup: { n: 'EA Sports FC Supercup', size: 4, when: 'jan' }, coef: 97.231 },
    FRA: { leagues: ['FRA1', 'FRA2'], cup: { n: 'Coupe de France', sh: 'Fransa Kupası', final: '05-08', venue: 'Stade de France', sfLegs: 1 }, sup: { n: 'Trophée des Champions', size: 2, when: 'jan' }, coef: 73.093 },
    TUR: { leagues: ['TUR1', 'TUR2'], cup: { n: 'Ziraat Türkiye Kupası', sh: 'ZTK', final: '05-13', venue: 'Final stadı', sfLegs: 2 }, sup: { n: 'Turkcell Süper Kupa', size: 4, when: 'jan' }, coef: 43.9 },
    POR: { leagues: ['POR1'], cup: { n: 'Taça de Portugal', sh: 'Portekiz Kupası', final: '05-30', venue: 'Estádio Nacional (Jamor)', sfLegs: 2 }, sup: { n: 'Supertaça Cândido de Oliveira', size: 2, when: 'aug' }, coef: 62.266 },
    NED: { leagues: ['NED1'], cup: { n: 'KNVB Beker', sh: 'Hollanda Kupası', final: '04-18', venue: 'De Kuip', sfLegs: 1 }, sup: { n: 'Johan Cruijff Schaal', size: 2, when: 'aug' }, coef: 67.15 },
    BEL: { leagues: ['BEL1'], cup: { n: 'Croky Cup', sh: 'Belçika Kupası', final: '05-13', venue: 'Koning Boudewijnstadion', sfLegs: 2 }, sup: null, coef: 56.85 },
    SCO: { leagues: ['SCO1'], cup: { n: 'Scottish Cup', sh: 'İskoçya Kupası', final: '05-22', venue: 'Hampden Park', sfLegs: 1 }, sup: null, coef: 31 },
    AUT: { leagues: ['AUT1'], cup: { n: 'UNIQA ÖFB Cup', sh: 'Avusturya Kupası', final: '05-01', venue: 'Wörthersee Stadion', sfLegs: 1 }, sup: null, coef: 32 },
    SUI: { leagues: ['SUI1'], cup: { n: 'Schweizer Cup', sh: 'İsviçre Kupası', final: '05-16', venue: 'Wankdorf', sfLegs: 1 }, sup: null, coef: 33 },
    GRE: { leagues: ['GRE1'], cup: { n: 'Betsson Greek Cup', sh: 'Yunanistan Kupası', final: '05-08', venue: 'OAKA', sfLegs: 2 }, sup: null, coef: 36 },
    CZE: { leagues: ['CZE1'], cup: { n: 'MOL Cup', sh: 'Çekya Kupası', final: '05-13', venue: 'Final stadı', sfLegs: 1 }, sup: null, coef: 44.1 },
    DEN: { leagues: ['DEN1'], cup: { n: 'Oddset Pokalen', sh: 'Danimarka Kupası', final: '05-13', venue: 'Parken', sfLegs: 2 }, sup: null, coef: 34 },
    POL: { leagues: ['POL1'], cup: { n: 'Puchar Polski', sh: 'Polonya Kupası', final: '05-02', venue: 'PGE Narodowy', sfLegs: 1 }, sup: null, coef: 35 },
    CRO: { leagues: ['CRO1'], cup: { n: 'SuperSport Hrvatski kup', sh: 'Hırvatistan Kupası', final: '05-26', venue: 'Final stadı', sfLegs: 1 }, sup: null, coef: 25 },
    SRB: { leagues: ['SRB1'], cup: { n: 'Kup Srbije', sh: 'Sırbistan Kupası', final: '05-19', venue: 'Final stadı', sfLegs: 1 }, sup: null, coef: 25 },
    UKR: { leagues: ['UKR1'], cup: { n: 'Kubok Ukrainy', sh: 'Ukrayna Kupası', final: '05-19', venue: 'Final stadı', sfLegs: 1 }, sup: null, coef: 24 },
    KSA: { leagues: ['KSA1'], cup: { n: "King's Cup", sh: 'Kral Kupası', final: '05-02', venue: 'King Abdullah Sports City', sfLegs: 1 }, sup: { n: 'Saudi Super Cup', size: 4, when: 'aug' }, coef: 0, afc: true }
  };

  // Modellenmeyen alt ligler için havuz (gerçek kulüp adları, kadrolar kurgusal oluşturulur)
  CM.POOLS = {
    ENG3: ['Oxford United', 'Leicester City', 'Sheffield Wednesday', 'Luton Town', 'Reading', 'Wigan Athletic', 'Barnsley', 'Peterborough United', 'Huddersfield Town', 'Bradford City', 'Stockport County', 'Plymouth Argyle', 'Blackpool', 'Rotherham United'],
    ESP3: ['CD Mirandés', 'SD Huesca', 'Cultural Leonesa', 'Real Zaragoza', 'Real Murcia', 'Hércules CF', 'Racing Ferrol', 'Gimnàstic de Tarragona', 'SD Ponferradina', 'CD Lugo'],
    GER3: ['Fortuna Düsseldorf', 'Preußen Münster', 'TSV 1860 München', 'SV Waldhof Mannheim', 'FC Ingolstadt 04', 'Rot-Weiss Essen', 'Hansa Rostock', 'Erzgebirge Aue', 'SC Verl', 'Alemannia Aachen'],
    ITA3: ['Bari', 'Reggiana', 'Spezia', 'Pescara', 'Cosenza', 'Cittadella', 'Brescia', 'Triestina', 'Ternana', 'Perugia'],
    FRA3: ['Amiens SC', 'SC Bastia', 'FC Martigues', 'US Orléans', 'Valenciennes FC', 'FC Rouen 1899', 'Stade Briochin', 'Nîmes Olympique', 'Châteauroux', 'Le Puy Foot'],
    TUR3: ['Adana Demirspor', 'Hatayspor', 'Sakaryaspor', 'Serik Belediyespor', 'Altınordu', 'Şanlıurfaspor', 'Tuzlaspor', 'Giresunspor', 'Kırklarelispor', '24 Erzincanspor', 'Menemen FK', 'Karşıyaka'],
    POR2: ['AVS Futebol SAD', 'CD Tondela', 'CD Feirense', 'Leixões SC', 'FC Penafiel', 'GD Chaves', 'FC Vizela', 'SC Farense', 'Portimonense SC', 'UD Oliveirense'],
    NED2: ['FC Volendam', 'NAC Breda', 'Heracles Almelo', 'Roda JC', 'De Graafschap', 'FC Den Bosch', 'RKC Waalwijk', 'Almere City', 'FC Emmen', 'FC Dordrecht'],
    BEL2: ['FCV Dender EH', 'RWD Molenbeek', 'KAS Eupen', 'Patro Eisden', 'Lierse Kempenzonen', 'RFC Seraing', 'Francs Borains', 'K Beerschot VA'],
    SCO2: ['Livingston', 'Ross County', 'Partick Thistle', 'Ayr United', 'Dunfermline Athletic', 'Raith Rovers', "Queen's Park", 'Greenock Morton'],
    AUT2: ['FC Blau-Weiß Linz', 'FC Admira Wacker', 'SKN St. Pölten', 'SK Austria Klagenfurt', 'SV Horn', 'Kapfenberger SV'],
    SUI2: ['FC Winterthur', 'FC Aarau', 'Neuchâtel Xamax', 'FC Wil 1900', 'Stade Lausanne-Ouchy', 'FC Schaffhausen', 'Yverdon-Sport', 'Étoile Carouge'],
    GRE2: ['AEL Larissa', 'Panserraikos', 'PAS Lamia', 'PAS Giannina', 'Athens Kallithea', 'Ionikos', 'AO Chania', 'Niki Volos'],
    CZE2: ['FK Dukla Praha', 'MFK Karviná', 'SK Líšeň', 'MFK Vyškov', 'FC Silon Táborsko', 'AFK Chrudim', 'SFC Opava', 'FK Příbram'],
    DEN2: ['Vejle Boldklub', 'FC Fredericia', 'Hvidovre IF', 'HB Køge', 'Kolding IF', 'Hillerød Fodbold', 'Esbjerg fB', 'AaB'],
    POL2: ['Lechia Gdańsk', 'Arka Gdynia', 'Bruk-Bet Termalica Nieciecza', 'Ruch Chorzów', 'Stal Mielec', 'Puszcza Niepołomice', 'Miedź Legnica', 'Polonia Warszawa'],
    CRO2: ['HNK Vukovar 1991', 'HNK Šibenik', 'HNK Cibalia', 'NK Dubrava', 'HNK Orijent 1919', 'NK Jarun', 'NK Hrvatski dragovoljac'],
    SRB2: ['FK Napredak Kruševac', 'FK Javor Ivanjica', 'FK Spartak Subotica', 'FK TSC Bačka Topola', 'FK Grafičar', 'FK Jedinstvo Ub', 'FK Inđija'],
    UKR2: ['SC Poltava', 'FC Rukh Lviv', 'FC Oleksandriya', 'FC Metalist Kharkiv', 'FC Inhulets', 'FC Vorskla Poltava', 'FC Nyva Ternopil'],
    KSA2: ['Al-Najma', 'Damac', 'Al-Okhdood', 'Al-Wehda', 'Al-Raed', 'Al-Taee', 'Al-Orobah', 'Al-Jabalain', 'Al-Batin']
  };

  // UEFA ülke puanları: oynanabilir olmayan ülkeler (başlangıç tahmini)
  CM.UEFA_COEF_OTHER = {
    NOR: 39.687, ISR: 28, CYP: 27, SWE: 26, HUN: 22, SVK: 21, ROU: 21, SVN: 20, AZE: 20, BUL: 19, ARM: 12, FIN: 15, GIB: 9, BIH: 13,
    LVA: 11, AND: 6, LTU: 11, GEO: 12, ALB: 11, KAZ: 15, MDA: 13, ISL: 12, IRL: 12, NIR: 9, WAL: 8, KOS: 11, MKD: 9, MNE: 8,
    BLR: 12, LUX: 9, MLT: 8, EST: 8, FRO: 10, SMR: 3, LIE: 5
  };
})(typeof window !== 'undefined' ? window : globalThis);
