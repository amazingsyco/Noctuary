var Class = require("class.js");

var Post = exports.Post = Class({
	init: function(path){
		this.path = path;
		console.log("New file at path " + path);
	}
});

Post.loadPostAtPath = function(path, cb){
	cb(null, new Post(path));
};