
var texToSvgBuffer = function (texInput) {
		var mjAPI = require("../src/node_modules/mathjax-node");
		var { convert } = require('../src/node_modules/convert-svg-to-png');

		mjAPI.config({
		  MathJax: {
			// traditional MathJax configuration  
			jax: ["input/TeX","output/SVG"],
			extensions: ["tex2jax.js"],
			TeX: {
			  extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
			}
		  }
		});
		mjAPI.start();

		mjAPI.typeset({
		  math: texInput,
		  format: "TeX", 
		  svg: true,     
		}, function (result) {
		  if (!result.errors) {
			//const png = convert(result.svg);
			//console.log(png);
			
			//console.log(data.svg);
			
			return data.svg;
		  }
		});
	};
	
module.exports = texToSvgBuffer;