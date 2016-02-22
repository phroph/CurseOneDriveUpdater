/**
 * Created by Phtoph on 2/20/2016.
 */

var request = require('request');

module.exports.updateUser = function(user) {
    for(var mod in user.mods) {
        if(mod!='_schema') {
            request.get('http://www.curse.com/addons/wow/' + user.mods[mod] + '/download', function (err, body, res) {
                if (res.indexOf('<!--We were unable to find the page or file you were looking for.-->') < 0) {
                    var pattern = /<a data-project=".+" data-file=".+" data-href="(.+)" class=/i;
                    var filePath = pattern.exec(res)[1];
                    pattern = /\/([^\/]+)$/i;
                    var fileName = pattern.exec(filePath)[1];
                    request.get(filePath).pipe(request.put({
                        url: "https://api.onedrive.com/v1.0/drive/special/approot:/mods/" + fileName + ":/content?@name.conflictBehavior=fail",
                        headers: {
                            'Authorization': 'bearer ' + user.onedrive.accessToken,
                        }
                    }, function(err, body, res) {
                        console.log(res);
                        //Maintain some mod manifest somewhere and prune out outdated/removed items.
                    }));
                }
            });
        }
    }
};