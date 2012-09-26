var fs        = require("fs");
var path      = require("path");
var async     = require("async");
var mkdirp    = require("mkdirp");
var gitane    = require("gitane");
var config    = require("./config");
var models    = require("./models");
var renderers = require("./renderers");

exports.build = function(cb){
	async.waterfall([
		// update the repository
		function updateRepository(cb){
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
//					console.log("* Finished updating repository\n");
					cb(err, buildPath, repoPath);
				});
			});
		},

		// load site
		function loadSite(buildPath, repoPath, cb){
			console.log("* Loading site: " + repoPath);
			models.Site.loadSiteAtPath(repoPath, function(err, site){
//				console.log("* Finished loading site\n");
				cb(err, buildPath, site);
			});
		},

		// render posts
		function renderPosts(buildPath, site, cb){
			console.log("* Rendering posts");
			var posts = site.posts;

			async.map(posts, function(post, cb){
				console.log("** Rendering post " + path.basename(post.path));
				var extension = post.bodyExtension();
				var renderer = renderers.Renderer.rendererForExtension(extension);
				if(renderer){
					renderer.render(post, function(err, result){
//						console.log("** Finished rendering post " + path.basename(post.path));
						cb(err, result);
					});
				}else{
					cb(new Error("no renderer for " + extension), null);
				}
			}, function(err, results){
//				console.log("* Finished rendering posts\n");
				cb(err, results);
			});
		}
	], function(err, results){
		console.log("* Build complete");
		cb(err, results);
	});
};