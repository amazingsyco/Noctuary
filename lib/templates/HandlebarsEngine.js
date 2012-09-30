var TemplateEngine = require("./TemplateEngine").TemplateEngine;
var handlebars     = require("handlebars");

var HandlebarsEngine = TemplateEngine.extend({
	renderPostWithTemplates: function(post, site, templates, cb){
		for(var key in templates){
			if(key != "layout")
				handlebars.registerPartial(key, templates[key]);
		}

		handlebars.registerHelper("include_css", function(context){
			return '<link rel="stylesheet" type="text/css" href="' + site.config.base_url + "stylesheets/" + context + '.css" />';
		});

		handlebars.registerHelper("include_js", function(context){
			return '<script type="text/javascript" src="' + site.config.base_url + "javascripts/" + context + '.js"></script>';
		});

		var result = handlebars.compile(templates.layout)(post);

		cb(null, result);
	}
});

TemplateEngine.registerTemplateEngineForExtension(HandlebarsEngine, "handlebars");
TemplateEngine.registerTemplateEngineForExtension(HandlebarsEngine, "hbs");