var jsdom = require("jsdom");
var fs = require('fs');

function doIt(name) {
    var fileName = "output/" + name + ".json";
    var url = "http://www.premierleague.com/en-gb/matchday/results.html?paramClubId=ALL&paramComp_8=true&paramSeason=" + name + "&view=.dateSeason";

    console.log("Beginning " + fileName);
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
            contentTables.each(function (index) {
                var $this = $(this);
                var date = $this.find('.masthead').parent().text();

                var games = $this.find('.fixturechangerow');
                if (games.length == 0) {
                    games = $this.find('tr.alt');
                }

                games.each(function () {
                    var $this = $(this);
                    var event = {};
                    event.Date = date;
                    event.HomeTeam = $this.find('.rHome').find('a').text();
                    event.AwayTeam = $this.find('.rAway').find('a').text();
                    var score = $this.find('.score').find('a').text().split(' - ');
                    event.HomeScore = score[0];
                    event.AwayScore = score[1];
                    event.Location = $this.find('.location').find('a').text();
                    events.push(event);
                });
            });

            console.log("Begin write " + fileName);
            fs.writeFileSync(fileName, JSON.stringify(events));
            console.log("End write " + fileName);
        }
    });
}

for (var i = 106; i < 115; i++) {
    var name = (1900 + i) + "-" + (1901 + i);
    doIt(name);
}