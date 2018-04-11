const { site, sc2Conf } = require("../config");
const { GetURLParameter } = require("./jhelper");
const Cookies = require("cookies-js");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STEEM CONNECT
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class JSC2 {
    constructor() {
        /// Cookie default config
        if (sc2Conf.debug) {
            Cookies.defaults = {
                path: "/",
                domain: sc2Conf.domainDebug,
                expires: sc2Conf.expires,
                secure: false
            };
        }
        else {
            Cookies.defaults = {
                path: "/",
                domain: sc2Conf.domainLive,
                expires: sc2Conf.expires,
                secure: true
            };
        }

        /// Get/Set Cookie
        this.accessToken = Cookies.get("accessToken");

        var urlHasToken = false;

        if (this.accessToken == undefined) {
            this.accessToken = GetURLParameter("access_token");
            urlHasToken = true;
        }

        if (this.accessToken != undefined) Cookies.set("accessToken", this.accessToken);
        else this.accessToken = "";

        /// Init steemconnect
        this.sc2;

        if (sc2Conf.debug) {
            this.sc2 = require("sc2-sdk").Initialize({
                app: site.name,
                callbackURL: sc2Conf.callBackURLDebug,
                accessToken: this.accessToken,
                scope: sc2Conf.scope
            });
        }
        else {
            this.sc2 = require("sc2-sdk").Initialize({
                app: site.name,
                callbackURL: c2Conf.callBackURL,
                accessToken: this.accessToken,
                scope: sc2Conf.scope
            });
        }

        /// Redirect to steemconnect login if no current accessToken found
        if (this.accessToken === "") document.location = this.sc2.getLoginURL("");

        this.profile;

        // Remove accessToken from url in browser location
        if (this.accessToken != "" && urlHasToken) {
            if (sc2Conf.debug) window.location = sc2Conf.callBackURLDebug;
            else window.location = sc2Conf.callBackURL;
        }
    }

    GetProfile(callBack) {
        if (this.profile != undefined) callBack(this.profile);

        else this.sc2.me((err, res) => {
            if (res == null) console.error("SC2: Profile not loaded!");
            this.profile = res;
            callBack(this.profile);
        });
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    JSC2
}