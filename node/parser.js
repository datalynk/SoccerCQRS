var jsdom = require("jsdom");
var fs = require('fs');

function doIt(year) {
    var name = year + "-" + (year + 1);
    var fileName = "output/" + name + ".json";
    var url = "http://www.premierleague.com/en-gb/matchday/results.html?paramClubId=ALL&paramComp_8=true&paramSeason=" + name + "&view=.dateSeason";

    console.log("Beginning " + fileName + ' (Url: ' + url + ')');
    jsdom.env({
        url: url,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function (errors, window) {
            if (!window || !window.$) {
                console.log("No jQuery, " + fileName + " failed.");
                return;
            }

            console.log("Parsing " + fileName);

            var $ = window.$;

            var events = [];
            var contentTables = $('.contentTable');
            contentTables.each(function(index) {
                var $this = $(this);
                var date = $this.find('.masthead').parent().text();

                var games = $this.find('.fixturechangerow');
                if (games.length == 0) {
                    games = $this.find('tr');
                }

                games.each(function() {
                    var $this = $(this);
                    var event = {};
                    event.Date = date;
                    event.HomeTeam = $this.find('.rHome').find('a').text();
                    if (!event.HomeTeam) return;
                    event.AwayTeam = $this.find('.rAway').find('a').text();
                    var score = $this.find('.score').find('a').text().split(' - ');
                    event.HomeScore = parseInt(score[0]);
                    event.AwayScore = parseInt(score[1]);
                    event.Location = $this.find('.location').find('a').text();
                    events.push(event);
                });
            });

            console.log("Begin write " + fileName);
            fs.writeFileSync(fileName, JSON.stringify(events, null, "\t"));
            console.log("End write " + fileName);
        }
    });
}

for (var i = 2006; i < 2014; i++) {
    doIt(i);
}

//doIt(1992);