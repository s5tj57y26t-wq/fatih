# Şampiyonluk Menajeri 01/02

Championship Manager 01/02 tarzında, telefonda oynanmak üzere tasarlanmış metin tabanlı bir futbol menajerlik oyunu.
Kurulum ya da derleme gerektirmez; saf HTML/CSS/JavaScript ile yazılmıştır ve internet olmadan da çalışır (PWA).
Oyun **2026/27 sezonunun başında (1 Temmuz 2026)** başlar.

## Dünya

- **20 ülkenin oynanabilir ligi** (+ 6 ikinci lig): İngiltere, İspanya, Almanya, İtalya, Fransa, Türkiye (2. ligleriyle birlikte),
  Portekiz, Hollanda, Belçika, İskoçya, Avusturya, İsviçre, Yunanistan, Çekya, Danimarka, Polonya, Hırvatistan, Sırbistan,
  Ukrayna ve Suudi Arabistan. Ligler güncel adları (Trendyol Süper Lig, LALIGA EA SPORTS, Serie A Enilive...), 2026/27
  takım listeleri, takım sayıları, devre sayıları, lig bölünmeleri (Avusturya, İskoçya, İsviçre, Danimarka, Yunanistan,
  Çekya, Sırbistan, Hırvatistan'ın 4 devresi...), düşme/terfi, play-off ve baraj kurallarıyla modellenmiştir.
- **Yerel kupalar**: Ziraat Türkiye Kupası, FA Cup, Carabao Cup, Copa del Rey, DFB-Pokal, Coppa Italia vb. ve süper kupalar
  (Turkcell Süper Kupa 4 takımlı).
- **UEFA**: Şampiyonlar Ligi, Avrupa Ligi, Konferans Ligi — 36 takımlı lig aşaması (İsviçre sistemi, torbalı kura, aynı ülke
  eşleşmesi yok), play-off turu, son 16'dan finale sabit eşleşme ağacı; UEFA Süper Kupa; ülke ve kulüp katsayıları,
  katsayıya göre katılım listesi ve ödül paraları. 2026/27 lig aşaması katılımcıları gerçektir; sonraki sezonların katılımcıları
  oyun içindeki lig ve kupa sonuçlarından belirlenir.
- **Diğer kulüp turnuvaları**: FIFA Kıtalararası Kupa, AFC Şampiyonlar Ligi Elite (Batı/Doğu bölgeleri), 2029 FIFA Kulüpler Dünya Kupası.
- **Milli takımlar** (~130 ülke): UEFA Uluslar Ligi (2026/27 gerçek A ligi grupları), EURO 2028 (İngiltere/İskoçya/Galler/İrlanda)
  elemeleri ve finalleri, 2030 Dünya Kupası elemeleri ve finalleri (48 takım), Afrika Uluslar Kupası, Asya Kupası, Gold Cup, Copa América.
  Elo tabanlı dünya sıralaması; milli takım oyuncuları maç öncesi kulüplerinden ayrılır.
- **Gerçek oyuncular**: 190'dan fazla kulübün ~2.200 gerçek oyuncusu (2026 yaz transferleri dahil); mevki, yaş, uyruk ve oyun
  tarzına göre CM tarzı 1-20 arası 17 özellik. Veritabanı dışındaki kadro boşlukları kurgusal oyuncularla doldurulur (kadroda "·" işaretli).

## Oynanış

- **Kariyer**: istediğiniz ligden bir kulüp, isteğe bağlı olarak bir milli takım ile birlikte. Yönetim kurulu hedefleri, güven,
  görevden alınma ve iş teklifleri.
- **Canlı maç**: dakika dakika Türkçe anlatım (atak cümlesi, ardından sonucu), 4 hız, canlı oyuncu notları, devre arası, maç içi taktik; 5 değişiklik hakkı (3 pencerede, uzatmada +1),
  uzatmalar ve seri penaltılar, çift maçlı eşleşmelerde toplam skor. "Hızlı sonuç" seçeneği.
- **Taktik**: 11 diziliş, mentalite, pas stili, pres, tempo, penaltıcı; mevki dışı oyuncular daha düşük verim verir.
- **Transfer**: tüm dünyada oyuncu arama (lig, uyruk, yaş, değer filtreleri), bonservis pazarlığı, karşı teklif, maaş ve sözleşme süresi,
  yabancı oyuncu kotaları, serbest oyuncular, transfer dönemleri (yaz ve ocak; dönem içinde oyun 2'şer gün ilerler), satış listesi.
  Gelen tekliflerde kabul / ret / pazarlık; teklifler dönem kapanınca geçersiz olur.
- **Kiralık**: diğer kulüplerin kadro dışı oyuncularını sezon sonuna kadar kiralama; kendi oyuncularınızı kiralık listesine koyma.
  Kiralıklar 30 Haziran'da kulüplerine döner.
- **Yönetim bütçesi**: transfer bütçesi her sezon kasaya ve yönetimin güvenine göre belirlenir; satışların yarısı bütçeye eklenir.
  Gelirlerin yanında maaş ve işletme giderleri vardır.
- **Gözlem**: tanımadığınız oyuncuların özellikleri aralık olarak görünür; tek oyuncu (1 hafta), lig veya ülke (4 hafta) gözlemi.
- **Antrenman**: takım odağı (genel, fiziksel, hücum, savunma, taktik, duran top) ve yoğunluk; bireysel antrenman odağı.
- **Kulüp**: finans (bilet, TV, sponsor, ödüller, maaşlar), altyapı (her yıl 15 Mart'ta genç oyuncular), sözleşme yenileme/fesih.
- Sakatlıklar, turnuvaya göre ayrı sarı kart birikimi ve cezalar, kondisyon, moral, oyuncu gelişimi, yaşlanma ve emeklilik.
- Kulüp renkleri ve desenleriyle çizilen armalar (gerçek logolar değil).
- Önemli mesajlarda (transfer/kiralama teklifi, iş teklifi, görevden alınma) oyun durur ve yanıt ekranını açar.
- Otomatik kayıt (IndexedDB, sıkıştırılmış).

## Telefonda oynamak

Oyun statik dosyalardan oluşur; herhangi bir statik barındırmaya koymanız yeterli.

**GitHub Pages ile:** Depo ayarlarında *Settings → Pages → Build and deployment* bölümünde kaynak olarak bu dalı ve kök
klasörü (`/`) seçin. Verilen adresi telefonda açın, ardından tarayıcı menüsünden **"Ana ekrana ekle"** deyin;
oyun uygulama gibi tam ekran açılır ve çevrimdışı çalışır.

**Bilgisayarda yerel olarak:**

```bash
python3 -m http.server 8080
```

Aynı Wi-Fi ağındaki telefondan `http://<bilgisayarın-ip-adresi>:8080` adresini açabilirsiniz.

## Dosya yapısı

| Klasör / dosya | İçerik |
| --- | --- |
| `js/core/` | Yardımcılar (rastgelelik, tarih, para), kayıt/yükleme |
| `js/db/` | Ülkeler, ligler ve kurallar, kulüpler, isim havuzları, `players/` altında gerçek oyuncu listeleri |
| `js/model/` | Oyuncu modeli, maç motoru, turnuva motoru, takvim, dünya kurulumu, oyun döngüsü, UEFA, milli takımlar, transfer/finans |
| `js/ui/` | Arayüz ekranları, canlı maç, olay yönetimi |
| `tools/normalize-players.js` | Oyuncu dosyalarını düzenleyen yardımcı betik (Node.js) |

Oyuncu satırı biçimi: `Ad Soyad;MEVKİ[/YAN MEVKİ];doğum yılı;UYRUK;güç[;potansiyel][;özellik etiketleri]`.

## Notlar

- Oyuncu güç değerleri, gerçek oyuncuların bilinen seviyesine göre oyunun kendi tahminidir; resmi bir veritabanı değildir.
- Henüz resmi olarak kesinleşmemiş biçimler (ör. 2030 Dünya Kupası UEFA elemeleri, bazı kıta turnuvalarının tarihleri) gerçeğe
  en yakın şekilde yaklaşık olarak modellenmiştir. Takvim yılına göre oynanan ligler (Norveç, İsveç vb.) oynanabilir değildir;
  bu ülkelerin kulüpleri Avrupa kupalarında yer alır.
