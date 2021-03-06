/*global describe, it*/
"use strict";

var should = require("should"),
	fs = require("fs");

require("mocha");

delete require.cache[require.resolve("../")];

var cdnizer = require("../");

function processInput(opts, fixtureFileName, expectedFileName) {
	var converter = cdnizer(opts),
		srcFile = fs.readFileSync("test/fixtures/"+fixtureFileName, "utf8"),
		expected = fs.readFileSync("test/expected/"+expectedFileName, "utf8"),
		result = converter(srcFile);
	
	result.should.not.be.empty;
	
	result.should.equal(expected);
}

describe("cdnizer: basic input", function() {

	it("should not modify a file if no matches", function() {
		processInput(['/no/match'], 'index.html', 'index-none.html');
	});

	it("should modify on basic input", function() {
		processInput({
			files: ['css/main.css', 'js/**/*.js'],
			defaultCDNBase: '//examplecdn/'
		}, 'index.html', 'index-generic.html');
	});

	it("should handle varied input", function() {
		processInput({
			files: ['css/*.css', 'js/**/*.js'],
			defaultCDNBase: '//examplecdn'
		}, 'index.html', 'index-generic.html');
	});

	it("should handle existing min and fallbacks", function() {
		processInput({
			files: [
				{
					file: 'js/**/angular/angular.js',
					test: 'window.angular'
				}
			],
			defaultCDNBase: '//examplecdn'
		}, 'index.html', 'index-fallback.html');
	});

	it("should add min with filenameMin", function() {
		processInput({
			files: [
				{
					file: 'js/**/firebase/firebase.js',
					cdn: '//examplecdn/js/vendor/firebase/${ filenameMin }'
				}
			]
		}, 'index.html', 'index-filename-min.html');
	});

});

describe("cdnizer: bower tests", function() {
	
	it("should handle bower versions (.bowerrc)", function() {
		processInput({
			files: [
				{
					file: 'js/**/angular/angular.js',
					package: 'angular',
					cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular.min.js'
				}
			]
		}, 'index.html', 'index-bowerrc.html');
	});

	it("should handle bower versions (passed in)", function() {
		processInput({
			bowerComponents: './test/bower_components',
			files: [
				{
					file: 'js/**/angular/angular.js',
					package: 'angular',
					cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular.min.js'
				}
			]
		}, 'index.html', 'index-bower.html');
	});
});

describe("cdnizer: css files", function() {
	
	it("should handle css files (no modification)", function() {
		processInput(['/no/match'], 'style.css', 'style-none.css');
	});

	it("should handle css files and relative roots", function() {
		processInput({
			defaultCDNBase: '//examplecdn',
			relativeRoot: 'style',
			files: [ '**/*.{gif,png,jpg,jpeg}' ]
		}, 'style.css', 'style-generic.css');
	});
});


describe("cdnizer: error handling", function() {
	
	it("should error on no input", function() {
		(function(){
			cdnizer();
		}).should.throw();
		(function(){
			cdnizer([]);
		}).should.throw();
		(function(){
			cdnizer({});
		}).should.throw();
		(function(){
			cdnizer({files:[]});
		}).should.throw();
	});
	
	it("should error on invalid input", function() {
		(function(){
			cdnizer(9);
		}).should.throw();
		(function(){
			cdnizer(null);
		}).should.throw();
		(function(){
			cdnizer({files:31});
		}).should.throw();
		(function(){
			cdnizer({files:null});
		}).should.throw();
		(function(){
			cdnizer({files:{}});
		}).should.throw();
	});
	
	it("should error on invalid files", function() {
		(function(){
			cdnizer({files:[{file:9}]});
		}).should.throw();
		(function(){
			cdnizer({files:[{file:new Date()}]});
		}).should.throw();
		(function(){
			cdnizer({files:['/not/invalid', {file:new Date()}]});
		}).should.throw();
	});
	
});