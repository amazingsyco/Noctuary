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

	loadPostsAndPages: function(cb){
		var self = this;
		async.parallel({
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
			cb(err, self);
		});
	}
});

Site.loadSiteAtPath = function(path, cb){
	var site = new Site(path);
	site.loadPostsAndPages(function(err, site){
		cb(err, site);
	})
};