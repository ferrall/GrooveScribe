/*
 * Lab Camp class.   
 *
 *
 */

if (typeof(labcamp) === "undefined")
	var labcamp = {};

(function () {
	"use strict";

	var root = labcamp;

	root.Wiktoria = {
		'EmptY 16th note groove' : '?TimeSig=4/4&Div=16&Tempo=80&Measures=1&H=|----------------|&S=|----------------|&K=|----------------|'
	};

	root.Klaus = {
	};

	root.Larnell = {
	};

	root.Stanton = {
	};

	root.FullArray = {
		"Wiktoria" : root.Wiktoria,
		"Klaus" : root.Klaus,
		"Larnell" : root.Larnell,
		"Stanton" : root.Stanton
	};

	root.isArray = function (myArray) {
		var str = myArray.constructor.toString();
		return (str.indexOf("Object") > -1);
	};

	root.arrayAsHTMLList = function (arrayToPrint) {
		var HTML = '<ul class="grooveListUL">\n';
		for (var key in arrayToPrint) {
			if (root.isArray(arrayToPrint[key])) {
				HTML += '<li class="grooveListHeaderLI">' + key + "</li>\n";
				HTML += root.arrayAsHTMLList(arrayToPrint[key]);
			} else {
				HTML += '<li class="grooveListLI" onClick="myGrooveWriter.loadNewGroove(\'' + arrayToPrint[key] + '\')">' + key + '</li>\n';
			}
		}
		HTML += "</ul>\n";

		return HTML;
	};

	root.getLabCampAsHTML = function () {
		var HTML = "";

		HTML = root.arrayAsHTMLList(root.FullArray);

		return HTML;
	};

})();
