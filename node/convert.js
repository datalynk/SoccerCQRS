var http = require('http');
var fs = require('fs');

function doIt(year) {
    var name = year + "-" + (year + 1);
    var fileName = "output/" + name + ".json";
    fs.readFile(fileName, 'utf8', function (err, data) {
        var events = JSON.parse(data);
        for (var i = 0; i < events.length; i++) {
            events[i].HomeScore = parseInt(events[i].HomeScore);
            events[i].AwayScore = parseInt(events[i].AwayScore);
        }

        fs.writeFileSync(fileName, JSON.stringify(events, null, "\t"));
    });
}

for (var i = 1992; i < 2014; i++) {
    doIt(i);
}

//doIt(1992);