var fs        = require("fs");
var path      = require("path");
var async     = require("async");
var ncp       = require("ncp").ncp;
var mkdirp    = require("mkdirp");
var gitane    = require("gitane");
var models    = require("./models");
var renderers = require("./renderers");
var templates = require("./templates");

exports.build = function(config, cb){
	async.waterfall([
		// update the repository
		function updateRepository(cb){
			console.log("** Updating repository");
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
					console.log("** Finished updating repository\n");
					cb(err, buildPath, repoPath);
				});
			});
		},

		// load site
		function loadSite(buildPath, repoPath, cb){
			console.log("** Loading site: " + repoPath);
			models.Site.loadSiteAtPath(repoPath, function(err, site){
				console.log("** Finished loading site\n");
				cb(err, buildPath, site);
			});
		},

		// render posts
		function renderPosts(buildPath, site, cb){
			console.log("** Rendering posts");
			var posts = site.posts;

			async.map(posts, function(post, cb){
				console.log("*** Rendering post " + path.basename(post.path));
				var extension = post.bodyExtension();
				var renderer = renderers.Renderer.rendererForExtension(extension);
				if(renderer){
					renderer.render(post, function(err, renderedPost){
						site.templateMapForPost(post, function(err, map){
							var templateEngine = templates.TemplateEngine.templateEngineForExtension("hbs");
							templateEngine.renderPostWithTemplates({
								post: renderedPost,
								title: post.title
							}, site, map, function(err, postHTML){
								console.log("*** Finished rendering post " + path.basename(post.path));
								post.html = postHTML;
								cb(err, post);
							});
						});
					});
				}else{
					cb(new Error("no renderer for " + extension), null);
				}
			}, function(err, results){
				console.log("** Finished rendering posts\n");
				cb(err, buildPath, site, posts);
			});
		},

		// save posts
		function savePosts(buildPath, site, posts, cb){
			console.log("** Saving posts");
			buildPath = path.join(buildPath, "site");
			async.forEach(posts, function(post, cb){
				site.permalinksForPost(post, function(err, permalinks){
					if(err){
						return cb(err, null);
					}

					async.forEach(permalinks, function(permalink, cb){
						var postBuildPath = path.join(buildPath, permalink);
						console.log("*** Saving post to path " + postBuildPath + ".html");
						mkdirp(path.dirname(postBuildPath), function(err){
							if(err){
								return cb(err, null);
							}

							fs.writeFile(postBuildPath + ".html", post.html, function (err, result){
								if(err){
									console.log("Error writing blog post " + err);
									return cb(err, null);
								}
								cb(null, result);
							});
						})
					}, cb);
				});
			}, function(err){
				cb(err, buildPath, site);
			});
		},

		// copy static files
		function copyStaticFiles(buildPath, site, cb){
			ncp(site.javascriptsFolder(), path.join(buildPath, "javascripts"), function(err){
				if(err){
					return cb(err, null);
				}
				cb(null);
			});
		}
	], function(err, results){
		console.log("** Build complete");
		cb(err, results);
	});
};