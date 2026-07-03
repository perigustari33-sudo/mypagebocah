(function() {
    var ua = navigator.userAgent;
    
    // Cek Android dan bukan Chrome
    var isAndroid = /Android/i.test(ua);
    var isChrome = /Chrome/i.test(ua) && !/Edg|OPR|SamsungBrowser|Vivaldi|FBAN|FBAV|Instagram|wv/i.test(ua);
    
    // Cek apakah sudah di-redirect
    var alreadyRedirected = window.location.search.includes('redirected=true');
    
    if (isAndroid && !isChrome && !alreadyRedirected) {
        var url = window.location.href;
        var redirectUrl = url + (url.includes('?') ? '&' : '?') + 'redirected=true';
        var intent = 'intent://' + redirectUrl.replace(/^https?:\/\//, '') + 
                    '#Intent;scheme=https;package=com.android.chrome;end';
        window.location.href = intent;
    }
})();
