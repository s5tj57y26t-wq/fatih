/* Almanya - Bundesliga 2026-27 ve seçili 2. Bundesliga kadroları. Güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.BAY = `
Manuel Neuer;GK;1986;GER;82;;ref,kar
Jonas Urbig;GK;2003;GER;74;84
Sven Ulreich;GK;1988;GER;68
Dayot Upamecano;CB;1998;FRA;84;;hiz,guc
Kim Min-jae;CB;1996;KOR;82
Jonathan Tah;CB;1996;GER;84
Hiroki Ito;CB/LB;1999;JPN;78
Joshua Kimmich;RB/DM;1995;GER;87;;pas,day
Josip Stanišić;RB/CB;2000;CRO;79
Sacha Boey;RB;2000;FRA;76
Konrad Laimer;RB/CM;1997;AUT;81;;day
Alphonso Davies;LB;2000;CAN;82;;hiz
Aleksandar Pavlović;DM;2004;GER;82;88
Leon Goretzka;CM;1995;GER;79
Tom Bischof;CM;2005;GER;76;85
Jamal Musiala;AM;2003;GER;89;;dri,tek
Lennart Karl;AM/RW;2008;GER;72;90
Michael Olise;RW;2001;FRA;88;;dri,pas
Serge Gnabry;RW/LW;1995;GER;79
Luis Díaz;LW;1997;COL;85;;dri,hiz
Nicolas Jackson;ST;2001;SEN;79
Harry Kane;ST;1993;ENG;89;;bit,pas,uza`;

  P.BVB = `
Gregor Kobel;GK;1997;SUI;85;;ref
Alexander Meyer;GK;1991;GER;70
Nico Schlotterbeck;CB;1999;GER;84;;pas
Waldemar Anton;CB;1996;GER;80
Niklas Süle;CB;1995;GER;76
Emre Can;CB/DM;1994;GER;76
Julian Ryerson;RB;1997;NOR;79
Daniel Svensson;LB;2002;SWE;77
Ramy Bensebaini;LB;1995;ALG;76
Felix Nmecha;CM;2000;GER;80
Marcel Sabitzer;CM;1994;AUT;78
Jobe Bellingham;CM;2005;ENG;78;86
Julian Brandt;AM;1996;GER;80;;pas
Carney Chukwuemeka;AM;2003;AUT;75
Maximilian Beier;RW/ST;2002;GER;79;;hiz
Serhou Guirassy;ST;1996;GUI;85;;bit,guc
Fábio Silva;ST;2002;POR;76`;

  P.B04 = `
Mark Flekken;GK;1993;NED;79
Jarell Quansah;CB;2003;ENG;79
Loïc Badé;CB;2000;FRA;79
Edmond Tapsoba;CB;1999;BFA;81
Facundo Medina;CB/LB;1999;ARG;79
Lucas Vázquez;RB;1991;ESP;74
Miguel Gutiérrez;LB;2001;ESP;79
Robert Andrich;DM;1994;GER;78
Aleix García;CM;1997;ESP;81;;pas
Malik Tillman;AM;2002;USA;80
Jonas Hofmann;AM/RW;1992;GER;75
Ibrahim Maza;AM/RW;2005;ALG;78;86
Eliesse Ben Seghir;LW;2005;MAR;77;85
Nathan Tella;RW;1999;NGA;76
Afonso Moreira;LW;2005;POR;76;85
Patrik Schick;ST;1996;CZE;81;;bit,kaf
Christian Kofane;ST;2006;CMR;72;84`;

  P.RBL = `
Péter Gulácsi;GK;1990;HUN;77
Maarten Vandevoordt;GK;2002;BEL;76
Castello Lukeba;CB;2002;FRA;81
Willi Orbán;CB;1992;HUN;78
Maxime Estève;CB;2002;FRA;76
Lutsharel Geertruida;RB/CB;2000;NED;77
Ridle Baku;RB;1998;GER;76
David Raum;LB;1998;GER;80;;ort
Nicolas Seiwald;DM;2001;AUT;78
Rocco Reitz;CM;2002;GER;77
Christoph Baumgartner;AM;1999;AUT;79
Assan Ouédraogo;AM;2006;GER;74;85
Antonio Nusa;LW;2005;NOR;79;87;dri,hiz
Johan Bakayoko;RW;2003;BEL;78
Christopher Nkunku;ST/AM;1997;FRA;79
Rômulo Cardoso;ST;2002;BRA;75`;

  P.STU = `
Fabian Bredlow;GK;1995;GER;72
Dennis Seimen;GK;2005;GER;66;76
Jeff Chabot;CB;1998;GER;77
Dan-Axel Zagadou;CB;1999;FRA;76
Ameen Al-Dakhil;CB;2002;BEL;75
Luca Jaquez;CB;2003;SUI;75
Leonidas Stergiou;CB/RB;2002;SUI;74
Josha Vagnoman;RB;2000;GER;74
Lorenz Assignon;RB;2000;FRA;74
Maximilian Mittelstädt;LB;1997;GER;78
Ramon Hendriks;LB/CB;2001;NED;73
Atakan Karazor;DM;1996;GER;76
Angelo Stiller;CM;2001;GER;81;;pas
Bilal El Khannouss;AM;2004;MAR;78;85
Chris Führich;LW;1998;GER;77
Jamie Leweling;RW;2001;GER;77
Nikolas Nartey;CM;2000;DEN;72
Dženan Pejčinović;ST;2005;GER;72;82
Ermedin Demirović;ST;1998;BIH;78
Deniz Undav;ST;1996;GER;79;;bit`;

  P.SGE = `
Noah Atubolu;GK;2002;GER;78;84
Kauã Santos;GK;2003;BRA;72
Robin Koch;CB;1996;GER;79
Arthur Theate;CB/LB;2000;BEL;78
Nnamdi Collins;CB;2004;GER;75
Lilian Brassier;CB;1999;FRA;74
Aurèle Amenda;CB;2003;SUI;72
Nathaniel Brown;LB;2003;GER;76
Aurélio Buta;RB;1997;POR;73
Ellyes Skhiri;DM;1995;TUN;77
Raphael Onyedika;DM;2001;NGA;77
Hugo Larsson;CM;2004;SWE;79;86
Mario Götze;AM;1992;GER;74
Can Uzun;AM;2005;TUR;78;87
Fares Chaibi;AM;2002;ALG;77
Ansgar Knauff;RW;2002;GER;75
Jean-Mattéo Bahoya;LW;2005;FRA;74;84
Jonathan Burkardt;ST;2000;GER;79`;

  P.SCF = `
Florian Müller;GK;1997;GER;73
Matthias Ginter;CB;1994;GER;78
Philipp Lienhart;CB;1996;AUT;77
Max Rosenfelder;CB;2003;GER;74
Lukas Kübler;RB;1992;GER;73
Christian Günter;LB;1993;GER;74
Maximilian Eggestein;DM;1996;GER;77
Nicolas Höfler;DM;1990;GER;71
Patrick Osterhage;CM;2000;GER;74
Vincenzo Grifo;LW;1993;ITA;78;;uza,ort
Ritsu Doan;RW;1998;JPN;79;;dri
Yuito Suzuki;AM;2001;JPN;75
Lucas Höler;ST;1994;GER;74
Igor Matanović;ST;2003;CRO;74`;

  P.TSG = `
Oliver Baumann;GK;1990;GER;79
Ozan Kabak;CB;2000;TUR;77
Kevin Akpoguma;CB;1995;NGA;73
Albian Hajdari;CB;2003;SUI;74
Bernardo;LB;1995;BRA;73
Vladimír Coufal;RB;1992;CZE;73
Grischa Prömel;CM;1995;GER;75
Leon Avdullahu;DM;2004;SUI;75;83
Wouter Burger;DM;2001;NED;75
Andrej Kramarić;AM/ST;1991;CRO;78;;bit
Adam Hložek;ST/LW;2002;CZE;77
Fisnik Asllani;ST;2002;KOS;76
Tim Lemperle;ST;2002;GER;74`;

  P.M05 = `
Robin Zentner;GK;1994;GER;75
Stefan Bell;CB;1991;GER;73
Dominik Kohr;CB/DM;1994;GER;73
Danny da Costa;RB;1993;GER;72
Anthony Caci;LB;1997;FRA;73
Kaishu Sano;DM;2000;JPN;77
Nadiem Amiri;AM;1996;GER;79;;pas
Paul Nebel;AM;2002;GER;75
Jae-sung Lee;LW;1992;KOR;74
Armindo Sieb;LW;2003;GER;73
Nelson Weiper;ST;2005;GER;73;82`;

  P.BMG = `
Moritz Nicolas;GK;1997;GER;76
Kevin Diks;CB/RB;1996;NED;76
Joe Scally;RB;2002;USA;75
Luca Netz;LB;2003;GER;74
Philipp Sander;DM;1998;GER;74
Julian Weigl;DM;1995;GER;75
Florian Neuhaus;CM;1997;GER;74
Kevin Stöger;AM;1993;AUT;76
Robin Hack;LW;1998;GER;75
Franck Honorat;RW;1996;FRA;76
Haris Tabaković;ST;1994;BIH;75
Tim Kleindienst;ST;1995;GER;77;;kaf`;

  P.SVW = `
Mio Backhaus;GK;2004;GER;73;81
Marco Friedl;CB;1998;AUT;76
Niklas Stark;CB;1995;GER;74
Amos Pieper;CB;1998;GER;73
Mitchell Weiser;RB;1994;GER;76
Felix Agu;LB;1999;GER;72
Senne Lynen;DM;1999;BEL;75
Jens Stage;CM;1996;DEN;77
Romano Schmid;AM;2000;AUT;77
Justin Njinmah;RW;2000;GER;73
Marco Grüll;LW;1998;AUT;74
Keke Topp;ST;2004;GER;72`;

  P.FCA = `
Finn Dahmen;GK;1998;GER;75
Jeffrey Gouweleeuw;CB;1991;NED;72
Keven Schlotterbeck;CB;1997;GER;73
Cédric Zesiger;CB;1998;SUI;73
Dimitrios Giannoulis;LB;1995;GRE;73
Kristijan Jakić;DM;1997;CRO;74
Fredrik Jensen;AM;1997;FIN;73
Alexis Claude-Maurice;AM;1998;FRA;75
Mert Kömür;RW;2005;GER;70;80
Phillip Tietz;ST;1997;GER;73`;

  P.FCU = `
Frederik Rønnow;GK;1992;DEN;76
Danilho Doekhi;CB;1998;NED;77
Diogo Leite;CB;1999;POR;75
Leopold Querfeld;CB;2003;AUT;75
Christopher Trimmel;RB;1987;AUT;68
Rani Khedira;DM;1994;GER;75
Janik Haberer;CM;1994;GER;72
Ilyas Ansah;RW;2004;GER;73
Tim Skarke;LW;1996;GER;72
Andrej Ilić;ST;2000;SRB;74
Oliver Burke;ST;1997;SCO;72`;

  P.KOE = `
Marvin Schwäbe;GK;1995;GER;74
Timo Hübers;CB;1996;GER;73
Rav van den Berg;CB;2004;NED;73
Kristoffer Lund;LB;2002;USA;72
Eric Martel;DM;2002;GER;74
Isak Johannesson;CM;2003;ISL;74
Linton Maina;LW;1999;GER;73
Jan Thielmann;RW;2002;GER;72
Said El Mala;LW;2006;GER;74;85
Marius Bülter;ST;1993;GER;72`;

  P.HSV = `
Daniel Heuer Fernandes;GK;1992;POR;74
Dennis Hadžikadunić;CB;1998;BIH;72
Luka Vušković;CB;2007;CRO;76;88
Miro Muheim;LB;1998;SUI;73
William Mikelbrencis;RB;2004;FRA;71
Jonas Meffert;DM;1994;GER;73
Nicolás Capaldo;CM;1998;ARG;74
Albert Sambi Lokonga;CM;1999;BEL;74
Rayan Philippe;ST;2000;FRA;73
Ransford Königsdörffer;ST;2001;GHA;72`;

  P.S04 = `
Loris Karius;GK;1993;GER;72
Nikola Katić;CB;1996;CRO;73
Ron Schallenberg;DM;1998;GER;71
Kenan Karaman;AM/ST;1994;TUR;73
Moussa Sylla;ST;1999;MLI;72
Bryan Lasme;RW;1998;FRA;70`;

  P.SVE = `
Nicolas Kristof;GK;1999;GER;70
Lukas Pinckert;RB;2000;GER;68
Muhammed Damar;AM;2004;GER;71
Younes Ebnoutalib;ST;2003;GER;70`;


  // 2. Bundesliga: küme düşen kulüpler
  P.WOB = `
Konstantinos Koulierakis;CB;2003;GRE;76
Denis Vavro;CB;1996;SVK;73
Joakim Mæhle;RB;1997;DEN;74
Maximilian Arnold;CM;1994;GER;75
Aster Vranckx;CM;2002;BEL;73
Lovro Majer;AM;1998;CRO;75
Patrick Wimmer;RW;2001;AUT;75
Mohamed Amoura;ST;2000;ALG;78;;hiz`;

  P.STP = `
Nikola Vasilj;GK;1995;BIH;74
Hauke Wahl;CB;1994;GER;73
Eric Smith;CB/DM;1997;SWE;73
Jackson Irvine;CM;1993;AUS;73
Andreas Hountondji;ST;2002;BEN;72`;

  P.FCH = `
Kevin Müller;GK;1991;GER;72
Patrick Mainka;CB;1994;GER;72
Jan Schöppner;CM;1999;GER;71
Marvin Pieringer;ST;1999;GER;71`;
})(typeof window !== 'undefined' ? window : globalThis);
