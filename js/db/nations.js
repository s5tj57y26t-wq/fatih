/* Ülkeler: kod -> [Türkçe ad, konfederasyon, milli takım gücü (tahmini, 2026), isim havuzu, renk1, renk2] */
(function (G) {
  'use strict';
  const CM = G.CM;
  const N = {
    // UEFA
    ESP: ['İspanya', 'UEFA', 92, 'ESP', '#c60b1e', '#ffc400'], FRA: ['Fransa', 'UEFA', 91, 'FRA', '#002395', '#ffffff'],
    ENG: ['İngiltere', 'UEFA', 90, 'ENG', '#ffffff', '#cf081f'], POR: ['Portekiz', 'UEFA', 88, 'POR', '#c8102e', '#006847'],
    GER: ['Almanya', 'UEFA', 86, 'GER', '#ffffff', '#000000'], NED: ['Hollanda', 'UEFA', 86, 'NED', '#f36c21', '#ffffff'],
    ITA: ['İtalya', 'UEFA', 84, 'ITA', '#0064aa', '#ffffff'], BEL: ['Belçika', 'UEFA', 83, 'BEL', '#e30613', '#000000'],
    CRO: ['Hırvatistan', 'UEFA', 82, 'SLS', '#ff0000', '#ffffff'], TUR: ['Türkiye', 'UEFA', 81, 'TUR', '#e30a17', '#ffffff'],
    NOR: ['Norveç', 'UEFA', 80, 'SCA', '#ba0c2f', '#00205b'], DEN: ['Danimarka', 'UEFA', 80, 'SCA', '#c8102e', '#ffffff'],
    SUI: ['İsviçre', 'UEFA', 79, 'GER', '#d52b1e', '#ffffff'], AUT: ['Avusturya', 'UEFA', 79, 'GER', '#ed2939', '#ffffff'],
    SRB: ['Sırbistan', 'UEFA', 76, 'SLS', '#c6363c', '#0c4076'], POL: ['Polonya', 'UEFA', 76, 'SLW', '#ffffff', '#dc143c'],
    UKR: ['Ukrayna', 'UEFA', 76, 'UKR', '#ffd500', '#005bbb'], CZE: ['Çekya', 'UEFA', 76, 'SLW', '#d7141a', '#11457e'],
    SWE: ['İsveç', 'UEFA', 76, 'SCA', '#fecc00', '#006aa7'], SCO: ['İskoçya', 'UEFA', 75, 'ENG', '#1c2c5b', '#ffffff'],
    HUN: ['Macaristan', 'UEFA', 75, 'HUN', '#cd2a3e', '#436f4d'], GRE: ['Yunanistan', 'UEFA', 75, 'GRE', '#0d5eaf', '#ffffff'],
    WAL: ['Galler', 'UEFA', 72, 'ENG', '#c8102e', '#00b140'], SVK: ['Slovakya', 'UEFA', 72, 'SLW', '#0b4ea2', '#ffffff'],
    SVN: ['Slovenya', 'UEFA', 72, 'SLS', '#ffffff', '#005da4'], ROU: ['Romanya', 'UEFA', 72, 'ROU', '#fcd116', '#002b7f'],
    IRL: ['İrlanda', 'UEFA', 72, 'ENG', '#169b62', '#ffffff'], GEO: ['Gürcistan', 'UEFA', 72, 'CAU', '#ffffff', '#ff0000'],
    BIH: ['Bosna-Hersek', 'UEFA', 70, 'SLS', '#002395', '#fecb00'], ALB: ['Arnavutluk', 'UEFA', 70, 'ALB', '#e41e20', '#000000'],
    NIR: ['Kuzey İrlanda', 'UEFA', 68, 'ENG', '#00843d', '#ffffff'], ISL: ['İzlanda', 'UEFA', 68, 'SCA', '#02529c', '#dc1e35'],
    FIN: ['Finlandiya', 'UEFA', 67, 'SCA', '#ffffff', '#002f6c'], ISR: ['İsrail', 'UEFA', 67, 'ISR', '#ffffff', '#0038b8'],
    MKD: ['Kuzey Makedonya', 'UEFA', 66, 'SLS', '#d20000', '#ffe600'], MNE: ['Karadağ', 'UEFA', 66, 'SLS', '#c40308', '#d4af37'],
    KOS: ['Kosova', 'UEFA', 66, 'ALB', '#244aa5', '#d0a650'], BUL: ['Bulgaristan', 'UEFA', 65, 'SLS', '#ffffff', '#00966e'],
    BLR: ['Belarus', 'UEFA', 63, 'UKR', '#c8313e', '#4aa657'], ARM: ['Ermenistan', 'UEFA', 62, 'CAU', '#d90012', '#0033a0'],
    LUX: ['Lüksemburg', 'UEFA', 62, 'FRA', '#ed2939', '#00a1de'], KAZ: ['Kazakistan', 'UEFA', 62, 'CAU', '#00afca', '#fec50c'],
    AZE: ['Azerbaycan', 'UEFA', 60, 'TUR', '#0092bc', '#e4002b'], CYP: ['Kıbrıs Rum Kesimi', 'UEFA', 60, 'GRE', '#ffffff', '#d57800'],
    EST: ['Estonya', 'UEFA', 58, 'BAL', '#0072ce', '#000000'], LVA: ['Letonya', 'UEFA', 57, 'BAL', '#9e3039', '#ffffff'],
    LTU: ['Litvanya', 'UEFA', 57, 'BAL', '#fdb913', '#006a44'], FRO: ['Faroe Adaları', 'UEFA', 56, 'SCA', '#ffffff', '#0065bd'],
    MDA: ['Moldova', 'UEFA', 55, 'ROU', '#003da5', '#ffd200'], MLT: ['Malta', 'UEFA', 52, 'ITA', '#cf142b', '#ffffff'],
    AND: ['Andorra', 'UEFA', 48, 'ESP', '#10069f', '#fedf00'], GIB: ['Cebelitarık', 'UEFA', 45, 'ENG', '#da000c', '#ffffff'],
    LIE: ['Lihtenştayn', 'UEFA', 45, 'GER', '#002b7f', '#ce1126'], SMR: ['San Marino', 'UEFA', 40, 'ITA', '#5eb6e4', '#ffffff'],
    RUS: ['Rusya', 'UEFA', 70, 'UKR', '#ffffff', '#d52b1e'],
    // CONMEBOL
    ARG: ['Arjantin', 'CONMEBOL', 91, 'ARG', '#75aadb', '#ffffff'], BRA: ['Brezilya', 'CONMEBOL', 88, 'BRA', '#ffdf00', '#009c3b'],
    URU: ['Uruguay', 'CONMEBOL', 83, 'ARG', '#5cbfeb', '#000000'], COL: ['Kolombiya', 'CONMEBOL', 83, 'LAT', '#fcd116', '#003893'],
    ECU: ['Ekvador', 'CONMEBOL', 80, 'LAT', '#ffdd00', '#034ea2'], PAR: ['Paraguay', 'CONMEBOL', 77, 'LAT', '#d52b1e', '#ffffff'],
    CHI: ['Şili', 'CONMEBOL', 74, 'LAT', '#d52b1e', '#0039a6'], VEN: ['Venezuela', 'CONMEBOL', 73, 'LAT', '#8b0000', '#ffcc00'],
    PER: ['Peru', 'CONMEBOL', 72, 'LAT', '#ffffff', '#d91023'], BOL: ['Bolivya', 'CONMEBOL', 66, 'LAT', '#007934', '#ffffff'],
    // CAF
    MAR: ['Fas', 'CAF', 85, 'ARA', '#c1272d', '#006233'], SEN: ['Senegal', 'CAF', 81, 'AFR', '#ffffff', '#00853f'],
    NGA: ['Nijerya', 'CAF', 78, 'AFR', '#008751', '#ffffff'], CIV: ['Fildişi Sahili', 'CAF', 78, 'AFR', '#ff8200', '#009a44'],
    ALG: ['Cezayir', 'CAF', 77, 'ARA', '#ffffff', '#006633'], EGY: ['Mısır', 'CAF', 76, 'ARA', '#ce1126', '#ffffff'],
    CMR: ['Kamerun', 'CAF', 75, 'AFR', '#007a5e', '#ce1126'], MLI: ['Mali', 'CAF', 75, 'AFR', '#14b53a', '#fcd116'],
    TUN: ['Tunus', 'CAF', 74, 'ARA', '#e70013', '#ffffff'], GHA: ['Gana', 'CAF', 74, 'AFR', '#ffffff', '#ce1126'],
    COD: ['DR Kongo', 'CAF', 74, 'AFR', '#007fff', '#ce1021'], RSA: ['Güney Afrika', 'CAF', 72, 'AFR', '#ffb612', '#007749'],
    BFA: ['Burkina Faso', 'CAF', 72, 'AFR', '#ef2b2d', '#009e49'], CPV: ['Yeşil Burun Adaları', 'CAF', 70, 'POR', '#003893', '#ffffff'],
    GUI: ['Gine', 'CAF', 70, 'AFR', '#ce1126', '#fcd116'], ANG: ['Angola', 'CAF', 67, 'POR', '#cc092f', '#000000'],
    GAB: ['Gabon', 'CAF', 67, 'AFR', '#fcd116', '#009e60'], ZAM: ['Zambiya', 'CAF', 66, 'AFR', '#198a00', '#ef7d00'],
    UGA: ['Uganda', 'CAF', 64, 'AFR', '#fcdc04', '#000000'], KEN: ['Kenya', 'CAF', 60, 'AFR', '#006600', '#bb0000'],
    TAN: ['Tanzanya', 'CAF', 60, 'AFR', '#1eb53a', '#00a3dd'], GAM: ['Gambiya', 'CAF', 62, 'AFR', '#ce1126', '#0c1c8c'],
    BEN: ['Benin', 'CAF', 62, 'AFR', '#008751', '#fcd116'], TOG: ['Togo', 'CAF', 58, 'AFR', '#006a4e', '#ffce00'],
    CGO: ['Kongo', 'CAF', 58, 'AFR', '#009543', '#dc241f'], GNB: ['Gine-Bissau', 'CAF', 60, 'POR', '#ce1126', '#fcd116'],
    MOZ: ['Mozambik', 'CAF', 57, 'POR', '#009a44', '#fcd116'], MTN: ['Moritanya', 'CAF', 57, 'ARA', '#00a95c', '#ffd700'],
    ZIM: ['Zimbabve', 'CAF', 55, 'AFR', '#319208', '#ffd200'], LBY: ['Libya', 'CAF', 58, 'ARA', '#000000', '#239e46'],
    EQG: ['Ekvator Ginesi', 'CAF', 58, 'AFR', '#3e9a00', '#e32118'], SLE: ['Sierra Leone', 'CAF', 55, 'AFR', '#1eb53a', '#0072c6'],
    MAD: ['Madagaskar', 'CAF', 52, 'AFR', '#fc3d32', '#007e3a'], COM: ['Komorlar', 'CAF', 52, 'ARA', '#3a75c4', '#ffffff'],
    SUD: ['Sudan', 'CAF', 54, 'ARA', '#d21034', '#007229'], NAM: ['Namibya', 'CAF', 52, 'AFR', '#003580', '#ffffff'],
    CHA: ['Çad', 'CAF', 50, 'AFR', '#002664', '#fecb00'],
    CTA: ['Orta Afrika Cumhuriyeti', 'CAF', 52, 'AFR', '#003082', '#ffce00'], BDI: ['Burundi', 'CAF', 52, 'AFR', '#ce1126', '#1eb53a'],
    DOM: ['Dominik Cumhuriyeti', 'CONCACAF', 55, 'LAT', '#002d62', '#ce1126'],
    SUR: ['Surinam', 'CONCACAF', 60, 'NED', '#377e3f', '#b40a2d'], GUA: ['Guatemala', 'CONCACAF', 60, 'LAT', '#4997d0', '#ffffff'],
    // AFC
    JPN: ['Japonya', 'AFC', 84, 'JPN', '#000555', '#ffffff'], KOR: ['Güney Kore', 'AFC', 80, 'KOR', '#c60c30', '#ffffff'],
    IRN: ['İran', 'AFC', 78, 'IRN', '#ffffff', '#da0000'], AUS: ['Avustralya', 'AFC', 77, 'ENG', '#ffcd00', '#00843d'],
    KSA: ['Suudi Arabistan', 'AFC', 72, 'ARA', '#ffffff', '#006c35'], UZB: ['Özbekistan', 'AFC', 72, 'CAU', '#ffffff', '#0099b5'],
    QAT: ['Katar', 'AFC', 70, 'ARA', '#8a1538', '#ffffff'], IRQ: ['Irak', 'AFC', 70, 'ARA', '#ffffff', '#007a3d'],
    JOR: ['Ürdün', 'AFC', 70, 'ARA', '#ffffff', '#ce1126'], UAE: ['BAE', 'AFC', 68, 'ARA', '#ffffff', '#00732f'],
    OMA: ['Umman', 'AFC', 64, 'ARA', '#db161b', '#ffffff'], BHR: ['Bahreyn', 'AFC', 63, 'ARA', '#ce1126', '#ffffff'],
    CHN: ['Çin', 'AFC', 64, 'ASI', '#de2910', '#ffde00'], SYR: ['Suriye', 'AFC', 62, 'ARA', '#ce1126', '#ffffff'],
    PLE: ['Filistin', 'AFC', 60, 'ARA', '#000000', '#007a3d'], THA: ['Tayland', 'AFC', 60, 'ASI', '#2d2a4a', '#a51931'],
    VIE: ['Vietnam', 'AFC', 58, 'ASI', '#da251d', '#ffff00'], IDN: ['Endonezya', 'AFC', 60, 'ASI', '#ff0000', '#ffffff'],
    // CONCACAF
    USA: ['ABD', 'CONCACAF', 80, 'ENG', '#ffffff', '#002868'], MEX: ['Meksika', 'CONCACAF', 80, 'LAT', '#006847', '#ffffff'],
    CAN: ['Kanada', 'CONCACAF', 78, 'ENG', '#d80621', '#ffffff'], PAN: ['Panama', 'CONCACAF', 72, 'LAT', '#d21034', '#ffffff'],
    CRC: ['Kosta Rika', 'CONCACAF', 70, 'LAT', '#ce1126', '#002b7f'], JAM: ['Jamaika', 'CONCACAF', 68, 'ENG', '#fed100', '#009b3a'],
    HON: ['Honduras', 'CONCACAF', 66, 'LAT', '#ffffff', '#0073cf'], HAI: ['Haiti', 'CONCACAF', 64, 'FRA', '#00209f', '#d21034'],
    CUW: ['Curaçao', 'CONCACAF', 64, 'NED', '#002b7f', '#f9e814'], SLV: ['El Salvador', 'CONCACAF', 60, 'LAT', '#0f47af', '#ffffff'],
    TRI: ['Trinidad ve Tobago', 'CONCACAF', 60, 'ENG', '#ce1126', '#000000'],
    // OFC
    NZL: ['Yeni Zelanda', 'OFC', 65, 'ENG', '#ffffff', '#000000']
  };
  CM.DB.nations = {};
  for (const k in N) {
    const v = N[k];
    CM.DB.nations[k] = { code: k, n: v[0], conf: v[1], str: v[2], pool: v[3], c1: v[4], c2: v[5] };
  }
})(typeof window !== 'undefined' ? window : globalThis);
