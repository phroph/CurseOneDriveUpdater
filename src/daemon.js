/**
 * Created by Phtoph on 2/20/2016.
 */

var request = require('request');
var fs = require('fs');

var createCallback = function(dec, user, map, name) {
    return function (err, body, res) {
        if (res.indexOf('<!--We were unable to find the page or file you were looking for.-->') < 0) {
            var pattern = /<a data-project=".+" data-file=".+" data-href="(.+)" class=/i;
            var filePath = pattern.exec(res)[1];
            pattern = /\/([^\/]+)$/i;
            var fileName = pattern.exec(filePath)[1];
            map[name] = fileName;
            request.get(filePath).pipe(request.put({
                url: "https://api.onedrive.com/v1.0/drive/special/approot:/mods/" + fileName + ":/content?@name.conflictBehavior=fail",
                headers: {
                    'Authorization': 'bearer ' + user.onedrive.accessToken,
                }
            }, function(err, body, res) {
                dec();
            }));
        }
    };
}

module.exports.updateUser = function(user) {
    console.log('Syncing user: ' + user.onedrive.userId);
    var map = {};
    var counter = 0;
    var dec = function() {
        counter--;
    }
    for(var mod in user.mods) {
        if(mod != '_schema') {
            counter++;
            request.get('http://www.curse.com/addons/wow/' + user.mods[mod] + '/download', createCallback(dec, user, map, user.mods[mod]));
        }
    }

    request.get({
        url: 'https://api.onedrive.com/v1.0/drive/special/approot:/:/children',
        headers: {
            'Authorization': 'bearer ' + user.onedrive.accessToken,
        }}, function (err, body, res) {
            var files = JSON.parse(res).value;
            var found = false;
            for(var file in files) {
                var fileName = files[file].name;
                if(fileName == 'install_mods.ps1') {
                    found = true;
                }
            }
            if(!found) {
                console.log('Adding install script to OneDrive.');
                fs.createReadStream('./bin/install_mods.ps1').pipe(request.put({
                    url: "https://api.onedrive.com/v1.0/drive/special/approot:/install_mods.ps1:/content",
                    headers: {
                        'Authorization': 'bearer ' + user.onedrive.accessToken,
                    }
                }));
            }
        });

    var timeoutCallback = function() {
        if(counter > 0) {
            setTimeout(timeoutCallback, 1000);
        } else {
            var pairs = "";
            var values = [];
            for(var key in Object.keys(map)) {
                var keyVal = Object.keys(map)[key];
                pairs += keyVal + ',' + map[keyVal] + ';';
                values.push(map[keyVal]);
            }
            request.put({
                url: "https://api.onedrive.com/v1.0/drive/special/approot:/mods/modlist.txt:/content",
                body: pairs,
                headers: {
                    'Authorization': 'bearer ' + user.onedrive.accessToken,
                }
            });
            request.get({
                url: 'https://api.onedrive.com/v1.0/drive/special/approot:/mods:/children',
                headers: {
                    'Authorization': 'bearer ' + user.onedrive.accessToken,
                }
            }, function (err, body, res) {
                var files = JSON.parse(res).value;
                for(var file in files) {
                    var fileName = files[file].name;
                    if(values.indexOf(fileName) < 0 && fileName != 'modlist.txt') {
                        console.log('Found out of date mod: ' + fileName);
                        request.del({
                            url: 'https://api.onedrive.com/v1.0/drive/special/approot:/mods/' + fileName,
                            headers: {
                                'Authorization': 'bearer ' + user.onedrive.accessToken,
                            }
                        })
                    }
                }
            });
        }
    };
    timeoutCallback();
};

module.exports.updateAll = function(users) {
    console.log('Syncing all users.');
    users.forEach(function(user) { module.exports.updateUser(user); });
};