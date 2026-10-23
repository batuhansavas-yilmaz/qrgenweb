# QrGen Web

QR kod oluşturan ve tarayan, tamamen tarayıcıda çalışan statik web uygulaması. Backend yok, reklam yok, görüntü veya metin sunucuya gönderilmez.

## İşlevler

- **QR oluşturma:** Metin, URL, telefon, e-posta, SMS, Wi-Fi ve vCard.
- **Canlı önizleme:** İçerik yazılırken QR anında güncellenir.
- **Kişiselleştirme:** QR rengi, arka plan rengi, 512/1024/2048 px boyut ve isteğe bağlı logo.
- **Sade QR:** Logo seçilmezse QR logosuz ve sade üretilir.
- **İndirme:** PNG ve SVG; panoya kopyalama ve Web Share desteği.
- **Tarama:** Canlı kamera, dosyadan görsel, sürükle-bırak ve panodan yapıştırma.
- **Kamera kontrolleri:** Flaş, kamera çevirme, destek varsa zoom; görüntüye dokununca odak halkası görünür ve kısa süre sonra kaybolur.
- **Sonuç işlemleri:** Site açma, arama, SMS, WhatsApp mesajı, e-posta ve Wi-Fi bilgilerini kopyalama.
- **Rehbere kaydet:** Telefon içeren sonuçlarda `.vcf` kişi dosyası indirir; dosyayı açınca rehber uygulamasına aktarılır.
- **Hazır örnekler:** Site, telefon ve site + telefon içeren üç QR masaüstünde görünür. Butonlar yalnızca görsel örnektir; tıklanamaz. Mobilde bu bölüm tamamen gizlenir.
- **Mobil:** Ana ekran `dvh` ve safe-area değerleriyle kaydırmasız çalışır; içerik taşarsa yalnızca gerektiği kadar kayar.
- **Tema:** Açık/koyu tema sistem tercihine göre otomatik; tokenlar `design-system/theme.css` içinde.
- **PWA:** Ana ekrana eklenebilir; uygulama kabuğu çevrimdışı açılır.
- **Gizlilik:** Çerez, localStorage veya analitik yok.

## Rehbere kaydet nasıl çalışır?

Tarayıcılar doğrudan telefon rehberine yazamaz. **Rehbere kaydet** butonu bir `.vcf` dosyası oluşturur. Dosyayı açtığınızda Android/iOS rehber uygulaması kişiyi içe aktarma seçeneği sunar. Web Share destekleniyorsa dosya paylaşım menüsüne de gönderilir.

## WhatsApp

Telefon içeren sonuçlarda **WhatsApp** butonu `wa.me` bağlantısıyla sohbeti açar. WhatsApp'ın herkese açık bir "doğrudan arama" bağlantısı yoktur; sohbet açıldıktan sonra arama simgesine dokunulabilir. Mesaj bağlantısı hazır metinle açılır.

## Yerel çalıştırma

**En kolay yol:** `sunucu-baslat.bat` dosyasına çift tıkla. Küçük bir sunucu açılır ve tarayıcı `http://localhost:8000` adresine gider.

Alternatif:

```
python -m http.server 8000
```

Kamera ve pano erişimi için HTTPS veya `localhost` gerekir. `file://` ile açmak kamera için çalışmaz.

## GitHub Pages

1. Dosyaları `qrgenweb` deposuna yükle.
2. **Settings → Pages** bölümünde **Deploy from a branch** seç.
3. Branch: `main`, klasör: `/ (root)`.
4. Yayın adresi: `https://batuhansavas-yilmaz.github.io/qrgenweb/`

## Tema

Tema artık ayrı bir şablon olarak `design-system/` altında durur:

- `design-system/theme.css`: açık/koyu renk, yüzey ve gölge tokenları
- `design-system/tokens.json`: makine okunabilir palet
- `design-system/README.md`: kullanım ve kurallar

`style.css` bu dosyayı `@import` eder. Başka bir uygulamaya uyarlamak için `theme.css` ve Rubik fontu temel alınabilir.

## Kullanılan bileşenler

| Bileşen | Lisans |
|---|---|
| qr-code-styling | MIT |
| jsQR | Apache-2.0 |
| Rubik fontu | SIL OFL 1.1 |

Lisans dosyaları `vendor/` içindedir.
