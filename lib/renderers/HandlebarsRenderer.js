var Renderer = require("./Renderer").Renderer;

var HandlebarsRenderer = Renderer.extend({
	render: function(post, cb){
		console.log("Rendering post " + post.path + " with Handlebars");
		cb(null, "");
	}
});

Renderer.registerRendererForExtension(HandlebarsRenderer, "handlebars");
Renderer.registerRendererForExtension(HandlebarsRenderer, "hbs");