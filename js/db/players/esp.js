/* İspanya - LALIGA EA SPORTS 2026-27 ve seçili Segunda kadroları. Güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.RMA = `
Thibaut Courtois;GK;1992;BEL;88;;ref
Andriy Lunin;GK;1999;UKR;78
Dean Huijsen;CB;2005;ESP;83;89;pas
Éder Militão;CB;1998;BRA;84;;hiz
Ibrahima Konaté;CB;1999;FRA;84;;guc,hiz
Antonio Rüdiger;CB;1993;GER;82;;guc
Raúl Asencio;CB;2003;ESP;79
Trent Alexander-Arnold;RB;1998;ENG;84;;pas,ort
Denzel Dumfries;RB;1996;NED;81
Marc Cucurella;LB;1998;ESP;83
Álvaro Carreras;LB;2003;ESP;82
Ferland Mendy;LB;1995;FRA;78
Aurélien Tchouaméni;DM;2000;FRA;85;;kap
Federico Valverde;CM;1998;URU;88;;day,uza
Jude Bellingham;CM/AM;2003;ENG;89;;tek,day
Eduardo Camavinga;CM;2002;FRA;83
Bernardo Silva;AM/RW;1994;POR;84;;tek,day
Arda Güler;AM;2005;TUR;84;90;pas,uza,tek
Thiago Pitarch;CM;2007;ESP;70;85
Vinícius Júnior;LW;2000;BRA;89;;dri,hiz
Rodrygo;RW/LW;2001;BRA;84
Brahim Díaz;AM/RW;1999;MAR;80;;dri
Yan Diomande;RW/LW;2006;CIV;82;90;hiz,dri
Kylian Mbappé;ST/LW;1998;FRA;91;;hiz,bit
Endrick;ST;2006;BRA;79;88
César Espí;ST;2007;ESP;66;82`;

  P.BAR = `
Joan García;GK;2001;ESP;84;;ref
Wojciech Szczęsny;GK;1990;POL;78
Dominik Livaković;GK;1995;CRO;78
Pau Cubarsí;CB;2007;ESP;85;92;pas,poz
Jules Koundé;RB/CB;1998;FRA;85
Andreas Christensen;CB;1996;DEN;78
Eric García;CB/DM;2001;ESP;79
Gerard Martín;LB/CB;2002;ESP;78
Alejandro Balde;LB;2003;ESP;83;;hiz
João Cancelo;RB/LB;1994;POR;80
Brian Fariñas;CB;2007;ESP;64;80
Rodri;DM;1996;ESP;89;;pas,kap,poz
Frenkie de Jong;CM;1997;NED;85;;pas,dri
Pedri;CM/AM;2002;ESP;89;;pas,yar,tek
Gavi;CM;2004;ESP;83
Marc Bernal;DM;2007;ESP;76;87
Fermín López;AM;2003;ESP;83;;uza
Dani Olmo;AM;1998;ESP;83;;tek
Lamine Yamal;RW;2007;ESP;91;97;dri,yar,tek
Raphinha;LW/RW;1996;BRA;86;;uza,bit
Anthony Gordon;LW;2001;ENG;83;;hiz
Karim Adeyemi;LW/ST;2002;GER;82;;hiz
Roony Bardghji;RW;2005;SWE;75;85
Gabriel Jesus;ST;1997;BRA;79
Hamza Abdelkarim;ST;2008;EGY;63;84`;

  P.ATM = `
Jan Oblak;GK;1993;SVN;85;;ref
Juan Musso;GK;1994;ARG;76
José María Giménez;CB;1995;URU;80;;kaf
Robin Le Normand;CB;1996;ESP;80
Dávid Hancko;CB/LB;1997;SVK;81
Clément Lenglet;CB;1995;FRA;76
Marc Pubill;RB/CB;2003;ESP;76
Nahuel Molina;RB;1998;ARG;79
Matteo Ruggeri;LB;2002;ITA;78
Álex Grimaldo;LB;1995;ESP;81;;ort,uza
Morten Hjulmand;DM;1999;DEN;83;;kap
Pablo Barrios;CM;2003;ESP;82
Johnny Cardoso;DM;2001;USA;79
Koke;CM;1992;ESP;77;;pas
Marcos Llorente;CM/RB;1995;ESP;81;;day,hiz
Álex Baena;AM/LW;2001;ESP;83;;ort,pas
Thiago Almada;AM;2001;ARG;81
Lee Kang-in;AM/RW;2001;KOR;81;;tek
Thomas Lemar;LW;1995;FRA;74
Giuliano Simeone;RW;2002;ARG;79;;day
Ademola Lookman;LW;1997;NGA;83;;dri
Julián Álvarez;ST;2000;ARG;87;;bit,day
Alexander Sørloth;ST;1995;NOR;81;;kaf,guc
Carlos Martín;ST;2002;ESP;73`;

  P.VIL = `
Luiz Júnior;GK;2001;BRA;79
Diego Conde;GK;1998;ESP;74
Juan Foyth;CB/RB;1998;ARG;79
Rafa Marín;CB;2002;ESP;78
Renato Veiga;CB/LB;2003;POR;78
Logan Costa;CB;2001;CPV;76
Santiago Mouriño;RB/CB;2002;URU;76
Sergi Cardona;LB;1999;ESP;76
Alfonso Pedraza;LB;1996;ESP;76
Thomas Partey;DM;1993;GHA;79;;kap
Santi Comesaña;CM;1996;ESP;77
Pape Gueye;CM;1999;SEN;78;;guc
Dani Parejo;CM;1989;ESP;74;;pas
Alberto Moleiro;AM/LW;2003;ESP;79;;dri
Nicolas Pépé;RW;1995;CIV;77
Tajon Buchanan;RW;1999;CAN;76
Manor Solomon;LW;1999;ISR;75
Ayoze Pérez;ST/LW;1993;ESP;79
Gerard Moreno;ST;1992;ESP;76
Georges Mikautadze;ST;2000;GEO;79
Tani Oluwaseyi;ST;2000;CAN;74`;

  P.BET = `
Álvaro Vallés;GK;1997;ESP;76
Adrián San Miguel;GK;1987;ESP;70
Héctor Bellerín;RB;1995;ESP;76
Natan;CB;2001;BRA;78
Diego Llorente;CB;1993;ESP;76
Marc Bartra;CB;1991;ESP;74
Valentín Gómez;CB;2003;ARG;76
Ricardo Rodríguez;LB;1992;SUI;74
Junior Firpo;LB;1996;ESP;74
Sofyan Amrabat;DM;1996;MAR;78;;kap
Marc Roca;DM;1996;ESP;76
Pablo Fornals;CM/AM;1996;ESP;79
Giovani Lo Celso;AM;1996;ARG;80;;pas
Isco;AM;1992;ESP;79;;tek
Sergi Altimira;CM;2001;ESP;76
Antony;RW;2000;BRA;80;;dri
Abde Ezzalzouli;LW;2001;MAR;79;;dri,hiz
Rodrigo Riquelme;LW;2000;ESP;77
Cucho Hernández;ST;1999;COL;79
Chimy Ávila;ST;1994;ARG;73`;

  P.ATH = `
Unai Simón;GK;1997;ESP;83;;ref
Álex Padilla;GK;2003;MEX;72
Aymeric Laporte;CB;1994;ESP;79;;pas
Dani Vivian;CB;1999;ESP;80
Aitor Paredes;CB;2000;ESP;77
Yeray Álvarez;CB;1995;ESP;75
Andoni Gorosabel;RB;1996;ESP;75
Yuri Berchiche;LB;1990;ESP;73
Adama Boiro;LB;2002;ESP;72
Mikel Jauregizar;DM;2003;ESP;78;85
Mikel Vesga;DM;1993;ESP;74
Iñigo Ruiz de Galarreta;CM;1993;ESP;76
Beñat Prados;CM;2001;ESP;76
Oihan Sancet;AM;2000;ESP;81;;tek,bit
Unai Gómez;AM;2003;ESP;74
Robert Navarro;LW;2002;ESP;76
Álex Berenguer;LW/RW;1995;ESP;77
Nico Williams;LW;2002;ESP;85;;dri,hiz
Iñaki Williams;RW/ST;1994;GHA;79;;hiz,day
Gorka Guruzeta;ST;1996;ESP;77
Maroan Sannadi;ST;2001;ESP;72`;

  P.RSO = `
Álex Remiro;GK;1995;ESP;81
Unai Marrero;GK;2001;ESP;70
Igor Zubeldia;CB;1997;ESP;78
Duje Ćaleta-Car;CB;1996;CRO;76
Jon Martín;CB;2006;ESP;72;83
Jon Aramburu;RB;2002;VEN;76
Sergio Gómez;LB;2000;ESP;76
Aihen Muñoz;LB;1997;ESP;73
Jon Gorrotxategi;DM;2001;ESP;74
Beñat Turrientes;CM;2002;ESP;76
Luka Sučić;CM;2002;CRO;78
Brais Méndez;AM;1997;ESP;79
Pablo Marín;CM;2003;ESP;74
Takefusa Kubo;RW;2001;JPN;82;;dri,tek
Ander Barrenetxea;LW;2001;ESP;77
Arsen Zakharyan;AM;2003;RUS;76
Mikel Oyarzabal;ST/LW;1997;ESP;82;;bit,kar
Orri Óskarsson;ST;2004;ISL;75;83
Umar Sadiq;ST;1997;NGA;74`;

  P.SEV = `
Ørjan Nyland;GK;1990;NOR;74
Odysseas Vlachodimos;GK;1994;GRE;74
Kike Salas;CB;2002;ESP;75
César Azpilicueta;CB/RB;1989;ESP;72
José Ángel Carmona;RB;2002;ESP;75
Gabriel Suazo;LB;1997;CHI;74
Lucien Agoumé;DM;2002;FRA;77
Nemanja Gudelj;DM/CB;1991;SRB;74
Djibril Sow;CM;1997;SUI;75
Peque Fernández;AM;2002;ESP;74
Rubén Vargas;LW;1998;SUI;77
Chidera Ejuke;LW;1998;NGA;76
Alexis Sánchez;ST/RW;1988;CHI;72
Isaac Romero;ST;2000;ESP;75
Akor Adams;ST;2000;NGA;76`;

  P.VAL = `
Stole Dimitrievski;GK;1993;MKD;76
Julen Agirrezabala;GK;2000;ESP;76
César Tárrega;CB;2002;ESP;77
Mouctar Diakhaby;CB;1996;GUI;75
Eray Cömert;CB;1998;SUI;73
Dimitri Foulquier;RB;1993;FRA;73
José Gayà;LB;1995;ESP;77
Pepelu;DM;1998;ESP;77;;pas
Javi Guerra;CM;2003;ESP;79;;uza
André Almeida;AM;2000;POR;76
Filip Ugrinic;CM;1999;SUI;74
Diego López;RW;2002;ESP;77
Luis Rioja;LW;1993;ESP;75
Arnaut Danjuma;LW;1997;NED;76
Largie Ramazani;LW;2001;BEL;75
Hugo Duro;ST;1999;ESP;77`;

  P.CEV = `
Ionuț Radu;GK;1997;ROU;75
Iván Villar;GK;1997;ESP;72
Carl Starfelt;CB;1995;SWE;75
Joseph Aidoo;CB;1995;GHA;73
Javi Rodríguez;CB;2003;ESP;75
Marcos Alonso;CB/LB;1990;ESP;74
Mihailo Ristić;LB;1995;SRB;73
Javi Rueda;RB;2003;ESP;72
Fran Beltrán;DM;1999;ESP;76
Ilaix Moriba;CM;2003;GUI;76
Hugo Sotelo;CM;2003;ESP;74
Hugo Álvarez;LW;2003;ESP;75
Williot Swedberg;AM;2004;SWE;74
Pablo Durán;RW;2001;ESP;73
Ferran Jutglà;ST;1999;ESP;75
Borja Iglesias;ST;1993;ESP;77;;kaf
Iago Aspas;ST/AM;1987;ESP;74;;bit,tek`;

  P.GET = `
David Soria;GK;1993;ESP;78
Djené Dakonam;CB;1991;TOG;75
Domingos Duarte;CB;1995;POR;74
Allan Nyom;RB;1988;CMR;70
Diego Rico;LB;1993;ESP;72
Juan Iglesias;RB;1998;ESP;73
Mauro Arambarri;DM;1995;URU;77;;kap
Luis Milla;CM;1994;ESP;76;;pas
Christantus Uche;CM;2003;NGA;73
Carles Aleñá;CM;1998;ESP;72
Borja Mayoral;ST;1997;ESP;75
Álex Sancris;LW;2001;ESP;71`;

  P.OSA = `
Sergio Herrera;GK;1993;ESP;77
Alejandro Catena;CB;1994;ESP;76
Enzo Boyomo;CB;2001;CMR;75
Valentin Rosier;RB;1996;FRA;74
Abel Bretones;LB;2000;ESP;73
Juan Cruz;LB;1992;ESP;72
Lucas Torró;DM;1994;ESP;75
Jon Moncayola;CM;1998;ESP;76
Aimar Oroz;AM;2001;ESP;76
Rubén García;LW;1993;ESP;74
Ante Budimir;ST;1991;CRO;78;;kaf,bit
Raúl García de Haro;ST;2000;ESP;73`;

  P.RAY = `
Augusto Batalla;GK;1996;ARG;76
Florian Lejeune;CB;1991;FRA;75
Abdul Mumin;CB;1998;GHA;73
Andrei Rațiu;RB;1998;ROU;76
Óscar Valentín;DM;1994;ESP;74
Pathé Ciss;DM;1994;SEN;74
Unai López;CM;1995;ESP;75
Isi Palazón;RW;1994;ESP;77;;dri
Jorge de Frutos;RW;1997;ESP;76
Álvaro García;LW;1992;ESP;74
Pedro Díaz;AM;1998;ESP;73
Sergio Camello;ST;2001;ESP;73
Alemão;ST;1998;BRA;73`;

  P.ALA = `
Antonio Sivera;GK;1996;ESP;75
Nahuel Tenaglia;CB;1996;ARG;75
Abdel Abqar;CB;1999;MAR;73
Víctor Parada;LB;2002;ESP;70
Antonio Blanco;DM;2000;ESP;76
Jon Guridi;CM;1995;ESP;74
Carlos Vicente;RW;1999;ESP;75
Toni Martínez;ST;1997;ESP;75
Lucas Boyé;ST;1996;ARG;74`;

  P.ESY = `
Marko Dmitrović;GK;1992;SRB;76
Leandro Cabrera;CB;1991;URU;75
Fernando Calero;CB;1995;ESP;73
Omar El Hilali;RB;2003;MAR;74
Carlos Romero;LB;2001;ESP;74
Edu Expósito;CM;1996;ESP;75
Pol Lozano;CM;1999;ESP;73
Urko González;DM;2001;ESP;72
Jofre Carreras;RW;2001;ESP;74
Tyrhys Dolan;LW;2001;ENG;73
Javi Puado;ST;1998;ESP;76
Roberto Fernández;ST;2002;ESP;73
Kike García;ST;1989;ESP;72`;

  P.ELC = `
Matías Dituro;GK;1987;ARG;72
Pedro Bigas;CB;1990;ESP;72
Víctor Chust;CB;2000;ESP;73
Álvaro Núñez;RB;2000;ESP;72
Marc Aguado;DM;2000;ESP;73
Aleix Febas;CM;1996;ESP;74
Martim Neto;CM;2003;POR;72
Germán Valera;RW;2002;ESP;73
Josan;RW;1989;ESP;70
Rafa Mir;ST;1997;ESP;74
André Silva;ST;1995;POR;75`;

  P.LEV2 = `
Mathew Ryan;GK;1992;AUS;73
Adrián de la Fuente;CB;1999;ESP;72
Unai Elgezabal;CB;1993;ESP;72
Manu Sánchez;LB;2000;ESP;72
Jeremy Toljan;RB;1994;GER;71
Oriol Rey;DM;1998;ESP;72
Pablo Martínez;CM;1998;ESP;72
Carlos Álvarez;AM;2003;ESP;75
Iván Romero;ST;2001;ESP;73
Karl Etta Eyong;ST;2003;CMR;74
José Luis Morales;LW;1987;ESP;70`;

  P.RAC = `
Jokin Ezkieta;GK;1996;ESP;72
Pablo Ramón;CB;2001;ESP;70
Álvaro Mantilla;RB;2000;ESP;69
Íñigo Sainz-Maza;CM;1998;ESP;70
Peio Canales;AM;2005;ESP;72;82
Íñigo Vicente;AM;1998;ESP;74
Andrés Martín;LW;1999;ESP;74
Asier Villalibre;ST;1997;ESP;71`;

  P.DEP = `
Germán Parreño;GK;1993;ESP;71
Ximo Navarro;RB;1990;ESP;69
Diego Villares;CM;1996;ESP;70
Mario Soriano;AM;2002;ESP;73
José Ángel Jurado;CM;1992;ESP;69
Yeremay Hernández;LW;2002;ESP;76;84;dri
David Mella;RW;2005;ESP;73;83
Zakaria Eddahchouri;ST;2000;NED;70`;

  P.MAL = `
Alfonso Herrero;GK;1994;ESP;70
Einar Galilea;CB;1994;ESP;68
Dani Lorenzo;CM;2002;ESP;71
Luismi Sánchez;DM;1992;ESP;68
Antoñito Cordero;LW;2006;ESP;70;82
Chupe;ST;2000;ESP;69`;

  // Segunda: küme düşen kulüpler
  P.GIR = `
Paulo Gazzaniga;GK;1992;ARG;75
Daley Blind;CB;1990;NED;72
David López;CB;1989;ESP;71
Arnau Martínez;RB;2003;ESP;75
Yangel Herrera;CM;1998;VEN;77
Iván Martín;AM;1999;ESP;76
Viktor Tsygankov;RW;1997;UKR;77
Bryan Gil;LW;2001;ESP;74
Cristhian Stuani;ST;1986;URU;70`;

  P.MLL = `
Leo Román;GK;2000;ESP;75
Martin Valjent;CB;1995;SVK;75
Antonio Raíllo;CB;1991;ESP;72
Pablo Maffeo;RB;1997;ARG;75
Johan Mojica;LB;1992;COL;72
Manu Morlanes;CM;1999;ESP;74
Sergi Darder;AM;1993;ESP;75
Takuma Asano;RW;1994;JPN;72`;

  P.OVI = `
Aarón Escandell;GK;1995;ESP;73
David Carmo;CB;1999;ANG;72
Dani Calvo;CB;1994;ESP;70
Santi Cazorla;AM;1984;ESP;68;;pas,tek
Santiago Colombatto;CM;1997;ARG;72
Ilyas Chaira;LW;2001;MAR;72
Federico Viñas;ST;1998;URU;72
Salomón Rondón;ST;1989;VEN;70`;
})(typeof window !== 'undefined' ? window : globalThis);
