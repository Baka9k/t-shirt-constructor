var editor = {};


editor.preparePage = function() {
	var width = $("#canvas1").width();
	var height = width / 0.96;
	$("#canvas1").height(height);
	$("#canvas2").height(height);
	$("#canvas3").height(height);
}

editor.createCanvas = function(element) {
	var canvas = $('<canvas/>').appendTo(element);
	canvas.width($(element).width());
	canvas.height($(element).height());
	return canvas;
}

editor.canvases = {};
editor.contexts = {};
//editor.canvases: front, rear, sides
//editor.contexts: front, rear, sides

editor.drawMasks = function() {
	for (var ctx in editor.contexts) {
		var texture = new Image();
		texture.src = "images/" + ctx + ".png";
		texture.onload = function() {
			return function () {
				var texture = texture;
				editor.contexts[ctx].drawImage(texture, 0, 0, 100, 100);
			}
		}
	}
}

editor.init = function () {
	editor.preparePage();
	editor.canvases.front = editor.createCanvas($("#canvas1"));
	editor.canvases.rear = editor.createCanvas($("#canvas2"));
	editor.canvases.sides = editor.createCanvas($("#canvas3"));
	for (var canvas in editor.canvases) {
		editor.contexts[canvas] = editor.canvases[canvas][0].getContext("2d");
	}
	editor.drawMasks();
}



$(document).ready(function() {
	editor.init();
});




