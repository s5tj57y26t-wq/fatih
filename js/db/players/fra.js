/* Fransa - Ligue 1 McDonald's 2026-27 ve seçili Ligue 2 kadroları. Güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.PSG = `
Lucas Chevalier;GK;2001;FRA;83
Matvey Safonov;GK;1999;RUS;78
Achraf Hakimi;RB;1998;MAR;87;;hiz,ort
Marquinhos;CB;1994;BRA;84;;mar,kar
Willian Pacho;CB;2001;ECU;85;;guc
Illia Zabarnyi;CB;2002;UKR;82
Lucas Beraldo;CB;2003;BRA;77
Nuno Mendes;LB;2002;POR;87;;hiz,dri
Lucas Hernández;LB/CB;1996;FRA;79
Vitinha;CM;2000;POR;89;;pas,tek
João Neves;CM;2004;POR;86;;day,kap
Warren Zaïre-Emery;CM;2006;FRA;81;89
Fabián Ruiz;CM;1996;ESP;83;;pas
Senny Mayulu;CM;2006;FRA;74;85
Ousmane Dembélé;RW/ST;1997;FRA;90;;dri,bit
Khvicha Kvaratskhelia;LW;2001;GEO;88;;dri,tek
Désiré Doué;RW/AM;2005;FRA;85;92;dri
Ibrahim Mbaye;LW;2008;FRA;70;88
Gonçalo Ramos;ST;2001;POR;81;;bit`;

  P.OM = `
Gerónimo Rulli;GK;1992;ARG;81
Jeffrey de Lange;GK;1998;NED;70
Nayef Aguerd;CB;1996;MAR;79
CJ Egan-Riley;CB;2003;ENG;75
Emerson Palmieri;LB;1994;ITA;74
Pierre-Emile Højbjerg;DM;1995;DEN;79;;kap
Geoffrey Kondogbia;DM;1993;CTA;74
Arthur Vermeeren;CM;2005;BEL;76;84
Quinten Timber;CM;2001;NED;79
Himad Abdelli;AM;1999;ALG;76
Tochukwu Nnadi;CM;2003;NGA;73
Timothy Weah;RW;2000;USA;77
Hamed Traorè;AM;2000;CIV;75
Bilal Nadir;AM;2003;MAR;73
Igor Paixão;LW;2000;BRA;80;;dri
Amine Gouiri;ST;2000;ALG;80
Pierre-Emerick Aubameyang;ST;1989;GAB;75`;

  P.ASM = `
Lukáš Hradecký;GK;1989;FIN;76
Philipp Köhn;GK;1998;SUI;76
Vanderson;RB;2001;BRA;80
Jordan Teze;RB/CB;1999;NED;76
Wout Faes;CB;1998;BEL;76
Mohammed Salisu;CB;1999;GHA;77
Christian Mawissa;CB;2005;FRA;76;84
Eric Dier;CB;1994;ENG;75
Thilo Kehrer;CB;1996;GER;75
Denis Zakaria;DM;1996;SUI;80
Lamine Camara;CM;2004;SEN;79;86
Aleksandr Golovin;AM;1996;RUS;79;;pas
Maghnes Akliouche;RW/AM;2002;FRA;81;;dri
Stanis Idumbo;AM;2005;BEL;72
Simon Adingra;LW;2002;CIV;76
Ansu Fati;LW;2002;ESP;77
Folarin Balogun;ST;2001;USA;79
Mika Biereth;ST;2003;DEN;78
Paris Brunner;RW;2006;GER;72;82`;

  P.LIL = `
Berke Özer;GK;2000;TUR;76
Aïssa Mandi;CB;1991;ALG;74
Alexsandro Ribeiro;CB;1999;BRA;78
Nathan Ngoy;CB;2003;BEL;74
Romain Perraud;LB;1997;FRA;76
Benjamin André;DM;1990;FRA;76
Ngal'ayel Mukau;CM;2004;BEL;76;84
Hákon Arnar Haraldsson;AM;2003;ISL;78
Osame Sahraoui;LW;2001;NOR;75
Matías Fernández-Pardo;RW;2005;BEL;75;84
Hamza Igamane;ST;2002;MAR;76
Olivier Giroud;ST;1986;FRA;72;;kaf`;

  P.OL = `
Rémy Descamps;GK;1996;FRA;75
Moussa Niakhaté;CB;1996;SEN;78
Clinton Mata;CB;1992;ANG;73
Ruben Kluivert;CB;2001;NED;74
Nicolás Tagliafico;LB;1992;ARG;75
Tanner Tessmann;DM;2001;USA;76
Corentin Tolisso;CM;1994;FRA;77
Tyler Morton;CM;2002;ENG;75
Pavel Šulc;AM;2000;CZE;77
Adam Karabec;AM;2003;CZE;74
Ernest Nuamah;RW;2003;GHA;75
Julien Duranville;LW;2006;BEL;72;84
Steeve Kango;ST;2007;FRA;66;80`;

  P.LENS = `
Robin Risser;GK;2004;FRA;78;85
Samson Baidoo;CB;2004;AUT;76
Malang Sarr;CB;1999;FRA;75
Jonathan Gradit;CB;1992;FRA;74
Saud Abdulhamid;RB;1999;KSA;72
Deiver Machado;LB;1993;COL;72
Amadou Haïdara;CM;1998;MLI;76
Adrien Thomasson;CM;1993;FRA;76
Andy Diouf;CM;2003;FRA;76
Florian Thauvin;RW;1993;FRA;78;;uza
Allan Saint-Maximin;LW;1997;FRA;76;;dri
Wesley Saïd;LW;1995;FRA;74
Odsonne Édouard;ST;1998;FRA;75`;

  P.OGCN = `
Marcin Bułka;GK;1999;POL;79
Jonathan Clauss;RB;1992;FRA;75
Antoine Mendy;RB;2004;FRA;72
Melvin Bard;LB;2000;FRA;75
Youssouf Ndayishimiye;CB;1998;FRA;75
Hicham Boudaoui;CM;1999;ALG;76
Tanguy Ndombele;CM;1996;FRA;73
Mohamed-Ali Cho;LW;2004;FRA;75
Sofiane Diop;AM;2000;MAR;76
Elye Wahi;ST;2003;FRA;74`;

  P.REN = `
Brice Samba;GK;1994;FRA;79
Przemysław Frankowski;RB;1995;POL;74
Christopher Wooh;CB;2001;CMR;74
Abdelhamid Aït Boudlal;CB;2006;MAR;72;83
Glen Kamara;CM;1995;FIN;74
Djaoui Cissé;CM;2004;FRA;73
Ludovic Blas;AM;1997;FRA;76
Mousa Al-Tamari;RW;1997;JOR;75
Quentin Merlin;LB;2002;FRA;74
Esteban Lepaul;ST;2000;FRA;75
Breel Embolo;ST;1997;SUI;76
Eliezer Mayenda;ST;2005;ESP;74;83`;

  P.RCSA = `
Karl-Johan Johnsson;GK;1990;SWE;70
Ismaël Doukouré;CB;2003;FRA;75
Mamadou Sarr;CB;2005;FRA;74;83
Guéla Doué;RB;2002;CIV;75
Félix Lemaréchal;CM;2003;FRA;73
Sebastian Nanasi;RW;2002;SWE;75
Diego Moreira;LW;2004;BEL;74
Joaquín Panichelli;ST;2002;ARG;75
Martial Godo;RW;2003;CIV;72`;

  P.SB29 = `
Grégoire Coudert;GK;1999;FRA;72
Kenny Lala;RB;1991;FRA;72
Brendan Chardonnet;CB;1994;FRA;72
Pierre Lees-Melou;CM;1993;FRA;74
Hugo Magnetti;CM;1998;FRA;72
Romain Del Castillo;RW;1996;FRA;75
Kamory Doumbia;AM;2003;MLI;72
Ludovic Ajorque;ST;1994;FRA;73`;

  P.TFC = `
Guillaume Restes;GK;2005;FRA;76;84
Charlie Cresswell;CB;2002;ENG;74
Rasmus Nicolaisen;CB;1997;DEN;73
Cristian Cásseres;CM;2000;VEN;74
Aron Dønnum;RW;1998;NOR;73
Frank Magri;ST;1999;CMR;72`;

  P.AUX = `
Donovan Léon;GK;1992;FRA;72
Gideon Mensah;LB;1998;GHA;72
Elisha Owusu;DM;1997;GHA;73
Lassine Sinayoko;ST;1999;MLI;73`;

  P.ANG = `
Hervé Koffi;GK;1996;BFA;70
Jordan Lefort;CB;1993;FRA;70
Farid El Melali;LW;1997;ALG;71`;

  P.HAC = `
Arthur Desmas;GK;1994;FRA;72
Gautier Lloris;CB;1995;FRA;70
Abdoulaye Touré;DM;1994;GUI;72
Yassine Kechta;CM;2002;MAR;71`;

  P.FCL = `
Yvon Mvogo;GK;1994;SUI;73
Laurent Abergel;DM;1993;FRA;70
Arthur Avom;CM;2004;CMR;71
Tosin Aiyegun;RW;1998;NGA;71`;

  P.PFC = `
Kevin Trapp;GK;1990;GER;78
Maxime Lopez;CM;1997;FRA;74
Ilan Kebbal;AM;1998;ALG;76
Willem Geubbels;ST;2001;FRA;72`;

  // Ligue 2: küme düşen kulüpler
  P.FCN3 = `
Anthony Lopes;GK;1990;POR;74
Nicolas Pallois;CB;1987;FRA;68
Francis Coquelin;DM;1991;FRA;69
Matthis Abline;ST;2003;FRA;75`;
})(typeof window !== 'undefined' ? window : globalThis);
