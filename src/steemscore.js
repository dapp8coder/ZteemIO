const { JSC2 } = require("./lib/jsc2");
const { steemScore } = require("./config");

class SteemScore {
    /**
     * 
     * @param {JSC2} jsc2
     */
    constructor(jsc2) {
        this.jsc2 = jsc2;

        //Default high scores
        /**@type {[]} */
        this.list = [
            ["20000", "zteemio", "2018-05-07"],
            ["18000", "zteemio", "2018-05-07"],
            ["16000", "zteemio", "2018-05-07"],
            ["14000", "zteemio", "2018-05-07"],
            ["12000", "zteemio", "2018-05-07"],
            ["10000", "zteemio", "2018-05-07"],
            ["8000", "zteemio", "2018-05-07"],
            ["6000", "zteemio", "2018-05-07"],
            ["4000", "zteemio", "2018-05-07"],
            ["2000", "zteemio", "2018-05-07"]
        ];

        this.playerScore = -1;
        this.playerPos = -1;
    }

    GetHighScores(callBack) {
        this.jsc2.steem.database.getDiscussions("created", { tag: "zteemio", limit: 10 }).then(discussions => {

            var latestDate = "";
            var latestDiscussion;

            discussions.forEach(discussion => {
                var zteemio = JSON.parse(discussion.json_metadata).zteemio;

                // Verify post contains accurate high score list.
                if (zteemio != undefined && this.VerifySteemList(zteemio.highscores) &&
                    steemScore.hsversion == zteemio.hsversion && zteemio.validate === "something" &&
                    discussion.created > latestDate) {
                    latestDate = discussion.created;
                    latestDiscussion = discussion;
                }
            });

            // If correct highscore list found, use it, else the default high score list is used.
            if (latestDiscussion != undefined) this.list = JSON.parse(latestDiscussion.json_metadata).zteemio.highscores;

            this.list.sort(function (a, b) {
                return a[0] - b[0];
            });

            this.list.reverse();
            this.list = this.list.slice(0, 10);

            callBack();

        }, function (error) {
            console.error("Error getting discussion for zteemio tag.")
        });
    }

    VerifySteemList(highScores) {
        for (var i = 0; i < highScores.length; i++) {
            var score = highScores[i][0];
            var name = highScores[i][1];
            var date = highScores[i][2];

            if (score.match('[^0-9]')) return false;
            if (name.match('[^a-z0-9.-]')) return false;
            if (date.match('[^0-9A-Z:.-]')) return false;
        }

        return true;
    }

    SetPlayerHighScorePos(playerScore) {
        if (playerScore.toString().match('[^0-9]')) {
            this.playerPos = -1;
            return;
        }

        this.playerScore = playerScore;
        this.playerPos = -1;

        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i][0] < this.playerScore) {
                this.playerPos = (i + 1);
                break;
            }
        }

        if (this.playerPos === -1 && this.list.length < 10) {
            this.playerPos = this.list.length + 1;
        }
    }

    AddAndPostPlayerScore(callBack) {
        this.GetHighScores(() => {
            this.SetPlayerHighScorePos(this.playerScore);

            if (this.playerPos != -1) {
                var scoreDate = new Date().toISOString();
                scoreDate = scoreDate.substr(0, scoreDate.length - 5);
                var playerEntry = [this.playerScore.toString(), this.jsc2.profile.user, scoreDate];

                if (this.playerPos === 1) {
                    this.list.unshift(playerEntry);
                    this.list.pop();
                }
                else if (this.playerPos === 10) {
                    this.list.pop();
                    this.list.push(playerEntry);
                }
                else {
                    var partOne = this.list.slice(0, this.playerPos - 1);
                    var partTwo = this.list.slice(this.playerPos - 1);
                    partOne.push(playerEntry);
                    partTwo.pop();
                    this.list = partOne.concat(partTwo);
                }
            }

            this.PostHighScore(callBack);
        });
    }

    HighScoreMaker() {
        var postString = `<br/><center><b>TOP TEN HIGH SCORES</b><table>\
           <tr><td width="50">Pos</td><td width="150">User</td><td width="100">Score</td><td width="100">Date</td></tr>`;

        for (var i = 0; i < this.list.length; i++) {
            var highScore = this.list[i];

            if (i + 1 === this.playerPos) postString += '<tr><td><b>' + (i + 1) + '</b></td><td><b>@' + highScore[1] + '</b></td><td><b>' + highScore[0] + '</b></td><td><b>' + highScore[2] + '</b></td></tr>';
            else postString += '<tr><td>' + (i + 1) + '</td><td>@' + highScore[1] + '</td><td>' + highScore[0] + '</td><td>' + highScore[2] + '</td></tr>';
        }

        return postString += `</table></center><br/>`;
    }

    PrependHighScorePost() {
        if (this.playerPos != -1) return `I played a round of <a href="https://spelmakare.se/steem/zteemio">Zteem.io</a> and got a score of ${this.playerScore}. That put me at position <b>${this.playerPos}.</b> on the high score list!`;
        else return `I played a round of <a href="https://spelmakare.se/steem/zteemio">Zteem.io</a> and got a score of ${this.playerScore}. It wasn't enough to get on the high score list.`;
    }

    AppendHighScorePost() {
        return `Try it yourself at <a href = "https://spelmakare.se/steem/zteemio"> Zteem.io</a>. Created by @smjn. Current version: ${steemScore.version}, current high score version: ${steemScore.hsversion}.`;
    }

    PostHighScore(callBack) {
        var user = this.jsc2.profile.user;

        var date;
        if (this.playerPos != -1) date = this.list[this.playerPos - 1][2];
        else {
            var scoreDate = new Date().toISOString();
            date = scoreDate.substr(0, scoreDate.length - 5);
        }
        date = date.toLowerCase();
        date = date.replace(/:/g, "");

        var link = "zteemio-" + user + "-" + date;
        var topic = "Zteem.io High Score!";
        var body = this.PrependHighScorePost() + this.HighScoreMaker() + this.AppendHighScorePost();
        var metaData = {
            "tags": ["zteemio"], /// ["zteemio", "gaming", "games", "steemgc", "gamersunited"]
            "app": "zteemio/" + steemScore.version,
            "zteemio": {
                "version": steemScore.version,
                "hsversion": steemScore.hsversion,
                "validate": "something",
                "highscores": this.list
            }
        }

        this.jsc2.sc2.comment("", "zteemio", user, link, topic, body, metaData, function (err, res) {
            console.log(err, res);
            callBack();
        });
    }
}

///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    SteemScore
}