/*
 * Google API's Library
 * Written by Eli Edds
 * IMPORTANT: This is not gapi.js from google, this is a custom, lighweight library for simple authorization and printing using the Google Cloud Print Service Interface
 */

var gapi = {};

gapi._auth = { bAuth: false, access_token: "", exp: 0, cache: undefined }

gapi.refresh = function (callback) {
    if (gapi._auth.cache == undefined) {
        console.error("No Authentication Request Cache, cannot refresh token");
        callback();
        return;
    } else {
        var email = gapi._auth.cache.email;
        var scope = gapi._auth.cache.scope;
        var private_key_str = gapi._auth.cache.key;
        gapi.auth(email, scope, private_key_str, callback);
    }
}

gapi.auth = function (email, scope, private_key_str, callback) {
    if (gapi._auth.bAuth) {
        console.log("Already Authorized, checking expiration...");
        if (KJUR.jws.IntDate.get("now") > gapi._auth.exp) {
            console.log("Token Expired, Requesting New One...");
            gapi._auth.bAuth = false;

            gapi.auth(email, scope, private_key_str, callback);
            return;
        } else {
            console.log("Token is still valid, skipping new request");
            callback(false);
            return;
        }
    }

    var cache = {};

    cache.email = email;
    cache.scope = scope;
    cache.key = private_key_str;
    gapi._auth.cache = cache;

    var pHeader = { "alg": "RS256", "typ": "JWT" }
    var sHeader = JSON.stringify(pHeader);

    var pClaim = {};
    pClaim.aud = "https://www.googleapis.com/oauth2/v4/token";
    pClaim.scope = scope;
    pClaim.iss = email;
    pClaim.exp = KJUR.jws.IntDate.get("now + 1hour");
    pClaim.iat = KJUR.jws.IntDate.get("now");
    //pClaim.sub = "eddsecp@cpsfc.org";

    var sClaim = JSON.stringify(pClaim);

    var sJWS = KJUR.jws.JWS.sign(null, sHeader, sClaim, private_key_str);

    var XHR = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];

    urlEncodedDataPairs.push(encodeURIComponent("grant_type") + '=' + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer"));
    urlEncodedDataPairs.push(encodeURIComponent("assertion") + '=' + encodeURIComponent(sJWS));
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    // We define what will happen if the data are successfully sent
    XHR.addEventListener('load', function (event) {
        if (XHR.readyState == 4) {
            var response = JSON.parse(XHR.responseText);
            console.log(response);
            if (response.access_token) {
                console.log("Requested Access Token Succesfully");
                gapi._auth.exp = pClaim.exp;
                gapi._auth.access_token = response.access_token;
                gapi._auth.bAuth = true;
                callback(true);
                return;
            }
        } else {
            console.error(XHR.responseText);
            callback(false);
            return;
        }
        //token = response["access_token"]
    });

    // We define what will happen in case of error
    XHR.addEventListener('error', function (event) {
        console.log('Oops! Something went wrong.');
        callback(false);
        return;
    });

    XHR.open('POST', 'https://www.googleapis.com/oauth2/v4/token');
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.send(urlEncodedData)
    return;
}

gapi.print = {};
gapi.drive = {};

gapi.print.submit = function (img) {
    // Make sure we have an access token
    gapi.refresh(() => {

        var xhr = new XMLHttpRequest();
        var printerID = "eddsecp@cpsfc.org"//Also Target Email, "b45bfeeb-46b2-2665-3169-738623ffd140"; // Ringo for Testing, change to proper printer on deploy
        var title = "Test Print Job";
        var data = img;
        var contentType = "application/pdf";
        var tags = "Automated; Sign In; ID";

        //formData.append("", "drunknight");
        //var url = 'https://www.google.com/cloudprint/search';
        var authStr = "Bearer " + gapi._auth.access_token;
        var url = 'https://docs.google.com/forms/d/e/1FAIpQLScygIXCUFbpQGrZ7o6Tbiy-GIQQGprPeXnEYEdrjbqf5wKcRA/formResponse?usp=pp_url&entry.558004711=' + encodeURIComponent(authStr) + '&entry.1902462614=' + encodeURIComponent(printerID) + '&entry.1783159477=' + encodeURIComponent(title) + '&entry.1789236024=' + encodeURIComponent(data) + '&entry.1329547601=' + encodeURIComponent(contentType) + '&entry.886182819=' + encodeURIComponent(tags);
        xhr.open('POST', url, true);
        //formData.append("auth", "Bearer" + gapi._auth.access_token);

        //xhr.setRequestHeader("Content-Type", undefined);//"application/x-www-form-urlencoded");
        //xhr.setRequestHeader("Authorization", "Bearer" + gapi._auth.access_token);

        xhr.addEventListener('load', function (e) {
            console.error(xhr.responseText);
        });

        //console.log("submitted search request");

        xhr.send();//formData);

        //$.ajax({type: "POST", url: 'https://www.google.com/cloudprint/search', data: {}, success: (data, status) => {console.log(status);console.log(data);}});
    });
}

// Name is for future compatibility, it is currently ignored
gapi.drive.upload = function (name, data, contentType, callback) {
    // Make sure we have an access token
    gapi.refresh(() => {
        var id;
        $.ajax({
            type: "POST",
            url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media',
            data: data,
            error: (xhr, textStatus, errorThrown) => {
                console.log(errorThrown);
                console.log(textStatus);
                console.log(xhr.responseText);
                callback(false);
            },
            contentType: contentType,
            headers: {
                Authorization: "Bearer " + gapi._auth.access_token
            },
            success: (data, status) => {
                id = data.id;

                let meta = {
                    name: name
                };

                $.ajax({
                    type: "PATCH",
                    url: 'https://www.googleapis.com/drive/v3/files/' + id,
                    data: JSON.stringify(meta),
                    error: (xhr, textStatus, errorThrown) => {
                        console.log(errorThrown);
                        console.log(textStatus);
                        console.log(xhr.responseText);
                        callback(false);
                    },
                    headers: {
                        Authorization: "Bearer " + gapi._auth.access_token
                    },
                    contentType: "application/json",
                    success: (data, status) => {
                        console.log(data);

                        var permissions = {
                            'type': 'anyone',
                            'role': 'reader'
                        }

                        $.ajax({
                            type: "POST",
                            url: 'https://www.googleapis.com/drive/v3/files/' + id + '/permissions?sendNotificationEmail=false',
                            data: JSON.stringify(permissions),
                            error: (xhr, textStatus, errorThrown) => {
                                console.log(errorThrown);
                                console.log(textStatus);
                                console.log(xhr.responseText);
                                callback(false);
                            },
                            headers: {
                                Authorization: "Bearer " + gapi._auth.access_token
                            },
                            contentType: "application/json",
                            success: (data, status) => {
                                callback(true, id);
                            }
                        });
                    }
                });
            }
        });
    });
}