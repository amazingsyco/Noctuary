var Class  = require("class.js");
var async  = require("async");
var fs     = require("fs");
var path   = require("path");
var util   = require("util");
var models = require("./index");
var moment = require("moment");

var Site = exports.Site = Class({
	init: function(inPath){
		this.path = inPath;
		this.config = JSON.parse(fs.readFileSync(path.join(this.path, "config.json")));
	},
	getPostDate: function(cb){

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
	permalinksForPost: function(post, cb){
		var formats = this.config.permalink_formats;
		if(typeof formats == "string"){
			formats = [formats];
		}

		var self = this;
		async.map(formats, function(formatString, cb){
			fs.stat(self.path, function(err, stats){
				if(err){
					return cb(err, null);
				}

				var date = stats.mtime;
				var permalink = moment(date).format(formatString);
				permalink = permalink.replace("$title", post.permalinkTitle());
				cb(null, permalink);
			});
		}, cb);
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
	},

	javascriptsFolder: function(){
		return path.join(this.path, this.config.theme_folder, this.config.javascripts_folder);
	}
});

Site.loadSiteAtPath = function(path, cb){
	var site = new Site(path);
	site.load(function(err, site){
		cb(err, site);
	})
};