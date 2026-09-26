/* İskoçya, Belçika, Avusturya, İsviçre, Yunanistan, Çekya, Danimarka, Polonya, Hırvatistan, Sırbistan, Ukrayna.
   Önde gelen kulüplerin bilinen oyuncuları (2026 yaz hareketleri kısmen yansıtılmıştır). Güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  // İskoçya
  P.CEL = `
Kasper Schmeichel;GK;1986;DEN;74
Sam Johnstone;GK;1993;ENG;73
Cameron Carter-Vickers;CB;1997;USA;77
Liam Scales;CB;1998;IRL;74
Auston Trusty;CB;1998;USA;74
Alistair Johnston;RB;1998;CAN;76
Jordan Lotomba;RB;1998;SUI;72
Kieran Tierney;LB;1997;SCO;75
Callum McGregor;CM;1993;SCO;77;;pas,kar
Arne Engels;CM;2003;BEL;77
Reo Hatate;CM;1997;JPN;77
Mika Baur;CM;2005;GER;72;82
Benjamin Nygren;AM;2001;SWE;76
Haissem Hassan;RW;2002;EGY;75
Camilo Durán;ST;2003;COL;74
Kasper Høgh;ST;2000;DEN;76
Adam Idah;ST;2001;IRL;73`;

  P.RAN = `
Ivor Pandur;GK;2000;CRO;73
John Souttar;CB;1996;SCO;72
Ben Godfrey;CB;1998;ENG;73
Kim Min-su;CB;2006;KOR;70;82
Dujon Sterling;RB;1999;ENG;71
Jefté;LB;2003;BRA;71
Connor Barron;CM;2002;SCO;72
Nicolas Raskin;CM;2001;BEL;74
Dan Neil;CM;2001;ENG;72
Ross McCrorie;CB/DM;1998;SCO;71
Cammy Devlin;CM;1998;AUS;71
Vanja Dragojević;DM;2007;SRB;68;82
Daisuke Yokota;RW;2000;JPN;72
Djeidi Gassama;LW;2003;FRA;73
Lawrence Shankland;ST;1995;SCO;72
Kevin Kelsy;ST;2004;VEN;72;82
Cyriel Dessers;ST;1994;NGA;73`;

  P.HOM = `
Craig Gordon;GK;1983;SCO;65
Stephen Kingsley;LB;1994;SCO;68
Beni Baningime;DM;1998;COD;68
Kenneth Vargas;RW;2002;CRC;68`;

  P.ABE = `
Dimitar Mitov;GK;1997;BUL;70
Graeme Shinnie;CM;1991;SCO;67
Kevin Nisbet;ST;1997;SCO;68`;

  P.HIB = `
Josef Bursik;GK;2000;ENG;69
Martin Boyle;RW;1993;AUS;69
Dylan Levitt;CM;2000;WAL;67`;

  // Belçika
  P.BRU = `
Simon Mignolet;GK;1988;BEL;73
Nordin Jackers;GK;1997;BEL;72
Joel Ordóñez;CB;2004;ECU;77;85
Brandon Mechele;CB;1993;BEL;73
Zaid Romero;CB;2000;ARG;73
Kyriani Sabbe;RB;2005;BEL;72
Joaquin Seys;LB;2005;BEL;73
Hugo Vetlesen;CM;2000;NOR;76
Hans Vanaken;AM;1992;BEL;76;;pas
Ludovit Reis;CM;2000;NED;73
Carlos Forbs;RW;2004;POR;77;85;hiz
Nicolò Tresoldi;ST;2004;GER;74
Romeo Vermant;ST;2004;BEL;72`;

  P.USG = `
Vic Chambaere;GK;2003;BEL;68
Kevin Mac Allister;CB;1997;ARG;74
Christian Burgess;CB;1991;ENG;72
Ross Sykes;CB;1999;ENG;72
Charles Vanhoutte;DM;1998;BEL;73
Anouar Ait El Hadj;AM;2002;BEL;73
Kevin Rodríguez;ST;2000;ECU;72`;

  P.AND = `
Colin Coosemans;GK;1992;BEL;73
Jan-Carlo Simić;CB;2005;SRB;73
Moussa N'Diaye;LB;2002;SEN;72
Mats Rits;CM;1993;BEL;72
Yari Verschaeren;AM;2001;BEL;74
Oliver Antman;RW;2001;FIN;72
Luis Vázquez;ST;2001;ARG;73`;

  P.GNK = `
Hendrik Van Crombrugge;GK;1993;BEL;73
Matte Smets;CB;2004;BEL;72
Bryan Heynen;CM;1997;BEL;74
Jarne Steuckers;LW;2002;BEL;73
Hyun-seok Hong;AM;1999;KOR;72`;

  P.GNT = `
Davy Roef;GK;1994;BEL;72
Stefan Mitrović;CB;2002;SRB;70
Omri Gandelman;CM;2000;ISR;73
Max Dean;ST;2004;ENG;71`;

  // Avusturya
  P.RBS = `
Alexander Schlager;GK;1996;AUT;74
Jacob Rasmussen;CB;1997;DEN;72
Joane Gadou;CB;2007;FRA;71;84
Frans Krätzig;LB;2003;GER;72
Mads Bidstrup;CM;2001;DEN;73
Maurits Kjærgaard;CM;2003;DEN;74
Clément Bischoff;CM;2005;DEN;70;82
Karim Onisiwo;ST;1992;AUT;70
Yorbe Vertessen;ST;2001;BEL;72`;

  P.STG = `
Oliver Christensen;GK;1999;DEN;71
Gregory Wüthrich;CB;1994;SUI;71
Jon Gorenc Stanković;DM;1996;SVN;72
Otar Kiteishvili;AM;1996;GEO;74
Tomi Horvat;AM;2001;SVN;71
Seedy Jatta;ST;2003;NOR;70`;

  P.RAP = `
Niklas Hedl;GK;2001;AUT;72
Nenad Cvetković;CB;1996;SRB;70
Matthias Seidl;CM;2001;AUT;72
Nikolaus Wurmbrand;LW;2005;AUT;70;80`;

  P.LASK = `
Jörg Siebenhandl;GK;1990;AUT;67
Philipp Ziereis;CB;1993;GER;68
Sascha Horvath;CM;1996;AUT;70
Moses Usor;LW;2002;NGA;70`;

  P.FAK = `
Samuel Şahin-Radlinger;GK;1992;AUT;67
Manfred Fischer;CM;1995;AUT;70
Dominik Fitz;AM;1999;AUT;71`;

  // İsviçre
  P.FCB2 = `
Marwin Hitz;GK;1987;SUI;68
Adrian Barišić;CB;2001;BIH;70
Dominik Schmid;LB;1998;SUI;69
Léo Leroy;CM;2000;FRA;71
Xherdan Shaqiri;AM;1991;SUI;74;;uza,pas
Bénie Traoré;LW;2002;CIV;71
Kevin Carlos;ST;2001;ESP;71`;

  P.YB = `
Marvin Keller;GK;2002;SUI;71
Loris Benito;CB;1992;SUI;68
Tanguy Zoukrou;CB;2003;FRA;70
Joël Monteiro;RW;1999;SUI;70
Christian Fassnacht;RW;1993;SUI;69`;

  P.LUG = `
Amir Saipi;GK;2000;SUI;69
Antonios Papadopoulos;CB;1999;GER;68
Mattia Bottani;AM;1991;SUI;70
Renato Steffen;LW;1991;SUI;69`;

  P.SER = `
Joël Mall;GK;1991;SUI;68
Steve Rouiller;CB;1990;SUI;68
Timothé Cognat;CM;1998;FRA;70
Miroslav Stevanović;RW;1990;BIH;69`;

  // Yunanistan
  P.OLY = `
Konstantinos Tzolakis;GK;2002;GRE;76
Panagiotis Retsos;CB;1998;GRE;75
Lorenzo Pirola;CB;2002;ITA;75
Rodinei;RB;1992;BRA;72
Francisco Ortega;LB;1999;ARG;74
Santiago Hezze;DM;2001;ARG;75
Dani García;DM;1990;ESP;72
Chiquinho;AM;2000;POR;76
Gustavo Puerta;CM;2003;COL;73
Gelson Martins;RW;1995;POR;76
Leon Bailey;RW;1997;JAM;76
Marcus Holmgren Pedersen;RB;2000;NOR;74
Daniel Podence;LW;1995;POR;76
Ayoub El Kaabi;ST;1993;MAR;78;;bit
Marius Mouandilmadji;ST;1998;CHA;72
Armando González;ST;2003;MEX;72`;

  P.PAOK = `
Jiří Pavlenka;GK;1992;CZE;74
Tomasz Kędziora;RB;1994;POL;71
Giannis Michailidis;CB;2000;GRE;72
Rahman Baba;LB;1994;GHA;70
Magomed Ozdoev;DM;1992;RUS;72
Giannis Konstantelias;AM;2003;GRE;77;85
Taison;LW;1988;BRA;70
Kiril Despodov;RW;1996;BUL;74
Fedor Chalov;ST;1998;RUS;74`;

  P.AEK = `
Thomas Strakosha;GK;1995;ALB;76
Domagoj Vida;CB;1989;CRO;70
Harold Moukoudi;CB;1997;CMR;73
Lazaros Rota;RB;1997;GRE;71
Orbelín Pineda;AM;1996;MEX;74
Mijat Gaćinović;AM;1995;SRB;73
Aboubakary Koita;LW;1998;MLI;74
Zini;ST;2002;ANG;73
Luka Jović;ST;1997;SRB;74`;

  P.PAO = `
Alban Lafont;GK;1999;FRA;76
Erik Palmer-Brown;CB;1997;USA;72
Tin Jedvaj;CB;1995;CRO;71
Georgios Kotsiras;RB;1992;GRE;70
Anass Salah-Eddine;LB;2002;NED;73
Adam Gnezda Čerin;CM;1999;SVN;73
Tete;RW;2000;BRA;75
Karol Świderski;ST;1997;POL;72`;

  // Çekya
  P.SLA = `
Jindřich Staněk;GK;1996;CZE;76
Tomáš Holeš;CB;1993;CZE;73
Igoh Ogbu;CB;2000;NGA;74
David Zima;CB;2000;CZE;74
David Douděra;RB;1998;CZE;74
Oscar Dorley;DM;1998;CIV;73
Christos Zafeiris;CM;2003;GRE;75
Lukáš Provod;LW;1996;CZE;74
Tomáš Chorý;ST;1995;CZE;74;;kaf
Mojmír Chytil;ST;1999;CZE;72`;

  P.SPA = `
Jakub Surovčík;GK;2002;SVK;71
Asger Sørensen;CB;1996;DEN;72
Jaroslav Zelený;LB;1992;CZE;71
Kaan Kairinen;CM;1998;FIN;73
Lukáš Sadílek;CM;1996;CZE;72
Lukáš Haraslín;LW;1996;SVK;74
Veljko Birmančević;RW;1998;SRB;73
Albion Rrahmani;ST;2000;KOS;73`;

  P.PLZ = `
Martin Jedlička;GK;1998;CZE;71
Václav Jemelka;CB;1995;CZE;71
Lukáš Červ;CM;2001;CZE;72
Prince Kwabena Adu;ST;2003;GHA;71
Rafiu Durosinmi;ST;2003;NGA;72`;

  // Danimarka
  P.FCK = `
Dominik Kotarski;GK;2000;CRO;74
Gabriel Pereira;CB;2001;BRA;73
Pantelis Hatzidiakos;CB;1997;GRE;73
Marcos López;LB;1999;PER;72
Lukas Lerager;CM;1993;DEN;72
Mohamed Elyounoussi;LW;1994;NOR;72
Jordan Larsson;ST;1997;SWE;72
Youssoufa Moukoko;ST;2004;GER;72`;

  P.FCM = `
Jonas Lössl;GK;1989;DEN;70
Mads Bech Sørensen;CB;1999;DEN;71
Pedro Bravo;CM;2004;BRA;71
Dario Osorio;RW;2004;CHI;73
Mikel Gogorza;LW;2004;ESP;71`;

  P.BIF = `
Patrick Pentz;GK;1997;AUT;72
Sean Klaiber;RB;1994;SUI;69
Daniel Wass;CM;1989;DEN;68
Nicolai Vallys;AM;1996;DEN;71`;

  // Polonya
  P.LEC = `
Bartosz Mrozek;GK;2000;POL;71
Alex Douglas;CB;2001;SWE;71
Joel Pereira;RB;1996;POR;70
Antoni Kozubal;DM;2004;POL;71
Afonso Sousa;AM;2000;POR;72
Mikael Ishak;ST;1993;SWE;73`;

  P.JAG = `
Sławomir Abramowicz;GK;2004;POL;70
Taras Romanczuk;DM;1991;POL;69
Jesús Imaz;AM;1990;ESP;71
Afimico Pululu;ST;1999;ANG;71`;

  P.RAK = `
Kacper Trelowski;GK;2003;POL;70
Ivi López;AM;1994;ESP;71
Jonatan Braut Brunes;ST;2000;NOR;71`;

  P.LEG2 = `
Kacper Tobiasz;GK;2002;POL;71
Radovan Pankov;CB;1995;SRB;70
Bartosz Kapustka;CM;1996;POL;71
Luquinhas;AM;1996;BRA;71`;

  // Hırvatistan
  P.DZG = `
Ivan Nevistić;GK;1998;CRO;73
Kévin Théophile-Catherine;CB;1989;FRA;69
Sergi Domínguez;CB;2005;ESP;73;82
Scott McKenna;CB;1996;SCO;72
Josip Mišić;DM;1994;CRO;72
Miha Zajc;AM;1994;SVN;74
Marko Pjaca;LW;1995;CRO;71
Arber Hoxha;RW;1998;ALB;72
Dion Drena Beljo;ST;2002;CRO;75`;

  P.HAJ = `
Ivan Lučić;GK;1995;AUT;70
Filip Uremović;CB;1997;CRO;69
Ivan Rakitić;CM;1988;CRO;72;;pas
Marko Livaja;ST;1993;CRO;73
Michele Šego;RW;2000;CRO;70`;

  P.RIJ = `
Martin Zlomislić;GK;1998;CRO;70
Niko Janković;CM;2001;CRO;71
Toni Fruk;AM;2001;CRO;74`;

  // Sırbistan
  P.CZV = `
Matheus;GK;1993;BRA;72
Ivan Guteša;GK;1997;SRB;69
Rodrigão;CB;1995;BRA;70
Nasser Djiga;CB;2002;BFA;71
Timi Max Elšnik;CM;1998;SVN;72
Rade Krunić;CM;1993;BIH;72
Mirko Ivanić;AM;1993;MNE;72
Bruno Duarte;ST;1996;BRA;72
Marko Arnautović;ST;1989;AUT;72`;

  P.PAR3 = `
Nikola Simić;GK;2004;SRB;66
Mario Jurčević;LB;1995;CRO;66
Aleksandar Šćekić;CM;1991;MNE;66
Ghayas Zahid;AM;1994;NOR;69`;

  // Ukrayna
  P.SHA = `
Dmytro Riznyk;GK;1999;UKR;74
Valeriy Bondar;CB;1999;UKR;74
Mykola Matviyenko;CB;1996;UKR;74
Pedro Henrique;LB;1995;BRA;71
Irakli Azarov;RB;2002;UKR;72
Oleksandr Karavayev;RB;1992;UKR;70
Artem Bondarenko;CM;2000;UKR;73
Marlon Gomes;CM;2003;BRA;74
Pedrinho;AM;1998;BRA;75
Kauã Elias;ST;2006;BRA;74;84
Lassina Traoré;ST;2001;BFA;73
Newerton;RW;2005;BRA;73`;

  P.DYN = `
Ruslan Neshcheret;GK;2002;UKR;72
Denys Popov;CB;1999;UKR;72
Vladyslav Kabayev;RW;1995;UKR;71
Volodymyr Brazhko;DM;2002;UKR;73
Nazar Voloshyn;LW;2003;UKR;72
Matviy Ponomarenko;ST;2006;UKR;70;82`;
})(typeof window !== 'undefined' ? window : globalThis);
