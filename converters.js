
var texToSvgBuffer = function (texInput) {
	let mjAPI = require("mathjax-node");
	let cloudinary = require("cloudinary");
	let svg2png = require("svg2png");

	cloudinary.config({ 
		cloud_name: 'mobile-tex', 
		api_key: '464297269935231', 
		api_secret: 'qsrU48U9xhYBQyZU4wB_-UdolzI' 
	});

	mjAPI.config({
		MathJax: { 
			jax: ["input/TeX","output/SVG"],
			extensions: ["tex2jax.js"],
			TeX: {
				extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
			}
		}
	});
	mjAPI.start();
	
	let url = "placeholder";
	
	mjAPI.typeset({
		math: texInput,
		format: "TeX", 
		svg: true,     
	}, function (rendered) {
		if (!rendered.errors) { 
			let svg = rendered.svg;

			svg2png(svg, {width: 500, height: 300}).then(png => 
				cloudinary.v2.uploader.upload_stream(function(error, result) {
					url = result.secure_url;	// issue: this isn't savingggg, url stays as "placeholder"
				})
				.end(png)
			);
		}
	});
	
	return url;
};
	
module.exports = texToSvgBuffer;