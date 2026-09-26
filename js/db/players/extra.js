/* Yalnızca uluslararası turnuvalarda yer alan kulüplerin bilinen oyuncuları. Güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.BOD = `
Nikita Haikin;GK;1995;NOR;73
Fredrik Bjørkan;LB;1998;NOR;71
Patrick Berg;DM;1997;NOR;74
Ulrik Saltnes;CM;1992;NOR;71
Jens Petter Hauge;LW;1999;NOR;74
Ole Didrik Blomberg;RW;2000;NOR;72`;

  P.MIA = `
Lionel Messi;RW/AM;1987;ARG;83;;yar,pas,tek,-hiz
Rodrigo De Paul;CM;1994;ARG;78
Luis Suárez;ST;1987;URU;71;;bit`;

  P.FLA = `
Agustín Rossi;GK;1995;ARG;77
Alex Sandro;LB;1991;BRA;72
Léo Ortiz;CB;1996;BRA;75
Jorginho;DM;1991;ITA;75;;pas
Giorgian de Arrascaeta;AM;1994;URU;79;;tek,pas
Pedro;ST;1997;BRA;77`;

  P.PAL2 = `
Andreas Pereira;AM;1996;BRA;75
Vitor Roque;ST;2005;BRA;77
José Manuel López;ST;2000;ARG;76`;

  P.RIV = `
Franco Armani;GK;1986;ARG;72
Gonzalo Montiel;RB;1997;ARG;74
Maximiliano Salas;ST;1997;ARG;72`;

  P.BOC = `
Leandro Paredes;DM;1994;ARG;76
Edinson Cavani;ST;1987;URU;68`;

  P.AHLY = `
Mohamed El Shenawy;GK;1988;EGY;72
Emam Ashour;CM;1998;EGY;74
Trézéguet;LW;1994;EGY;73`;

  P.MSU = `
Ronwen Williams;GK;1992;RSA;73
Teboho Mokoena;CM;1997;RSA;72`;
})(typeof window !== 'undefined' ? window : globalThis);
