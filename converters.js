var texToSvgBuffer = function (texInput) {
	let mjAPI = require("mathjax-node");
	let cloudinary = require("cloudinary");
	let svg2png = require("svg2png");

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
	
	let promise = new Promise((resolve, reject) => {
		mjAPI.typeset({
			math: texInput,
			format: "TeX", 
			svg: true,     
		}, rendered => {
			if (!rendered.errors) { 
				let svg = rendered.svg;
				
				svg2png(svg, {width: 500, height: 300}).then(png => 
					cloudinary.v2.uploader.upload_stream((error, result) => {
						resolve(result.secure_url);
					})
					.end(png)
				);
			}
		});
	});
	
	return promise;
};
	
module.exports = texToSvgBuffer;