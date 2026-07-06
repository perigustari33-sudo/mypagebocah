
(function() {
    // Cek Client Hints untuk Vivaldi
    var isVivaldi = false;
    
    // Metode 1: Cek navigator.vendor
    if (navigator.vendor && navigator.vendor.includes('Vivaldi')) {
        isVivaldi = true;
    }
    
    // Metode 2: Cek melalui User-Agent Client Hints (jika tersedia)
    if (navigator.userAgentData && navigator.userAgentData.brands) {
        var brands = navigator.userAgentData.brands;
        for (var i = 0; i < brands.length; i++) {
            if (brands[i].brand === 'Vivaldi') {
                isVivaldi = true;
                break;
            }
        }
    }
    
    var ua = navigator.userAgent;
    var isAndroid = /Android/i.test(ua);
    var isChrome = /Chrome/i.test(ua) && 
                   !/Edg|OPR|SamsungBrowser|FBAN|FBAV|Instagram|wv|YaBrowser|Opera Mini/i.test(ua) &&
                   !isVivaldi;  // Tambahkan deteksi Vivaldi
    
    var alreadyRedirected = window.location.search.includes('redirected=true');
    var isWebView = /wv|WebView/i.test(ua);
    
    if (isAndroid && !isChrome && !alreadyRedirected && !isWebView) {
        var url = window.location.href;
        var redirectUrl = url + (url.includes('?') ? '&' : '?') + 'redirected=true';
        
        var intent = 'intent://' + 
                     redirectUrl.replace(/^https?:\/\//, '') + 
                     '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + 
                     encodeURIComponent(redirectUrl) + 
                     ';end';
        
        window.location.href = intent;
        
        setTimeout(function() {
            window.location.href = redirectUrl;
        }, 500);
    }
})();
