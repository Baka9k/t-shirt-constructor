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
	editor.openModal();
	editor.tools[tool]();
}

editor.openModal = function() {
	$("#modal").modal();
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
		ReactDOM.render(
			<addtext />,
			document.getElementsByClassName("modal-open")[0]
		);
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
	



$(document).ready(function() {
	editor.init();
});





//==============================  REACT  ==============================


var Header = React.createClass({
    render(){
    	return(
    		<nav class="navbar navbar-fixed rednav">
			  <div class="container-fluid">

				<ul class="nav navbar-nav">
					<li class="nav-item" id="tools">
					  <button type="button" class="tool" data-toggle="tooltip" title="Добавить текст" id="addtext">
					  	<span class="glyphicon glyphicon-font"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Добавить картинку" id="addpicture">
					  	<span class="glyphicon glyphicon-picture"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Цвет фона" id="color">
					  	<span class="glyphicon glyphicon-tint"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Добавить фигуру" id="addfigure">
					  	<span class="glyphicon glyphicon-stop"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Отменить последнее действие" id="undo">
					  	<span class="glyphicon glyphicon-backward"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Очистить всё" id="clearall">
					  	<span class="glyphicon glyphicon-trash"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Сохранить макет" id="save">
					  	<span class="glyphicon glyphicon-floppy-save"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Загрузить макет" id="load">
					  	<span class="glyphicon glyphicon-floppy-open"></span>
					  </button>
					</li>
					<li class="nav-item">
					  <button type="button" class="tool" data-toggle="tooltip" title="Сохранить как картинку" id="renderpng">
					  	<span class="glyphicon glyphicon-save-file"></span>
					  </button>
					</li>
					
				</ul>
			  </div><!-- /.container-fluid -->
			</nav>
		);
	}
});


var Footer = React.createClass({
    render(){
    	return(
			<footer class="footer">
			  <div class="container">
			  
				<div class="col-xs-12 col-sm-12 col-md-5 col-lg-4">
					<div class="copyright">
						<a href="#">&copy; 2016 Mikhail Semochkin</a>
					</div>
				<div>  
		
			  </div>
			</footer>
		);
	}
});

var Body = React.createClass({
    render(){
    	return(
			<div class="canvas" id="canvasDiv1"></div>
			<div class="canvas" id="canvasDiv2"></div>
			<div class="canvas" id="canvasDiv3"></div>
		);
	}
});












var Modal = React.createClass({
    componentDidMount(){
        $(this.getDOMNode()).modal('show');
        $(this.getDOMNode()).on('hidden.bs.modal', this.props.handleHideModal);
    },
    render(){
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
    propTypes:{
        handleHideModal: React.PropTypes.func.isRequired
    }
});



var App = React.createClass({
    getInitialState(){
        return {view: {showModal: false}}
    },
    handleHideModal(){
        this.setState({view: {showModal: false}})
    },
    handleShowModal(){
        this.setState({view: {showModal: true}})
    },
    render(){
		return(
		    <div className="row">
		        <button className="btn btn-default btn-block" onClick={this.handleShowModal}>Open Modal</button>
		        {this.state.view.showModal ? <Modal handleHideModal={this.handleHideModal}/> : null}
		    </div>
		);
	}
});






React.render(
   <App />,
    document.getElementById('container')
);









