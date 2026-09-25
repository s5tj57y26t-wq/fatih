/* Statik veri ve yardımcılar */
(function (G) {
  'use strict';

  // Tohumlanabilir rastgele sayı üreteci (mulberry32)
  let seed = Date.now() >>> 0;
  function rand() {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function setSeed(s) { seed = s >>> 0; }
  function randInt(a, b) { return a + Math.floor(rand() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function gauss() { return (rand() + rand() + rand() + rand() - 2) / 2; }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const FIRST_NAMES = ['Ahmet', 'Mehmet', 'Mustafa', 'Emre', 'Burak', 'Arda', 'Hakan', 'Serkan', 'Volkan', 'Onur',
    'Caner', 'Ozan', 'Kerem', 'Cenk', 'Umut', 'Yusuf', 'Ömer', 'Barış', 'Tolga', 'Sinan', 'Gökhan', 'Selçuk',
    'Tuncay', 'Rüştü', 'Alpay', 'Bülent', 'Ergün', 'Hasan', 'Oğuzhan', 'Deniz', 'Kaan', 'Berk', 'Efe', 'Mert',
    'Cem', 'Uğur', 'Engin', 'Fatih', 'İlhan', 'Nihat', 'Okan', 'Tayfun', 'Yasin', 'Zafer', 'Murat', 'Ali',
    'Can', 'Enes', 'Halil', 'İsmail', 'Kadir', 'Levent', 'Orhan', 'Salih', 'Taner', 'Veli', 'Ferhat', 'Erkan'];
  const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın',
    'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat',
    'Erdem', 'Korkmaz', 'Güneş', 'Aksoy', 'Tekin', 'Bulut', 'Ünal', 'Başaran', 'Tunç', 'Akın', 'Keskin', 'Durmaz',
    'Sarı', 'Uysal', 'Gül', 'Ateş', 'Bozkurt', 'Karaca', 'Taş', 'Erol', 'Toprak', 'Ekinci', 'Sezer', 'Uçar',
    'Altıntop', 'Akgün', 'Balcı', 'Coşkun', 'Duman', 'Esen', 'Gündoğdu', 'Işık', 'Kaplan', 'Oral', 'Tuna'];
  const FOREIGN = [
    ['BRA', ['Rodrigo', 'Marcelo', 'Fábio', 'Júnior', 'Anderson', 'Thiago', 'Diego'], ['Silva', 'Souza', 'Santos', 'Oliveira', 'Pereira', 'Costa', 'Ribeiro']],
    ['ARG', ['Martín', 'Pablo', 'Javier', 'Santiago', 'Lucas'], ['González', 'Fernández', 'López', 'Romero', 'Díaz', 'Álvarez']],
    ['NGA', ['Emeka', 'Chidi', 'Victor', 'Samuel', 'Obinna'], ['Okafor', 'Eze', 'Nwosu', 'Adeyemi', 'Obi']],
    ['CRO', ['Ivan', 'Luka', 'Marko', 'Ante', 'Josip'], ['Kovač', 'Horvat', 'Babić', 'Jurić', 'Marić']],
    ['GER', ['Stefan', 'Jens', 'Tobias', 'Markus', 'Florian'], ['Müller', 'Schmidt', 'Wagner', 'Becker', 'Hoffmann']],
    ['POR', ['João', 'Nuno', 'Rui', 'Tiago', 'Bruno'], ['Ferreira', 'Carvalho', 'Gomes', 'Martins', 'Rocha']],
    ['SEN', ['Moussa', 'Cheikh', 'Ibrahima', 'Pape'], ['Diop', 'Ndiaye', 'Sow', 'Fall', 'Cissé']],
    ['ROU', ['Gheorghe', 'Adrian', 'Florin', 'Ionuț'], ['Popescu', 'Ionescu', 'Munteanu', 'Stan']]
  ];

  // Kurgusal kulüpler: ad, kısa ad, itibar (1-100), renkler, bütçe (milyon €)
  const TEAMS = [
    ['Boğaziçi SK', 'BOĞ', 92, '#f5c400', '#b3001b', 28],
    ['Kadıköy Kanaryaları', 'KAD', 91, '#ffe600', '#0a1f5c', 26],
    ['Beşiktepe JK', 'BEŞ', 88, '#111111', '#ffffff', 22],
    ['Karadeniz FK', 'KAR', 84, '#7a1e3a', '#3fa9f5', 17],
    ['Anadolu Kartalları', 'ANA', 74, '#2a7de1', '#ffffff', 9],
    ['Başkent Gençlik', 'BAŞ', 72, '#b3001b', '#000000', 8],
    ['Ege Yıldızları', 'EGE', 70, '#1c1c8c', '#ffffff', 7],
    ['Marmara Spor', 'MAR', 68, '#0e7a3a', '#ffffff', 7],
    ['Bursa Timsahları', 'BUR', 71, '#008a45', '#ffffff', 8],
    ['Konya Bozkır', 'KON', 64, '#00873e', '#ffffff', 5],
    ['Çukurova Adana', 'ÇUK', 63, '#0055a4', '#ff7a00', 5],
    ['Kayseri Erciyes', 'KAY', 62, '#ffcc00', '#c8102e', 5],
    ['Antalya Akdeniz', 'ANT', 61, '#d50000', '#ffffff', 5],
    ['Samsun Kırmızı', 'SAM', 60, '#e30613', '#ffffff', 4],
    ['Gaziantep Şahinleri', 'GAZ', 58, '#b00020', '#111111', 4],
    ['Denizli Horozları', 'DEN', 56, '#1b1b1b', '#e2e2e2', 3],
    ['Malatya Kayısı', 'MAL', 55, '#ffd200', '#111111', 3],
    ['Sakarya Dalgası', 'SAK', 54, '#07964a', '#111111', 3]
  ];

  const POSITIONS = ['GK', 'DF', 'MF', 'FW'];
  const POS_TR = { GK: 'K', DF: 'D', MF: 'OS', FW: 'F' };
  const POS_LONG = { GK: 'Kaleci', DF: 'Defans', MF: 'Orta Saha', FW: 'Forvet' };

  const ATTRS = ['kalecilik', 'topKapma', 'markaj', 'pas', 'teknik', 'yaraticilik', 'bitiricilik', 'kafa', 'hiz', 'dayaniklilik', 'pozisyon', 'kararlilik'];
  const ATTR_TR = {
    kalecilik: 'Kalecilik', topKapma: 'Top Kapma', markaj: 'Markaj', pas: 'Pas', teknik: 'Teknik',
    yaraticilik: 'Yaratıcılık', bitiricilik: 'Bitiricilik', kafa: 'Kafa Vuruşu', hiz: 'Hız',
    dayaniklilik: 'Dayanıklılık', pozisyon: 'Pozisyon Alma', kararlilik: 'Kararlılık'
  };
  // Mevkiye göre özellik ağırlıkları
  const WEIGHTS = {
    GK: { kalecilik: 6, pozisyon: 2, kararlilik: 1, hiz: 0.5, pas: 0.5 },
    DF: { topKapma: 3, markaj: 3, kafa: 2, pozisyon: 2, hiz: 1.5, dayaniklilik: 1, kararlilik: 1, pas: 0.5 },
    MF: { pas: 3, teknik: 2, yaraticilik: 2.5, dayaniklilik: 1.5, topKapma: 1, bitiricilik: 1, hiz: 1, kararlilik: 1, pozisyon: 1 },
    FW: { bitiricilik: 3.5, hiz: 2, teknik: 2, kafa: 1.5, pozisyon: 1.5, yaraticilik: 1, kararlilik: 1 }
  };

  const FORMATIONS = {
    '4-4-2': { DF: 4, MF: 4, FW: 2 },
    '4-3-3': { DF: 4, MF: 3, FW: 3 },
    '4-5-1': { DF: 4, MF: 5, FW: 1 },
    '3-5-2': { DF: 3, MF: 5, FW: 2 },
    '5-3-2': { DF: 5, MF: 3, FW: 2 },
    '4-2-4': { DF: 4, MF: 2, FW: 4 }
  };
  const MENTALITY = {
    defans: { label: 'Defansif', att: 0.82, def: 1.18 },
    kontra: { label: 'Kontra Atak', att: 0.92, def: 1.08 },
    dengeli: { label: 'Dengeli', att: 1.0, def: 1.0 },
    hucum: { label: 'Hücum', att: 1.12, def: 0.9 },
    tamHucum: { label: 'Tam Hücum', att: 1.25, def: 0.78 }
  };
  const PASSING = {
    kisa: { label: 'Kısa Pas', mid: 1.06, chance: 0.96 },
    karisik: { label: 'Karışık', mid: 1.0, chance: 1.0 },
    uzun: { label: 'Uzun Top', mid: 0.93, chance: 1.07 }
  };
  const PRESSING = {
    dusuk: { label: 'Düşük', def: 0.97, tire: 0.8 },
    normal: { label: 'Normal', def: 1.0, tire: 1.0 },
    yuksek: { label: 'Yüksek', def: 1.06, tire: 1.35 }
  };

  G.D = {
    rand, setSeed, randInt, pick, clamp, gauss, shuffle,
    FIRST_NAMES, LAST_NAMES, FOREIGN, TEAMS, POSITIONS, POS_TR, POS_LONG,
    ATTRS, ATTR_TR, WEIGHTS, FORMATIONS, MENTALITY, PASSING, PRESSING
  };
})(window);
