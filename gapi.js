/*
 * Google API's Library
 * Written by Eli Edds
 * IMPORTANT: This is not gapi.js from google, this is a custom, lighweight library for simple authorization and printing using the Google Cloud Print Service Interface
 */

var gapi = {};

gapi._auth = { auth: false, access_token: "" }

gapi.auth = function (client_id, client_secret, callback) {
    if (gapi._auth) {
        console.log("Already Authorized, returning...");
        return false;
    }

    // Base64url of JWT Header
    const header = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9";
    var claim_set = {};

    claim_set.iss = "";
    claim_set.scope = "";
    claim_set.aud = "https://www.googleapis.com/oauth2/v4/token";
    claim_set.exp = "";
    claim_set.iat = "";

}