/* İtalya - Serie A Enilive 2026-27 ve seçili Serie B kadroları. Güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.INT = `
Josep Martínez;GK;1998;ESP;79
Ivan Provedel;GK;1994;ITA;76
Raffaele Di Gennaro;GK;1993;ITA;64
Alessandro Bastoni;CB;1999;ITA;86;;pas
Manuel Akanji;CB;1995;SUI;82
John Stones;CB/DM;1994;ENG;81;;pas
Benjamin Pavard;CB/RB;1996;FRA;80
Yann Aurel Bisseck;CB;2000;GER;80
Carlos Augusto;LB;1999;BRA;78
Federico Dimarco;LB;1997;ITA;84;;ort,uza
Djed Spence;RB;2000;ENG;78
Luis Henrique;RB/RW;2001;BRA;78
Hakan Çalhanoğlu;DM;1994;TUR;83;;pas,uza
Nicolò Barella;CM;1997;ITA;86;;day,pas
Henrikh Mkhitaryan;CM;1989;ARM;76
Davide Frattesi;CM;1999;ITA;80
Piotr Zieliński;CM;1994;POL;79
Petar Sučić;CM;2003;CRO;78;85
Aleksandar Stanković;CM;2005;SRB;76;84
Curtis Jones;CM;2001;ENG;79
Lautaro Martínez;ST;1997;ARG;88;;bit,kar
Marcus Thuram;ST;1997;FRA;84;;guc,hiz
Ange-Yoan Bonny;ST;2003;FRA;77
Francesco Pio Esposito;ST;2005;ITA;76;85`;

  P.MIL = `
Mike Maignan;GK;1995;FRA;86;;ref
Marco Sportiello;GK;1992;ITA;70
Fikayo Tomori;CB;1997;ENG;80
Strahinja Pavlović;CB;2001;SRB;80;;guc
Matteo Gabbia;CB;1999;ITA;77
Koni De Winter;CB;2002;BEL;77
Pervis Estupiñán;LB;1998;ECU;78
Davide Bartesaghi;LB;2005;ITA;75;83
Alexis Saelemaekers;RB/RW;1999;BEL;79
Samuele Ricci;DM;2001;ITA;79
Youssouf Fofana;CM;1999;FRA;80
Ardon Jashari;CM;2002;SUI;79
Adrien Rabiot;CM;1995;FRA;81
Ruben Loftus-Cheek;CM;1996;ENG;77
Christian Pulisic;RW/AM;1998;USA;83;;dri
Omari Hutchinson;RW;2003;JAM;76
Santiago Giménez;ST;2001;MEX;79
Lorenzo Colombo;ST;2002;ITA;73`;

  P.JUV = `
Guglielmo Vicario;GK;1996;ITA;81
Kamil Grabara;GK;1999;POL;77
Carlo Pinsoglio;GK;1990;ITA;62
Gleison Bremer;CB;1997;BRA;84;;guc,mar
Federico Gatti;CB;1998;ITA;78
Lloyd Kelly;CB;1998;ENG;76
Pierre Kalulu;CB/RB;2000;FRA;79
Jhon Lucumí;CB;1998;COL;79
Zeki Çelik;RB;1997;TUR;75
Andrea Cambiaso;LB/RB;2000;ITA;81
Juan Cabal;LB;2001;COL;74
Manuel Locatelli;DM;1998;ITA;80;;pas
Teun Koopmeiners;CM/AM;1998;NED;80
Weston McKennie;CM;1998;USA;77
Douglas Luiz;CM;1998;BRA;77
Pape Matar Sarr;CM;2002;SEN;80
Francisco Conceição;RW;2002;POR;81;;dri
Kerim Alajbegović;RW/LW;2007;BIH;76;88
Nicolás González;LW;1998;ARG;78
Jérémie Boga;LW;1997;CIV;75
Randal Kolo Muani;ST;1998;FRA;80;;hiz,guc
Nick Woltemade;ST;2002;GER;81;;tek,kaf`;

  P.NAP = `
Vanja Milinković-Savić;GK;1997;SRB;80
Alex Meret;GK;1997;ITA;78
Alessandro Buongiorno;CB;1999;ITA;81
Amir Rrahmani;CB;1994;KOS;78
Sam Beukema;CB;1998;NED;80
Juan Jesus;CB;1991;BRA;72
Giovanni Di Lorenzo;RB;1993;ITA;79
Mathías Olivera;LB;1997;URU;78
Leonardo Spinazzola;LB;1993;ITA;74
Pasquale Mazzocchi;RB;1995;ITA;73
Stanislav Lobotka;DM;1994;SVK;82;;pas
Frank Anguissa;CM;1995;CMR;81;;guc
Scott McTominay;CM/AM;1996;SCO;85;;bit,day
Billy Gilmour;CM;2001;SCO;78
Kevin De Bruyne;AM;1991;BEL;83;;pas,yar,uza
Eljif Elmas;AM;1999;MKD;77
Alisson Santos;LW;2002;BRA;77
Matteo Politano;RW;1993;ITA;78
David Neres;RW;1997;BRA;79;;dri
Giovane;ST;2003;BRA;74
Antonio Vergara;RW;2003;ITA;72
Rasmus Højlund;ST;2003;DEN;80;;guc,hiz`;

  P.ROM = `
Mile Svilar;GK;1999;SRB;83;;ref
Gianluca Mancini;CB;1996;ITA;79
Evan Ndicka;CB;1999;CIV;80
Mario Hermoso;CB;1995;ESP;76
Leonardo Balerdi;CB;1999;ARG;78
Devyne Rensch;RB;2003;NED;75
Wesley;RB;2003;BRA;79
Angeliño;LB;1997;ESP;77
Kostas Tsimikas;LB;1996;GRE;74
Manu Koné;CM;2001;FRA;81;;day
Bryan Cristante;DM;1995;ITA;76
Neil El Aynaoui;CM;2001;MAR;77
Marten de Roon;DM;1991;NED;76
Lorenzo Pellegrini;AM;1996;ITA;77
Niccolò Pisilli;CM;2004;ITA;75;83
Matías Soulé;RW;2003;ARG;80;;dri
Paulo Dybala;AM/ST;1993;ARG;80;;tek,uza
Tommaso Baldanzi;AM;2003;ITA;74
Artem Dovbyk;ST;1997;UKR;78`;

  P.ATA = `
Marco Carnesecchi;GK;2000;ITA;81
Isak Hien;CB;1999;SWE;79
Berat Djimsiti;CB;1993;ALB;76
Giorgio Scalvini;CB;2003;ITA;79
Odilon Kossounou;CB;2001;CIV;78
Sead Kolašinac;CB/LB;1993;BIH;74
Thomas Kristensen;CB;2002;DEN;75
Raoul Bellanova;RB;2000;ITA;77
Davide Zappacosta;RB/LB;1992;ITA;74
Éderson;CM;1999;BRA;82;;day
Yunus Musah;CM;2002;USA;77
Mario Pašalić;CM;1995;CRO;77
Gianluca Gaetano;AM;2000;ITA;76
Lazar Samardžić;AM;2002;SRB;77
Daniel Maldini;AM;2001;ITA;74
Charles De Ketelaere;AM/ST;2001;BEL;82;;tek
Jonathan Rowe;LW;2003;ENG;76
Kamaldeen Sulemana;LW;2002;GHA;74
Giacomo Raspadori;ST/AM;2000;ITA;78
Gianluca Scamacca;ST;1999;ITA;78;;kaf
Nikola Krstović;ST;2000;MNE;77`;

  P.COMO = `
Jean Butez;GK;1995;FRA;78
Robert Sánchez;GK;1997;ESP;78
Trevoh Chalobah;CB;1999;ENG;79
Marc-Oliver Kempf;CB;1995;GER;76
Diego Carlos;CB;1993;BRA;75
Jacobo Ramón;CB;2005;ESP;75;84
Yan Couto;RB;2002;BRA;77
Álex Valle;LB;2004;ESP;76
Máximo Perrone;DM;2003;ARG;79
Sergi Roberto;CM;1992;ESP;74
Lucas Da Cunha;CM;2001;FRA;77
Nico Paz;AM;2004;ARG;83;90;tek,uza
Martin Baturina;AM;2003;CRO;79
Nicolas Kühn;RW;2000;GER;78
Jesús Rodríguez;LW;2005;ESP;76;85
Jayden Addai;LW;2005;NED;74
Assane Diao;RW;2005;SEN;77
Tasos Douvikas;ST;1999;GRE;77
Álvaro Morata;ST;1992;ESP;76`;

  P.LAZ = `
Christos Mandas;GK;2001;GRE;77
Alessio Romagnoli;CB;1995;ITA;78
Mario Gila;CB;2000;ESP;79
Adam Marušić;RB;1992;MNE;75
Nuno Tavares;LB;2000;POR;77
Nicolò Rovella;DM;2001;ITA;79
Toma Bašić;CM;1996;CRO;73
Mattia Zaccagni;LW;1995;ITA;80;;dri
Gustav Isaksen;RW;2001;DEN;77
Pedro;RW;1987;ESP;70
Boulaye Dia;ST;1996;SEN;75
Valentín Castellanos;ST;1998;ARG;78`;

  P.FIO = `
David de Gea;GK;1990;ESP;79
Marin Pongračić;CB;1997;CRO;76
Luca Ranieri;CB;1999;ITA;76
Pietro Comuzzo;CB;2005;ITA;76;84
Dodô;RB;1998;BRA;78
Robin Gosens;LB;1994;GER;76
Rolando Mandragora;CM;1997;ITA;76
Marco Brescianini;CM;2000;ITA;75
Nicolò Fagioli;CM;2001;ITA;77
Albert Guðmundsson;AM;1997;ISL;78
Moise Kean;ST;2000;ITA;81;;hiz,guc
Beto;ST;1998;POR;74
Edin Džeko;ST;1986;BIH;72`;

  P.BOL2 = `
Łukasz Skorupski;GK;1991;POL;76
Nicolò Casale;CB;1998;ITA;75
Emil Holm;RB;2000;SWE;75
Juan Miranda;LB;2000;ESP;76
Remo Freuler;DM;1992;SUI;77
Lewis Ferguson;CM;1999;SCO;79
Tommaso Pobega;CM;1999;ITA;75
Jens Odgaard;AM;1999;DEN;75
Riccardo Orsolini;RW;1997;ITA;80;;uza
Federico Bernardeschi;LW;1994;ITA;74
Santiago Castro;ST;2004;ARG;77
Thijs Dallinga;ST;2000;NED;74`;

  P.TOR2 = `
Alberto Paleari;GK;1992;ITA;70
Saúl Coco;CB;1998;EQG;74
Guillermo Maripán;CB;1994;CHI;74
Luca Marianucci;CB;2004;ITA;72
Valentino Lazaro;RB;1996;AUT;72
Cristiano Biraghi;LB;1992;ITA;72
Kristjan Asllani;DM;2002;ALB;74
Ivan Ilić;CM;2001;SRB;75
Nikola Vlašić;AM;1997;CRO;76
Giovanni Simeone;ST;1995;ARG;74
Duván Zapata;ST;1991;COL;73
Che Adams;ST;1996;SCO;74`;

  P.UDI = `
Maduka Okoye;GK;1999;NGA;75
Christian Kabasele;CB;1991;BEL;72
Oumar Solet;CB;2000;FRA;77
Kingsley Ehizibue;RB;1995;NGA;72
Jordan Zemura;LB;1999;ZIM;73
Jesper Karlström;DM;1995;SWE;74
Jakub Piotrowski;CM;1997;POL;74
Arthur Atta;CM;2003;FRA;75
Lazar Jovanović;RW;2006;SRB;72;82
Nicolò Zaniolo;AM;1999;ITA;75
Keinan Davis;ST;1998;ENG;74`;

  P.GEN = `
Nicola Leali;GK;1993;ITA;73
Leo Østigård;CB;1999;NOR;74
Johan Vásquez;CB;1998;MEX;76
Aarón Martín;LB;1997;ESP;74
Morten Frendrup;DM;2001;DEN;77
Junior Messias;RW;1991;BRA;71
Jeff Ekhator;ST;2006;ITA;70;82
Vitinha;ST;2000;POR;73`;

  P.CAG = `
Elia Caprile;GK;2001;ITA;75
Yerry Mina;CB;1994;COL;73
Sebastiano Luperto;CB;1996;ITA;73
Gabriele Zappa;RB;1999;ITA;72
Michel Adopo;CM;2000;FRA;74
Razvan Marin;CM;1996;ROU;72
Zito Luvumbo;RW;2002;ANG;74
Gennaro Borrelli;ST;2000;ITA;72
Sebastiano Esposito;ST;2002;ITA;73`;

  P.PAR = `
Zion Suzuki;GK;2002;JPN;77
Enrico Delprato;CB;1999;ITA;73
Emanuele Valeri;LB;1998;ITA;73
Adrián Bernabé;CM;2001;ESP;76
Nahuel Estévez;DM;1995;ARG;72
Mandela Keita;DM;2002;BEL;74
Mateo Pellegrino;ST;2001;ARG;75`;

  P.LEC2 = `
Wladimiro Falcone;GK;1995;ITA;77
Kialonda Gaspar;CB;1997;ANG;72
Tiago Gabriel;CB;2004;POR;73
Antonino Gallo;LB;2000;ITA;73
Frédéric Guilbert;RB;1994;FRA;71
Ylber Ramadani;DM;1996;ALB;73
Lassana Coulibaly;CM;1996;MLI;73
Riccardo Sottil;LW;1999;ITA;72
Lameck Banda;LW;2001;ZAM;72
Francesco Camarda;ST;2008;ITA;70;86`;

  P.SAS = `
Arijanet Muric;GK;1998;KOS;76
Jay Idzes;CB;2000;IDN;74
Josh Doig;LB;2002;SCO;72
Kristian Thorstvedt;CM;1999;NOR;73
Nemanja Matić;DM;1988;SRB;72
Domenico Berardi;RW;1994;ITA;78;;uza
Armand Laurienté;LW;1998;FRA;77
Andrea Pinamonti;ST;1999;ITA;75`;

  P.VEN = `
Filip Stanković;GK;2002;SRB;73
Michael Svoboda;CB;1998;AUT;71
Antonio Candela;RB;2000;ITA;70
Gianluca Busio;CM;2002;USA;73
Issa Doumbia;CM;2003;ITA;72
John Yeboah;RW;2000;ECU;71
Joel Pohjanpalo;ST;1994;FIN;72`;

  P.FRO = `
Michele Cerofolini;GK;1999;ITA;68
Ilario Monterisi;CB;2001;ITA;68
Anthony Oyono;LB;2001;GAB;68
Luca Garritano;AM;1994;ITA;68
Giuseppe Caso;RW;1998;ITA;68`;

  P.MON2 = `
Semuel Pizzignacco;GK;2001;ITA;68
Andrea Carboni;CB;2001;ITA;70
Luca Caldirola;CB;1991;ITA;68
Matteo Pessina;CM;1997;ITA;72
Gianluca Caprari;AM;1993;ITA;71
Dany Mota;ST;1998;POR;71`;
})(typeof window !== 'undefined' ? window : globalThis);
