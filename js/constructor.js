//============================== EDITOR =============================

var editor = {};



editor.variables = {
	canvasWidth: 0,
	canvasHeight: 0,
};


editor.canvases = {};
editor.contexts = {};
//editor.canvases: front, rear, sides
//editor.contexts: front, rear, sides


editor.state = {
    
    shirtColor: "#ff0000",
    lastShirtColor: "ff0000",
	currentTool: "",
	content: {},
	absoluteX: 0,
	absoluteY: 0,
	
	//Coordinates relative to editor.state.canvas
	relativeX: 0,
	relativeY: 0,
	
	//Canvas ("front", "rear" or "sides"), over which the preview is
	canvas: "front",
	
	//Absolute width and height of preview canvas
	sizeX: 0,
	sizeY: 0,
	
	//Width and height of preview canvas relative to editor.variables.canvasWidth and editor.variables.canvasHeight
	relativeSizeX: 0,
	relativeSizeY: 0,
	
	//When tool is used and new tool is picked, editor.toolUsed() changes id of current preview canvas from "preview" to editor.state.previewId
	//When new tool is picked, editor.useTool() changes editor.state.previewId to new string value generated by Math.random()
	previewId: "",
	
	changes: 0,
	noCanvasError: false,
	
	newPreviewId: function() {
		editor.state.previewId = Math.random().toString();
	},
    
}

	


editor.preparePage = function() {

	//Set height of containers for 3 main canvases
	var width = $("#canvasDiv1").width();
	var height = width / 0.96;
	$("#canvasDiv1").height(height);
	$("#canvasDiv2").height(height);
	$("#canvasDiv3").height(height);
	editor.variables.canvasWidth = width;
	editor.variables.canvasHeight = height;
	
}


editor.createCanvas = function(element) {

	var canvas = document.createElement('canvas');
	element.appendChild(canvas);
	canvas.setAttribute('width', $(element).width());
	canvas.setAttribute('height', element.style.height);
	return canvas;
	
}


editor.drawFill = function(color) {

	for (var ctx in editor.contexts) {
		var context = editor.contexts[ctx];
		context.fillStyle = color;
		context.fillRect(0, 0, editor.variables.canvasWidth, editor.variables.canvasHeight);
	}
	
}


editor.drawMasks = function() {

	for (var ctx in editor.contexts) {
		var texture = new Image();
		texture.src = "images/" + ctx + ".png";
		texture.onload = (function (texture, ctx) {return function() {
			editor.contexts[ctx].drawImage(texture,  0, 0, editor.variables.canvasWidth, editor.variables.canvasHeight);
		} })(texture,ctx);
	}
	
}


editor.activateTools = function() {

	//Add event listeners on tools buttons
	$(".tool").each(function(index) {
		$(this).on("click", function() {
		    editor.useTool($(this).attr('id')); 
		});
	});
}


editor.updateRelativeCoords = function() {
	
	//get
	//editor.state.absoluteX and editor.state.absoluteY, editor.state.sizeX and editor.state.sizeY
	//set
	//editor.state.canvas, editor.state.relativeX and editor.state.relativeY, 
	//editor.state.relativeSizeX and editor.state.relativeSizeY
	
	var absX = editor.state.absoluteX;
	var absY = editor.state.absoluteY;
	var sizeX = editor.state.sizeX;
	var sizeY = editor.state.sizeY;
	
	var centerX = absX + sizeX / 2;
	var centerY = absY + sizeY / 2
	
	//determine over which canvas preview is located
	var canvasList = {};
	
	for (var canvas in editor.canvases) {
		var can = editor.canvases[canvas];
		var c = {};
		c.offset = absoluteOffset(can);
		c.startX = c.offset.left;
		c.startY = c.offset.top;
		c.endX = c.startX + $(can).width();
		c.endY = c.startY + $(can).height();
		c.width = $(can).width();
		c.height = $(can).height();
		canvasList[canvas] = c;
	}
	
	var canvas = "none";
	
	for (var c in canvasList) {
		var can = canvasList[c];
		if ( (centerX >= can.startX) && (centerX <= can.endX)
			  &&
			 (centerY >= can.startY) && (centerY <= can.endY)
		   ) {
			canvas = c;
			break;
		}
	}
	//"canvas" variable now is "none", "front", "rear" or "sides"
	if (canvas == "none") {
		editor.state.canvas = "none";
		return;
	}
	
	//calculate preview offset from this canvas
	var can = canvasList[canvas];
	var absOffsetX = absX - can.startX;
	var absOffsetY = absY - can.startY;
	
	//and make them relative
	var relOffsetX = absOffsetX / canvasList[canvas].width;
	var relOffsetY = absOffsetX / canvasList[canvas].height;
	
	//calculate relative size of preview
	var relSizeX = sizeX / canvasList[canvas].width;
	var relSizeY = sizeY / canvasList[canvas].height;
	
	editor.state.canvas = canvas;
	editor.state.relativeX = relOffsetX;
	editor.state.relativeY = relOffsetY;
	editor.state.relativeSizeX = relSizeX;
	editor.state.relativeSizeY = relSizeY;
		
}


editor.toolUsed = function() {

	//When new tool is picked, disable .draggable and .resizable for current preview canvas and save changes made by the previous tool to history
    
    var toolsWithPreview = ["addtext", "addpicture", "addfigure"];
    var toolsWithoutPreview = ["color"];
    
    if (toolsWithPreview.indexOf(editor.state.currentTool) != -1) {
        
        if (!$("#preview")[0]) return;
        
        var coords = absoluteOffset($("#preview")[0]);
        editor.state.absoluteX = coords.left;
        editor.state.absoluteY = coords.top;
        editor.state.sizeX = $("#preview").width();
        editor.state.sizeY = $("#preview").height();
        editor.updateRelativeCoords();
        
        if (editor.state.canvas == "none") {
            
            editor.state.noCanvasError = true;
            editor.noCanvasError();
            $("#preview").remove();
            
        } else {
        
            history.newEntry(
                true,
                editor.state.currentTool,
                editor.state.content,
                editor.state.relativeX,
                editor.state.relativeY,
                editor.state.canvas,
                editor.state.relativeSizeX,
                editor.state.relativeSizeY,
                editor.state.previewId
            );
            
            editor.state.changes++;
            
            if ($("#preview").is('.ui-resizable')) {
                $("#preview").resizable('destroy');
            } else {
                $("#preview").draggable("destroy");
            }
            $("#preview")
                .css("cursor", "auto")
                .attr("id", editor.state.previewId);
            
        }
	
    }

    if (toolsWithoutPreview.indexOf(editor.state.currentTool) != -1) {
       
       history.newEntry(
            false,
            editor.state.currentTool
        );
        
        editor.state.changes++;
         
    }
    
}


editor.useTool = function(tool) {
	
    editor.state.newPreviewId();
	editor.toolUsed();
	
	if (editor.state.noCanvasError) return;
	
	editor.state.currentTool = tool;
	$("#modalOpener").click();
	editor.tools[tool]();
	
}


editor.previewToShirt = function() {

	$("#preview")
		.appendTo($("body"))
		.center()
		.css("cursor", "move")
		.draggable();
	$("#modal").modal('hide');
	
}


editor.noCanvasError = function() {
	
	$("#modalOpener").click();
	$("#cancelbutton").remove();
	$("#okbutton").text("OK").click(function() {
		$("#modal").modal('hide');
		editor.state.noCanvasError = false;
	});
	$("#modalTitle").text("Ошибка");
	ReactDOM.render(
		<NoCanvasErrorMessage />,
		document.getElementById("modalBody")
	);
	
}




editor.init = function() {

	editor.preparePage();
	editor.canvases.front = editor.createCanvas(document.getElementById("canvasDiv1"));
	editor.canvases.rear = editor.createCanvas(document.getElementById("canvasDiv2"));
	editor.canvases.sides = editor.createCanvas(document.getElementById("canvasDiv3"));
	for (var canvas in editor.canvases) {
		editor.contexts[canvas] = editor.canvases[canvas].getContext("2d");
	}
	editor.drawFill(editor.state.shirtColor);
	editor.drawMasks();
	editor.activateTools();
	
}



//================================ UTILS ===================================

/*
The canvas element runs independent from the device or monitor's pixel ratio.
On the iPad 3+, this ratio is 2. This essentially means that your 1000px width canvas would now need to fill 2000px to match it's stated width on the iPad display. Fortunately for us, this is done automatically by the browser. On the other hand, this is also the reason why you see less definition on images and canvas elements that were made to directly fit their visible area. Because your canvas only knows how to fill 1000px but is asked to draw to 2000px, the browser must now intelligently fill in the blanks between pixels to display the element at its proper size.
*/
//MyNameIsKo
//http://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas


var PIXEL_RATIO = (function () {

    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
    
})();


var createHiDPICanvas = function(w, h, ratio) {

    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
    
}


//Create canvas with the device resolution.
//var myCanvas = createHiDPICanvas(500, 250);



var triggerOnchange = function(element) {

	var event = new Event('input', { bubbles: true });
	element.dispatchEvent(event);
	
}


jQuery.fn.center = function() {

    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
    
}

$.widget("ui.resizable", $.ui.resizable, {
    resizeTo: function(newSize) {
        var start = new $.Event("mousedown", { pageX: 0, pageY: 0 });
        this._mouseStart(start);
        this.axis = 'se';
        var end = new $.Event("mouseup", {
            pageX: newSize.width - this.originalSize.width,
            pageY: newSize.height - this.originalSize.height
        });
        this._mouseDrag(end);
        this._mouseStop(end);
    }
});

var absoluteOffset = function(element) {

    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
    
}


//=============================== TOOLS ======================================

	
editor.tools = {


	addtext: function() {
		
		$("#modalTitle").text("Добавить текст");
		
		ReactDOM.render(
			<AddText />,
			document.getElementById("modalBody")
		);
		
	},
	
	
	addpicture: function() {
		
		$("#modalTitle").text("Добавить картинку");
		
		ReactDOM.render(
			<AddPicture />,
			document.getElementById("modalBody")
		);
		
	},
	
	
	color: function() {
        
        editor.state.lastShirtColor = editor.state.shirtColor;
        
        $("#modalTitle").text("Изменить цвет футболки");
		
		ReactDOM.render(
			<ChangeColor />,
			document.getElementById("modalBody")
		);
        
	},
	
	
	addfigure: function() {
        
        $("#modalTitle").text("Добавить фигуру");
		
		ReactDOM.render(
			<AddFigure />,
			document.getElementById("modalBody")
		);
        
	},
	
	
	undo: function() {
	
	},
	
	
	clearall: function() {
	
	},
	
	
	render: function() {
	
	},
	
	
}




//=============================  HISTORY  =====================================

//All coordinates in history are relative

var history = {};

history.changes = [];


var Change = function (withPreview, tool, content, x, y, canvas, sizeX, sizeY, previewId) {
    
    if (withPreview) {
        
        this.tool = tool;
        this.content = content;
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.canvas = canvas;
        this.previewId = previewId;
        
        this.comment = "Added element on canvas '" + this.canvas + "'";
        
        return this;
        
    } else if (!withPreview) {
     
        this.tool = tool;
        
        if (this.tool == "color") {
            this.oldColor = editor.state.lastShirtColor;
            this.newColor = editor.state.shirtColor;
            this.comment = "T-shirt color changed from " + this.oldColor + "to " + this.newColor;
        }
        
    }
	
}


history.newEntry = function(tool, content, x, y, canvas, sizeX, sizeY, previewId) {

	var entry = new Change (tool, content, x, y, canvas, sizeX, sizeY, previewId);
	history.changes.push(entry);
    
	console.log(entry.comment);
    
}





//==============================  REACT  =======================================
			


//----------------- tool dialogs --------------------

var AddText = React.createClass({
	
    componentDidMount: function() {
        $(".fontlist").each(function(index) {
			$(this).css("font-family", $(this).text()); 
		});
		
		$("#colorpicker").spectrum({
    		color: "#000000",
    		cancelText: "Отмена",
        	chooseText: "Выбрать",
			change: function(color){
				$("#hexcolor").val(color.toHexString().substr(1,6));
				triggerOnchange($("#hexcolor")[0]);
			},
		});
		$("#hexcolor").change(function() {
			$("#colorpicker").spectrum("set", $("#hexcolor").val());
			triggerOnchange($("#hexcolor")[0]);
		});
		
		$("#modal").on('shown.bs.modal', function() {
			var width = $("#previewDiv").width();
			var height = $("#previewDiv").height();
			var canvas = createHiDPICanvas(width, height);
			canvas.id = "preview";
			$(canvas).appendTo("#previewDiv");
		});
	
		$("#okbutton").click(function() {
			if ($("#text").val() != "") {
				editor.previewToShirt();
			} else {
				$("#modal").modal('hide');
			}
		});
    },
    
	handleChange: function() {
		this.updatePreview();
	},
	
	updatePreview: function(clearall) {
		var canvas = document.getElementById("preview");
		var context = canvas.getContext("2d");
		var text = $("#text").val();
		if (clearall) text = "";
		var font = $("#fontpicker").val();
		var size = $("#sizepicker").val();
		var color = $("#colorpicker").spectrum('get');
		
		context.font = size + "px " + font;
		var textWidth = context.measureText(text).width;
		var textHeight = size;
		var x = canvas.width / 2 - textWidth / 2;
		var y = canvas.height / 2 + textHeight / 2;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		if (color.toHexString) var hexColor = color.toHexString();
		context.fillStyle = 0 || hexColor;
		context.fillText(text, x, y);
		
		editor.state.content = {
			text: text,
			font: font,
			size: size,
			color: hexColor,
			x: x,
			y: y,
		};
		
	},

    render: function() {
    	return(
    		<div onChange={this.handleChange} id="addtext">
    			
    			<div className="container-fluid">
					
					<TextArea updatePreview={this.updatePreview} />
					
				</div>
				
				<div className="container-fluid">
					<div className="col-xs-6 col-sm-6 col-md-6 col-lg-4 smallinput">
						
						<FontSizePicker />
						
					</div>
				
					<div className="col-xs-6 col-sm-6 col-md-6 col-lg-8 smallinput">

						  <FontList fonts={resources.fonts} />
							
					</div>			
				</div>
				
				<div className="container-fluid">
					<div className="colorpicker-label">
						Выберите цвет текста
					</div>
					<div className="colorpicker">
					
						<ColorPicker id="colorpicker" />
					
					</div>
					<div>
						<div className="input-group hexcolor">
							<span className="input-group-addon">#</span>
							<input type = "text" className = "form-control" id="hexcolor" maxLength="6" />
						</div>
					</div>
				</div>
				
				<div className="container-fluid">
					<div className="col-xs-12 col-sm-12 col-md-12 col-lg-10 preview" id="previewDiv">
						
					</div>	
				</div>
				
    		</div>
		);
	}
	
});



var AddPicture = React.createClass({
	
	componentDidMount: function() {
		var imageLoader = document.getElementById('imageLoader');
		imageLoader.addEventListener('change', this.handleImage, false);
	},
	
	handleImage: function(e) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext("2d");
		
		var reader = new FileReader();
		
		reader.onload = function(event){
			var img = new Image();
			
			img.onload = function(){
				canvas.width = img.width;
				canvas.height = img.height;
				context.drawImage(img,0,0);
				
				$(canvas)
					.appendTo($("body"))
					.attr('id', 'preview')
					.center()
					.resizable({
						aspectRatio: true,
						handles: "n, e, s, w, ne, se, sw, nw",
					})
                    .css("cursor", "move")
					.closest('div').draggable({containment: "parent"});
				
				//Resize image if it's too big and covers whole page
				var w = window.innerWidth;
				var h = window.innerHeight;
				if ( (img.width > w-100) || (img.height > h-150) ) {
					var ratio = img.width / img.height;
					if (ratio > 1) {
						var newWidth = w*0.7;
						var newHeight = newWidth / ratio;
					} else {
						var newHeight = w*0.6;
						var newWidth = newHeight / ratio;
					}
					$(canvas).resizable("resizeTo", { height: newHeight, width: newWidth });
					$(canvas).closest('div').center();
				}
				
				$("#modal").modal('hide');
				editor.state.content = {
					image: img,
					sizeX: img.width,
					sizeY: img.height
				};
				
			}
			img.src = event.target.result;
		}
		reader.readAsDataURL(e.target.files[0]); 
	},

    render: function() {
    	return(
    		<div>
    			
    			<div className="container-fluid">
					<h4>Загрузите изображение:</h4>
				</div>
				
				<EmptyContainer />
				
				<div className="container-fluid">
					<input type="file" id="imageLoader" name="imageLoader"/>		
				</div>
				
				
    		</div>
		);
	}
	
});



var ChangeColor = React.createClass({
	
    componentDidMount: function() {
        
        this.colorBeforeChanges = editor.state.shirtColor;
        
		$("#colorpicker").spectrum({
    		color: editor.state.shirtColor,
    		cancelText: "Отмена",
        	chooseText: "Выбрать",
			change: function(color){
				$("#hexcolor").val(color.toHexString().substr(1,6));
				triggerOnchange($("#hexcolor")[0]);
			},
		});
		$("#hexcolor").change(function() {
			$("#colorpicker").spectrum("set", $("#hexcolor").val());
			triggerOnchange($("#hexcolor")[0]);
		});
	
		$("#okbutton").click(function() {
			$("#modal").modal('hide');
		});
        
        var updateShirtColor = this.updateShirtColor;
        var colorBeforeChanges = this.colorBeforeChanges;
        $("#cancelbutton").click(function() {
            editor.state.shirtColor = colorBeforeChanges;
            updateShirtColor();
			$("#modal").modal('hide');
		});
        
	},
    
	handleChange: function() {
        var color = $("#colorpicker").spectrum('get');
        var hexColor = color.toHexString();
        editor.state.shirtColor = hexColor;
		this.updateShirtColor();
	},
	
	updateShirtColor: function() {
		editor.drawFill(editor.state.shirtColor);
        editor.drawMasks();
	},

    render: function() {
    	return(
    		<div onChange={this.handleChange}>
    			
				<div className="container-fluid">
					<div className="colorpicker-label">
						Выберите цвет футболки
					</div>
					<div className="colorpicker">
					
						<ColorPicker id="colorpicker" />
					
					</div>
					<div>
						<div className="input-group hexcolor">
							<span className="input-group-addon">#</span>
							<input type = "text" className = "form-control" id="hexcolor" maxLength="6" />
						</div>
					</div>
				</div>
				
    		</div>
		);
	}
	
});



var AddFigure = React.createClass({
	
    componentDidMount: function() {
        
		$("#colorpicker").spectrum({
    		color: "#000000",
    		cancelText: "Отмена",
        	chooseText: "Выбрать",
			change: function(color){
				$("#hexcolor").val(color.toHexString().substr(1,6));
				triggerOnchange($("#hexcolor")[0]);
			},
		});
		$("#hexcolor").change(function() {
			$("#colorpicker").spectrum("set", $("#hexcolor").val());
			triggerOnchange($("#hexcolor")[0]);
		});
		
		$("#colorpicker2").spectrum({
    		color: "#eeeeee",
    		cancelText: "Отмена",
        	chooseText: "Выбрать",
			change: function(color){
				$("#hexcolor2").val(color.toHexString().substr(1,6));
				triggerOnchange($("#hexcolor2")[0]);
			},
		});
		$("#hexcolor2").change(function() {
			$("#colorpicker2").spectrum("set", $("#hexcolor2").val());
			triggerOnchange($("#hexcolor2")[0]);
		});
		
		$('#xsizepicker').slider({
			min: 2,
			max: 300,
			animate: "fast",
			value: 20,
			change: function(){
				triggerOnchange($("#hexcolor")[0]);
			},
		});
		$('#ysizepicker').slider({
			min: 2,
			max: 300,
			animate: "fast",
			value: 20,
			change: function(){
				triggerOnchange($("#hexcolor")[0]);
			},
		});
		$("#linewidth").val("1");
		
		$("#modal").on('shown.bs.modal', function() {
			var width = $("#previewDiv").width();
			var height = $("#previewDiv").height();
			var canvas = createHiDPICanvas(width, height);
			canvas.id = "preview";
			$(canvas).appendTo("#previewDiv");
		});
	
		$("#okbutton").click(function() {
            editor.previewToShirt();
		});

    },
    
	handleChange: function() {
		this.updatePreview();
	},
	
	updatePreview: function() {
        
		var canvas = document.getElementById("preview");
		var context = canvas.getContext("2d");
		
		var figure = $("#figurepicker").val();
		var lineWidth = $("#linewidth").val();
		var width = $("#xsizepicker").slider("value");
		var height = $("#ysizepicker").slider("value");
		var strokeColor = $("#colorpicker").spectrum('get');
		var fillColor = $("#colorpicker2").spectrum('get');
		
		//TODO: fix measures on HiDPI devices
		var x = canvas.width / 2 - width / 2;
		var y = canvas.height / 2 - height / 2;
		
		if (strokeColor.toHexString) var hexStrokeColor = strokeColor.toHexString();
		if (fillColor.toHexString) var hexFillColor = fillColor.toHexString();
		
		if ($("#nostroke").is(":checked")) hexStrokeColor = "rgba(0,0,0,0)";
		if ($("#nofill").is(":checked")) hexFillColor = "rgba(0,0,0,0)";
		
		context.strokeStyle = strokeColor;
		context.fillStyle = fillColor;
		console.log(figure, lineWidth, width, hexStrokeColor, hexFillColor, height);
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		//draw figure
		if (figure == "rectangle") {
			context.beginPath();
			context.rect(x, y, width, height);
			context.fill();
			context.lineWidth = lineWidth;
			context.stroke();
		}
		
		editor.state.content = {
			figure: figure,
			width: width,
			height: height,
			strokeColor: hexStrokeColor,
			fillColor: hexFillColor,
			x: x,
			y: y,
		};
		
	},

    render: function() {
    	return(
    		<div onChange={this.handleChange} id="addfigurediv">
    			
				<div className="container-fluid">
					<div className="col-xs-6 col-sm-6 col-md-6 col-lg-8 smallinput">

						  <FigureList />
							
					</div>
				</div>
				
				<div className="container-fluid">
					<div className="colorpicker-label">
						Выберите цвет обводки:
					</div>
					<div className="colorpicker">
					
						<ColorPicker id="colorpicker" />
					
					</div>
					<div>
						<div className="input-group hexcolor">
							<span className="input-group-addon">#</span>
							<input type = "text" className = "form-control" id="hexcolor" maxLength="6" />
						</div>
					</div>
					<div className="col-xs-6 col-sm-6 col-md-4 col-lg-3 smallinput">
						<div className="checkbox right">
							<label><input type="checkbox" value="" id="nostroke" />Без обводки</label>
						</div>
					</div>
				</div>
				
				<div className="container-fluid">
					<div className="colorpicker-label">
						Выберите цвет заливки:
					</div>
					<div className="colorpicker">
					
						<ColorPicker id="colorpicker2" />
					
					</div>
					<div>
						<div className="input-group hexcolor">
							<span className="input-group-addon">#</span>
							<input type = "text" className = "form-control" id="hexcolor2" maxLength="6" />
						</div>
					</div>
					<div className="col-xs-6 col-sm-6 col-md-4 col-lg-3 smallinput">
						<div className="checkbox right">
							<label><input type="checkbox" value="" id="nofill" />Без заливки</label>
						</div>
					</div>	
				</div>
				
				<div className="container-fluid">
					<div className="colorpicker-label">
						Толщина обводки:
					</div>
					<div className="input-group linewidth">
						<input type = "number" className = "form-control" id="linewidth" maxLength="1" min="1" max="7" />
						<span className="input-group-addon">px</span>
					</div>
				</div>	
				
				<div className="container-fluid">
					<div className="table table-condensed table-bordered table-responsive">
						<table className="table">
							<tbody>
								<tr>
									<td>
										Ширина
									</td>
									<td>
										Высота
									</td>
								</tr>
								<tr>
									<td>
										<div className="slider">
											<div id="xsizepicker"></div>
										</div>
									</td>
									<td>
										<div className="slider">
											<div id="ysizepicker"></div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					
					
					
				</div>
				
				<div className="container-fluid">
					<div className="col-xs-12 col-sm-12 col-md-12 col-lg-10 preview-big" id="previewDiv">
						
					</div>	
				</div>
				
    		</div>
		);
	}
	
});



//------------------ resources --------------------

var resources = {};

resources.fonts = [
	'Georgia, serif',
	'"Palatino Linotype", "Book Antiqua", Palatino, serif',
	'"Times New Roman", Times, serif',
	'Arial, Helvetica, sans-serif',
	'"Arial Black", Gadget, sans-serif',
	'"Comic Sans MS", cursive, sans-serif',
	'Impact, Charcoal, sans-serif',
	'"Lucida Sans Unicode", "Lucida Grande", sans-serif',
	'Tahoma, Geneva, sans-serif',
	'"Trebuchet MS", Helvetica, sans-serif',
	'Verdana, Geneva, sans-serif',
	'"Courier New", Courier, monospace',
	'"Lucida Console", Monaco, monospace'
];

resources.tools = [
	{
		tooltip: "Добавить текст",
		id: "addtext",
		glyphicon: "glyphicon glyphicon-font"
	},
	{
		tooltip: "Добавить картинку",
		id: "addpicture",
		glyphicon: "glyphicon glyphicon-picture"
	},
	{
		tooltip: "Цвет футболки",
		id: "color",
		glyphicon: "glyphicon glyphicon-tint"
	},
	{
		tooltip: "Добавить фигуру",
		id: "addfigure",
		glyphicon: "glyphicon glyphicon-stop"
	},
	{
		tooltip: "Отменить последнее действие",
		id: "undo",
		glyphicon: "glyphicon glyphicon-backward"
	},
	{
		tooltip: "Очистить всё",
		id: "clearall",
		glyphicon: "glyphicon glyphicon-trash"
	},
	{
		tooltip: "Сохранить как картинку",
		id: "render",
		glyphicon: "glyphicon glyphicon-save-file"
	}
	
];





//-------------- tool dialogs classes -------------

var ListItemWrapper = React.createClass ({

	render: function() {
		return (
			<li className={this.props.classname}>
				{this.props.item}
			</li>
		);
	}
	
});


var SelectItemWrapper = React.createClass ({

	render: function() {
		return (
			<option className={this.props.classname} value={this.props.item}>
				{this.props.name}
			</option>);
	}
	
});



var TextArea = React.createClass({

	getInitialState: function() {
		return {value: ""};
	},
	
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	
	clearall: function() {
		this.setState({value: ""});
		this.props.updatePreview(true);
	},
	
    render: function() {
    	var text = this.state.value;
    	return(
			<div className="input-group">
			
				<
					input type = "text"
					className = "form-control"
					placeholder = "Введите текст"
					aria-describedby = "cleartext"
					id = "text"
					onChange = {this.handleChange}
					value = {text}
				/>
				
				<span className="input-group-addon" onClick={this.clearall} id="cleartext">
					<span className="glyphicon glyphicon-remove-circle"></span>
				</span>
				
			</div>
		);
	}
});


var FontList = React.createClass({

	getInitialState: function() {
		return {value: this.props.fonts[0]};
	},
	
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	
    render: function() {
    	var currentFont = this.state.value;
    	return(
    		<select value={currentFont} onChange={this.handleChange} className="form-control select" id="fontpicker">
    			
				{this.props.fonts.map(function(font) {
					return (
						<
							SelectItemWrapper
							key = {font}
							classname = "fontlist"
							item = {font}
							name = {font}
						/>
					);
				})}
				
			</select>
		);
	}
	
});


var FigureList = React.createClass({
	
	figures: function() {
		return [
			{type: "rectangle", name: "Прямоугольник"},
			{type: "triangle", name: "Треугольник"},
			{type: "ellipse", name: "Эллипс"}
		];
	},
	
	getInitialState: function() {
		return {value: "rectangle"};
	},
	
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	
    render: function() {
    	var currentFigure = this.state.value;
    	var figures = this.figures();
    	return(
    		<select value={currentFigure} onChange={this.handleChange} className="form-control select" id="figurepicker">
    			
				{figures.map(function(figure) {
					return (
						<
							SelectItemWrapper
							key = {figure.type}
							classname = "figurelist"
							item = {figure.type}
							name = {figure.name}
						/>
					);
				})}
				
			</select>
		);
	}
	
});


var FontSizePicker = React.createClass ({

	getInitialState: function() {
		return {value: "18"};
	},
	
	handleChange: function(event) {
		this.setState({value: event.target.value});
	},
	
	render: function() {
		var text = this.state.value;
		return(
			<div className="input-group">
			
				<
					input type = "number"
					className = "form-control"
					placeholder = "Введите размер шрифта"
					onChange = {this.handleChange}
					value = {text}
					id="sizepicker"
				/>
				
				<span className="input-group-addon">px</span>
			</div>
		);
	}
	
});


var ColorPicker = React.createClass ({

	render: function() {
    	return(
    		<input type='text' id={this.props.id} />
    	);
    }
    
});


var NoCanvasErrorMessage = React.createClass ({

	render: function() {
    	return(
    		<div className="container-fluid">
    			Предыдущий элемент был помещен вне какого-либо макета и будет удален.
    		</div>
    	);
    }
    
});




//---------- main components classes -------------

var ToolButtons = React.createClass({

    render: function() {
    	return(
    		<ul className="nav navbar-nav">
				
				{this.props.tools.map(function(tool) {
					return (
						<li className="nav-item" key={tool.id}>
						  <button type="button" className="tool" data-toggle="tooltip" title={tool.tooltip} id={tool.id}>
						  	<span className={tool.glyphicon}></span>
						  </button>
						</li>);
				})}
				
			</ul>
		);
	}
	
});




//---------------- main components -----------------


var Header = React.createClass({

    render: function() {
    	return(
    		<nav className="navbar navbar-fixed-top rednav">
			  <div className="container-fluid">

					<ToolButtons tools={resources.tools} />
					
			  </div>
			</nav>
		);
	}
	
});


var Footer = React.createClass({

    render: function() {
    	return(
			<footer className="footer">
			  <div className="container">
			  
				<div className="col-xs-12 col-sm-12 col-md-5 col-lg-4">
					<div className="copyright">
						<a href="#">&copy; 2016 Mikhail Semochkin</a>
					</div>
				</div>  
		
			  </div>
			</footer>
		);
	}
	
});


var Body = React.createClass({

    render: function() {
    	return(
    		<div>
				<div className="canvas" id="canvasDiv1"></div>
				<div className="canvas" id="canvasDiv2"></div>
				<div className="canvas" id="canvasDiv3"></div>
			</div>
		);
	}
	
});


var EmptyContainer = React.createClass({

    render: function() {
    	return(
			<div className="container">&nbsp;</div>
		);
	}
	
});


var EmptyContainer3 = React.createClass({

    render: function() {
    	return(
			<div className="container">&nbsp;<br />&nbsp;<br />&nbsp;</div>
		);
	}
	
});


var Modal = React.createClass({

    componentDidMount: function() {
        $(ReactDOM.findDOMNode(this)).modal('show');
        $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
    },
    
    render: function() {
        return (
          <div className="modal fade" id="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title" id="modalTitle"></h4>
                </div>
                <div className="modal-body row" id="modalBody">
                  
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-flat" data-dismiss="modal" id="cancelbutton">Отмена</button>
                  <button type="button" className="btn btn-flat" id="okbutton">Готово</button>
                </div>
              </div>
            </div>
          </div>
        )
    },
    
    propTypes: {
        handleHideModal: React.PropTypes.func.isRequired
    }
    
});





var App = React.createClass({

    getInitialState: function() {
        return {view: {showModal: false}}
    },
    handleHideModal: function() {
        this.setState({view: {showModal: false}})
    },
    handleShowModal: function() {
        this.setState({view: {showModal: true}})
    },
    componentDidMount: function() {        //Onload
        editor.init();
	     
    },
    
    render: function() {
    	
		return(
		    <div>
		    	
		    	<Header />
		    	<EmptyContainer3 />
		    	<Body />
		    	<EmptyContainer />
		    	<Footer />
		    	
		        <button className="hidden" id="modalOpener" onClick={this.handleShowModal}>Open Modal</button>
		        {this.state.view.showModal ? <Modal handleHideModal={this.handleHideModal}/> : null}
		        
		        
		    </div>
		);
	}
	
});




ReactDOM.render(
	<App />,
	document.getElementById("appwrapper")
);











