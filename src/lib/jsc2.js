const { site, sc2Conf } = require("../config");
const { GetURLParameter } = require("./jhelper");
const Cookies = require("cookies-js");
const { DOMSanitize } = require("./jvalidate");
const { Client } = require("dsteem");

const steem = new Client("https://api.steemit.com");


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

    GetHighScores(callBack) {
        steem.database.getDiscussions("created", { tag: "zteemio", limit: 100 }).then(discussions => {

            var latestDate = "";
            var latestDiscussion;

            /// TEST TWO ENTRIES
            /*var test2 = JSON.parse(JSON.stringify(discussions[0]));
            test2.created = "2019-12-02T06:39:47";
            discussions.push(test2);*/

            discussions.forEach(discussion => {
                if (discussion.created > latestDate) {
                    latestDate = discussion.created;
                    latestDiscussion = discussion;
                }
            });

            /**@type {[]} */
            var highScores = JSON.parse(latestDiscussion.json_metadata).zteemio.highscores;

            highScores.sort(function (a, b) {
                return a[0] - b[0];
            });

            highScores.reverse();

            callBack(highScores);
        });
    }
    /**
     * 
     * @param {[]} highScores 
     */
    HighScoreMaker(highScores, postString) {
        postString += `<center><b>TOP TEN HIGH SCORES</b><table>\
           <tr><td width="50">Pos</td><td width="150">User</td><td width="100">Score</td><td width="100">Date</td></tr>`;

        for (var i = 0; i < highScores.length; i++) {
            var highScore = highScores[i];

            postString += '<tr><td>' + (i + 1) + '</td><td>@' + highScore[1] + '</td><td>' + highScore[0] + '</td><td>' + highScore[2] + '</td></tr>';
        }

        return postString += `</table></center>`;
    }

    PrependHighScorePost() {
        return `I played a round of <a href="${this.callBackURL}">Zteem.io</a> and got a score of 40. That put me at position <b>4</b> on the high score list!`;
    }

    AppendHighScorePost() {
        return `Try it yourself at <a href = "${this.callBackURL}"> Zteem.io</a>. Created by @smjn.</a>`;
    }

    PostHighScore() {
        // INCLUDE HIGH SCORE VERSION
        // MAKE SPECIAL FOR POS 1 and TOP 3. POS 1 USE ALL TAGS

        this.sc2.comment("", "zteemio", "smjn", "zteemio-high-score-test-4",
            "[TEST IGNORE] Zteem.io High Score!",
            'I played a round of <a href="https://spelmakare.se/steem/zteemio">Zteem.io</a> and got a score of 40. That put me at position <b>4</b> on the high score list!\
            <br/>\
            <center>\
            <b>TOP TEN HIGH SCORES</b>\
            <table>\
            <tr><td>Position</td><td>User</td><td>Score</td><td>Date</td></tr>\
            <tr><td>1</td><td>@User1</td><td>100</td><td>2018-01-20</td></tr>\
            <tr><td>2</td><td>@User2</td><td>80</td><td>2018-02-15</td></tr>\
            <tr><td>3</td><td>@User3</td><td>50</td><td>2018-03-25</td></tr>\
            <tr><td><b>4</b></td><td><b>@smjn</b></td><td><b>40</b></td><td><b>2018-05-02</b></td></tr>\
            <tr><td>5</td><td>@UserX</td><td>20</td><td>2018-04-15</td></tr>\
            </table>\
            </center>\
            <br/>\
            Try it yourself at <a href="https://spelmakare.se/steem/zteemio">Zteem.io</a>. Created by @smjn.</a>',
            {
                "tags": ["zteemio"], /// ["zteemio", "gaming", "games", "steemgc", "gamersunited"]
                "app": "zteemio/0.1",
                "zteemio": {
                    "version": 0.1,
                    "hsversion": 1,
                    "validate": "something",
                    "user": "smjn",
                    "score": 40,
                    "hsposition": 4,
                    "highscores": [
                        ["20", "userx", "2018-04-15"],
                        ["100", "user1", "2018-01-20"],
                        ["50", "user3", "2018-03-25"],
                        ["80", "user2", "2018-02-15"],
                        ["40", "smjn", "2018-05-02"]
                    ]
                }
            },
            function (err, res) {
                console.log(err, res)
            }
        );
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    JSC2
}