/* Ligleri oynanabilir olmayan, yalnızca uluslararası kulüp turnuvalarında yer alan kulüpler.
   [anahtar, ad, kısa ad, ülke, renk1, renk2, itibar, konfederasyon, bölge (AFC için W/E)] */
(function (G) {
  'use strict';
  const CM = G.CM;
  const X = [
    // UEFA (2026-27 lig aşamasındaki kulüpler dahil)
    ['BOD', 'FK Bodø/Glimt', 'BOD', 'NOR', '#fcd116', '#000000', 74, 'UEFA'], ['VIK', 'Viking FK', 'VIK', 'NOR', '#003f87', '#ffffff', 64, 'UEFA'],
    ['BRN', 'SK Brann', 'BRA', 'NOR', '#e30613', '#ffffff', 63, 'UEFA'], ['LSK', 'Lillestrøm SK', 'LSK', 'NOR', '#fcd116', '#000000', 58, 'UEFA'],
    ['MOL', 'Molde FK', 'MOL', 'NOR', '#003f87', '#ffffff', 64, 'UEFA'], ['RBK', 'Rosenborg BK', 'RBK', 'NOR', '#ffffff', '#000000', 62, 'UEFA'],
    ['MFF', 'Malmö FF', 'MFF', 'SWE', '#6cabdd', '#ffffff', 66, 'UEFA'], ['MJA', 'Mjällby AIF', 'MJÄ', 'SWE', '#fcd116', '#000000', 56, 'UEFA'],
    ['DIF', 'Djurgårdens IF', 'DIF', 'SWE', '#003f87', '#6cabdd', 60, 'UEFA'], ['BKH', 'BK Häcken', 'HÄC', 'SWE', '#fcd116', '#000000', 58, 'UEFA'],
    ['AIK', 'AIK', 'AIK', 'SWE', '#000000', '#fcd116', 59, 'UEFA'], ['HAM', 'Hammarby IF', 'HAM', 'SWE', '#009639', '#ffffff', 59, 'UEFA'],
    ['SLO', 'ŠK Slovan Bratislava', 'SLO', 'SVK', '#6cabdd', '#ffffff', 64, 'UEFA'], ['TRN', 'FC Spartak Trnava', 'TRN', 'SVK', '#e30613', '#000000', 56, 'UEFA'],
    ['SAB', 'Sabah FK', 'SAB', 'AZE', '#003f87', '#ffffff', 60, 'UEFA'], ['QAR', 'Qarabağ FK', 'QAR', 'AZE', '#000000', '#ffffff', 68, 'UEFA'],
    ['FER', 'Ferencvárosi TC', 'FTC', 'HUN', '#009639', '#ffffff', 70, 'UEFA'], ['PUS', 'Puskás Akadémia', 'PUS', 'HUN', '#fcd116', '#003f87', 55, 'UEFA'],
    ['CEJ', 'NK Celje', 'CEL', 'SVN', '#003f87', '#fcd116', 60, 'UEFA'], ['OLI', 'NK Olimpija Ljubljana', 'OLI', 'SVN', '#009639', '#ffffff', 58, 'UEFA'],
    ['PAF', 'Pafos FC', 'PAF', 'CYP', '#003f87', '#ffffff', 64, 'UEFA'], ['OMO', 'AC Omonia', 'OMO', 'CYP', '#009639', '#ffffff', 62, 'UEFA'],
    ['APO', 'APOEL', 'APO', 'CYP', '#fcd116', '#003f87', 62, 'UEFA'], ['AEKL', 'AEK Larnaca', 'AEK', 'CYP', '#fcd116', '#009639', 58, 'UEFA'],
    ['MTA', 'Maccabi Tel Aviv', 'MTA', 'ISR', '#fcd116', '#003f87', 66, 'UEFA'], ['HBS', "Hapoel Be'er Sheva", 'HBS', 'ISR', '#e30613', '#ffffff', 62, 'UEFA'],
    ['MHA', 'Maccabi Haifa', 'MHA', 'ISR', '#009639', '#ffffff', 62, 'UEFA'], ['LUD', 'PFC Ludogorets Razgrad', 'LUD', 'BUL', '#009639', '#ffffff', 66, 'UEFA'],
    ['LEV', 'PFC Levski Sofia', 'LEV', 'BUL', '#003f87', '#ffffff', 58, 'UEFA'], ['CSK', 'PFC CSKA Sofia', 'CSK', 'BUL', '#e30613', '#ffffff', 58, 'UEFA'],
    ['FCSB', 'FCSB', 'FCSB', 'ROU', '#e30613', '#003f87', 64, 'UEFA'], ['UCR', 'Universitatea Craiova', 'UCV', 'ROU', '#6cabdd', '#ffffff', 60, 'UEFA'],
    ['CFR', 'CFR Cluj', 'CFR', 'ROU', '#8e1f2f', '#ffffff', 60, 'UEFA'], ['ARA', 'FC Ararat-Armenia', 'ARA', 'ARM', '#fcd116', '#003f87', 54, 'UEFA'],
    ['KUP', 'KuPS', 'KUP', 'FIN', '#fcd116', '#000000', 54, 'UEFA'], ['HJK', 'HJK Helsinki', 'HJK', 'FIN', '#003f87', '#ffffff', 56, 'UEFA'],
    ['LRI', 'Lincoln Red Imps', 'LRI', 'GIB', '#e30613', '#ffffff', 48, 'UEFA'], ['BOR', 'FK Borac Banja Luka', 'BOR', 'BIH', '#e30613', '#003f87', 54, 'UEFA'],
    ['ZRI', 'HŠK Zrinjski Mostar', 'ZRI', 'BIH', '#e30613', '#ffffff', 54, 'UEFA'], ['RIG', 'Riga FC', 'RIG', 'LVA', '#003f87', '#ffffff', 50, 'UEFA'],
    ['RFS', 'FK RFS', 'RFS', 'LVA', '#003f87', '#ffffff', 50, 'UEFA'], ['IES', 'Inter Club d\'Escaldes', 'IES', 'AND', '#003f87', '#ffffff', 42, 'UEFA'],
    ['KZA', 'FK Kauno Žalgiris', 'KŽA', 'LTU', '#009639', '#ffffff', 48, 'UEFA'], ['IBE', 'FC Iberia 1999', 'IBE', 'GEO', '#fcd116', '#e30613', 50, 'UEFA'],
    ['DTB', 'FC Dinamo Tbilisi', 'DTB', 'GEO', '#003f87', '#ffffff', 50, 'UEFA'], ['EGN', 'KF Egnatia', 'EGN', 'ALB', '#e30613', '#000000', 46, 'UEFA'],
    ['KAI', 'FC Kairat', 'KAI', 'KAZ', '#fcd116', '#000000', 56, 'UEFA'], ['AST2', 'FC Astana', 'AST', 'KAZ', '#fcd116', '#6cabdd', 56, 'UEFA'],
    ['SHE', 'FC Sheriff Tiraspol', 'SHE', 'MDA', '#fcd116', '#000000', 54, 'UEFA'], ['VIKR', 'Víkingur Reykjavík', 'VÍK', 'ISL', '#e30613', '#000000', 48, 'UEFA'],
    ['SHR', 'Shamrock Rovers', 'SHR', 'IRL', '#009639', '#ffffff', 52, 'UEFA'], ['LIN2', 'Linfield', 'LIN', 'NIR', '#003f87', '#ffffff', 46, 'UEFA'],
    ['TNS', 'The New Saints', 'TNS', 'WAL', '#009639', '#ffffff', 46, 'UEFA'], ['DRI', 'FC Drita', 'DRI', 'KOS', '#009639', '#ffffff', 46, 'UEFA'],
    ['SHK', 'KF Shkëndija', 'SHK', 'MKD', '#e30613', '#000000', 46, 'UEFA'], ['BUD', 'FK Budućnost Podgorica', 'BUD', 'MNE', '#003f87', '#ffffff', 46, 'UEFA'],
    ['DMI', 'FC Dinamo Minsk', 'DMI', 'BLR', '#003f87', '#ffffff', 50, 'UEFA'], ['DIF2', 'FC Differdange 03', 'DIF', 'LUX', '#e30613', '#ffffff', 42, 'UEFA'],
    ['HSP', 'Hamrun Spartans', 'HAM', 'MLT', '#e30613', '#000000', 42, 'UEFA'], ['FLO', 'FC Flora', 'FLO', 'EST', '#009639', '#ffffff', 44, 'UEFA'],
    ['KIK', 'KÍ Klaksvík', 'KÍ', 'FRO', '#003f87', '#ffffff', 44, 'UEFA'], ['TOR', 'SCU Torreense', 'TOR', 'POR', '#0055a4', '#ffffff', 55, 'UEFA'],
    // AFC - Batı
    ['AIN', 'Al Ain', 'AIN', 'UAE', '#5d2e8c', '#ffffff', 66, 'AFC', 'W'], ['SAA', 'Shabab Al-Ahli', 'SAA', 'UAE', '#e30613', '#000000', 65, 'AFC', 'W'],
    ['WAH', 'Al Wahda', 'WAH', 'UAE', '#8e1f2f', '#ffffff', 62, 'AFC', 'W'], ['SHJ', 'Sharjah FC', 'SHJ', 'UAE', '#e30613', '#ffffff', 61, 'AFC', 'W'],
    ['SAD', 'Al-Sadd', 'SAD', 'QAT', '#ffffff', '#000000', 66, 'AFC', 'W'], ['DUH', 'Al-Duhail', 'DUH', 'QAT', '#8e1f2f', '#ffffff', 63, 'AFC', 'W'],
    ['GHF', 'Al-Gharafa', 'GHA', 'QAT', '#fcd116', '#003f87', 61, 'AFC', 'W'], ['RAYY', 'Al-Rayyan', 'RAY', 'QAT', '#e30613', '#fcd116', 60, 'AFC', 'W'],
    ['PER', 'Persepolis', 'PER', 'IRN', '#e30613', '#ffffff', 62, 'AFC', 'W'], ['ESTQ', 'Esteghlal', 'EST', 'IRN', '#003f87', '#ffffff', 61, 'AFC', 'W'],
    ['TRC', 'Tractor', 'TRA', 'IRN', '#e30613', '#ffffff', 60, 'AFC', 'W'], ['NSF', 'Nasaf Qarshi', 'NAS', 'UZB', '#003f87', '#ffffff', 56, 'AFC', 'W'],
    ['PAK', 'Pakhtakor', 'PAK', 'UZB', '#009639', '#ffffff', 57, 'AFC', 'W'], ['SHO', 'Al-Shorta', 'SHO', 'IRQ', '#6cabdd', '#ffffff', 57, 'AFC', 'W'],
    // AFC - Doğu
    ['VIS', 'Vissel Kobe', 'VIS', 'JPN', '#8e1f2f', '#ffffff', 66, 'AFC', 'E'], ['SAN', 'Sanfrecce Hiroshima', 'SAN', 'JPN', '#5d2e8c', '#ffffff', 64, 'AFC', 'E'],
    ['KSH', 'Kashima Antlers', 'KAS', 'JPN', '#8e1f2f', '#003f87', 65, 'AFC', 'E'], ['MCZ', 'Machida Zelvia', 'MAC', 'JPN', '#003f87', '#ffffff', 62, 'AFC', 'E'],
    ['YFM', 'Yokohama F. Marinos', 'YFM', 'JPN', '#003f87', '#ffffff', 63, 'AFC', 'E'], ['KAW', 'Kawasaki Frontale', 'KAW', 'JPN', '#6cabdd', '#000000', 63, 'AFC', 'E'],
    ['ULS', 'Ulsan HD', 'ULS', 'KOR', '#003f87', '#fcd116', 64, 'AFC', 'E'], ['POH', 'Pohang Steelers', 'POH', 'KOR', '#e30613', '#000000', 61, 'AFC', 'E'],
    ['JEO', 'Jeonbuk Hyundai Motors', 'JEO', 'KOR', '#009639', '#ffffff', 64, 'AFC', 'E'], ['SEO', 'FC Seoul', 'SEO', 'KOR', '#e30613', '#000000', 61, 'AFC', 'E'],
    ['SHP', 'Shanghai Port', 'SHP', 'CHN', '#e30613', '#ffffff', 61, 'AFC', 'E'], ['SHS', 'Shanghai Shenhua', 'SHS', 'CHN', '#003f87', '#ffffff', 60, 'AFC', 'E'],
    ['CHE2', 'Chengdu Rongcheng', 'CHE', 'CHN', '#e30613', '#fcd116', 58, 'AFC', 'E'], ['MEC', 'Melbourne City', 'MEC', 'AUS', '#6cabdd', '#ffffff', 58, 'AFC', 'E'],
    ['BUR2', 'Buriram United', 'BUR', 'THA', '#003f87', '#f47920', 58, 'AFC', 'E'], ['JDT', 'Johor Darul Ta\'zim', 'JDT', 'THA', '#e30613', '#003f87', 58, 'AFC', 'E'],
    // CONMEBOL
    ['FLA', 'Flamengo', 'FLA', 'BRA', '#e30613', '#000000', 78, 'CONMEBOL'], ['PAL2', 'Palmeiras', 'PAL', 'BRA', '#009639', '#ffffff', 77, 'CONMEBOL'],
    ['BOT', 'Botafogo', 'BOT', 'BRA', '#000000', '#ffffff', 73, 'CONMEBOL'], ['FLU', 'Fluminense', 'FLU', 'BRA', '#8e1f2f', '#009639', 72, 'CONMEBOL'],
    ['CAM', 'Atlético Mineiro', 'CAM', 'BRA', '#000000', '#ffffff', 72, 'CONMEBOL'], ['CRU', 'Cruzeiro', 'CRU', 'BRA', '#003f87', '#ffffff', 71, 'CONMEBOL'],
    ['SAO', 'São Paulo', 'SAO', 'BRA', '#ffffff', '#e30613', 71, 'CONMEBOL'], ['INTB', 'Internacional', 'INT', 'BRA', '#e30613', '#ffffff', 70, 'CONMEBOL'],
    ['RIV', 'River Plate', 'RIV', 'ARG', '#ffffff', '#e30613', 76, 'CONMEBOL'], ['BOC', 'Boca Juniors', 'BOC', 'ARG', '#003f87', '#fcd116', 75, 'CONMEBOL'],
    ['RACA', 'Racing Club', 'RAC', 'ARG', '#6cabdd', '#ffffff', 71, 'CONMEBOL'], ['EST2', 'Estudiantes de La Plata', 'EST', 'ARG', '#e30613', '#ffffff', 69, 'CONMEBOL'],
    ['PEN2', 'Peñarol', 'PEÑ', 'URU', '#fcd116', '#000000', 66, 'CONMEBOL'], ['LDU', 'LDU Quito', 'LDU', 'ECU', '#ffffff', '#003f87', 66, 'CONMEBOL'],
    // CONCACAF
    ['MIA', 'Inter Miami CF', 'MIA', 'USA', '#f7b5cd', '#000000', 70, 'CONCACAF'], ['LAFC', 'Los Angeles FC', 'LAF', 'USA', '#000000', '#c39e6d', 68, 'CONCACAF'],
    ['SEA', 'Seattle Sounders FC', 'SEA', 'USA', '#5d9741', '#236192', 66, 'CONCACAF'], ['MTY', 'CF Monterrey', 'MTY', 'MEX', '#003f87', '#ffffff', 68, 'CONCACAF'],
    ['PAC', 'CF Pachuca', 'PAC', 'MEX', '#003f87', '#ffffff', 66, 'CONCACAF'], ['AME', 'Club América', 'AME', 'MEX', '#fcd116', '#003f87', 69, 'CONCACAF'],
    ['CAZ', 'Cruz Azul', 'CAZ', 'MEX', '#003f87', '#ffffff', 68, 'CONCACAF'], ['TIG', 'Tigres UANL', 'TIG', 'MEX', '#fcd116', '#003f87', 68, 'CONCACAF'],
    // CAF
    ['AHLY', 'Al Ahly', 'AHL', 'EGY', '#e30613', '#ffffff', 70, 'CAF'], ['PYR', 'Pyramids FC', 'PYR', 'EGY', '#003f87', '#ffffff', 66, 'CAF'],
    ['EST3', 'Espérance de Tunis', 'EST', 'TUN', '#e30613', '#fcd116', 65, 'CAF'], ['MSU', 'Mamelodi Sundowns', 'MSU', 'RSA', '#fcd116', '#003f87', 67, 'CAF'],
    ['WAC2', 'Wydad AC', 'WAC', 'MAR', '#e30613', '#ffffff', 64, 'CAF'], ['RSB2', 'RS Berkane', 'RSB', 'MAR', '#f47920', '#000000', 63, 'CAF'],
    // OFC
    ['AUC', 'Auckland City FC', 'AUC', 'NZL', '#003f87', '#ffffff', 48, 'OFC']
  ];
  CM.DB.extra = X.map(r => ({ id: r[0], n: r[1], sh: r[2], cty: r[3], c1: r[4], c2: r[5], rep: r[6], conf: r[7], region: r[8] || null }));
})(typeof window !== 'undefined' ? window : globalThis);
