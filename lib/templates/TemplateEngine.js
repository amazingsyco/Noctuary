var Class = require("class.js");

var TemplateEngine = exports.TemplateEngine = Class({
	renderPostWithTemplates: function(post, templates, cb){

	}
});


TemplateEngine.allTemplateEngines = {};
TemplateEngine.templateEngineForExtension = function(extension){
	var templateEngineClass = TemplateEngine.allTemplateEngines[extension];
	if(templateEngineClass){
		return new (templateEngineClass)();
	}else{
		return null;
	}
};

TemplateEngine.registerTemplateEngineForExtension = function(templateEngine, extension){
	TemplateEngine.allTemplateEngines[extension] = templateEngine;
};