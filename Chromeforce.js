// ============================================
// webview-redirect.js - Deteksi WebView & Redirect ke Chrome
// (Dengan proteksi loop untuk Telegram)
// ============================================

(function() {
    // ============================================
    // CEK APAKAH SUDAH PERNAH DI-REDIRECT
    // ============================================
    function hasRedirected() {
        // Cek di sessionStorage
        if (sessionStorage.getItem('_webview_redirected')) {
            return true;
        }
        
        // Cek di URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('_redirected') === '1') {
            return true;
        }
        
        return false;
    }

    // ============================================
    // TANDAI SUDAH REDIRECT
    // ============================================
    function markRedirected() {
        // Simpan di sessionStorage (bertahan selama tab terbuka)
        sessionStorage.setItem('_webview_redirected', '1');
        
        // Tambahkan parameter ke URL
        const url = new URL(window.location.href);
        url.searchParams.set('_redirected', '1');
        window.history.replaceState({}, '', url.toString());
    }

    // ============================================
    // DETEKSI WEBVIEW
    // ============================================
    function isWebView() {
        if (navigator.userAgentData) {
            const brands = navigator.userAgentData.brands || [];
            const hasWebView = brands.some(brand => 
                brand.brand.toLowerCase().includes('webview')
            );
            if (hasWebView) return true;
        }
        
        const ua = navigator.userAgent.toLowerCase();
        
        // Deteksi Telegram khusus
        if (ua.includes('telegram')) {
            return true;
        }
        
        return ua.includes('webview') || 
               ua.includes('wv') || 
               (ua.includes('android') && ua.includes('version/')) ||
               ua.includes('; wv)');
    }

    // ============================================
    // DETEKSI DARI REFERER
    // ============================================
    function isFromWebViewApp() {
        const referer = document.referrer.toLowerCase();
        
        // Deteksi Telegram dari referer
        if (referer.includes('telegram')) {
            return true;
        }
        
        const appPatterns = [
            'instagram', 'facebook', 'twitter', 'tiktok',
            'whatsapp', 'telegram', 'line', 'wechat',
            'linkedin', 'pinterest', 'reddit', 'snapchat',
            'discord', 'android-app', 'com.google.android'
        ];
        
        return appPatterns.some(pattern => referer.includes(pattern));
    }

    // ============================================
    // DETEKSI PLATFORM
    // ============================================
    function getPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) return 'android';
        if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'ios';
        return 'desktop';
    }

    // ============================================
    // CEK APAKAH SUDAH DI CHROME
    // ============================================
    function isChrome() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('chrome') && 
               !ua.includes('edge') && 
               !ua.includes('opr') && 
               !ua.includes('brave') &&
               !ua.includes('telegram');
    }

    // ============================================
    // REDIRECT KE CHROME (DENGAN PROTEKSI LOOP)
    // ============================================
    function redirectToChrome() {
        const currentUrl = window.location.href;
        const platform = getPlatform();
        
        // Tandai sudah redirect
        markRedirected();
        
        if (platform === 'android') {
            // Gunakan intent dengan fallback
            const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');
            const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
            
            // Coba redirect dengan intent
            window.location.replace(intentUrl);
            
            // Fallback: jika intent gagal, buka Play Store
            setTimeout(() => {
                window.location.replace('https://play.google.com/store/apps/details?id=com.android.chrome');
            }, 3000);
            
        } else if (platform === 'ios') {
            const chromeUrl = currentUrl.replace(/^https?:\/\//, 'googlechrome://');
            window.location.replace(chromeUrl);
            
            setTimeout(() => {
                window.location.replace('https://apps.apple.com/app/google-chrome/id535886823');
            }, 3000);
            
        } else {
            window.location.replace('https://www.google.com/chrome/');
        }
    }

    // ============================================
    // EKSEKUSI UTAMA
    // ============================================
    
    // 1. Cek apakah sudah redirect sebelumnya
    if (hasRedirected()) {
        console.log('⏭️ Sudah pernah redirect, skip untuk menghindari loop');
        return;
    }
    
    // 2. Cek apakah sudah di Chrome
    if (isChrome()) {
        console.log('✅ Sudah di Chrome, lanjutkan');
        return;
    }
    
    // 3. Deteksi WebView
    const isWebViewDetected = isWebView();
    const isFromApp = isFromWebViewApp();
    const shouldRedirect = isWebViewDetected || isFromApp;
    
    // 4. Redirect jika perlu
    if (shouldRedirect) {
        console.log('⚠️ WebView terdeteksi! Mengalihkan ke Chrome...');
        console.log('- Platform:', getPlatform());
        console.log('- WebView:', isWebViewDetected);
        console.log('- From App:', isFromApp);
        console.log('- User-Agent:', navigator.userAgent);
        
        // Redirect dengan proteksi loop
        redirectToChrome();
    } else {
        console.log('✅ Bukan WebView, lanjutkan akses');
    }
})();
