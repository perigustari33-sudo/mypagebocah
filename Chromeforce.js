// IIFE - Langsung dijalankan otomatis
(function() {
    // Fungsi untuk mendeteksi apakah user-agent mengandung WebView
    function isWebView() {
        // Cek menggunakan User-Agent Client Hints (modern)
        if (navigator.userAgentData) {
            // Ambil brands (termasuk informasi browser)
            const brands = navigator.userAgentData.brands || [];
            
            // Cek apakah ada brand yang mengandung "WebView"
            const hasWebView = brands.some(brand => 
                brand.brand.toLowerCase().includes('webview')
            );
            
            // Cek juga dari userAgent string sebagai fallback
            const ua = navigator.userAgent.toLowerCase();
            const hasWebViewUA = ua.includes('webview') || 
                                 ua.includes('wv') || 
                                 (ua.includes('android') && ua.includes('version/'));
            
            return hasWebView || hasWebViewUA;
        }
        
        // Fallback untuk browser lama
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('webview') || 
               ua.includes('wv') || 
               (ua.includes('android') && ua.includes('version/'));
    }

    // Fungsi untuk redirect ke Chrome browser
    function redirectToChrome() {
        // Cek apakah sudah di Chrome
        const isChrome = /chrome/i.test(navigator.userAgent) && 
                         !/edge|opr|brave/i.test(navigator.userAgent);
        
        if (isChrome) {
            console.log("✅ Sudah di Chrome browser, tidak perlu redirect");
            return;
        }
        
        // Deteksi platform
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const isAndroid = /android/i.test(navigator.userAgent);
        
        // Redirect langsung ke Chrome tanpa setTimeout
        if (isAndroid) {
            // Coba buka intent Chrome
            window.location.replace('intent://#Intent;scheme=https;package=com.android.chrome;end');
        } else if (isIOS) {
            window.location.replace('https://apps.apple.com/app/google-chrome/id535886823');
        } else {
            // Desktop: arahkan ke halaman download Chrome
            window.location.replace('https://www.google.com/chrome/');
        }
    }

    // Eksekusi deteksi dan redirect
    if (isWebView()) {
        console.log("⚠️ Terdeteksi WebView! Mengalihkan ke Chrome browser...");
        redirectToChrome();
    } else {
        console.log("✅ Bukan WebView, lanjutkan akses");
    }
})();
