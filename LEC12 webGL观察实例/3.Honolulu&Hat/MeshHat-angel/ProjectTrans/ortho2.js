"use strict";

var canvas;
var gl;

var numVertices  = 36;
var pointsArray = [];
var colorsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 ),
    ];

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),   // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    ];

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
	 
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
	 
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
	 
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
	 
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
	 
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.viewport( 0, 0, canvas.width, canvas.height );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // sliders for viewing parameters
    document.getElementById("radiusSlider").onchange = function(event)
	{    radius = event.target.value;	};	
    document.getElementById("thetaSlider").onchange = function(event) 
	{    theta = event.target.value* Math.PI/180.0;};	
    document.getElementById("phiSlider").onchange = function(event) 
	{    phi = event.target.value* Math.PI/180.0; };    
	document.getElementById("heightSlider").onchange = function(event) {
        ytop = event.target.value/2;
        bottom = -event.target.value/2;
    };	
    document.getElementById("widthSlider").onchange = function(event) {
        right = event.target.value/2;
        left = -event.target.value/2;
    };	
    document.getElementById("depthSlider").onchange = function(event) {
		near = 0; //不让出现负的情况,否则之后程序不能显示图形
		far = event.target.value;       
    };
	
    render();
	 //near = -event.target.value;  会报错 此页上的代码禁用了反向和正向缓存。
}

var radius = 1;
var theta  = 0.0;
var phi    = 0.0;

//var near = -1.0;
var near=0.0;
var far = 1.0;
var left = -1.0;
var right = 1.0;
var bottom = -1.0;
var ytop = 1.0;

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        /*eye = vec3(radius*Math.sin(phi), 
		           radius*Math.sin(theta),
                   radius*Math.cos(phi));*/	
	    
		var x=radius*Math.sin(theta)*Math.cos(phi);
		var y=radius*Math.sin(theta)*Math.sin(phi);
		var z=radius*Math.cos(theta);  
		
	    eyeXYZ.value = String(x)+", "+String(y)+", "+String(z);
		eyePolar.value = String(radius)+",  "+String(theta)+",  "+String(phi);
		eye = vec3(x,y,z);		 
        modelViewMatrix = lookAt(eye, at , up);
        
		projectionMatrix = ortho(left, right, bottom, ytop, near, far);
		clipwindow.value= String(left)+","+String(right)+",  "+String(bottom)+","+
		           String(ytop)+",  "+String(near)+","+String(far);
		
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        requestAnimFrame(render);
    }
