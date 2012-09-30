var Class = require("class.js");
var path  = require("path");
var fs    = require("fs");

var Post = exports.Post = Class({
	init: function(postPath){
		this.path = postPath;
		this.title = path.basename(this.path, path.extname(this.path));
	},
	loadData: function(cb){
		var self = this;
		fs.readdir(this.path, function(err, files){
			var assets = [];
			var bodyName = null;
			for(var index = 0; index < files.length; index++){
				var filename = files[index];
				if(path.basename(filename, path.extname(filename)) == "post"){
					bodyName = filename;
				}else{
					assets.push(filename);
				}
			}

			if(bodyName){
				self.assets = assets;
				self.bodyName = bodyName;
				cb(null, self);
			}else{
				cb(new Error("No post body found"), null);
			}
		})
	},
	bodyPath: function(){
		return path.join(this.path, this.bodyName);
	},
	bodyExtension: function(){
		return path.extname(this.bodyPath()).replace(/^\./, "");
	},
	loadBodyData: function(cb){
		fs.readFile(this.bodyPath(), "utf8", cb);
	},
	extension: function(){
		return path.extname(this.path).replace(/^\./, "");
	}
});

Post.loadPostAtPath = function(postPath, cb){
	var extension = path.extname(postPath).replace(/^\./, "");
	var postClass = Post.postClassForExtension(extension);
	if(postClass){
		var post = new postClass(postPath);
		post.loadData(function(err, post){
			cb(err, post);
		});
	}else{
		cb(new Error("No post class for " + extension), null);
	}
};

Post.allPostClasses = {};
Post.postClassForExtension = function(extension){
	var postClass = Post.allPostClasses[extension];
	if(postClass){
		return postClass;
	}else{
		return null;
	}
};

Post.registerPostClassForExtension = function(postClass, extension){
	Post.allPostClasses[extension] = postClass;
};