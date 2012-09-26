var Class = require("class.js");
var Renderer = exports.Renderer = Class({
	init: function(){

	},
	render: function(post, cb){

	}
});

Renderer.allRenderers = {};
Renderer.rendererForExtension = function(extension){
	var rendererClass = Renderer.allRenderers[extension];
	if(rendererClass){
		return new (rendererClass)();
	}else{
		return null;
	}
};

Renderer.registerRendererForExtension = function(renderer, extension){
	Renderer.allRenderers[extension] = renderer;
};