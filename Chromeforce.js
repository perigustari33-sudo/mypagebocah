// Deteksi browser dan redirect ke Chrome
function redirectToChrome() {
    var userAgent = navigator.userAgent;
    var isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent); // Bukan Edge
    var isAndroid = /Android/.test(userAgent);
    
    // Jika bukan Chrome dan di Android
    if (!isChrome && isAndroid) {
        var currentUrl = window.location.href;
        
        // Gunakan intent URL untuk membuka di Chrome
        var chromeIntent = 'intent://' + currentUrl.replace(/^https?:\/\//, '') + 
                          '#Intent;scheme=https;package=com.android.chrome;end';
        
        window.location.href = chromeIntent;
    }
}

// Jalankan
redirectToChrome();
