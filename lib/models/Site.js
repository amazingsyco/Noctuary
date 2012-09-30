var Class  = require("class.js");
var async  = require("async");
var fs     = require("fs");
var path   = require("path");
var util   = require("util");
var models = require("./index");

var Site = exports.Site = Class({
	init: function(inPath){
		this.path = inPath;
		this.config = JSON.parse(fs.readFileSync(path.join(this.path, "config.json")));
	},

	load: function(cb){
		var self = this;
		async.parallel({
			templates: function(cb){
				var templatesPath = path.join(self.path, self.config.theme_folder, self.config.templates_folder);
				fs.readdir(templatesPath, function(err, files){
					async.map(files, function(filename, cb){
						var templatePath = path.join(templatesPath, filename);
						cb(null, templatePath)
					}, cb);
				});
			},
			posts: function(cb){
				var postsPath = path.join(self.path, self.config.posts_folder);
				fs.readdir(postsPath, function(err, files){
					async.map(files, function(filename, cb){
						var postPath = path.join(postsPath, filename);
						models.Post.loadPostAtPath(postPath, cb);
					}, cb);
				});
			}
//			pages: function(cb){
//
//			}
		}, function(err, results){
			self.posts = results.posts;
			self.templatePaths = results.templates;

			cb(err, self);
		});
	},
	templateMapForPost: function(post, cb){
		var kind = post.kind || "text";
		var map = {};
		async.map(this.templatePaths, function(templatePath, cb){
			fs.readFile(templatePath, function(err, data){
				if(err){
					return cb(err, null);
				}

				data = data.toString();

				var name = path.basename(templatePath, path.extname(templatePath));
				if(name == "layout"){
					map[name] = data;
				}else if(name == "post"){
					map.content = data;
				}else if(name == kind){
					map.post = data;
				}
				cb(null, null);
			});
		}, function(err, result){
			cb(null, map);
		});
	}
});

Site.loadSiteAtPath = function(path, cb){
	var site = new Site(path);
	site.load(function(err, site){
		cb(err, site);
	})
};