# BSY Theme

QrGen Web için kullanılan şablon tema. İndigo ana renk, buz mavisi açık zemin, koyu lacivert yüzeyler ve Rubik fontu.

## Kullanım

`design-system/theme.css` dosyasını yeni bir projeye kopyala ve ana CSS dosyasından önce bağla:

```html
<link rel="stylesheet" href="design-system/theme.css">
<link rel="stylesheet" href="style.css">
```

Tema seçimi `html` üzerindeki `data-theme` ile yapılır:

```js
const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.dataset.theme = dark ? 'dark' : 'light';
```

`theme.css` yalnızca tokenları içerir. Bileşenler bu değişkenleri kullanmalıdır:

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  color: var(--txt);
}
```

## Palet

| Rol | Açık | Koyu |
|---|---|---|
| Ana | `#5a4ad8` | `#8b80ff` |
| Ana parlama | `#6a59e8` | `#6f63f6` |
| Ana yumuşak | `#ece9fc` | `rgba(111,99,246,.16)` |
| Zemin | `#eaf2fa` | `#0c1120` |
| Yüzey | `#ffffff` | `#161d31` |
| İkincil yüzey | `#f3f8fd` | `#1d253d` |
| Metin | `#234d6c` | `#eef1f8` |
| İkincil metin | `#4c7493` | `#a2abc8` |
| Kenarlık | `#d7e5f1` | `#263051` |
| Vurgu / buz | `#2f79a4` | `#7fe4d8` |
| Hata / tarama | `#c22f43` | `#ff5b6b` |
| Başarı | `#0c7a4d` | `#2fd27f` |
| WhatsApp | `#128c4a` | `#4ade80` |

## Kurallar

- Rubik kullan; başlıklarda `letter-spacing: -.03em` ile sıkılaştır.
- Ana eylemlerde `--btn-grad` gradyanını kullan.
- Kartlarda 14–20 px yarıçap ve `--shadow-card` kullan.
- Dokunma hedefleri en az 44 px olmalı.
- Açık ve koyu temayı ayrı ayrı test et; koyu temada metin kontrastını 4.5:1 altına düşürme.
- Tarama çizgisi için `--red`, bağlantı ve vurgular için `--primary` kullan.
- `prefers-reduced-motion` açıksa tarama/geçiş animasyonlarını kapat.
- Tema dosyasını değiştirdiğinde `tokens.json` ve bu belgeyi de güncelle.

Bu tema QrGen Web'de `style.css` tarafından `@import` edilir.
