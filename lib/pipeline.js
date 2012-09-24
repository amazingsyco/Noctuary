var fs     = require("fs");
var path   = require("path");
var async  = require("async");
var mkdirp = require("mkdirp");
var gitane = require("gitane");
var config = require("./config");

exports.build = function(cb){
	async.waterfall([
		// update the repository
		function(cb){
			var repoURL = config.repository;
			var buildFolder = path.resolve(config.build_folder);
			mkdirp(buildFolder, function(err){
				if(err){
					return cb(err, null);
				}

				var repoPath = path.join(buildFolder, "repository");
				var gitCommand = "git clone " + config.repository + " repository";
				var directory = buildFolder;

				if(path.existsSync(repoPath)){
					gitCommand = "git pull origin master";
					directory = repoPath;
				}

				gitane.run(directory, config.ssh_key, gitCommand, function(err, stdout, stderr){
					console.log("ran git in directory " + directory + " with command " + gitCommand);
					console.log(" - " + stdout);
					console.log(" - " + stderr);
					cb(err, buildFolder);
				});
			});
		}

		// build post tree	
	], function(err, results){
		cb(err, results);
	});
};