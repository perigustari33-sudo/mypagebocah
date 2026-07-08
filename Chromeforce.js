// ============================================
// webview-redirect.js - Deteksi WebView & Redirect ke Chrome
// ============================================

(function() {
    // Deteksi WebView dari User-Agent / Client Hints
    function isWebView() {
        if (navigator.userAgentData) {
            const brands = navigator.userAgentData.brands || [];
            const hasWebView = brands.some(brand => 
                brand.brand.toLowerCase().includes('webview')
            );
            if (hasWebView) return true;
        }
        
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('webview') || 
               ua.includes('wv') || 
               (ua.includes('android') && ua.includes('version/')) ||
               ua.includes('; wv)');
    }

    // Deteksi dari Referer
    function isFromWebViewApp() {
        const referer = document.referrer.toLowerCase();
        const appPatterns = [
            'instagram', 'facebook', 'twitter', 'tiktok',
            'whatsapp', 'telegram', 'line', 'wechat',
            'linkedin', 'pinterest', 'reddit', 'snapchat',
            'discord', 'android-app', 'com.google.android'
        ];
        return appPatterns.some(pattern => referer.includes(pattern));
    }

    // Deteksi Platform
    function getPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) return 'android';
        if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
        return 'desktop';
    }

    // Redirect ke Chrome
    function redirectToChrome() {
        const currentUrl = window.location.href;
        const platform = getPlatform();
        
        if (platform === 'android') {
            const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');
            const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
            window.location.replace(intentUrl);
        } else if (platform === 'ios') {
            const chromeUrl = currentUrl.replace(/^https?:\/\//, 'googlechrome://');
            window.location.replace(chromeUrl);
            // Fallback
            setTimeout(() => {
                window.location.replace('https://apps.apple.com/app/google-chrome/id535886823');
            }, 500);
        } else {
            window.location.replace('https://www.google.com/chrome/');
        }
    }

    // Eksekusi
    const shouldRedirect = isWebView() || isFromWebViewApp();
    
    if (shouldRedirect) {
        console.log('⚠️ WebView terdeteksi! Mengalihkan ke Chrome...');
        console.log('- URL:', window.location.href);
        console.log('- Platform:', getPlatform());
        redirectToChrome();
    } else {
        console.log('✅ Bukan WebView, lanjutkan akses');
    }
})();
