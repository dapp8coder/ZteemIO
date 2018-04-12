const { site, sc2Conf } = require("../config");
const { GetURLParameter } = require("./jhelper");
const Cookies = require("cookies-js");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STEEM CONNECT
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class JSC2 {
    constructor() {
        this.domain = sc2Conf.domainLive;
        this.callBackURL = sc2Conf.callBackURL;
        this.secure = true;

        if (sc2Conf.debug) {
            this.domain = sc2Conf.domainDebug;
            this.callBackURL = sc2Conf.callBackURLDebug;
            this.secure = false;
        }

        if (sc2Conf.local) {
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
        this.sc2 = require("sc2-sdk").Initialize({
            app: site.name,
            callbackURL: this.callBackURL,
            accessToken: this.accessToken,
            scope: sc2Conf.scope
        });

        /// Redirect to steemconnect login if no current accessToken found
        if (this.accessToken === "") window.location = this.sc2.getLoginURL("");

        this.profile;

        // Remove accessToken etc from url in browser location
        if (this.accessToken != "" && urlHasToken) {
            window.history.pushState(this.callBackURL, "Zteem.io", this.callBackURL);
        }
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