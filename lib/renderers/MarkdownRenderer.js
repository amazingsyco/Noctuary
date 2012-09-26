var Renderer = require("./Renderer").Renderer;
var markdown = require("markdown").markdown;

var MarkdownRenderer = exports.MarkdownRenderer = Renderer.extend({
	render: function(post, cb){
		post.loadBodyData(function(err, data){
			if(err){
				return cb(err, null);
			}

			var html = markdown.toHTML(data);
			cb(null, html);
		});
	}
});

Renderer.registerRendererForExtension(MarkdownRenderer, "markdown");
Renderer.registerRendererForExtension(MarkdownRenderer, "md");