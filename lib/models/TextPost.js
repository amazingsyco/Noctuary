var Post = require("./Post").Post;

var TextPost = exports.TextPost = Post.extend({
});

Post.registerPostClassForExtension(TextPost, "text");