var url = require('url');

function getAuthenticationURL() {
    return "https://login.mypurecloud.com/oauth/authorize?response_type=token&client_id=f49f19cf-ee62-406b-b20e-43fd147d6e37&redirect_uri=http://localhost/callback"
}
 function getTokenFromUrl(callbackURL) {
        const urlParts = url.parse(callbackURL, true);
        const urlObj  = getHashData(urlParts.hash.substr(1));
        return urlObj
 }

function getHashData (hash){
    return  hash.split('&').reduce(function (res, item) {
        var parts = item.split('=');
        res[parts[0]] = parts[1];
        return res;
    }, {});
}

module.exports = {
    getAuthenticationURL,
    getTokenFromUrl,
};