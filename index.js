var async = require("async");
var config = require("./lib/config");
var pipeline = require("./lib/pipeline");

var configSites = config.sites;

var sites = [];
for(var idx = 2; idx < process.argv.length; idx++){
	var siteName = process.argv[idx];
	if(configSites[siteName]){
		sites.push(process.argv[idx]);
	}
}

if(sites.length == 0){
	for(var key in configSites){
		sites.push(key);
	}
}

async.forEachSeries(sites, function(sitename, cb){
	var site = configSites[sitename];
	pipeline.build(site, function(err, results){
		console.log("Built");
	});
});