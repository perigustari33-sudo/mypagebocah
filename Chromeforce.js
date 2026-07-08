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
        console.log("Sudah di Chrome browser, tidak perlu redirect");
        return;
    }
    
    // URL Play Store untuk download Chrome
    const chromePlayStore = 'https://play.google.com/store/apps/details?id=com.android.chrome';
    const chromeAppStore = 'https://apps.apple.com/app/google-chrome/id535886823';
    
    // Deteksi platform
    const platform = navigator.userAgentData?.platform || navigator.platform;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);
    
    // Redirect ke Chrome
    if (isAndroid) {
        // Coba buka intent Chrome
        window.location.href = 'intent://#Intent;scheme=https;package=com.android.chrome;end';
        
        // Fallback ke Play Store jika intent gagal
        setTimeout(() => {
            window.location.href = chromePlayStore;
        }, 2000);
    } else if (isIOS) {
        window.location.href = chromeAppStore;
    } else {
        // Desktop: arahkan ke halaman download Chrome
        window.location.href = 'https://www.google.com/chrome/';
    }
}

// Fungsi utama
function checkAndRedirect() {
    if (isWebView()) {
        console.log("⚠️ Terdeteksi WebView! Mengalihkan ke Chrome browser...");
        redirectToChrome();
    } else {
        console.log("✅ Bukan WebView, lanjutkan akses");
    }
}

// Jalankan deteksi
checkAndRedirect();
