/* İsim havuzları: veritabanında gerçek karşılığı olmayan kadro boşluklarını dolduran kurgusal oyuncular için */
(function (G) {
  'use strict';
  const CM = G.CM, U = CM.U;
  const P = {
    TUR: ['Ahmet Mehmet Mustafa Emre Burak Arda Hakan Serkan Onur Caner Ozan Kerem Cenk Umut Yusuf Ömer Barış Tolga Sinan Gökhan Selçuk Oğuzhan Deniz Kaan Berk Efe Mert Cem Uğur Engin Fatih Okan Yasin Murat Ali Can Enes Halil İsmail Kadir Salih Taner Ferhat Erkan Doğukan Yunus Eren Bartu Kutay Emirhan Semih Batuhan Furkan Alperen Tarık',
      'Yılmaz Kaya Demir Şahin Çelik Yıldız Yıldırım Öztürk Aydın Özdemir Arslan Doğan Kılıç Aslan Çetin Kara Koç Kurt Özkan Şimşek Polat Erdem Korkmaz Güneş Aksoy Tekin Bulut Ünal Tunç Akın Keskin Durmaz Sarı Uysal Gül Ateş Bozkurt Karaca Taş Erol Toprak Ekinci Sezer Uçar Akgün Balcı Coşkun Duman Esen Işık Kaplan Oral Tuna Akbaş Gürbüz Yazıcı'],
    ENG: ['James Jack Harry Charlie George Oliver Thomas William Joe Ben Sam Lewis Callum Jordan Ryan Tom Luke Adam Josh Kieran Connor Dan Matt Liam Nathan Owen Reece Tyler Kyle Jamie Scott Rhys Aaron Jake Max Alfie Archie Ethan Finley Harvey',
      'Smith Jones Taylor Brown Williams Wilson Johnson Davies Robinson Wright Thompson Evans Walker White Roberts Green Hall Wood Jackson Clarke Hughes Edwards Turner Hill Moore Cooper Ward Morris King Watson Harrison Morgan Baker Young Mitchell Parker Bennett Barnes Shaw Fletcher'],
    ESP: ['Alejandro Pablo Daniel Adrián Álvaro David Javier Sergio Carlos Iker Mario Hugo Marc Raúl Jorge Rubén Diego Víctor Manuel Iván Óscar Borja Álex Unai Aitor Gonzalo Miguel Jaime Nacho Fran Dani Rodrigo Pedro Jon Asier',
      'García Fernández González Rodríguez López Martínez Sánchez Pérez Gómez Martín Jiménez Ruiz Hernández Díaz Moreno Muñoz Álvarez Romero Alonso Gutiérrez Navarro Torres Domínguez Vázquez Ramos Gil Ramírez Serrano Blanco Molina Morales Ortega Delgado Castro Ortiz Rubio Marín Sanz Iglesias Medina'],
    LAT: ['Juan Carlos Luis José Miguel Andrés Santiago Sebastián Mateo Diego Kevin Jhon Brayan Cristian Jhonatan Wilmer Edwin Jefferson Byron Anthony Óscar Richard Julián Nicolás Felipe',
      'Rodríguez Gómez Martínez Hernández López González Pérez Sánchez Ramírez Torres Flores Rivera Morales Ortiz Castillo Vargas Reyes Cruz Mendoza Quintero Caicedo Valencia Mina Arboleda Hurtado Estupiñán Cabezas Angulo'],
    ARG: ['Lautaro Julián Enzo Alexis Nicolás Rodrigo Leandro Franco Facundo Matías Gonzalo Lucas Agustín Tomás Thiago Valentín Joaquín Ezequiel Maximiliano Federico Germán Santiago Nahuel Cristian Emiliano',
      'Fernández González Rodríguez Gómez Martínez López Díaz Pérez Romero Sosa Álvarez Acuña Paredes Medina Benítez Molina Castro Ferreyra Giménez Ruiz Suárez Rojas Silva Ramos Correa Aguirre Vázquez Cabrera Ledesma Rossi'],
    POR: ['João Pedro Diogo Tiago Rafael Gonçalo Rúben Bruno André Ricardo Nuno Miguel Francisco Rodrigo Tomás Vitinha Fábio Hugo Luís Nélson Renato Daniel Bernardo Duarte Martim',
      'Silva Santos Ferreira Pereira Oliveira Costa Rodrigues Martins Jesus Sousa Fernandes Gonçalves Gomes Lopes Marques Alves Almeida Ribeiro Pinto Carvalho Teixeira Moreira Correia Mendes Nunes Soares Vieira Monteiro Cardoso Rocha'],
    BRA: ['Gabriel Lucas Matheus Pedro Guilherme Rafael Felipe Bruno Vinícius Gustavo João Thiago Leonardo Igor Caio Wesley Rodrygo Danilo Éder Douglas Luiz Everton Fabrício Willian Marcos Júnior Alex Renan Diego',
      'Silva Santos Oliveira Souza Rodrigues Ferreira Alves Pereira Lima Gomes Costa Ribeiro Martins Carvalho Almeida Lopes Soares Fernandes Vieira Barbosa Rocha Dias Nascimento Andrade Moreira Nunes Marques Machado Mendes Freitas'],
    ITA: ['Alessandro Andrea Lorenzo Matteo Francesco Luca Marco Davide Simone Federico Riccardo Gabriele Giacomo Nicolò Stefano Mattia Pietro Filippo Tommaso Samuele Daniele Michele Giorgio Manuel Antonio',
      'Rossi Russo Ferrari Esposito Bianchi Romano Colombo Ricci Marino Greco Bruno Gallo Conti De Luca Mancini Costa Giordano Rizzo Lombardi Moretti Barbieri Fontana Santoro Mariani Rinaldi Caruso Ferrara Galli Martini Leone Longo Gentile'],
    FRA: ['Lucas Hugo Théo Nathan Mathis Enzo Louis Raphaël Tom Maxime Antoine Alexandre Kylian Yanis Mohamed Rayan Adam Noah Jules Baptiste Clément Quentin Florian Kévin Jordan Moussa Ibrahima Mamadou Ousmane Axel',
      'Martin Bernard Dubois Thomas Robert Richard Petit Durand Leroy Moreau Simon Laurent Lefebvre Michel Garcia David Bertrand Roux Vincent Fournier Morel Girard André Mercier Dupont Lambert Bonnet François Martinez Diallo Traoré Koné Camara Sissoko Mendy'],
    GER: ['Lukas Leon Finn Jonas Paul Luca Felix Maximilian Niklas Tim Jan Julian Moritz David Florian Tobias Kevin Marco Nico Jannik Lennard Timo Robin Fabian Dominik Marvin Kai Sebastian Philipp Yannick',
      'Müller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann Schäfer Koch Bauer Richter Klein Wolf Schröder Neumann Schwarz Zimmermann Braun Krüger Hofmann Hartmann Lange Schmitt Werner Krause Meier Lehmann Huber Gruber Steiner'],
    NED: ['Daan Sem Lucas Levi Milan Jesse Thijs Bram Luuk Stijn Ruben Jens Tim Sven Kevin Jordy Joey Mats Thomas Noah Justin Quinten Wout Dani Teun Rick',
      'de Jong Jansen de Vries van den Berg van Dijk Bakker Janssen Visser Smit Meijer de Boer Mulder de Groot Bos Vos Peters Hendriks van Leeuwen Dekker Brouwer de Wit Dijkstra Smits de Graaf van der Meer Kok Jacobs Vermeulen van Beek Schouten'],
    SCA: ['Mikkel Rasmus Magnus Jonas Oliver William Emil Victor Frederik Mathias Andreas Kasper Sander Kristian Erik Anders Lars Henrik Johan Oscar Viktor Elias Isak Axel Filip Joel Noah Sebastian Tobias Martin',
      'Nielsen Jensen Hansen Pedersen Andersen Christensen Larsen Sørensen Rasmussen Olsen Johansen Karlsson Andersson Eriksson Nilsson Larsson Olsson Persson Svensson Berg Haugen Hagen Johnsen Solberg Strand Lindqvist Holm Dahl Lund Bakke'],
    SLS: ['Luka Ivan Marko Josip Ante Mateo Nikola Filip Petar Stefan Lazar Aleksandar Miloš Dušan Nemanja Uroš Vladimir Mario Borna Duje Toni Dino Amar Edin Kenan Emir Haris Nikolaj Martin Andrej',
      'Horvat Kovačević Babić Marić Jurić Novak Knežević Vuković Petrović Jovanović Nikolić Marković Đorđević Stojanović Ilić Pavlović Milošević Popović Stanković Mitrović Kostić Radić Perić Tomić Pašić Hodžić Begić Kovač Lukić Savić'],
    SLW: ['Jakub Kacper Szymon Mateusz Bartosz Michał Filip Wojciech Kamil Piotr Tomáš Jan Lukáš Ondřej David Martin Adam Matěj Patrik Marek Peter Dominik Jakub Adrián Lukasz',
      'Nowak Kowalski Wiśniewski Wójcik Kowalczyk Kamiński Lewandowski Zieliński Szymański Woźniak Dąbrowski Kozłowski Novák Svoboda Novotný Dvořák Černý Procházka Kučera Veselý Horák Němec Král Hudák Kováč Tóth Varga Baláž'],
    UKR: ['Oleksandr Andriy Mykola Dmytro Serhiy Vitaliy Yuriy Taras Bohdan Artem Illia Maksym Vladyslav Oleh Roman Heorhiy Mykhailo Valeriy Denys Anatoliy Ivan Yevhen',
      'Kovalenko Bondarenko Tkachenko Kravchenko Boyko Melnyk Koval Moroz Lysenko Rudenko Savchenko Petrenko Marchenko Shapoval Sydorenko Ponomarenko Oliynyk Hnatyuk Kovalchuk Polishchuk Levchenko Pavlenko Klymenko Moskalenko'],
    GRE: ['Giorgos Dimitris Nikos Kostas Giannis Christos Panagiotis Vasilis Thanasis Michalis Stelios Sotiris Apostolos Lazaros Anastasios Petros Fotis Kyriakos Tasos Manolis',
      'Papadopoulos Pappas Georgiou Oikonomou Nikolaou Karagiannis Vlachos Papanikolaou Makris Dimitriou Konstantinou Ioannou Christodoulou Antoniou Alexiou Papadakis Athanasiou Stamatis Kyriakou Michailidis'],
    HUN: ['Bence Dániel Máté Ádám Balázs Dominik Zsolt Gergő Levente Márton Roland Kristóf Attila Péter Tamás',
      'Nagy Kovács Tóth Szabó Horváth Varga Kiss Molnár Németh Farkas Balogh Papp Takács Juhász Lakatos Mészáros Oláh Simon Fehér Szalai'],
    ROU: ['Andrei Alexandru Ionuț Florin Răzvan Mihai Cristian Nicolae Denis Darius Adrian Vlad Radu Ștefan Valentin Marius',
      'Popescu Ionescu Popa Stan Dumitru Munteanu Stoica Constantin Marin Moldovan Mihai Radu Rusu Ene Toma Nistor Dobre Coman Barbu Lungu'],
    ALB: ['Arbër Armando Ermir Kristjan Elseid Rey Nedim Myrto Taulant Endri Lirim Arlind Valon Florent Milot Edon Besar Fidan',
      'Hoxha Berisha Krasniqi Gashi Shala Morina Kastrati Ismajli Bajrami Rexhepi Hasani Zeqiri Kelmendi Dervishi Shehu Leka Mema Ahmeti'],
    ARA: ['Mohammed Ahmed Abdullah Ali Omar Khalid Youssef Hamza Salem Saud Fahad Nasser Yasser Firas Abdulrahman Sultan Faisal Ayman Hassan Karim Ilyes Amine Anas Sofiane Walid',
      'Al-Harbi Al-Qahtani Al-Otaibi'],
    AFR: ['Moussa Cheikh Ibrahima Pape Mamadou Idrissa Victor Samuel Emeka Chidi Wilfried Franck Sébastien Serge Ismaël Yves Kofi Kwame Jordan André Abdul Seko Boubacar Amadou Nicolas Chukwuemeka Tunde Daniel',
      'Diop Ndiaye Sow Fall Cissé Diallo Sarr Gueye Traoré Keita Konaté Touré Kouassi Bamba Okafor Eze Nwosu Adeyemi Obi Mensah Owusu Boateng Asante Ofori Nkemelu Mbarga Tchoupo Ekambi Kamara Bangura'],
    JPN: ['Takumi Kaoru Daichi Wataru Hiroki Ritsu Ao Junya Yuto Shogo Keito Takehiro Koki Kota Reo Yuki Sota Haruto Ren Riku Kaito Hayato Shun',
      'Sato Suzuki Takahashi Tanaka Watanabe Ito Yamamoto Nakamura Kobayashi Kato Yoshida Yamada Sasaki Yamaguchi Matsumoto Inoue Kimura Hayashi Shimizu Mori Ikeda Hashimoto Ishikawa Ogawa Okada'],
    KOR: ['Min-jun Seo-jun Do-yun Ji-ho Joon-young Hyun-soo Sung-min Dong-hyun Jae-won Tae-yang Woo-jin Ji-hoon Sang-woo Min-seok Jun-ho Yong-hwan',
      'Kim Lee Park Choi Jung Kang Cho Yoon Jang Lim Han Oh Seo Shin Kwon Ahn Song Yoo Hong Jeon Ko Moon'],
    IRN: ['Mehdi Alireza Saman Ali Morteza Ramin Milad Saeid Omid Hossein Majid Ahmad Mohammad Karim Reza Amir Arash',
      'Ahmadi Mohammadi Hosseini Rezaei Moradi Jafari Rahimi Hashemi Sadeghi Heidari Najafi Ebrahimi Asadi Mousavi Kazemi Ghasemi Salehi Bagheri'],
    ASI: ['Wei Hao Jun Lei Chen Ming Tuan Minh Quang Hung Somchai Supachai Rizky Pratama Arif Budi Dimas Nattapong',
      'Wang Zhang Liu Wu Zhou Nguyen Tran Le Pham Hoang Srisuk Wongsa Saputra Hidayat Kurniawan Santoso Wibowo Suksawat'],
    CAU: ['Giorgi Levan Nika Luka Davit Aram Artur Sardor Jasur Rustam Elvin Orkhan Nurlan Timur Aslan Otar Saba Gor Narek Azamat',
      'Beridze Kapanadze Gelashvili Lomidze Tsiklauri Grigoryan Hakobyan Petrosyan Sargsyan Karimov Rakhimov Aliyev Mammadov Hasanov Ismoilov Nazarov Abdullayev Tursunov Babayan Gogoladze'],
    BAL: ['Karol Mattias Rauno Henri Konstantin Vladislavs Roberts Kristers Gvidas Fedor Artūras Justas Edvinas Paulius',
      'Tamm Saar Sepp Mägi Kask Bērziņš Kalniņš Ozoliņš Liepiņš Kazlauskas Jankauskas Petrauskas Stankevičius Vasiliauskas'],
    ISR: ['Eran Manor Oscar Dor Liel Mohammad Gavriel Omri Eli Yarden Idan Tai Anan Roy Itay Nir',
      'Cohen Levi Mizrahi Friedman Biton Dahan Avraham Azoulay Katz Shapiro Hadad Amar Golan Ohana'],
  };
  const pools = {};
  for (const k in P) {
    if (!P[k][0]) continue;
    pools[k] = [P[k][0].split(' '), P[k][1].split(' ')];
  }
  // Çok kelimeli soyadlarını (de Jong vb.) korumak için özel ayrıştırma
  const NED_LAST = ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'van Leeuwen', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'de Graaf', 'van der Meer', 'Kok', 'Jacobs', 'Vermeulen', 'van Beek', 'Schouten'];
  pools.NED[1] = NED_LAST;
  pools.ARA[1] = ['Al-Harbi', 'Al-Qahtani', 'Al-Otaibi', 'Al-Zahrani', 'Al-Ghamdi', 'Al-Shammari', 'Bennani', 'El Idrissi', 'Benali', 'Haddad', 'Mansour', 'Khalil', 'Hamdi', 'Saleh', 'Yassine', 'Belkacem'];

  function make(nat) {
    const n = CM.DB.nations[nat];
    const key = n && pools[n.pool] ? n.pool : 'ENG';
    const p = pools[key];
    return U.pick(p[0]) + ' ' + U.pick(p[1]);
  }
  CM.Names = { make, pools };
})(typeof window !== 'undefined' ? window : globalThis);
