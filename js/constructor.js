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


//    ---- Tools ----

editor.tools = {
	addtext: function() {
	
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

					
var ToolButtons = React.createClass({

	tools: function() {
		return [
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
				id: "clear",
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
				id: "renderpng",
				glyphicon: "glyphicon glyphicon-save-file"
			}
			
		];
	},
	
    render: function() {
    	var toolsarr = this.tools();
    	var buttons = toolsarr.map(function(tool) {
    		return (<li className="nav-item" key={tool.id}>
					  <button type="button" className="tool" data-toggle="tooltip" title={tool.tooltip} id={tool.id}>
					  	<span className={tool.glyphicon}></span>
					  </button>
					</li>
					);
    	});

    	return(
    		<ul className="nav navbar-nav">
				{buttons}
			</ul>
		);
	}
	
});

var Header = React.createClass({
    render: function() {
    	return(
    		<nav className="navbar navbar-fixed rednav">
			  <div className="container-fluid">

				

					<ToolButtons />
					
				
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
                  <h4 className="modal-title">Modal title</h4>
                </div>
                <div className="modal-body">
                  <p>One fine body&hellip;</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary">Save changes</button>
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
    componentDidUpdate: function() {
        editor.init();
        console.log("Nya!");
    },
    
    render: function() {
    	
		return(
		    <div>
		    	
		    	<Header />
		    	<Body />
		    	<EmptyContainer />
		    	<Footer />
		    	
		    	
		    	
		        <button className="btn btn-default btn-block" onClick={this.handleShowModal}>Open Modal</button>
		        {this.state.view.showModal ? <Modal handleHideModal={this.handleHideModal}/> : null}
		    </div>
		);
	}
	
});




ReactDOM.render(
	<App />,
	document.getElementById("appwrapper")
);











