const { site, sc2Conf } = require("../config");
const { GetURLParameter } = require("./jhelper");
const Cookies = require("cookies-js");
const { DOMSanitize } = require("./jvalidate");

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

        this.CheckCookieForToken();
        this.CheckURLForToken();

        /// Init steemconnect
        this.sc2 = require("sc2-sdk").Initialize({
            app: site.name,
            callbackURL: this.callBackURL,
            accessToken: this.accessToken,
            scope: sc2Conf.scope
        });


    }

    CheckCookieForToken() {
        this.accessToken = DOMSanitize(Cookies.get("accessToken"));

        // if (this.accessToken == "") return false;
        // else if (this.sc2.) console.log("x" + this.accessToken);
        //  else return true;
        //check if set
        //check if valid

        //return true/false
    }

    CheckURLForToken() {
        if (this.accessToken == "") {
            this.accessToken = DOMSanitize(GetURLParameter("access_token"));

            // Remove
            if (this.accessToken != "") {
                window.history.pushState(this.callBackURL, "Zteem.io", this.callBackURL);
            }
        }

        //check if set
        //check if valid

        //return true/false
    }

    StoreTokenInCookie() {
        if (this.accessToken != "") Cookies.set("accessToken", DOMSanitize(this.accessToken));
    }

    RedirectToSC2() {
        if (this.accessToken == "") window.location = this.sc2.getLoginURL("");
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