# Şampiyonluk Menajeri 01/02

Championship Manager 01/02 tarzında, telefonda oynanmak üzere tasarlanmış metin tabanlı bir futbol menajerlik oyunu.
Kurulum ya da derleme gerektirmez; saf HTML/CSS/JavaScript ile yazılmıştır ve internet olmadan da çalışır (PWA).

## Özellikler

- **18 kurgusal kulüp**, her birinde ~24 oyuncu; oyuncuların CM tarzı 1-20 arası özellikleri (bitiricilik, pas, top kapma, hız, kalecilik...)
- **Canlı maç motoru**: dakika dakika Türkçe anlatım, 3 hız seçeneği, devre arası, maç içi taktik ve oyuncu değişikliği,
  istatistikler, oyuncu notları ve diğer maçların anlık skorları
- **Taktik**: 6 diziliş (4-4-2, 4-3-3, 4-5-1, 3-5-2, 5-3-2, 4-2-4), mentalite, pas stili ve pres ayarları; saha üzerinde ilk 11 ve 7 yedek seçimi
- **Transfer**: oyuncu arama/filtreleme, bonservis teklifi, pazarlık (karşı teklif), maaş talebi ve sözleşme süresi,
  serbest oyuncular, satış listesi ve diğer kulüplerden gelen teklifler
- **Kulüp yönetimi**: bütçe, haftalık maaş yükü, bilet/sponsor gelirleri, yönetim kurulu güveni ve sezon beklentisi (kovulabilirsiniz!)
- **Sezonlar**: 34 haftalık çift devreli lig, puan durumu, fikstür, gol krallığı, sezon sonu ödülleri,
  yaşlanma/gelişim, emeklilik, sözleşme bitişleri ve altyapıdan gelen genç oyuncular
- Sakatlıklar, kart cezaları (kırmızı kart ve 4 sarı), kondisyon ve moral
- Her hafta otomatik kayıt (tarayıcı hafızası)

## Telefonda oynamak

Oyun statik dosyalardan oluşur; herhangi bir statik barındırmaya koymanız yeterli.

**GitHub Pages ile:** Depo ayarlarında *Settings → Pages → Build and deployment* bölümünde kaynak olarak bu dalı ve kök
klasörü (`/`) seçin. Verilen adresi telefonda açın, ardından tarayıcı menüsünden **"Ana ekrana ekle"** deyin;
oyun uygulama gibi tam ekran açılır ve çevrimdışı çalışır.

**Bilgisayarda yerel olarak:**

```bash
npx http-server -p 8080
# ya da
python3 -m http.server 8080
```

Aynı Wi-Fi ağındaki telefondan `http://<bilgisayarın-ip-adresi>:8080` adresini açabilirsiniz.

## Dosya yapısı

| Dosya | İçerik |
| --- | --- |
| `index.html` | Uygulama iskeleti |
| `css/style.css` | Mobil öncelikli, CM 01/02 esintili tema |
| `js/data.js` | Kulüpler, isimler, özellikler, dizilişler, taktik sabitleri, rastgele sayı üreteci |
| `js/engine.js` | Oyuncu değerlendirme ve dakika dakika maç motoru |
| `js/game.js` | Oyun dünyası: fikstür, puan durumu, transfer, finans, sezon geçişi, kayıt |
| `js/ui.js` | Ekranlar, canlı maç ekranı ve dokunmatik etkileşim |
| `manifest.json`, `sw.js`, `icons/` | Ana ekrana eklenebilir uygulama (PWA) ve çevrimdışı önbellek |

Tüm kulüp ve oyuncu isimleri kurgusaldır.
