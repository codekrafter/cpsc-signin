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
        return callback(false);
    } else {
        var email = gapi._auth.cache.email;
        var scope = gapi._auth.cache.scope;
        var private_key_str = gapi._auth.cache.key;
        return gapi.auth(email, scope, private_key_str, callback);
    }
}

gapi.auth = function (email, scope, private_key_str, callback) {
    if (gapi._auth.bAuth) {
        console.log("Already Authorized, checking expiration...");
        if (KJUR.jws.IntDate.get("now") > gapi._auth.exp) {
            console.log("Token Expired, Requesting New One...");
            gapi._auth.bAuth = false;

            return gapi.auth(email, scope, private_key_str, callback);
        } else {
            console.log("Token is still valid, skipping new request");
            return callback(false);
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
                return callback(true);
            }
        } else {
            console.error(XHR.responseText);
            return callback(false);
        }
        //token = response["access_token"]
    });

    // We define what will happen in case of error
    XHR.addEventListener('error', function (event) {
        console.log('Oops! Something went wrong.');
        return callback(false);
    });

    XHR.open('POST', 'https://www.googleapis.com/oauth2/v4/token');
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.send(urlEncodedData)
    return callback(false);
}

gapi.print = {};
gapi.drive = {};
gapi.gmail = {};

gapi.print.submit = async function (content, contentType, title, printerID) {
    // Make sure we have an access token
    return gapi.refresh(async (auth) => {
        var url = "https://cors-anywhere.herokuapp.com/https://www.google.com/cloudprint/submit";//'https://www.google.com/cloudprint/search';

        var authStr = "Bearer " + gapi._auth.access_token;

        //var printerID = "b45bfeeb-46b2-2665-3169-738623ffd140";
        var ticket = `{
            "version": "1.0",
            "print": {
                "vendor_ticket_item": [],
                "copies": {
                    "copies": 1
                }
            }
        }`

        var fd = new FormData();

        fd.append("printerid", printerID);
        fd.append("title", title);
        fd.append("ticket", ticket);
        fd.append("content", content);
        fd.append("contentType", contentType);

        var out;

        var json = await fetch(url, {
            method: "POST",
            body: fd,
            headers: {
                'Authorization': authStr
            }
        })
            .then(resp => resp.json());
        //.then(json => {console.log(json); return json}).then(json => {out = json.job.ticketUrl});
        console.log(json);
        console.log(json.job.ticketUrl);
        return json.job.ticketUrl;

        return out;
    });
}

gapi.print.status = function (id) {
    gapi.refresh(() => {
        gapi.refresh(() => {
            var url = "https://cors-anywhere.herokuapp.com/"//https://www.google.com/cloudprint/ticket";

            var authStr = "Bearer " + gapi._auth.access_token;

            var fd = new FormData();

            fd.append("jobid", id);

            fetch(url + id, {
                method: "GET",
                //body: fd,
                headers: {
                    'Authorization': authStr
                }
            })
                .then(resp => resp.text())
                .then(json => console.log(json));
        });
    });
}

gapi.gmail.send = function (to, cc, id) {
    // Make sure we have an access token
    gapi.refresh(() => {
        var id;
        $.ajax({
            type: "POST",
            url: 'https://www.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media',
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
                console.log(status);
                console.log(data);
            }
        });
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
                            'type': 'domain',
                            'role': 'reader',
                            'domain': 'cpsfc.org'
                        };

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
                                console.log(status);
                                console.log(data);
                                callback(true, id);
                            }
                        });
                    }
                });
            }
        });
    });
}