(function () {
  'use strict';

  const EN = {
  "Qr Oluştur ve Tara": "Create & Scan QR",
  "QR, cihazında": "QR, on your device",
  "Oluştur, Tara, Paylaş.": "Create, Scan, Share.",
  "QR Oluştur": "Create QR",
  "QR Tara": "Scan QR",
  "Cihazda işlem": "On-device",
  "Verilerinizi saklamaz": "No data stored",
  "Dosyadan tara": "Scan from image",
  "Site": "Website",
  "Site bağlantısı": "Website link",
  "Siteyi aç": "Open website",
  "Telefon": "Phone",
  "Telefon numarası": "Phone number",
  "Ara": "Call",
  "SMS": "SMS",
  "Site + numara": "Website + number",
  "Site + Numara": "Website + Number",
  "Telefon ve site bağlantısı birlikte": "Phone and website together",
  "Hazır örnekler": "Quick demos",
  "Birkaç QR deneyin": "Try a few QRs",
  "Site, telefon ve ikisini birlikte içeren örnekler.": "Examples with a website, a phone number, and both.",
  "İçerik bekleniyor.": "Waiting for content.",
  "Bu içerik için QR oluşturulamadı.": "Could not create a QR for this content.",
  "İçerik girin.": "Enter content.",
  "Vazgeç": "Cancel",
  "Tamam": "OK",
  "QR rengi": "QR color",
  "Arka plan rengi": "Background color",
  "Logo eklendi.": "Logo added.",
  "Logo yüklenemedi.": "Could not load logo.",
  "Dosya oluşturulamadı.": "Could not create file.",
  "QR panoya kopyalandı.": "QR copied to clipboard.",
  "Panoya kopyalanamadı; PNG olarak indirin.": "Could not copy; download as PNG.",
  "Paylaşım açılamadı.": "Could not open sharing.",
  "Yeni QR": "New QR",
  "İçerik türünü seç, canlı önizlemeyi gör, indir veya paylaş.": "Choose a content type, preview live, download or share.",
  "Arka plan": "Background",
  "Boyut": "Size",
  "Önce QR içeriği girin.": "Enter QR content first.",
  "Website adresi": "Website URL",
  "Metin": "Text",
  "QR içine yazılacak metin": "Text to encode in the QR",
  "E-posta adresi": "Email address",
  "Konu": "Subject",
  "Mesaj": "Message",
  "Ağ adı (SSID)": "Network name (SSID)",
  "Ev Wi-Fi": "Home Wi-Fi",
  "Şifre": "Password",
  "Güvenlik": "Security",
  "Şifresiz": "No password",
  "Gizli ağ": "Hidden network",
  "Ad soyad": "Full name",
  "Ad Soyad": "Full name",
  "E-posta": "Email",
  "Şirket": "Company",
  "Ünvan": "Job title",
  "Logo seç": "Choose logo",
  "Logoyu değiştir": "Change logo",
  "Kaldır": "Remove",
  "Canlı önizleme": "Live preview",
  "Hata düzeltme seviyesi H: QR'ın yaklaşık %30'una kadar hasar onarılabilir.": "Error correction level H: up to about 30% of the QR code can be restored.",
  "Yüksek dayanıklılık": "High durability",
  "PNG indir": "Download PNG",
  "Kopyala": "Copy",
  "Paylaş": "Share",
  "Kartvizit": "Contact",
  "Kamera açılamadı. Dosyadan tarama yapabilirsin.": "Could not open the camera. You can scan from a file.",
  "Kamera izni verilmedi. Sistem ayarlarından kamera iznini aç veya dosyadan tara.": "Camera permission denied. Enable camera permission in system settings or scan from a file.",
  "Kamera bulunamadı. Dosyadan tarama yapabilirsin.": "Camera not found. You can scan from a file.",
  "Kamera hazırlanıyor. Lütfen tekrar dene.": "Camera is preparing. Please try again.",
  "Kamera başlatılamadı. Lütfen tekrar dene.": "Could not start the camera. Please try again.",
  "Flaş bu cihazda desteklenmiyor.": "Flash is not supported on this device.",
  "Kamera çevrilemedi.": "Could not switch camera.",
  "Görsel okunamadı.": "Could not read image.",
  "Panoda görsel yok.": "No image in the clipboard.",
  "QR kod bulunamadı. Daha net bir görsel deneyin.": "No QR code found. Try a clearer image.",
  "Kamera açılıyor…": "Starting camera…",
  "Kamerayı başlat": "Start camera",
  "Kamera izni gerekir; görüntü cihazdan çıkmaz.": "Camera permission is required; the image never leaves your device.",
  "Kamera açık": "Camera on",
  "Flaşı kapat": "Turn flash off",
  "Flaşı aç": "Turn flash on",
  "Kamerayı çevir": "Switch camera",
  "Tara": "Scan",
  "Kamerayı Kapat": "Turn camera off",
  "Kamerayı Aç": "Turn camera on",
  "Galeriden seç": "Choose from gallery",
  "Panodan yapıştır": "Paste from clipboard",
  "Panodaki QR görselini bu alana yapıştırın.": "Paste the QR image from your clipboard into this field.",
  "Buraya dokunup basılı tutun, ardından Yapıştır'a dokunun": "Touch and hold this field, then tap Paste.",
  "Panodan yapıştırma alanı": "Paste from clipboard field",
  "Kapat": "Close",
  "Bağlantı açılamadı.": "Could not open link.",
  "Kopyalandı.": "Copied.",
  "Kopyalanamadı.": "Could not copy.",
  "Sonuç": "Result",
  "Tarama sonucu": "Scan result",
  "Ağ": "Network",
  "Evet": "Yes",
  "Konum": "Location",
  "İçerik": "Content",
  "Ad": "Name",
  "Arama başlatılamadı.": "Could not start a call.",
  "SMS uygulaması açılamadı.": "Could not open the SMS app.",
  "WhatsApp açılamadı.": "Could not open WhatsApp.",
  "E-posta gönder": "Send email",
  "E-posta uygulaması açılamadı.": "Could not open the email app.",
  "Şifreyi kopyala": "Copy password",
  "Ham içerik": "Raw content",
  "Bu içerik cihazında işlendi. Hiçbir görsel veya metin sunucuya gönderilmedi.": "This content was processed on your device. No image or text was sent to a server.",
  "SMS at": "Send SMS",
  "Tüm işlemler cihazında • reklamsız • ücretsiz": "All processing on your device • ad-free • free",
  "Tüm işlemler cihazında · reklamsız · ücretsiz": "All processing on your device · ad-free · free",
  "SVG indirildi.": "SVG downloaded.",
  "PNG indirildi.": "PNG downloaded.",
  "QR kodum": "My QR code",
  "İçerik girin": "Enter content",
  "İşleniyor": "Processing",
  "(isteğe bağlı)": "(optional)",
  "Geri": "Back",
  "Geçerli bir website adresi girin.": "Enter a valid website address.",
  "Geçerli bir telefon numarası girin.": "Enter a valid phone number.",
  "Geçerli bir e-posta adresi girin.": "Enter a valid email address.",
  "Ağ adı (SSID) girin.": "Enter a network name (SSID).",
  "En az bir kişi bilgisi girin.": "Enter at least one contact detail.",
  "QrGen Kişisi": "QrGen Contact",
  "Merhaba, QR kodu ile ulaşıyorum.": "Hello, I am reaching out via a QR code.",
  "PNG oluşturulamadı.": "Could not create PNG.",
  "site": "website",
  "Oluştur, tara, paylaş.": "Create, Scan, Share.",
  "QR kodlarını saniyeler içinde oluştur; kamerayla veya görselden tara.": "Create QR codes in seconds; scan with the camera or from an image.",
  "QR kodunu okut": "Scan QR code",
  "Kamerayı aç, QR’ı çerçeveye hizala.": "Open the camera and align the QR code in the frame.",
  "Dosyadan oku": "Scan from file",
  "Görseli buraya bırak": "Drop an image here",
  "Flaş ve zoom, cihaz ve tarayıcı destekliyorsa görünür.": "Flash and zoom appear if supported by your device and browser.",
  "Tarama": "Scan",
  "İçerik girildiğinde burada görünür.": "Appears here when content is entered.",
  "QR içerik türü": "QR content type",
  "Yeniden tara": "Scan again",
  "Kamera bu tarayıcıda desteklenmiyor. Dosyadan tarama yapabilirsin.": "Camera is not supported in this browser. You can scan from a file.",
  "Kamera izni verilmedi. Tarayıcı adres çubuğundaki kamera iznini aç veya dosyadan tara.": "Camera permission denied. Enable camera permission in the browser address bar or scan from a file.",
  "Kamera başka bir uygulama tarafından kullanılıyor. Kamerayı kapatıp tekrar dene.": "The camera is being used by another app. Close it and try again.",
  "Lütfen bir görsel seçin.": "Please choose an image.",
  "Panoya erişilemiyor; Ctrl+V deneyin.": "Clipboard is not accessible; try Ctrl+V.",
  "QR motoru yüklenemedi. Sayfayı yenileyin.": "QR engine could not load. Refresh the page.",
  "İçerik türü seçin.": "Choose a content type.",
  "Paylaşım desteklenmiyor; PNG indirildi.": "Sharing is not supported; PNG downloaded.",
  "Metin girin.": "Enter text.",
  "QR kodunu çerçeveye hizala · netleşmesi için dokun": "Align the QR code in the frame · tap to focus",
  "Görseli sürükle-bırak veya dosyadan seç. Flaş ve zoom, cihaz destekliyorsa etkinleşir.": "Drag and drop an image or choose a file. Flash and zoom activate if supported by the device."
};

  const rawLocale = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  const systemLang = String(rawLocale).toLowerCase().startsWith('tr') ? 'tr' : 'en';
  const forcedLang = new URLSearchParams(location.search).get('lang');
  const lang = forcedLang === 'tr' || forcedLang === 'en' ? forcedLang : systemLang;

  function t(text) {
    if (lang === 'tr') return text;
    return EN[text] || text;
  }

  function translatedValue(value) {
    const key = String(value).trim();
    if (!key || !EN[key]) return value;
    return String(value).replace(key, EN[key]);
  }

  function localize(root) {
    if (!root || lang === 'tr') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, textarea, code, pre')) return NodeFilter.FILTER_REJECT;
        return EN[node.nodeValue.trim()] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => { node.nodeValue = translatedValue(node.nodeValue); });
    root.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach((element) => {
      ['placeholder', 'aria-label', 'title', 'alt'].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value && EN[value.trim()]) element.setAttribute(attribute, translatedValue(value));
      });
    });
  }

  function localizeMeta() {
    document.documentElement.lang = lang;
    if (lang === 'en') {
      document.title = 'QrGen — Create & Scan QR';
      const description = document.querySelector('meta[name="description"]');
      if (description) {
        description.setAttribute(
          'content',
          'QrGen — create QR codes, scan with the camera or from an image. Fully in your browser, ad-free and free.'
        );
      }
    }
  }

  window.I18N = { lang, t, localize };

  function boot() {
    localizeMeta();
    localize(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
