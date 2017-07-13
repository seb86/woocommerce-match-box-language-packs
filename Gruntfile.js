/* jshint node:true */
module.exports = function( grunt ) {
	'use strict';

	grunt.initConfig({
		wget: {
			resources: {
				files: {
					'resources/woocommerce-match-box.pot': 'https://raw.githubusercontent.com/seb86/WooCommerce-Match-Box/master/languages/woocommerce-match-box.pot',
				}
			}
		},

		shell: {
			options: {
				stdout: true,
				stderr: true
			},
			txpush: {
				command: 'tx push -s' // push the resources
			},
			txpull: {
				command: 'tx pull -a -f' // pull the .po files
			}
		},

		potomo: {
			options: {
				poDel: false
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'languages/',
					src: ['*.po'],
					dest: 'languages/',
					ext: '.mo',
					nonull: true
				}]
			}
		}
	});

	// Load NPM tasks to be used here
	grunt.loadNpmTasks( 'grunt-shell' );
	grunt.loadNpmTasks( 'grunt-wget' );
	grunt.loadNpmTasks( 'grunt-potomo' );

	// Register tasks
	grunt.registerTask( 'default', function () {
		grunt.log.writeln( "\n ############################################ " );
		grunt.log.writeln( " ###### WooCommerce Match Box Language Pack Generator ###### " );
		grunt.log.writeln( " ############################################ \n" );
		grunt.log.writeln( " # Commands: \n" );
		grunt.log.writeln( " grunt compile    =  Gets the Transifex translations, compiles the .mo files and generates zip files " );
		grunt.log.writeln( " grunt resources  =  Gets the WooCommerce Match Box core .pot file and pushes on Transifex " );
	});

	grunt.registerTask( 'resources', [
		'wget:resources',
		'shell:txpush'
	]);

	grunt.registerTask( 'update_translations', [
		'shell:txpull',
		'potomo'
	]);

	grunt.registerTask( 'compress', function () {
		var fs    = require( 'fs' ),
			files = fs.readdirSync( 'languages/' ),
			done  = this.async();

		files.forEach( function ( file ) {
			var lang = file.replace( /(^woocommerce-match-box-)(.+)(.po)/, '$2' );
			if ( lang !== file ) {
				var dest = 'packages/' + lang + '.zip';
				var zip  = new require('node-zip')();
				zip.file( 'woocommerce-match-box-' + lang + '.po', fs.readFileSync( 'languages/woocommerce-match-box-' + lang + '.po' ) );
				zip.file( 'woocommerce-match-box-' + lang + '.mo', fs.readFileSync( 'languages/woocommerce-match-box-' + lang + '.mo' ) );

				var data = zip.generate({
					base64: false,
					compression: 'DEFLATE'
				});
				fs.writeFileSync( dest, data, 'binary' );
				grunt.log.writeln( ' -> ' + lang + ': ' + dest + ' file created successfully' );
			}
		});

		done();
	});

	grunt.registerTask( 'compile', [
		'update_translations',
		'compress'
	]);

};
