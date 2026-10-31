// Shared GA4 setup. Never send tool inputs, file names, notes or URL query strings.
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-JRB2GZGSMH', {
  page_location: window.location.origin + window.location.pathname,
  page_referrer: document.referrer ? document.referrer.split('?')[0].split('#')[0] : '',
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});
