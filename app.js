(function () {
  'use strict';

  const t = (text) => window.I18N.t(text);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const DEMO_SITE = 'https://batuhansavas-yilmaz.github.io/qrgenweb/';
  const DEMO_PHONE = '+905321234567';
  const DEMO_NAME = 'QrGen Demo';
  const DEMO_VCARD = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:' + DEMO_NAME,
    'TEL;TYPE=CELL:' + DEMO_PHONE,
    'URL:' + DEMO_SITE,
    'END:VCARD'
  ].join('\r\n');
  const WHATSAPP_TEXT = t('Merhaba, QR kodu ile ulaşıyorum.');
  const TYPE_LABELS = {
    url: 'Site',
    phone: 'Telefon',
    email: 'E-posta',
    sms: 'SMS',
    wifi: 'Wi-Fi',
    vcard: 'Kartvizit',
    mixed: 'Site + Numara',
    text: 'Metin',
    geo: 'Konum'
  };
  const VIEW_META = {
    home: { title: 'Qr Oluştur ve Tara', back: false, brand: true },
    generate: { title: 'QR Oluştur', back: true, brand: false },
    scan: { title: 'QR Tara', back: true, brand: false },
    result: { title: 'Sonuç', back: true, brand: false }
  };
  const VIEW_DEPTH = { home: 0, generate: 1, scan: 1, result: 2 };
  let firstView = true;
  let viewTransitionId = 0;

  const state = {
    view: 'home',
    generateType: 'url',
    generatedData: '',
    generatedLabel: '',
    logoData: null,
    previewQr: null,
    heroQr: null,
    demoQrs: {},
    stream: null,
    videoTrack: null,
    scanTimer: null,
    scanning: false,
    scanBusy: false,
    cameraStarting: false,
    torch: false,
    facingMode: 'environment',
    scanTick: 0,
    barcodeDetector: null,
    barcodeDetectorChecked: false,
    result: null,
    detected: false
  };

  const debouncedUpdatePreview = debounce(updatePreview, 140);

  init();

  function init() {
    setupTheme();
    initRipples();
    initNavigation();
    initQrCodes();
    initGenerate();
    setupBarcodeDetector();
    initScan();
    initResult();
    routeInitial();
    registerServiceWorker();
  }

  function setupTheme() {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = media.matches ? 'dark' : 'light';
    };
    apply();
    if (media.addEventListener) media.addEventListener('change', apply);
    else if (media.addListener) media.addListener(apply);
  }

  function initRipples() {
    const selector = 'button, a.action-btn, a.btn-primary, a.btn-soft, a.quick-action, .demo-action, .chip, .rescan, .icon-btn, .cam-btn, .mini-link, .file-label, .bsy-btn, [role="button"]';
    document.addEventListener('pointerdown', (event) => {
      if (event.button && event.button !== 0) return;
      const host = event.target.closest(selector);
      if (!host || host.matches(':disabled, [aria-disabled="true"]')) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.4;
      const ripple = document.createElement('span');
      ripple.className = 'md-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
      host.classList.add('md-ripple-host');
      host.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      setTimeout(() => ripple.remove(), 800);
    }, { passive: true });
  }

  function animateAppbarTitle() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const title = $('#appbarTitle');
    if (!title) return;
    title.classList.remove('title-fade');
    void title.offsetWidth;
    title.classList.add('title-fade');
    setTimeout(() => title.classList.remove('title-fade'), 400);
  }

  function playViewTransition(view, forward) {
    if (!view || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.view').forEach((element) => element.classList.remove('view-push-in', 'view-pop-in'));
    void view.offsetWidth;
    const className = forward ? 'view-push-in' : 'view-pop-in';
    view.classList.add(className);
    const id = ++viewTransitionId;
    const cleanup = () => {
      if (id !== viewTransitionId) return;
      view.classList.remove('view-push-in', 'view-pop-in');
      view.removeEventListener('animationend', onEnd);
    };
    const onEnd = (event) => {
      if (event.target === view) cleanup();
    };
    view.addEventListener('animationend', onEnd);
    setTimeout(cleanup, 500);
  }

  function initNavigation() {
    $('#backBtn').addEventListener('click', () => {
      if (state.view === 'result') navigate('scan');
      else navigate('home');
    });
    $('#goGenerate').addEventListener('click', () => navigate('generate'));
    $('#goScan').addEventListener('click', () => navigate('scan'));
    window.addEventListener('hashchange', handleRoute);
  }

  function navigate(name) {
    if (location.hash === '#' + name) showView(name);
    else location.hash = name;
  }

  function handleRoute() {
    const name = location.hash.replace('#', '') || 'home';
    showView(VIEW_META[name] ? name : 'home');
  }

  function routeInitial() {
    const name = location.hash.replace('#', '');
    showView(VIEW_META[name] ? name : 'home');
  }

  function showView(name) {
    if (name === 'result' && !state.result) name = 'home';
    if (state.view === 'scan' && name !== 'scan') stopCamera();
    const previous = state.view;
    const animate = !firstView && previous !== name;
    const forward = (VIEW_DEPTH[name] ?? 0) >= (VIEW_DEPTH[previous] ?? 0);
    firstView = false;
    state.view = name;
    $$('.view').forEach((view) => {
      view.hidden = view.id !== name + 'View';
    });
    const meta = VIEW_META[name];
    $('#appbarTitle').textContent = t(meta.title);
    $('#backBtn').hidden = !meta.back;
    $('#brandBtn').hidden = !meta.brand;
    document.documentElement.dataset.view = name;
    if (animate) {
      playViewTransition(document.getElementById(name + 'View'), forward);
      animateAppbarTitle();
    }
    const main = $('#main');
    if (main) main.scrollTop = 0;
    if (name === 'generate') updatePreview();
    if (name === 'scan') resetScanUi();
  }

  function initQrCodes() {
    if (!hasQrEngine()) {
      showToast('QR motoru yüklenemedi. Sayfayı yenileyin.');
      return;
    }
    state.heroQr = createStaticQr('heroQr', DEMO_SITE, 512);
    state.demoQrs.site = createStaticQr('demoSiteQr', DEMO_SITE, 512);
    state.demoQrs.phone = createStaticQr('demoPhoneQr', 'tel:' + DEMO_PHONE, 512);
    state.demoQrs.both = createStaticQr('demoBothQr', DEMO_VCARD, 512);
  }

  function hasQrEngine() {
    return typeof window.QRCodeStyling === 'function';
  }

  function toQrData(value) {
    const text = String(value == null ? '' : value);
    if (!/[^\x00-\x7F]/.test(text)) return text;
    if (typeof TextEncoder === 'function') {
      const bytes = new TextEncoder().encode(text);
      let binary = '';
      const chunk = 0x8000;
      for (let index = 0; index < bytes.length; index += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
      }
      return binary;
    }
    return unescape(encodeURIComponent(text));
  }

  function qrOptions(data, size, fg, bg, logo) {
    const options = {
      type: 'canvas',
      width: size,
      height: size,
      data: toQrData(data),
      margin: Math.max(8, Math.round(size * 0.03)),
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { color: fg, type: 'rounded' },
      cornersSquareOptions: { color: fg, type: 'extra-rounded' },
      cornersDotOptions: { color: fg, type: 'dot' },
      backgroundOptions: { color: bg }
    };
    if (logo) {
      options.image = logo;
      options.imageOptions = {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.32,
        hideBackgroundDots: true
      };
    }
    return options;
  }

  function createStaticQr(targetId, data, size) {
    const target = document.getElementById(targetId);
    if (!target) return null;
    target.innerHTML = '';
    const qr = new window.QRCodeStyling(qrOptions(data, size, '#0b1020', '#ffffff', null));
    qr.append(target);
    return qr;
  }

  function renderPreviewQr(data, size, fg, bg, logo) {
    const target = $('#previewQr');
    if (!target || !hasQrEngine()) return;
    target.innerHTML = '';
    const qr = new window.QRCodeStyling(qrOptions(data, size, fg, bg, logo));
    qr.append(target);
    state.previewQr = qr;
  }

  function initGenerate() {
    $$('#typeChips .chip').forEach((chip) => {
      chip.addEventListener('click', () => setGenerateType(chip.dataset.type));
    });
    $$('.field-group input, .field-group textarea, .field-group select').forEach((field) => {
      field.addEventListener('input', debouncedUpdatePreview);
      field.addEventListener('change', debouncedUpdatePreview);
    });
    $('#fgColor').addEventListener('input', debouncedUpdatePreview);
    $('#bgColor').addEventListener('input', debouncedUpdatePreview);
    $('#qrSize').addEventListener('change', updatePreview);
    $('#logoInput').addEventListener('change', handleLogoChange);
    $('#removeLogo').addEventListener('click', removeLogo);
    $('#downloadPng').addEventListener('click', () => downloadPreview('png'));
    $('#downloadSvg').addEventListener('click', () => downloadPreview('svg'));
    $('#copyQr').addEventListener('click', copyPreview);
    $('#shareQr').addEventListener('click', sharePreview);
    setGenerateType('url');
  }

  function setGenerateType(type) {
    state.generateType = type;
    $$('#typeChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.type === type);
    });
    $$('.field-group').forEach((group) => {
      group.hidden = group.dataset.group !== type;
    });
    updatePreview();
  }

  function buildContent() {
    const type = state.generateType;
    if (type === 'url') {
      const url = normalizeUrl($('#genUrl').value);
      if (!url) return { valid: false, error: 'Geçerli bir website adresi girin.' };
      return { valid: true, data: url, label: 'URL', summary: url };
    }
    if (type === 'text') {
      const text = $('#genText').value.trim();
      if (!text) return { valid: false, error: 'Metin girin.' };
      return { valid: true, data: text, label: 'Metin', summary: shorten(text, 90) };
    }
    if (type === 'phone') {
      const phone = normalizePhone($('#genPhone').value);
      if (!phone) return { valid: false, error: 'Geçerli bir telefon numarası girin.' };
      return { valid: true, data: 'tel:' + phone, label: 'Telefon', summary: formatPhone(phone) };
    }
    if (type === 'email') {
      const email = $('#genEmail').value.trim();
      if (!isEmail(email)) return { valid: false, error: 'Geçerli bir e-posta adresi girin.' };
      const params = new URLSearchParams();
      const subject = $('#genEmailSubject').value.trim();
      const body = $('#genEmailBody').value.trim();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      const query = params.toString();
      return {
        valid: true,
        data: 'mailto:' + email + (query ? '?' + query : ''),
        label: 'E-posta',
        summary: email
      };
    }
    if (type === 'sms') {
      const phone = normalizePhone($('#genSmsPhone').value);
      if (!phone) return { valid: false, error: 'Geçerli bir telefon numarası girin.' };
      const body = $('#genSmsBody').value.trim();
      return {
        valid: true,
        data: 'SMSTO:' + phone + (body ? ':' + body : ''),
        label: 'SMS',
        summary: formatPhone(phone) + (body ? ' · ' + shorten(body, 42) : '')
      };
    }
    if (type === 'wifi') {
      const ssid = $('#genWifiSsid').value.trim();
      if (!ssid) return { valid: false, error: 'Ağ adı (SSID) girin.' };
      const password = $('#genWifiPassword').value;
      const encryption = $('#genWifiEnc').value;
      const hidden = $('#genWifiHidden').checked;
      const data = 'WIFI:T:' + encryption + ';S:' + escapeWifi(ssid) + ';P:' + escapeWifi(password) + ';' + (hidden ? 'H:true;' : '') + ';';
      return { valid: true, data, label: 'Wi-Fi', summary: ssid };
    }
    if (type === 'vcard') {
      const name = $('#genVName').value.trim();
      const phone = normalizePhone($('#genVPhone').value);
      const email = $('#genVEmail').value.trim();
      const org = $('#genVOrg').value.trim();
      const title = $('#genVTitle').value.trim();
      const url = normalizeUrl($('#genVUrl').value);
      if (!name && !phone && !email && !url) {
        return { valid: false, error: 'En az bir kişi bilgisi girin.' };
      }
      const data = buildVCardData({
        name: name || t('QrGen Kişisi'),
        phone,
        email: isEmail(email) ? email : '',
        org,
        title,
        url
      });
      return {
        valid: true,
        data,
        label: 'Kartvizit',
        summary: [name || t('QrGen Kişisi'), phone ? formatPhone(phone) : '', url ? t('site') : ''].filter(Boolean).join(' · ')
      };
    }
    return { valid: false, error: 'İçerik türü seçin.' };
  }

  function isActiveFormEmpty() {
    const group = document.querySelector('.field-group:not([hidden])');
    if (!group) return true;
    const fields = group.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea');
    if (!fields.length) return true;
    return Array.from(fields).every((field) => !field.value.trim());
  }

  function updatePreview() {
    const errorEl = $('#previewError');
    errorEl.hidden = true;
    errorEl.textContent = '';
    const built = buildContent();
    const qrBox = $('#previewQr');
    const placeholder = $('#previewPlaceholder');
    const actionButtons = [$('#downloadPng'), $('#downloadSvg'), $('#copyQr'), $('#shareQr')];
    $('#previewType').textContent = t(built.label || TYPE_LABELS[state.generateType] || 'QR');
    if (!built.valid) {
      state.generatedData = '';
      qrBox.hidden = true;
      placeholder.hidden = false;
      $('#previewSummary').textContent = t('İçerik bekleniyor.');
      actionButtons.forEach((button) => { button.disabled = true; });
      if (!isActiveFormEmpty()) {
        errorEl.textContent = t(built.error || 'İçerik girin.');
        errorEl.hidden = false;
      }
      return;
    }
    try {
      const size = Number($('#qrSize').value);
      renderPreviewQr(built.data, size, $('#fgColor').value, $('#bgColor').value, state.logoData);
      state.generatedData = built.data;
      state.generatedLabel = built.label;
      qrBox.hidden = false;
      placeholder.hidden = true;
      $('#previewSummary').textContent = built.summary || t(built.label);
      actionButtons.forEach((button) => { button.disabled = false; });
    } catch (error) {
      console.error(error);
      state.generatedData = '';
      qrBox.hidden = true;
      placeholder.hidden = false;
      actionButtons.forEach((button) => { button.disabled = true; });
      errorEl.textContent = t('Bu içerik için QR oluşturulamadı.');
      errorEl.hidden = false;
    }
  }

  async function handleLogoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir görsel seçin.');
      return;
    }
    try {
      state.logoData = await fileToLogoDataUrl(file);
      $('#removeLogo').hidden = false;
      updatePreview();
      showToast('Logo eklendi.');
    } catch (error) {
      console.error(error);
      showToast('Logo yüklenemedi.');
    }
  }

  function fileToLogoDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const max = 512;
          const scale = Math.min(1, max / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = () => reject(new Error('image'));
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function removeLogo() {
    state.logoData = null;
    $('#logoInput').value = '';
    $('#removeLogo').hidden = true;
    updatePreview();
  }

  async function downloadPreview(extension) {
    if (!state.generatedData || !state.previewQr) return;
    setLoading(true);
    try {
      const raw = await state.previewQr.getRawData(extension);
      const blob = raw instanceof Blob ? raw : new Blob([raw], { type: extension === 'svg' ? 'image/svg+xml' : 'image/png' });
      const name = 'qrgen-' + state.generateType + '-' + Date.now() + '.' + extension;
      downloadBlob(blob, name);
      showToast(extension === 'svg' ? 'SVG indirildi.' : 'PNG indirildi.');
    } catch (error) {
      console.error(error);
      showToast('Dosya oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  }

  async function copyPreview() {
    if (!state.previewQr) return;
    try {
      const blob = await state.previewQr.getRawData('png');
      if (!navigator.clipboard || !window.ClipboardItem) throw new Error('clipboard');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('QR panoya kopyalandı.');
    } catch (error) {
      showToast('Panoya kopyalanamadı; PNG olarak indirin.');
    }
  }

  async function sharePreview() {
    if (!state.previewQr) return;
    try {
      const blob = await state.previewQr.getRawData('png');
      const file = new File([blob], 'qrgen.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'QrGen', text: t('QR kodum') });
        return;
      }
      downloadBlob(blob, 'qrgen.png');
      showToast('Paylaşım desteklenmiyor; PNG indirildi.');
    } catch (error) {
      if (error.name !== 'AbortError') showToast('Paylaşım açılamadı.');
    }
  }

  function buildVCardData(contact) {
    const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    if (contact.name) lines.push('FN;CHARSET=UTF-8:' + escapeVCard(contact.name));
    if (contact.org) lines.push('ORG;CHARSET=UTF-8:' + escapeVCard(contact.org));
    if (contact.title) lines.push('TITLE;CHARSET=UTF-8:' + escapeVCard(contact.title));
    if (contact.phone) lines.push('TEL;TYPE=CELL:' + contact.phone.replace(/[^\d+]/g, ''));
    if (contact.email) lines.push('EMAIL:' + contact.email);
    if (contact.url) lines.push('URL:' + contact.url);
    lines.push('END:VCARD');
    return lines.join('\r\n') + '\r\n';
  }

  function bindCameraAction(element, action) {
    let savedScrollTop = 0;
    element.addEventListener('pointerdown', () => {
      savedScrollTop = $('#main').scrollTop;
    });
    element.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });
    element.addEventListener('click', () => {
      action();
      const restore = () => {
        $('#main').scrollTop = savedScrollTop;
      };
      requestAnimationFrame(restore);
      setTimeout(restore, 120);
      setTimeout(restore, 350);
    });
  }

  function initScan() {
    bindCameraAction($('#startCameraBtn'), startCamera);
    bindCameraAction($('#cameraPlaceholder'), startCamera);
    $('#cameraPlaceholder').addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startCamera();
      }
    });
    $('#stopCameraBtn').addEventListener('click', () => {
      stopCamera();
      resetScanUi();
    });
    $('#scanFileInput').addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) handleScanFile(file);
      event.target.value = '';
    });
    $('#scanPasteBtn').addEventListener('click', pasteFromClipboard);
    $('#flashBtn').addEventListener('click', toggleTorch);
    $('#flipBtn').addEventListener('click', flipCamera);
    $('#zoomRange').addEventListener('input', applyZoom);
    ['dragover', 'dragenter'].forEach((name) => {
      $('#dropZone').addEventListener(name, (event) => {
        event.preventDefault();
        $('#dropZone').classList.add('dragover');
      });
      $('#cameraStage').addEventListener(name, (event) => {
        event.preventDefault();
        $('#dropZone').classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach((name) => {
      $('#dropZone').addEventListener(name, () => $('#dropZone').classList.remove('dragover'));
      $('#cameraStage').addEventListener(name, () => $('#dropZone').classList.remove('dragover'));
    });
    $('#dropZone').addEventListener('drop', handleDrop);
    $('#cameraStage').addEventListener('drop', handleDrop);
    document.addEventListener('paste', handlePaste);
  }

  async function startCamera() {
    if (state.stream || state.cameraStarting) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraError('Kamera bu tarayıcıda desteklenmiyor. Dosyadan tarama yapabilirsin.');
      return;
    }
    state.cameraStarting = true;
    state.detected = false;
    state.scanTick = 0;
    setLoading(true);
    hideCameraError();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: state.facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      state.stream = stream;
      state.videoTrack = stream.getVideoTracks()[0];
      const video = $('#scanVideo');
      video.srcObject = stream;
      video.hidden = false;
      await video.play();
      updateMirrorMode();
      $('#cameraPlaceholder').hidden = true;
      $('#cameraOverlay').hidden = false;
      $('#startCameraBtn').hidden = true;
      $('#stopCameraBtn').hidden = false;
      state.scanning = true;
      updateCameraCapabilities();
      startScanLoop();
    } catch (error) {
      console.error(error);
      showCameraError(cameraErrorMessage(error));
      stopCamera();
    } finally {
      state.cameraStarting = false;
      setLoading(false);
    }
  }

  function updateMirrorMode() {
    const video = $('#scanVideo');
    if (!video) return;
    let facing = state.facingMode;
    if (state.videoTrack && typeof state.videoTrack.getSettings === 'function') {
      const settings = state.videoTrack.getSettings();
      if (settings && settings.facingMode) facing = settings.facingMode;
    }
    video.classList.toggle('mirrored', facing === 'user');
  }

  function cameraErrorMessage(error) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return 'Kamera izni verilmedi. Tarayıcı adres çubuğundaki kamera iznini aç veya dosyadan tara.';
    }
    if (error.name === 'NotFoundError' || error.name === 'OverconstrainedError') {
      return 'Kamera bulunamadı. Dosyadan tarama yapabilirsin.';
    }
    if (error.name === 'NotReadableError') {
      return 'Kamera başka bir uygulama tarafından kullanılıyor. Kamerayı kapatıp tekrar dene.';
    }
    return 'Kamera açılamadı. Dosyadan tarama yapabilirsin.';
  }

  function showCameraError(message) {
    const element = $('#cameraError');
    element.textContent = t(message);
    element.hidden = false;
  }

  function hideCameraError() {
    $('#cameraError').hidden = true;
  }

  function stopCamera() {
    state.scanning = false;
    stopScanLoop();
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    state.stream = null;
    state.videoTrack = null;
    const video = $('#scanVideo');
    if (video) {
      video.pause();
      video.srcObject = null;
      video.hidden = true;
      video.classList.remove('mirrored');
    }
    $('#cameraOverlay').hidden = true;
    $('#cameraPlaceholder').hidden = false;
    $('#startCameraBtn').hidden = false;
    $('#stopCameraBtn').hidden = true;
    $('#flashBtn').hidden = true;
    $('#flipBtn').hidden = true;
    $('#zoomWrap').hidden = true;
    $('#flashBtn').classList.remove('active');
    state.torch = false;
  }

  function resetScanUi() {
    stopCamera();
    hideCameraError();
    state.detected = false;
    $('#cameraPlaceholder').hidden = false;
    $('#cameraOverlay').hidden = true;
    $('#startCameraBtn').hidden = false;
    $('#stopCameraBtn').hidden = true;
  }

  function updateCameraCapabilities() {
    const track = state.videoTrack;
    if (!track) return;
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    $('#flashBtn').hidden = !capabilities.torch;
    if (capabilities.zoom) {
      $('#zoomWrap').hidden = false;
      const range = $('#zoomRange');
      range.min = capabilities.zoom.min != null ? capabilities.zoom.min : 1;
      range.max = capabilities.zoom.max != null ? capabilities.zoom.max : 1;
      range.step = capabilities.zoom.step != null ? capabilities.zoom.step : 0.1;
      range.value = range.min;
      updateZoomLabel();
    } else {
      $('#zoomWrap').hidden = true;
    }
    if (capabilities.focusMode && capabilities.focusMode.indexOf('continuous') !== -1) {
      track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
    }
    refreshFlipVisibility();
  }

  async function refreshFlipVisibility() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      $('#flipBtn').hidden = cameras.length < 2;
    } catch (error) {
      $('#flipBtn').hidden = true;
    }
  }

  async function setupBarcodeDetector() {
    if (state.barcodeDetectorChecked) return;
    state.barcodeDetectorChecked = true;
    const Detector = window.BarcodeDetector;
    if (typeof Detector !== 'function') return;
    try {
      if (typeof Detector.getSupportedFormats === 'function') {
        const formats = await Detector.getSupportedFormats();
        if (!Array.isArray(formats) || formats.indexOf('qr_code') === -1) return;
      }
      state.barcodeDetector = new Detector({ formats: ['qr_code'] });
    } catch (error) {
      state.barcodeDetector = null;
    }
  }

  function startScanLoop() {
    stopScanLoop();
    state.scanBusy = false;
    state.scanTimer = setInterval(scanFrame, 180);
  }

  function stopScanLoop() {
    if (state.scanTimer) clearInterval(state.scanTimer);
    state.scanTimer = null;
    state.scanBusy = false;
  }

  async function scanFrame() {
    if (!state.scanning || state.scanBusy || state.detected) return;
    const video = $('#scanVideo');
    if (!video || video.readyState < 2 || !video.videoWidth) return;
    state.scanBusy = true;
    try {
      if (state.barcodeDetector) {
        try {
          const codes = await state.barcodeDetector.detect(video);
          const found = Array.isArray(codes) ? codes.find((code) => code && code.rawValue) : null;
          if (found) {
            onScanSuccess(found.rawValue);
            return;
          }
        } catch (error) {
          state.barcodeDetector = null;
        }
      }

      const shouldRunJsQr = !state.barcodeDetector || state.scanTick % 3 === 0;
      state.scanTick = (state.scanTick + 1) % 3;
      if (!shouldRunJsQr) return;

      const canvas = $('#scanCanvas');
      const max = 800;
      const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
      const width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(video, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      if (!window.jsQR) return;
      const result = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
      if (result && result.data) onScanSuccess(result.data);
    } catch (error) {
      // Camera frame errors are transient.
    } finally {
      state.scanBusy = false;
    }
  }

  function onScanSuccess(data) {
    if (state.detected) return;
    state.detected = true;
    stopCamera();
    const parsed = parseContent(data);
    state.result = parsed;
    renderResult(parsed);
    navigate('result');
    if (navigator.vibrate) navigator.vibrate(60);
  }

  async function toggleTorch() {
    if (!state.videoTrack) return;
    try {
      state.torch = !state.torch;
      await state.videoTrack.applyConstraints({ advanced: [{ torch: state.torch }] });
      $('#flashBtn').classList.toggle('active', state.torch);
      $('#flashBtn').setAttribute('aria-label', t(state.torch ? 'Flaşı kapat' : 'Flaşı aç'));
    } catch (error) {
      state.torch = false;
      $('#flashBtn').classList.remove('active');
      showToast('Flaş bu cihazda desteklenmiyor.');
    }
  }

  async function flipCamera() {
    state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
    stopCamera();
    await startCamera();
  }

  async function applyZoom() {
    if (!state.videoTrack) return;
    const value = Number($('#zoomRange').value);
    try {
      await state.videoTrack.applyConstraints({ advanced: [{ zoom: value }] });
      updateZoomLabel();
    } catch (error) {
      // Zoom is optional.
    }
  }

  function updateZoomLabel() {
    const value = Number($('#zoomRange').value);
    $('#zoomLabel').textContent = (Math.round(value * 10) / 10) + '×';
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    $('#dropZone').classList.remove('dragover');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) handleScanFile(file);
  }

  async function handleScanFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Lütfen bir görsel seçin.');
      return;
    }
    state.detected = false;
    setLoading(true);
    try {
      let source;
      try {
        source = await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch (error) {
        source = await loadImageFromFile(file);
      }
      const result = await scanImageSource(source);
      if (result && result.data) onScanSuccess(result.data);
      else showToast('QR kod bulunamadı. Daha net bir görsel deneyin.');
    } catch (error) {
      console.error(error);
      showToast('Görsel okunamadı.');
    } finally {
      setLoading(false);
    }
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function scanImageSource(source) {
    if (state.barcodeDetector) {
      try {
        const codes = await state.barcodeDetector.detect(source);
        const found = Array.isArray(codes) ? codes.find((code) => code && code.rawValue) : null;
        if (found) return { data: found.rawValue };
      } catch (error) {
        // jsQR fallback follows.
      }
    }

    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    if (!sourceWidth || !sourceHeight) return null;
    const max = 1600;
    const scale = Math.min(1, max / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, 0, 0, width, height);
    let result = decodeCanvas(canvas);
    if (result) return result;
    for (const degrees of [90, 180, 270]) {
      const rotated = document.createElement('canvas');
      const radians = degrees * Math.PI / 180;
      const rotatedWidth = degrees === 180 ? width : height;
      const rotatedHeight = degrees === 180 ? height : width;
      rotated.width = rotatedWidth;
      rotated.height = rotatedHeight;
      const rotatedContext = rotated.getContext('2d', { willReadFrequently: true });
      rotatedContext.translate(rotatedWidth / 2, rotatedHeight / 2);
      rotatedContext.rotate(radians);
      rotatedContext.drawImage(canvas, -width / 2, -height / 2);
      result = decodeCanvas(rotated);
      if (result) return result;
    }
    return null;
  }

  function decodeCanvas(canvas) {
    if (!window.jsQR) return null;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
  }

  async function pasteFromClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      showToast('Panoya erişilemiyor; Ctrl+V deneyin.');
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith('image/'));
        if (type) {
          const blob = await item.getType(type);
          await handleScanFile(new File([blob], 'pano.png', { type }));
          return;
        }
      }
      showToast('Panoda görsel yok.');
    } catch (error) {
      showToast('Panoya erişilemiyor; Ctrl+V deneyin.');
    }
  }

  function handlePaste(event) {
    if (state.view !== 'scan') return;
    const target = event.target;
    if (target && target.closest && target.closest('input, textarea')) return;
    const items = event.clipboardData && event.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          handleScanFile(file);
          return;
        }
      }
    }
  }

  function initResult() {
    $('#resultContent').addEventListener('click', handleResultClick);
  }

  async function handleResultClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'copy') await copyText(state.result ? state.result.raw : '');
    if (action === 'share') await shareText(state.result ? state.result.raw : '');
    if (action === 'rescan') {
      navigate('scan');
      setTimeout(startCamera, 150);
    }
    if (action === 'copy-wifi') {
      const password = state.result && state.result.wifi ? state.result.wifi.password : '';
      if (password) await copyText(password);
    }
  }

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Kopyalandı.');
    } catch (error) {
      showToast('Kopyalanamadı.');
    }
  }

  async function shareText(text) {
    if (!text) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'QrGen', text });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    await copyText(text);
  }

  function parseContent(raw) {
    const text = String(raw || '').trim();
    if (!text) return { type: 'text', raw: text };
    if (/^BEGIN:VCARD/i.test(text)) return parseVCard(text);
    if (/^WIFI:/i.test(text)) return parseWifi(text);
    if (/^SMSTO:/i.test(text)) return parseSms(text);
    if (/^mailto:/i.test(text)) return parseMailto(text);
    if (/^tel:/i.test(text)) {
      const phone = normalizePhone(text.slice(4));
      return phone ? { type: 'phone', phone, raw: text } : { type: 'text', raw: text };
    }
    if (/^geo:/i.test(text)) return { type: 'geo', geo: text, raw: text };
    const url = extractUrl(text);
    const phone = extractPhone(text);
    const emailMatch = text.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/);
    const email = emailMatch ? emailMatch[0] : null;
    if (url && phone) return { type: 'mixed', url, phone, raw: text };
    if (url) return { type: 'url', url, raw: text };
    if (phone) return { type: 'phone', phone, raw: text };
    if (email) return { type: 'email', email, raw: text };
    return { type: 'text', raw: text };
  }

  function parseVCard(text) {
    const normalizedText = /ENCODING=QUOTED-PRINTABLE/i.test(text) ? text.replace(/=\r?\n/g, '') : text;
    const lines = normalizedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const unfolded = [];
    for (const line of lines) {
      if (/^[ \t]/.test(line) && unfolded.length) unfolded[unfolded.length - 1] += line.slice(1);
      else unfolded.push(line);
    }
    const fields = {};
    for (const line of unfolded) {
      const index = line.indexOf(':');
      if (index < 0) continue;
      const header = line.slice(0, index);
      const parts = header.split(';');
      const key = parts.shift().trim().toUpperCase();
      if (!key) continue;
      const params = {};
      for (const part of parts) {
        const equals = part.indexOf('=');
        if (equals > 0) params[part.slice(0, equals).trim().toUpperCase()] = part.slice(equals + 1).trim();
      }
      const value = decodeVCardValue(line.slice(index + 1).trim(), params);
      if (!fields[key]) fields[key] = [];
      fields[key].push(value);
    }
    const rawPhone = fields.TEL && fields.TEL.find(Boolean);
    const rawUrl = fields.URL && fields.URL.find(Boolean);
    return {
      type: 'vcard',
      name: decodeVCard((fields.FN && fields.FN[0]) || (fields.N && fields.N[0]) || ''),
      phone: rawPhone ? normalizePhone(rawPhone) : null,
      url: rawUrl ? normalizeUrl(rawUrl) : null,
      email: fields.EMAIL && fields.EMAIL[0] ? fields.EMAIL[0] : null,
      org: decodeVCard((fields.ORG && fields.ORG[0]) || ''),
      title: decodeVCard((fields.TITLE && fields.TITLE[0]) || ''),
      raw: text
    };
  }

  function parseWifi(text) {
    const body = text.replace(/^WIFI:/i, '');
    const parts = [];
    let current = '';
    let escaped = false;
    for (const character of body) {
      if (escaped) {
        current += character;
        escaped = false;
        continue;
      }
      if (character === '\\') {
        escaped = true;
        current += character;
        continue;
      }
      if (character === ';') {
        parts.push(current);
        current = '';
        continue;
      }
      current += character;
    }
    if (current) parts.push(current);
    const map = {};
    for (const part of parts) {
      const index = part.indexOf(':');
      if (index > 0) map[part.slice(0, index).trim().toUpperCase()] = part.slice(index + 1);
    }
    return {
      type: 'wifi',
      wifi: {
        ssid: decodeWifi(map.S || ''),
        password: decodeWifi(map.P || ''),
        encryption: (map.T || 'nopass').toUpperCase(),
        hidden: String(map.H || '').toLowerCase() === 'true'
      },
      raw: text
    };
  }

  function parseSms(text) {
    const body = text.replace(/^SMSTO:/i, '');
    const index = body.indexOf(':');
    const phone = normalizePhone(index >= 0 ? body.slice(0, index) : body);
    return {
      type: 'sms',
      phone,
      smsBody: index >= 0 ? body.slice(index + 1) : '',
      raw: text
    };
  }

  function parseMailto(text) {
    try {
      const url = new URL(text);
      return {
        type: 'email',
        email: decodeURIComponent(url.pathname),
        subject: url.searchParams.get('subject') || '',
        body: url.searchParams.get('body') || '',
        raw: text
      };
    } catch (error) {
      return { type: 'email', email: text.replace(/^mailto:/i, ''), subject: '', body: '', raw: text };
    }
  }

  function renderResult(parsed) {
    const label = t(TYPE_LABELS[parsed.type] || 'Metin');
    const actionHtml = buildResultActions(parsed);
    const detailsHtml = buildResultDetails(parsed);
    $('#resultContent').innerHTML = `
      <div class="result-page">
        <div class="result-head">
          <div>
            <span class="eyebrow">${t('Tarama sonucu')}</span>
            <h2>${escapeHtml(label)}</h2>
          </div>
          <span class="badge">${escapeHtml(label)}</span>
        </div>
        <div class="result-card">${detailsHtml}</div>
        ${actionHtml}
        <div class="result-card">
          <details class="raw-details">
            <summary>${t('Ham içerik')}</summary>
            <div class="raw-box">${escapeHtml(parsed.raw)}</div>
          </details>
          <div class="privacy-note">
            ${icon('lock')}
            <span>${t('Bu içerik cihazında işlendi. Hiçbir görsel veya metin sunucuya gönderilmedi.')}</span>
          </div>
        </div>
        <button class="rescan" type="button" data-action="rescan">
          ${icon('camera')} ${t('Yeniden tara')}
        </button>
      </div>
    `;
  }

  function buildResultDetails(parsed) {
    if (parsed.type === 'url') {
      return siteCard('link', hostOf(parsed.url), parsed.url);
    }
    if (parsed.type === 'phone') {
      return siteCard('phone', formatPhone(parsed.phone), t('Telefon numarası'));
    }
    if (parsed.type === 'email') {
      const rows = [row(t('E-posta'), parsed.email)];
      if (parsed.subject) rows.push(row(t('Konu'), parsed.subject));
      if (parsed.body) rows.push(row(t('Mesaj'), parsed.body));
      return `<div class="result-rows">${rows.join('')}</div>`;
    }
    if (parsed.type === 'sms') {
      const rows = [row(t('Telefon'), formatPhone(parsed.phone))];
      if (parsed.smsBody) rows.push(row(t('Mesaj'), parsed.smsBody));
      return `<div class="result-rows">${rows.join('')}</div>`;
    }
    if (parsed.type === 'wifi') {
      const rows = [row(t('Ağ'), parsed.wifi.ssid)];
      rows.push(row(t('Güvenlik'), parsed.wifi.encryption === 'NOPASS' ? t('Şifresiz') : parsed.wifi.encryption));
      if (parsed.wifi.password) rows.push(row(t('Şifre'), parsed.wifi.password));
      if (parsed.wifi.hidden) rows.push(row(t('Gizli ağ'), t('Evet')));
      return `<div class="result-rows">${rows.join('')}</div>`;
    }
    if (parsed.type === 'geo') {
      return `<div class="result-rows">${row(t('Konum'), parsed.geo)}</div>`;
    }
    if (parsed.type === 'text') {
      return `<div class="result-rows">${row(t('İçerik'), parsed.raw)}</div>`;
    }
    const rows = [];
    if (parsed.name) rows.push(row(t('Ad'), parsed.name));
    if (parsed.org) rows.push(row(t('Şirket'), parsed.org));
    if (parsed.title) rows.push(row(t('Ünvan'), parsed.title));
    if (parsed.phone) rows.push(row(t('Telefon'), formatPhone(parsed.phone)));
    if (parsed.email) rows.push(row(t('E-posta'), parsed.email));
    if (parsed.url) rows.push(row(t('Site'), parsed.url));
    return `<div class="result-rows">${rows.join('')}</div>`;
  }

  function siteCard(iconName, title, subtitle) {
    return `
      <div class="result-site">
        <div class="result-icon">${icon(iconName)}</div>
        <div class="result-site-copy">
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(subtitle)}</span>
        </div>
      </div>
    `;
  }

  function row(label, value) {
    return `<div class="result-row"><span class="result-label">${escapeHtml(label)}</span><span class="result-value">${escapeHtml(value)}</span></div>`;
  }

  function buildResultActions(parsed) {
    const parts = [];
    if (parsed.url) {
      parts.push(`<a class="btn-primary btn-full" href="${escapeAttr(parsed.url)}" target="_blank" rel="noopener noreferrer">${icon('external')} ${t('Siteyi aç')}</a>`);
    }
    if (parsed.phone) {
      parts.push(`
        <div class="quick-grid">
          <a class="quick-action primary" href="${escapeAttr('tel:' + parsed.phone)}">${icon('phone')}<strong>${t('Ara')}</strong></a>
          <a class="quick-action" href="${escapeAttr('sms:' + parsed.phone)}">${icon('message')}<strong>${t('SMS at')}</strong></a>
          <a class="quick-action wa wide" href="${escapeAttr(waLink(parsed.phone))}" target="_blank" rel="noopener noreferrer">${iconWhatsApp()}<strong>WhatsApp</strong></a>
        </div>
      `);
    }
    if (parsed.email) {
      parts.push(`<a class="btn-soft btn-full" href="mailto:${escapeAttr(parsed.email)}">${icon('mail')} ${t('E-posta gönder')}</a>`);
    }
    if (parsed.type === 'wifi') {
      if (parsed.wifi.password) {
        parts.push(`<button class="btn-soft btn-full" type="button" data-action="copy-wifi">${icon('copy')} ${t('Şifreyi kopyala')}</button>`);
      }
    }
    parts.push(`
      <div class="btn-row">
        <button class="btn-soft" type="button" data-action="copy">${icon('copy')} ${t('Kopyala')}</button>
        <button class="btn-soft" type="button" data-action="share">${icon('share')} ${t('Paylaş')}</button>
      </div>
    `);
    return parts.join('');
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (error) {
      return url;
    }
  }

  function normalizeUrl(value) {
    if (!value) return null;
    let candidate = String(value).trim();
    if (!candidate) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
      candidate = 'https://' + candidate.replace(/^\/+/, '');
    }
    try {
      const url = new URL(candidate);
      if (!url.hostname || (url.hostname.indexOf('.') === -1 && url.hostname !== 'localhost')) return null;
      return url.href;
    } catch (error) {
      return null;
    }
  }

  function normalizePhone(value) {
    if (!value) return null;
    let phone = String(value).replace(/[^\d+]/g, '');
    if (phone.startsWith('00')) phone = '+' + phone.slice(2);
    if (phone.startsWith('+')) {
      const digits = phone.slice(1);
      return digits.length >= 7 && digits.length <= 15 ? '+' + digits : null;
    }
    return phone.length >= 7 && phone.length <= 15 ? phone : null;
  }

  function formatPhone(phone) {
    if (!phone) return '';
    if (/^\+90\d{10}$/.test(phone)) {
      return '+90 ' + phone.slice(3, 6) + ' ' + phone.slice(6, 9) + ' ' + phone.slice(9, 11) + ' ' + phone.slice(11);
    }
    return phone;
  }

  function waLink(phone) {
    const digits = String(phone).replace(/\D/g, '');
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(WHATSAPP_TEXT);
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
  }

  function extractUrl(text) {
    const match = text.match(/\b((?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?)/i);
    if (!match) return null;
    return normalizeUrl(match[1].replace(/[),.;]+$/, ''));
  }

  function extractPhone(text) {
    const match = text.match(/(?:\+?\d[\d\s().-]{5,}\d)/);
    if (!match) return null;
    return normalizePhone(match[0]);
  }

  function escapeWifi(value) {
    return String(value).replace(/([\\;,:"])/g, '\\$1');
  }

  function decodeWifi(value) {
    return String(value).replace(/\\([\\;,:"])/g, '$1');
  }

  function decodeVCard(value) {
    return String(value)
      .replace(/\\n/gi, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
      .trim();
  }

  function normalizeCharset(charset) {
    const value = String(charset || 'utf-8').replace(/^"|"$/g, '').trim().toLowerCase();
    return value || 'utf-8';
  }

  function decodeVCardValue(value, params) {
    const encoding = String(params.ENCODING || '').toUpperCase();
    const charset = normalizeCharset(params.CHARSET);
    if (encoding === 'QUOTED-PRINTABLE') return decodeQuotedPrintable(value, charset);
    if (encoding === 'B' || encoding === 'BASE64') {
      try {
        const binary = atob(String(value).replace(/\s+/g, ''));
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        return new TextDecoder(charset).decode(bytes);
      } catch (error) {
        return value;
      }
    }
    return value;
  }

  function decodeQuotedPrintable(value, charset) {
    const normalized = String(value).replace(/=\r?\n/g, '');
    const bytes = [];
    for (let index = 0; index < normalized.length; index += 1) {
      const character = normalized[index];
      if (character === '=' && /^[0-9A-Fa-f]{2}$/.test(normalized.slice(index + 1, index + 3))) {
        bytes.push(parseInt(normalized.slice(index + 1, index + 3), 16));
        index += 2;
        continue;
      }
      const code = normalized.charCodeAt(index);
      if (code <= 0xFF) {
        bytes.push(code);
      } else if (typeof TextEncoder === 'function') {
        for (const byte of new TextEncoder().encode(character)) bytes.push(byte);
      } else {
        bytes.push(63);
      }
    }
    try {
      return new TextDecoder(charset).decode(new Uint8Array(bytes));
    } catch (error) {
      try {
        return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
      } catch (fallbackError) {
        return value;
      }
    }
  }

  function escapeVCard(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function shorten(value, length) {
    const text = String(value || '');
    return text.length > length ? text.slice(0, length - 1) + '…' : text;
  }

  function icon(name) {
    return '<svg class="ic" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function iconWhatsApp() {
    return '<svg class="ic wa" aria-hidden="true"><use href="#i-whatsapp"></use></svg>';
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function setLoading(visible) {
    $('#loadingOverlay').hidden = !visible;
  }

  function showToast(message) {
    const container = $('#toasts');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = t(message);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 220);
    }, 2600);
  }

  function debounce(callback, wait) {
    let timer;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => callback.apply(null, args), wait);
    };
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }
})();
