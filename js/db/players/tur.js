/* Türkiye - Trendyol Süper Lig 2026-27 kadroları (2026 yaz transferleri dahil, web araması + genel bilgi).
   Satır: Ad;Mevki[/yan mevkiler];doğum yılı;ülke;güç (45-95);[potansiyel];[stil etiketleri]
   Güç değerleri oyunun kendi tahminidir. Listede olmayan kadro yerleri kulüp seviyesine göre kurgusal oyuncularla tamamlanır. */
(function (G) {
  'use strict';
  const P = G.CM.DB.P = G.CM.DB.P || {};

  P.GAL = `
Uğurcan Çakır;GK;1996;TUR;81;;ref
Günay Güvenç;GK;1991;TUR;71
Jankat Yılmaz;GK;2004;TUR;62;72
Davinson Sánchez;CB;1996;COL;80;;guc,kaf
Abdülkerim Bardakcı;CB;1994;TUR;77;;kaf,kar
El Chadaille Bitshiabu;CB;2005;FRA;74;83;guc
Kaan Ayhan;CB/DM;1994;TUR;73
Arda Ünyay;CB;2005;TUR;64;76
Wilfried Singo;RB/CB;2000;CIV;79;;hiz,guc
Eren Elmalı;LB;2000;TUR;75
Ismail Jakobs;LB;1999;SEN;76;;hiz
Kazımcan Karataş;LB;2003;TUR;68;74
Lucas Torreira;DM;1996;URU;80;;kap,day
Mario Lemina;DM/CM;1993;GAB;77;;guc,kap
Lesley Ugochukwu;DM;2004;FRA;74;81
İlkay Gündoğan;CM/AM;1990;GER;79;;pas,yar,-hiz
Gabriel Sara;CM/AM;1999;BRA;80;;pas,uza
Aleksey Batrakov;AM/CM;2005;RUS;79;88;yar,tek
Eyüp Aydın;CM;2004;TUR;64;73
Roland Sallai;RW/RB;1997;HUN;78;;day
Yunus Akgün;RW/AM;2000;TUR;77;;dri
Leroy Sané;RW/LW;1996;GER;82;;dri,hiz,uza
Rafael Leão;LW;1999;POR;85;;hiz,dri,guc
Barış Alper Yılmaz;RW/ST;2000;TUR;79;;guc,hiz
Victor Osimhen;ST;1998;NGA;88;;hiz,kaf,bit
Deniz Gül;ST;2004;TUR;72;80`;

  P.FEN = `
Ederson;GK;1993;BRA;84;;pas
Mert Günok;GK;1989;TUR;73
Tarık Çetin;GK;1996;TUR;68
Milan Škriniar;CB;1995;SVK;82;;mar,kaf,kar
Nathan Aké;CB/LB;1995;NED;80;;pas
Çağlar Söyüncü;CB;1996;TUR;76
Kojo Peprah Oppong;CB;2004;GHA;74;82;hiz
Yiğit Efe Demir;CB;2004;TUR;71;80
Nélson Semedo;RB;1993;POR;76;;hiz
Mert Müldür;RB/LB;1999;TUR;75
N'Golo Kanté;DM/CM;1991;FRA;79;;kap,day
İsmail Yüksek;DM;1999;TUR;74;;kap
Matteo Guendouzi;CM;1999;FRA;81;;day,pas
Marco Asensio;AM/RW;1996;ESP;81;;uza,tek
Anderson Talisca;AM/ST;1994;BRA;77;;uza,kaf
Kerem Aktürkoğlu;LW/RW;1998;TUR;80;;hiz,dri
Mason Greenwood;RW/ST;2001;ENG;84;;bit,uza,tek
Amara Diouf;LW;2008;SEN;64;86;hiz,dri
Romelu Lukaku;ST;1993;BEL;80;;guc,bit,-hiz
Vedat Muriqi;ST;1994;KOS;78;;kaf,guc,-hiz
Sidiki Chérif;ST;2006;FRA;72;84;hiz`;

  P.BJK = `
Alexander Nübel;GK;1996;GER;80
Doğan Alemdar;GK;2002;TUR;71;77
Emmanuel Agbadou;CB;1997;CIV;77;;guc
Tiago Djaló;CB;2000;POR;76
Emirhan Topçu;CB;2001;TUR;72
Ümit Akdağ;CB;2003;TUR;70;76
Yasin Özcan;CB;2006;TUR;68;80
Amir Murillo;RB;1996;PAN;75;;hiz
Taylan Bulut;RB;2006;TUR;68;79
Rıdvan Yılmaz;LB;2001;TUR;73
Kassoum Ouattara;LB;2004;BFA;72;79;hiz
Wilfred Ndidi;DM;1996;NGA;79;;kap,guc
Salih Özcan;DM/CM;1998;TUR;74
Kartal Yılmaz;CM;2001;TUR;70
Orkun Kökçü;CM/AM;2000;TUR;81;;pas,uza,yar
Fabio Miretti;CM/AM;2003;ITA;74;80
Junior Olaitan;AM/CM;2002;BEN;72;77
İlhan Fakılı;AM;2004;TUR;63;72
Václav Černý;RW;1997;CZE;77;;uza
Leandro Trossard;LW/AM;1994;BEL;81;;tek,bit
Ernest Poku;RW/LW;2004;NED;74;82;hiz
Dušan Vlahović;ST;2000;SRB;83;;bit,kaf,guc
Oh Hyeon-gyu;ST;2001;KOR;73
Semih Kılıçsoy;ST;2005;TUR;71;81`;

  P.TS = `
André Onana;GK;1996;CMR;80;;pas
Ahmet Doğan Yıldırım;GK;2003;TUR;63;70
Stefan Savić;CB;1991;MNE;75;;mar,kar
Chibuike Nwaiwu;CB;2003;NGA;74;80
Samet Akaydın;CB;1994;TUR;73
Cenk Özkacar;CB;2000;TUR;73
Arseniy Batagov;CB;2002;UKR;72;77
Wagner Pina;RB/LB;2003;CPV;73;78
Mustafa Eskihellaç;RB;1997;TUR;71
Sidny Lopes Cabral;LB;2002;CPV;72;77
Fabinho;DM;1993;BRA;78;;kap,pas
Batista Mendy;DM;2000;FRA;74
Benjamin Bouchouari;CM;2001;MAR;72
Tim Jabol-Folcarelli;CM;2000;FRA;72
Ozan Tufan;CM;1995;TUR;72
Ruslan Malinovskyi;AM/CM;1993;UKR;77;;uza,pas
Ernest Muçi;AM/LW;2001;ALB;75;;tek
Aral Şimşir;LW;2002;TUR;73;78;hiz
Noah Saviolo;LW;2004;FRA;70;78
Mohamed Salah;RW;1992;EGY;86;;bit,hiz,dri
Franculino Dju;ST;2004;GNB;74;82;hiz
Paul Onuachu;ST;1994;NGA;77;;kaf,guc,-hiz
Umut Nayır;ST;1993;TUR;68`;

  P.IBFK = `
Muhammed Şengezer;GK;1997;TUR;70
Léo Duarte;CB;1996;BRA;73
Jerome Opoku;CB;1998;GHA;72
Ousseynou Ba;CB;1995;SEN;72
Festy Ebosele;RB;2002;IRL;71;;hiz
Michał Karbownik;LB;2001;POL;72
Christopher Operi;LB;1997;CIV;70
Berat Özdemir;DM;1998;TUR;72
Olivier Kemen;CM;1996;FRA;72
Miguel Crespo;CM;1996;POR;73
Abbosbek Fayzullaev;AM/LW;2003;UZB;74;79;dri
Edin Višća;RW;1990;BIH;73;;ort
Yusuf Sarı;RW;1998;TUR;71
Eldor Shomurodov;ST;1995;UZB;76;;bit
Davie Selke;ST;1995;GER;73;;kaf`;

  P.SAMS = `
Okan Kocuk;GK;1995;TUR;72
Bilal Bayazıt;GK;1999;TUR;70
Rick van Drongelen;CB;1998;NED;74;;kaf
Toni Borevković;CB;1997;CRO;72
Logi Tómasson;LB;2000;ISL;72
Celil Yüksel;DM;1998;TUR;71
Antoine Makoumbou;CM;1998;CGO;73
Polat Yaldır;CM;2002;TUR;67;73
Samed Onur;CM;2002;TUR;66;72
Carlo Holse;LW/AM;1999;DEN;74
Anthony Musaba;RW;2000;NED;72;;hiz
Emre Kılınç;LW;1994;TUR;70
Tanguy Coulibaly;LW;2001;FRA;71
Fatih Kaya;ST;1999;TUR;68`;

  P.GOZ = `
Luka Gugeshashvili;GK;1999;GEO;70
Malcom Bokele;CB;2000;CMR;72
Allan Godói;CB;1998;BRA;71
Ogün Bayrak;RB;1998;TUR;68
Arda Okan Kurtulan;LB;2003;TUR;66
Novatus Dismas;DM;2002;TAN;70
Anthony Dennis;CM;2004;NGA;70;77
Taha Altıkardeş;DM;2003;TUR;68
Romulo;AM;2001;BRA;73;;tek
David Tijanić;AM;1997;SVN;70
Gökdeniz Bayrakdar;LW;1998;TUR;70
Juan;ST;2002;BRA;73;;guc
Sinclair Armstrong;ST;2003;IRL;70;77;hiz
André Henrique;ST;2002;BRA;70`;

  P.EYP = `
Marcos Felipe;GK;1996;BRA;70
Nihad Mujakić;CB;1998;BIH;70
Robin Yalçın;CB;1993;TUR;70
Luccas Claro;CB;1991;BRA;70
Jawad El Yamiq;CB;1992;MAR;70
Calegari;RB;2002;BRA;70
Umut Meraş;LB;1995;TUR;69
Taras Stepanenko;DM;1989;UKR;69
Mateusz Łęgowski;DM;2003;POL;68
Kerem Demirbay;CM;1993;TUR;74;;pas,uza
Svit Sešlar;CM;2004;SVN;68;75
Emre Akbaba;AM;1992;TUR;71
Samu Sáiz;AM;1991;ESP;72;;tek
Abdelhamid Sabiri;AM;1996;MAR;72;;uza
Prince Ampem;RW;1998;GHA;70
Serdar Gürler;LW;1991;TUR;69
Denis Drăguș;ST;1999;ROU;71
Mame Thiam;ST;1992;SEN;70
Umut Bozok;ST;1996;TUR;69`;

  P.KAS = `
Andreas Gianniotis;GK;1992;GRE;71
Attila Szalai;CB;1998;HUN;74
Nicholas Opoku;CB;1997;GHA;70
Kevin Rodrigues;LB;1994;POR;69
Haris Hajradinović;AM;1994;BIH;71
Cafú;CM;1993;POR;70
Fousseni Diabaté;RW;1995;MLI;70
Mamadou Fall;LW;2002;SEN;70
Adrian Benedyczak;ST;2000;POL;72`;

  P.RIZ = `
Yahia Fofana;GK;2000;CIV;74
Tayyip Talha Sanuç;CB;2000;TUR;71
Emir Ortakaya;CB;2004;TUR;66;74
Qazim Laçi;CM;1996;ALB;72
Can Bozdoğan;CM;2001;TUR;69
Valentin Mihăilă;LW;2000;ROU;74;;hiz
Jesurun Rak-Sakyi;RW;2002;ENG;70
Loide Augusto;RW;2000;ANG;70
Frantzdy Pierrot;ST;1995;HAI;72;;kaf,guc`;

  P.KON = `
Chidozie Awaziem;CB;1997;NGA;72
Adil Demirbağ;CB;1997;TUR;70
Arthur Masuaku;LB;1993;COD;72
Arif Boşluk;LB;2003;TUR;68
Marko Jevtović;DM;1993;SRB;70
Pedrinho;AM;1998;BRA;72
Jean-Luc Dompé;LW;1995;FRA;72;;dri
Ebrima Colley;LW;2000;GAM;70
Mostafa Mohamed;ST;1997;EGY;74;;kaf
Enis Destan;ST;2002;TUR;70`;

  P.ALN = `
Paulo Victor;GK;1987;BRA;68
Fidan Aliti;CB;1993;KOS;71
Nuno Lima;LB;2001;CPV;72
Florent Hadergjonaj;RB;1994;KOS;69
Gaius Makouta;CM;1997;CGO;71
Ianis Hagi;AM;1998;ROU;74;;tek,pas
Meschack Elia;RW;1997;COD;71;;hiz
Hwang Ui-jo;ST;1992;KOR;71
Baran Ali Gezek;CM;2006;TUR;64;76
Omar Ben Ali;ST;2005;TUN;64;75`;

  P.GFK = `
Mustafa Burak Bozan;GK;2000;TUR;66
Arda Kızıldağ;CB;1998;TUR;70
Myenty Abena;CB;1994;SUR;71
Nazım Sangaré;RB;1994;TUR;70
Kacper Kozłowski;CM;2003;POL;72;77
Alexandru Maxim;AM;1990;ROU;71;;pas
Deian Sorescu;RW;1997;ROU;70
Christopher Lungoyi;RW;2000;SUI;69
Mohamed Bayo;ST;1998;GUI;71`;

  P.KOC = `
Aleksandar Jovanović;GK;1992;SRB;72
Hrvoje Smolčić;CB;2000;CRO;70
Massadio Haïdara;LB;1992;MLI;68
Ahmet Oğuz;LB;1993;TUR;68
Show;DM;1999;ANG;70
Ryan Mendes;LW;1990;CPV;67
Bruno Petković;ST;1994;CRO;72;;kaf,pas
Serdar Dursun;ST;1991;TUR;70`;

  P.GNC = `
Ricardo Velho;GK;1998;POR;72
Zan Zuzek;CB;1997;SVN;70
Thalisson;CB;1998;BRA;69
Abdurrahim Dursun;LB;1999;TUR;67
Oğulcan Ülgün;CM;1998;TUR;68
Franco Tongya;AM;2002;ITA;70
Dal Varešanović;AM;2001;BIH;70
Göktan Gürpüz;AM;2002;TUR;67
Henry Onyekuru;LW;1997;NGA;71;;hiz
M'Baye Niang;ST;1994;SEN;71;;guc`;
})(typeof window !== 'undefined' ? window : globalThis);
