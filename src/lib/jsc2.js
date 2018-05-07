const { site, sc2Conf } = require("../config");
const { GetURLParameter } = require("./jhelper");
const Cookies = require("cookies-js");
const { DOMSanitize } = require("./jvalidate");
const { Client } = require("dsteem");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STEEM CONNECT
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class JSC2 {
    constructor() {
        this.domain = sc2Conf.domainLive;
        this.callBackURL = sc2Conf.callBackURL;
        this.secure = true;
        this.accessToken = "";
        this.profile;
        this.steem = new Client("https://api.steemit.com");

        if (window.location.href.includes(sc2Conf.domainDebug)) {
            this.domain = sc2Conf.domainDebug;
            this.callBackURL = sc2Conf.callBackURLDebug;
            this.secure = false;
        }

        if (window.location.href.includes(sc2Conf.domainLocal)) {
            this.domain = sc2Conf.domainLocal;
            this.callBackURL = sc2Conf.callBackURLLocal;
            this.secure = false;
        }

        /// Cookie default config
        Cookies.defaults = {
            path: "/",
            domain: this.domain,
            expires: sc2Conf.expires,
            secure: this.secure
        };

        if (!this.SetTokenFromCookie()) {
            this.SetTokenFromURL();
        }

        /// Init steemconnect
        this.sc2 = require("sc2-sdk").Initialize({
            app: site.name,
            callbackURL: this.callBackURL,
            accessToken: this.accessToken,
            scope: sc2Conf.scope
        });
    }

    SetTokenFromCookie() {
        this.accessToken = DOMSanitize(Cookies.get("accessToken"));

        if (this.accessToken == "") return false;

        return true;
    }

    SetTokenFromURL() {
        this.accessToken = DOMSanitize(GetURLParameter("access_token"));

        // Remove token from URL and store in a cookie.
        if (this.accessToken != "") {
            window.history.pushState(this.callBackURL, "Zteem.io", this.callBackURL);

            this.StoreTokenInCookie();

            return true;
        }

        return false;
    }

    StoreTokenInCookie() {
        Cookies.set("accessToken", DOMSanitize(this.accessToken));
    }

    RemoveCookie() {
        Cookies.expire("accessToken");
    }

    RedirectToSC2() {
        window.location = this.sc2.getLoginURL("");
    }

    Logout() {
        this.sc2.removeAccessToken();
        this.RemoveCookie();
        window.location = "";
    }

    GetProfile(callBack) {
        if (this.accessToken === "") return;

        if (this.profile != undefined) callBack(this.profile);

        else this.sc2.me((err, res) => {
            if (err) {
                console.log(err)
            }
            else {
                if (res == undefined) console.error("SC2: Profile not loaded!");

                this.profile = res;
                callBack(this.profile);
            }
        });
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    JSC2
}