/* İngiltere - Premier League 2026-27 ve seçili Championship kadroları (2026 yaz transferleri dahil).
   Satır: Ad;Mevki[/yan];doğum;ülke;güç;[potansiyel];[etiketler] - güç değerleri oyunun tahminidir. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.ARS = `
David Raya;GK;1995;ESP;86;;ref,pas
Kepa Arrizabalaga;GK;1994;ESP;78
Illan Meslier;GK;2000;FRA;75
William Saliba;CB;2001;FRA;88;;mar,hiz
Gabriel Magalhães;CB;1997;BRA;87;;kaf,guc
Ezri Konsa;CB/RB;1997;ENG;81
Cristhian Mosquera;CB;2004;ESP;78;85
Piero Hincapié;CB/LB;2002;ECU;82;;hiz
Ben White;RB/CB;1997;ENG;81
Jurriën Timber;RB/CB;2001;NED;83
Riccardo Calafiori;LB/CB;2002;ITA;81
Myles Lewis-Skelly;LB/CM;2006;ENG;78;88
Declan Rice;DM/CM;1999;ENG;88;;kap,day,pas
Martín Zubimendi;DM;1999;ESP;86;;pas,poz
Bruno Guimarães;CM/DM;1997;BRA;85;;pas,kap
Mikel Merino;CM/ST;1996;ESP;82;;kaf
Martin Ødegaard;AM;1998;NOR;86;;yar,pas
Eberechi Eze;AM/LW;1998;ENG;84;;dri,tek
Ethan Nwaneri;AM/RW;2007;ENG;79;90;tek
Fábio Vieira;AM;2000;POR;76
Max Dowman;AM/RW;2009;ENG;70;92;dri
Bukayo Saka;RW;2001;ENG;88;;dri,ort,bit
Noni Madueke;RW/LW;2002;ENG;80;;dri
Gabriel Martinelli;LW;2001;BRA;82;;hiz
Christos Tzolis;LW;2002;GRE;79
Viktor Gyökeres;ST;1998;SWE;85;;guc,bit
Kai Havertz;ST/AM;1999;GER;83;;kaf`;

  P.MCI = `
Gianluigi Donnarumma;GK;1999;ITA;88;;ref
Stefan Ortega;GK;1992;GER;76
Rúben Dias;CB;1997;POR;86;;mar,kar
Joško Gvardiol;CB/LB;2002;CRO;86
Abdukodir Khusanov;CB;2004;UZB;78;86;hiz,guc
Nico O'Reilly;LB/CM;2005;ENG;76;84
Rayan Aït-Nouri;LB;2001;ALG;81;;dri
Matheus Nunes;RB/CM;1998;POR;80
Rico Lewis;RB/CM;2004;ENG;77;83
Enzo Fernández;CM;2001;ARG;86;;pas,uza
Elliot Anderson;CM/DM;2002;ENG;85;;day,pas
Mateo Kovačić;CM;1994;CRO;80
Ayyoub Bouaddi;DM/CM;2007;MAR;76;88
Allan;CM;2004;BRA;74;82
Mathys Detourbet;AM;2008;FRA;70;86
Phil Foden;AM/LW;2000;ENG;86;;tek,uza
Jérémy Doku;LW;2002;BEL;83;;dri,hiz
Iliman Ndiaye;LW/AM;2000;SEN;81;;dri
Jeremy Monga;RW;2009;ENG;68;88
Erling Haaland;ST;2000;NOR;91;;bit,guc,hiz`;

  P.LIV = `
Alisson;GK;1992;BRA;87;;ref
Giorgi Mamardashvili;GK;2000;GEO;82
Freddie Woodman;GK;1997;ENG;65
Virgil van Dijk;CB;1991;NED;86;;kaf,kar,mar
Ronald Araújo;CB;1999;URU;82;;guc
Jérémy Jacquet;CB;2005;FRA;76;86
Giovanni Leoni;CB;2006;ITA;76;87
Joe Gomez;CB/RB;1997;ENG;78
Jeremie Frimpong;RB;2000;NED;82;;hiz
Conor Bradley;RB;2003;NIR;79
Milos Kerkez;LB;2003;HUN;80
Ryan Gravenberch;DM/CM;2002;NED;86;;dri
Alexis Mac Allister;CM;1998;ARG;86;;pas
Dominik Szoboszlai;CM/AM;2000;HUN;86;;uza,day
Trey Nyoni;CM;2007;ENG;68;84
Florian Wirtz;AM;2003;GER;88;;yar,tek,dri
Bradley Barcola;LW/RW;2002;FRA;84;;hiz,dri
Cody Gakpo;LW;1999;NED;83
Víctor Muñoz;LW;2003;ESP;78;84
Rio Ngumoha;LW;2008;ENG;68;88
Alexander Isak;ST;1999;SWE;88;;bit,tek
Hugo Ekitiké;ST;2002;FRA;84;;dri`;

  P.CHE = `
Emiliano Martínez;GK;1992;ARG;83;;ref,kar
Mike Penders;GK;2005;BEL;70;84
Levi Colwill;CB;2003;ENG;82
Wesley Fofana;CB;2000;FRA;80
Maxence Lacroix;CB;2000;FRA;81;;hiz
Jorrel Hato;LB/CB;2006;NED;77;86
Reece James;RB/CM;1999;ENG;83
Malo Gusto;RB;2003;FRA;80
Marco Palestra;RB;2005;ITA;78;86
Pep Chavarría;LB;1998;ESP;76
Valentín Barco;LB/CM;2004;ARG;76
Moisés Caicedo;DM;2001;ECU;87;;kap,day
Roméo Lavia;DM;2004;BEL;79
Jordan Henderson;CM;1990;ENG;74
Cole Palmer;AM/RW;2002;ENG;87;;tek,bit,yar
Morgan Rogers;AM/LW;2002;ENG;84;;dri,guc
Estêvão;RW;2007;BRA;82;91;dri
Pedro Neto;RW/LW;2000;POR;82;;hiz
Geovany Quenda;RW;2007;POR;78;88
Alejandro Garnacho;LW;2004;ARG;80
Jamie Gittens;LW;2004;ENG;78
Dastan Satpaev;ST;2008;KAZ;64;84
João Pedro;ST/AM;2001;BRA;83;;tek
Emmanuel Emegha;ST;2003;NED;76
Danny Welbeck;ST;1990;ENG;72`;

  P.MUN = `
Senne Lammens;GK;2002;BEL;77;84
Matthijs de Ligt;CB;1999;NED;81
Lisandro Martínez;CB;1998;ARG;80
Leny Yoro;CB;2005;FRA;79;88
Harry Maguire;CB;1993;ENG;76;;kaf
Ayden Heaven;CB;2006;ENG;72;83
Diogo Dalot;RB/LB;1999;POR;78
Noussair Mazraoui;RB;1997;MAR;78
Patrick Dorgu;LB;2004;DEN;77
Luke Shaw;LB;1995;ENG;76
Manuel Ugarte;DM;2001;URU;77;;kap
Kobbie Mainoo;CM;2005;ENG;79;87
Andrey Santos;CM;2004;BRA;78
Toby Collyer;CM;2004;ENG;68
Mason Mount;AM;1999;ENG;76
Bruno Fernandes;AM;1994;POR;84;;pas,yar,uza
Amad Diallo;RW;2002;CIV;81;;dri
Bryan Mbeumo;RW;1999;CMR;83;;bit
Matheus Cunha;AM/LW;1999;BRA;83;;dri,uza
Benjamin Šeško;ST;2003;SVN;81;;kaf,guc
Joshua Zirkzee;ST;2001;NED;76`;

  P.TOT = `
Antonín Kinský;GK;2003;CZE;72
Martin Dúbravka;GK;1989;SVK;72
Micky van de Ven;CB;2001;NED;84;;hiz
Jan Paul van Hecke;CB;2000;NED;80
Marcos Senesi;CB;1997;ARG;78
Tosin Adarabioyo;CB;1997;ENG;77
Pedro Porro;RB;1999;ESP;81;;ort
Destiny Udogie;LB;2002;ITA;80
Andrew Robertson;LB;1994;SCO;78;;ort
Ben Davies;LB/CB;1993;WAL;72
Sandro Tonali;DM/CM;2000;ITA;86;;day,pas
Rodrigo Bentancur;DM;1997;URU;78
Archie Gray;CM/DM;2006;ENG;78;86
Lucas Bergvall;CM;2006;SWE;79;87
Conor Gallagher;CM;2000;ENG;81;;day
Mateus Fernandes;CM/AM;2004;POR;80;86
James Maddison;AM;1996;ENG;81;;pas
Xavi Simons;AM/LW;2003;NED;83;;dri
Dejan Kulusevski;RW/AM;2000;SWE;82
Mohammed Kudus;RW;2000;GHA;83;;dri,guc
Sávio;RW/LW;2004;BRA;82;;dri
Mathys Tel;LW/ST;2005;FRA;76
Wilson Odobert;LW;2004;FRA;75
Omar Marmoush;ST/LW;1999;EGY;82;;uza
Dominic Solanke;ST;1997;ENG;80
Richarlison;ST;1997;BRA;77`;

  P.NEW = `
Nick Pope;GK;1992;ENG;82
Lukáš Horníček;GK;2002;CZE;72
Sven Botman;CB;2000;NED;80
Malick Thiaw;CB;2001;GER;80
Fabian Schär;CB;1991;SUI;77
Dan Burn;CB/LB;1992;ENG;78;;kaf
Tino Livramento;RB/LB;2002;ENG;81;;hiz
Amar Dedić;RB;2002;BIH;79
Lewis Hall;LB;2004;ENG;81
Nico González;DM;2002;ESP;80
Joelinton;CM;1996;BRA;81;;guc
Joe Willock;CM;1999;ENG;76
Jacob Ramsey;CM/AM;2001;ENG;77
Anthony Elanga;RW;2002;SWE;80;;hiz
Jacob Murphy;RW;1995;ENG;78
Bazoumana Touré;LW;2006;CIV;74;85
Yoane Wissa;ST;1996;COD;80
William Osula;ST;2003;DEN;74`;

  P.AVL = `
Marco Bizot;GK;1991;NED;78
Pau Torres;CB;1997;ESP;81;;pas
Victor Lindelöf;CB;1994;SWE;76
Tyrone Mings;CB;1993;ENG;76
Lamare Bogarde;CB/DM;2004;NED;72
Matty Cash;RB;1997;POL;79
Lucas Digne;LB;1993;FRA;77
Ian Maatsen;LB;2002;NED;78
Boubacar Kamara;DM;1999;FRA;81;;kap
Amadou Onana;DM/CM;2001;BEL;79;;guc
João Gomes;DM/CM;2001;BRA;80;;kap
Youri Tielemans;CM;1997;BEL;81;;pas
Johan Manzambi;CM/AM;2005;SUI;79;87
John McGinn;CM/LW;1994;SCO;79
Emiliano Buendía;AM;1996;ARG;77
Andrés García;RB/RW;2003;ESP;72
Ollie Watkins;ST;1995;ENG;83;;bit,hiz`;

  P.BHA = `
Bart Verbruggen;GK;2002;NED;80
Jason Steele;GK;1990;ENG;70
Pascal Struijk;CB/LB;1999;NED;78
Lewis Dunk;CB;1991;ENG;76;;kaf,pas
Igor Julio;CB;1998;BRA;76
Joël Veltman;RB;1992;NED;73
Ferdi Kadıoğlu;LB/RB;1999;TUR;78
Maxim De Cuyper;LB;2000;BEL;77
Jaouen Hadjam;LB;2003;ALG;75
Carlos Baleba;DM;2004;CMR;82;;guc,kap
Mats Wieffer;DM/RB;1999;NED;76
Yasin Ayari;CM;2003;SWE;77
Jack Hinshelwood;CM/RB;2005;ENG;76;83
Pascal Groß;CM;1991;GER;77;;pas
Diego Gómez;CM;2003;PAR;77
Matt O'Riley;AM;2000;DEN;77
Georginio Rutter;AM/ST;2002;FRA;79;;dri
Kaoru Mitoma;LW;1997;JPN;80;;dri
Yankuba Minteh;RW;2004;GAM;78;;hiz
Evan Ferguson;ST;2004;IRL;76
Stefanos Tzimas;ST;2006;GRE;75;85
Promise David;ST;2001;CAN;74
Charalampos Kostoulas;ST;2007;GRE;72;85`;

  P.BOU = `
Đorđe Petrović;GK;1999;SRB;79
António Silva;CB;2003;POR;81
Bafodé Diakité;CB;2001;FRA;77
Julián Araujo;RB;2001;MEX;74
Juanlu Sánchez;RB;2003;ESP;76
Adrien Truffert;LB;2001;FRA;77
Tyler Adams;DM;1999;USA;78;;kap
Alex Scott;CM;2003;ENG;79
Lewis Cook;CM;1997;ENG;75
Ryan Christie;CM;1995;SCO;76
Marcus Tavernier;LW/AM;1999;ENG;79
Amine Adli;RW;2000;MAR;76
David Brooks;RW;1997;WAL;75
Justin Kluivert;AM/LW;1999;NED;79
Evanilson;ST;1999;BRA;79
Álvaro Rodríguez;ST;2004;ESP;75;82
Enes Ünal;ST;1997;TUR;74
Eli Junior Kroupi;ST;2006;FRA;74;85`;

  P.BRE = `
Caoimhín Kelleher;GK;1998;IRL;80
Hákon Valdimarsson;GK;2001;ISL;66
Nathan Collins;CB;2001;IRL;76
Sepp van den Berg;CB;2001;NED;76
Kristoffer Ajer;CB/RB;1998;NOR;75
Jannik Schuster;CB;2006;GER;72;81
Michael Kayode;RB;2004;ITA;76
Aaron Hickey;RB/LB;2002;SCO;76
Keane Lewis-Potter;LB/LW;2001;ENG;75
Mamadou Sangaré;DM;2002;MLI;77
Vitaly Janelt;CM;1998;GER;75
Mathias Jensen;CM;1996;DEN;76
Yehor Yarmoliuk;CM;2004;UKR;74
Mikkel Damsgaard;AM;2000;DEN;78;;pas
Fábio Carvalho;AM;2002;POR;74
Kevin Schade;LW;2001;GER;78;;hiz
Jaidon Anthony;LW;1999;ENG;76
Igor Thiago;ST;2001;BRA;79;;guc
Callum Wilson;ST;1992;ENG;73`;

  P.CRY = `
Dean Henderson;GK;1997;ENG;80
Chris Richards;CB;2000;USA;78
Axel Disasi;CB;1998;FRA;77
Bright Arrey-Mbi;CB;2003;GER;75
Finn Jeltsch;CB;2006;GER;72;82
Takehiro Tomiyasu;RB/CB;1998;JPN;75
Óscar Mingueza;RB;1999;ESP;77
Tyrick Mitchell;LB;1999;ENG;79
Adam Wharton;CM;2004;ENG;80;;pas
Jefferson Lerma;DM;1994;COL;76
Will Hughes;CM;1995;ENG;74
Daichi Kamada;AM;1996;JPN;77
Yeremy Pino;RW;2002;ESP;77
Anan Khalaili;RW;2004;ISR;77
Dwight McNeil;LW;1999;ENG;76
Ismaïla Sarr;RW;1998;SEN;79;;hiz
Evann Guessand;ST;2001;CIV;77
Jean-Philippe Mateta;ST;1997;FRA;80;;guc,kaf
Zavier Gozo;ST;2008;FRA;68;84`;

  P.EVE = `
Jordan Pickford;GK;1994;ENG;83
Mark Travers;GK;1999;IRL;70
James Tarkowski;CB;1992;ENG;78;;kaf
Jarrad Branthwaite;CB;2002;ENG;80
Jake O'Brien;CB/RB;2001;IRL;76
Michael Keane;CB;1993;ENG;74
Nathan Patterson;RB;2001;SCO;75
Vitaliy Mykolenko;LB;1999;UKR;76
James Garner;CM;2001;ENG;78
Tim Iroegbunam;DM;2003;ENG;74
Kiernan Dewsbury-Hall;CM;1998;ENG;77
Carlos Alcaraz;AM;2002;ARG;76
Merlin Röhl;AM;2002;GER;76
Brennan Johnson;RW;2001;WAL;79;;hiz
Tyrique George;LW;2006;ENG;74;83
Thierno Barry;ST;2002;FRA;77`;

  P.FUL = `
Bernd Leno;GK;1992;GER;81
Benjamin Lecomte;GK;1991;FRA;72
Joachim Andersen;CB;1996;DEN;78
Calvin Bassey;CB/LB;1999;NGA;77
Jorge Cuenca;CB;1999;ESP;76
David Affengruber;CB;2001;AUT;74
Kenny Tete;RB;1995;NED;76
Timothy Castagne;RB;1995;BEL;76
Antonee Robinson;LB;1997;USA;79;;hiz
Ryan Sessegnon;LB;2000;ENG;74
Sander Berge;DM;1998;NOR;78
Harrison Reed;DM;1995;ENG;74
Shea Charles;DM;2003;NIR;76
Alex Iwobi;AM/LW;1996;NGA;79
Emile Smith Rowe;AM;2000;ENG;77
Josh King;AM;2007;ENG;74;84
Tom Cairney;CM;1991;SCO;72
Samuel Chukwueze;RW;1999;NGA;77
Oscar Bobb;RW;2003;NOR;77
Kevin;LW;2003;BRA;76
Rodrigo Muniz;ST;2001;BRA;77
Gonzalo García;ST;2004;ESP;76;85
Raúl Jiménez;ST;1991;MEX;75
Jonah Kusi-Asare;ST;2007;SWE;70;83`;

  P.LEE = `
James Trafford;GK;2002;ENG;80
Lucas Perri;GK;1997;BRA;76
Joe Rodon;CB;1997;WAL;76
Jaka Bijol;CB;1999;SVN;77
Tarik Muharemović;CB/LB;2003;BIH;78;84
Nico Elvedi;CB;1996;SUI;76
Jayden Bogle;RB;2000;ENG;74
Gabriel Gudmundsson;LB;1999;SWE;75
Ethan Ampadu;DM;2000;WAL;76
Anton Stach;CM;1998;GER;77
Ao Tanaka;CM;1998;JPN;76
Ilia Gruev;DM;2000;BUL;74
Brenden Aaronson;AM;2000;USA;75
Daniel James;LW;1997;WAL;77;;hiz
Noah Okafor;LW;2000;SUI;77
Harry Wilson;RW;1997;WAL;78;;uza
Dominic Calvert-Lewin;ST;1997;ENG;76;;kaf
Lukas Nmecha;ST;1998;GER;74`;

  P.NFO = `
Matz Sels;GK;1992;BEL;80
Murillo;CB;2002;BRA;82
Nikola Milenković;CB;1997;SRB;81;;kaf
Ousmane Diomande;CB;2003;CIV;80;86
Morato;CB;2001;BRA;74
Daniel Muñoz;RB;1996;COL;80
Neco Williams;RB/LB;2001;WAL;78
Ola Aina;RB/LB;1996;NGA;77
Ibrahim Sangaré;DM;1997;CIV;77
Nicolás Domínguez;CM;1998;ARG;78
Xaver Schlager;CM;1997;AUT;78
Morgan Gibbs-White;AM;2000;ENG;83;;pas,dri
Callum Hudson-Odoi;LW;2000;ENG;78
Dan Ndoye;RW;2000;SUI;79
Dilane Bakwa;RW;2002;FRA;74
Liam Delap;ST;2003;ENG;78;;guc
Chris Wood;ST;1991;NZL;77;;kaf
Igor Jesus;ST;2001;BRA;77
Arnaud Kalimuendo;ST;2002;FRA;77`;

  P.SUN = `
Robin Roefs;GK;2003;NED;76
Kevin Danso;CB;1998;AUT;78
Omar Alderete;CB;1996;PAR;75
Daniel Ballard;CB;1999;NIR;74
Jordan Hume;RB;2000;ENG;74
Nordi Mukiele;RB;1997;FRA;76
Thomas Meunier;RB;1991;BEL;72
Reinildo;LB;1994;MOZ;75
Granit Xhaka;CM/DM;1992;SUI;81;;pas,kar
Noah Sadiki;DM;2004;COD;75
Habib Diarra;CM;2004;SEN;76
Enzo Le Fée;CM;2000;FRA;76
Chris Rigg;AM;2007;ENG;70;84
Malick Fofana;LW;2005;BEL;80;87;dri,hiz
Chemsdine Talbi;RW;2005;MAR;74
Dayann Méthalie;RW;2004;FRA;76
Jules Ahoka;RW;2004;FRA;72
Juan Riquelme Angulo;LW;2006;ESP;72;82
Wilson Isidor;ST;2000;FRA;77
Brian Brobbey;ST;2002;NED;75;;guc`;

  P.COV = `
Carl Rushworth;GK;2001;ENG;72
Milan van Ewijk;RB;2000;NED;74
Jay Dasilva;LB;1998;WAL;72
Bobby Thomas;CB;2001;ENG;72
Liam Kitching;CB;1999;ENG;70
Ethan Pinnock;CB;1993;JAM;72
Matt Grimes;CM;1995;ENG;74
Frank Onyeka;DM;1998;NGA;73
Jack Rudoni;AM;2001;ENG;74
Tatsuhiro Sakamoto;RW;1996;JPN;73
Ephron Mason-Clark;LW;1999;ENG;71
Josh Eccles;CM;2000;ENG;68
Loum Tchaouna;RW;2003;FRA;73
Haji Wright;ST;1998;USA;75
Ellis Simms;ST;2001;ENG;72`;

  P.IPS = `
Kjell Scherpen;GK;2000;NED;74
Christian Walton;GK;1995;ENG;70
Issa Diop;CB;1997;FRA;75
Dara O'Shea;CB;1999;IRL;72
Jacob Greaves;CB;2000;ENG;71
Kayne van Oevelen;CB;2004;NED;70
Leif Davis;LB;1999;ENG;72
Ben Johnson;RB;2000;ENG;71
Exequiel Palacios;CM;1998;ARG;78;;pas
Florentino Luís;DM;1999;POR;75;;kap
Saša Lukić;CM;1996;SRB;74
Kalvin Phillips;DM;1995;ENG;71
Zian Flemming;AM;1998;NED;74
Julio Enciso;AM/LW;2004;PAR;76
Abdul Fatawu;RW;2004;GHA;76;;hiz
Daizen Maeda;LW;1997;JPN;78;;hiz,day
Jaden Philogene;LW;2002;ENG;73
Emersonn;ST;2004;BRA;74;82
George Hirst;ST;1999;ENG;71`;

  P.HUL = `
Jack Butland;GK;1993;ENG;74
Ryan Giles;LB;2000;ENG;72;;ort
Matt Crooks;CM;1994;ENG;70
Joe Gelhardt;ST;2002;ENG;70
Oliver McBurnie;ST;1996;SCO;71;;kaf`;

  // Championship (küme düşen kulüpler ve bilinen oyuncular)
  P.WOL = `
José Sá;GK;1993;POR;77
Toti Gomes;CB;1999;POR;75
Yerson Mosquera;CB;2001;COL;73
Hugo Bueno;LB;2002;ESP;72
Matt Doherty;RB;1992;IRL;71
André;DM;2001;BRA;76
Marshall Munetsi;CM;1996;ZIM;74
Jean-Ricner Bellegarde;AM;1998;HAI;75
Hwang Hee-chan;LW;1996;KOR;74
Jørgen Strand Larsen;ST;2000;NOR;77;;kaf
Tolu Arokodare;ST;2000;NGA;73`;

  P.WHU = `
Alphonse Areola;GK;1993;FRA;77
Mads Hermansen;GK;2000;DEN;75
Max Kilman;CB;1997;ENG;77
Jean-Clair Todibo;CB;1999;FRA;76
Konstantinos Mavropanos;CB;1997;GRE;75
Aaron Wan-Bissaka;RB;1997;ENG;77
El Hadji Malick Diouf;LB;2004;SEN;76
Tomáš Souček;CM;1995;CZE;77;;kaf
Guido Rodríguez;DM;1994;ARG;74
Jarrod Bowen;RW;1996;ENG;81
Crysencio Summerville;LW;2001;NED;77
Adama Traoré;RW;1996;ESP;75;;hiz,guc
Niclas Füllkrug;ST;1993;GER;75`;

  P.BUR = `
Hjalmar Ekdal;CB;1998;SWE;72
Quilindschy Hartman;LB;2001;NED;71
Josh Cullen;CM;1996;IRL;74
Josh Laurent;CM;1995;ENG;72
Hannibal Mejbri;AM;2003;TUN;73
Lyle Foster;ST;2000;RSA;71
Marcus Edwards;RW;1998;ENG;72
Armando Broja;ST;2001;ALB;72`;
})(typeof window !== 'undefined' ? window : globalThis);
