var fs     = require("fs");
var path   = require("path");
var async  = require("async");
var mkdirp = require("mkdirp");
var gitane = require("gitane");
var config = require("./config");
var models = require("./models");

exports.build = function(cb){
	async.waterfall([
		// update the repository
		function(cb){
			console.log("* Updating repository");
			var repoURL = config.repository;
			var buildPath = path.resolve(config.build_folder);
			mkdirp(buildPath, function(err){
				if(err){
					return cb(err, null);
				}

				var repoPath = path.join(buildPath, "repository");
				var gitCommand = "git clone " + config.repository + " repository";
				var directory = buildPath;

				if(path.existsSync(repoPath)){
					gitCommand = "git pull origin master";
					directory = repoPath;
				}

				gitane.run(directory, config.ssh_key, gitCommand, function(err, stdout, stderr){
//					console.log(stdout);
					console.log("* Finished updating repository\n");
					cb(err, buildPath, repoPath);
				});
			});
		},

		// load site
		function(buildPath, repoPath, cb){
			console.log("* Loading site: " + repoPath);
			models.Site.loadSiteAtPath(repoPath, function(err, site){
				console.log("* Finished loading site");
				cb(err, buildPath, site);
			});
		},

		// build post tree	
		function(buildPath, site, cb){
			cb(null);
		}
	], function(err, results){
		cb(err, results);
	});
};