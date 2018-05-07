const { JSC2 } = require("./lib/jsc2");

class SteemScore {
    /**
     * 
     * @param {JSC2} jsc2
     */
    constructor(jsc2) {
        this.jsc2 = jsc2;
        this.list = [
            ["20000", "zteemio", "2018-05-07"],
            ["19000", "zteemio", "2018-05-07"],
            ["18000", "zteemio", "2018-05-07"],
            ["17000", "zteemio", "2018-05-07"],
            ["16000", "zteemio", "2018-05-07"],
            ["15000", "zteemio", "2018-05-07"],
            ["14000", "zteemio", "2018-05-07"],
            ["13000", "zteemio", "2018-05-07"],
            ["12000", "zteemio", "2018-05-07"],
            ["11000", "zteemio", "2018-05-07"],
            ["10000", "zteemio", "2018-05-07"],
            ["9000", "zteemio", "2018-05-07"],
            ["8000", "zteemio", "2018-05-07"],
            ["7000", "zteemio", "2018-05-07"],
            ["6000", "zteemio", "2018-05-07"],
            ["5000", "zteemio", "2018-05-07"],
            ["4000", "zteemio", "2018-05-07"],
            ["3000", "zteemio", "2018-05-07"],
            ["2000", "zteemio", "2018-05-07"],
            ["1000", "zteemio", "2018-05-07"]
        ];

        this.playerScore = -1;
        this.playerPos = -1;
    }

    GetHighScores(callBack) {
        this.jsc2.steem.database.getDiscussions("created", { tag: "zteemio", limit: 100 }).then(discussions => {

            var latestDate = "";
            var latestDiscussion;

            // TODO ADD CHECK AND VERIFY THAT A POST HAS THE DATA NEEDED.
            // SAME HIGHSCROE VERSION AND ALSO PERHAPS CHECK SCORES IN MULTIPLE ENTRIES AND MERGE 

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
            this.list = JSON.parse(latestDiscussion.json_metadata).zteemio.highscores;

            this.list.sort(function (a, b) {
                return a[0] - b[0];
            });

            this.list.reverse();

            callBack();
        });
    }

    SetPlayerHighScorePos(playerScore) {
        this.playerScore = playerScore;
        this.playerPos = -1;

        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i][0] < this.playerScore) {
                this.playerPos = (i + 1);
                break;
            }
        }

        if (this.playerPos === -1 && this.list.length < 10) {
            //    this.playerPos = this.list.length + 1;
        }
    }

    AddAndPostPlayerScore(callBack) {
        this.GetHighScores(() => {
            this.SetPlayerHighScorePos(this.playerScore);

            if (this.playerPos != -1) {
                var scoreDate = new Date().toISOString();
                var playerEntry = [this.playerScore.toString(), this.jsc2.profile.user, scoreDate];

                this.list.push(playerEntry);
            }

            this.PostHighScore(callBack);
        });
    }

    HighScoreMaker(postString) {
        postString += `<center><b>TOP TEN HIGH SCORES</b><table>\
           <tr><td width="50">Pos</td><td width="150">User</td><td width="100">Score</td><td width="100">Date</td></tr>`;

        for (var i = 0; i < this.list.length; i++) {
            var highScore = this.list[i];

            postString += '<tr><td>' + (i + 1) + '</td><td>@' + highScore[1] + '</td><td>' + highScore[0] + '</td><td>' + highScore[2] + '</td></tr>';
        }

        return postString += `</table></center>`;
    }

    PrependHighScorePost() {
        return `I played a round of <a href="${this.jsc2.callBackURL}">Zteem.io</a> and got a score of 40. That put me at position <b>4</b> on the high score list!`;
    }

    AppendHighScorePost() {
        return `Try it yourself at <a href = "${this.jsc2.callBackURL}"> Zteem.io</a>. Created by @smjn.</a>`;
    }

    PostHighScore(callBack) {
        console.log(this.list);
        callBack();
        // INCLUDE HIGH SCORE VERSION
        // MAKE SPECIAL FOR POS 1 and TOP 3. POS 1 USE ALL TAGS

        /* this.sc2.comment("", "zteemio", "smjn", "zteemio-high-score-test-4",
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
         );*/
    }
}

///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    SteemScore
}