//============================== JS to draw on canvas ========================

var editor = {};



editor.variables = {
	canvasWidth: 0,
	canvasHeight: 0,
};
editor.canvases = {};
editor.contexts = {};
//editor.canvases: front, rear, sides
//editor.contexts: front, rear, sides



editor.preparePage = function() {
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
	$(".tool").each(function(index) {
		$(this).on("click", function() {
		    editor.useTool($(this).attr('id')); 
		});
	});
}

editor.useTool = function(tool) {
	$("#modalOpener").click();
	editor.tools[tool]();
}





editor.init = function() {
	editor.preparePage();
	editor.canvases.front = editor.createCanvas(document.getElementById("canvasDiv1"));
	editor.canvases.rear = editor.createCanvas(document.getElementById("canvasDiv2"));
	editor.canvases.sides = editor.createCanvas(document.getElementById("canvasDiv3"));
	for (var canvas in editor.canvases) {
		editor.contexts[canvas] = editor.canvases[canvas].getContext("2d");
	}
	editor.drawFill("#FF0000");
	editor.drawMasks();
	editor.activateTools();
}


//=============================== TOOLS ======================================

editor.tools = {

	addtext: function() {
		ReactDOM.render(
			<Addtext />,
			document.getElementById("modalBody")
		);
		
		$(".fontlist").each(function(index) {
			$(this).css("font-family", $(this).text()); 
		});
		
		$("#cleartext").click(function() {
			$("#text").val(""); 
		});
		$("#colorpicker").spectrum({
    		color: "#000000",
		});
		
		
		
	},
	
	addpicture: function() {
	
	},
	
	color: function() {
	
	},
	
	addfigure: function() {
	
	},
	
	undo: function() {
	
	},
	
	clearall: function() {
	
	},
	
	save: function() {
	
	},
	
	load: function() {
	
	},
	
	render: function() {
	
	},
}






//==============================  REACT  =======================================

					


//--------------- tool dialogs -------------------

var Addtext = React.createClass({

    render: function() {
    	return(
    		<div>
    			
    			<div className="container-fluid">
					<div className="input-group">
					  <input type="text" className="form-control" placeholder="Введите текст" aria-describedby="cleartext" id="text" />
					  <span className="input-group-addon" id="cleartext"><span className="glyphicon glyphicon-remove-circle"></span></span>
					</div>
				</div>
				
				<div className="container-fluid">
					<div className="col-xs-6 col-sm-6 col-md-6 col-lg-4 smallinput">
						<div className="input-group">
						  <input type="text" className="form-control" placeholder="Введите размер шрифта" />
						  <span className="input-group-addon" id="fontsize">px</span>
						</div>
					</div>
				
					<div className="col-xs-6 col-sm-6 col-md-6 col-lg-8 smallinput">

						  <Fonts fonts={resources.fonts} />
							
					</div>			
				</div>
				
				<div className="container-fluid">
					<div className="smallinput">
					
						<ColorPicker />
					
					</div>
					<div className="smallinput">
						Выберите цвет текста
					</div>
				</div>
				
				<div className="container-fluid">
					<div className="col-xs-12 col-sm-12 col-md-12 col-lg-10 preview">
						<canvas id = "preview" /> 
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
		tooltip: "Цвет фона",
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
		tooltip: "Очистить все",
		id: "clearall",
		glyphicon: "glyphicon glyphicon-trash"
	},
	{
		tooltip: "Сохранить макет",
		id: "save",
		glyphicon: "glyphicon glyphicon-floppy-save"
	},
	{
		tooltip: "Загрузить макет",
		id: "load",
		glyphicon: "glyphicon glyphicon-floppy-open"
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
		return (<li className={this.props.classname}>{this.props.item}</li>);
	}
});

var SelectItemWrapper = React.createClass ({
	render: function() {
		return (<option className={this.props.classname}>{this.props.item}</option>);
	}
});


var Fonts = React.createClass({

    render: function() {
    	return(
    		<select className="form-control select">
    		
    			
				{this.props.fonts.map(function(font) {
					return (<SelectItemWrapper key={font} classname="fontlist" item={font} />);
				})}
        
			</select>
		);
	}
	
});


var ColorPicker = React.createClass ({

	render: function() {
    	return(
    		<input type='text' id="colorpicker" />
    	);
    }
    
});



//---------- main components classes ------------

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
    		<nav className="navbar navbar-fixed rednav">
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

var Modal = React.createClass({
    componentDidMount: function() {
        $(ReactDOM.findDOMNode(this)).modal('show');
        $(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
    },
    render: function() {
        return (
          <div className="modal fade">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title" id="modalTitle"></h4>
                </div>
                <div className="modal-body row" id="modalBody">
                  
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-flat" data-dismiss="modal">Отмена</button>
                  <button type="button" className="btn btn-flat">Готово</button>
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











