var TemplateEngine = require("./TemplateEngine").TemplateEngine;
var handlebars     = require("handlebars");

var HandlebarsEngine = TemplateEngine.extend({
	renderPostWithTemplates: function(post, templates, cb){
		for(var key in templates){
			if(key != "layout")
				handlebars.registerPartial(key, templates[key]);
		}

		var result = handlebars.compile(templates.layout)(post);

		cb(null, result);
	}
});

TemplateEngine.registerTemplateEngineForExtension(HandlebarsEngine, "handlebars");
TemplateEngine.registerTemplateEngineForExtension(HandlebarsEngine, "hbs");