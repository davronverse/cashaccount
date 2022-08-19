// Import plugin to handle relative paths.
const path = require('path');

module.exports =
{
	// Add your application's scripts below
	entry: './www/js/index.js',
	mode: 'development',
	output:
	{
		path: path.resolve(__dirname, '.'),
		filename: './www/js/app.js'
	},
	module:
	{
		rules:
		[
			{
				// Only pack up `.js` files.
				test: /\.js$/,

				// Do not parse node modules.
				include:
				[
					/node_modules/
				],
			},
		]
	},
}
