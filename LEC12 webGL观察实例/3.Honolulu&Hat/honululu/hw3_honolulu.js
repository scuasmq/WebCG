"use strict";

var canvas;
var gl;

var numVertices = 36;
var pointsArray = [];

var scale = 1.0;

var isOrtho = true;
//  add
var fColor;
const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);
var data = data256;

//  平行投影
const near   =  0.2;
const far    =  2.0;
const left   = -2.0;
const right  =  2.0;
const vtop   =  2.0;
const bottom = -2.0;
//  透视投影
const fovy   = 90.0;    //  Field-of-view in Y direction angle (in degrees)
const aspect = 1.0;     //  Viewport aspect ratio

//  极坐标参数
var radius = 1.0;
var theta  = 0.0;
var phi    = 0.0;
//  lookAt函数参数
var  eye = vec3(0.0, 0.0, 0.0);
var   at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var scaleMatrix, modelViewMatrix, projectionMatrix;
var scaleMatrixLoc, modelViewMatrixLoc, projectionMatrixLoc;


function loadPoints(n) {
    for(var i=0; i<n-1; i++) {
        for(var j=0; j<n-1;j++) {
            pointsArray.push( vec4(2*i/n-1, 2*data[i*n+j]-1, 2*j/n-1, 1.0));
            pointsArray.push( vec4(2*(i+1)/n-1, 2*data[(i+1)*n+j]-1, 2*j/n-1, 1.0));
            pointsArray.push( vec4(2*(i+1)/n-1, 2*data[(i+1)*n+j+1]-1, 2*(j+1)/n-1, 1.0));
            pointsArray.push( vec4(2*i/n-1, 2*data[i*n+j+1]-1, 2*(j+1)/n-1, 1.0) );
    }
    }
}


window.onload = function init() {
    
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert("WebGL isn't available"); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    loadPoints(256);
	
    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    fColor = gl.getUniformLocation(program, "fColor");

    scaleMatrixLoc = gl.getUniformLocation(program, 'u_scaleMatrix');
    projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
    
    //  task1
    scale = 1.0;
    document.getElementById("ScaleSlider").onchange = function(event){
        scale = event.target.value;
    }

    //  task2 
    var btToChangePt = document.getElementById("ProjectionTypeButton");
    btToChangePt.addEventListener("click", function(e) {
        if(e.button == 0) {
            isOrtho = !isOrtho;
            if(isOrtho) {
                btToChangePt.innerHTML = "Ortho";
            } else {
                btToChangePt.innerHTML = "Perspective";
            }
        }
    });

    //  Task3-1: r/t/p sliders
    document.getElementById("radiusSlider").onchange = function(event){
        radius = event.target.value;	
    };	
    document.getElementById("thetaSlider").onchange = function(event){
        theta = event.target.value * Math.PI/180.0;
    };	
    document.getElementById("phiSlider").onchange = function(event){
        phi = event.target.value * Math.PI/180.0; 
    };    

    //  Task3-3: x/y/z sliders
    document.getElementById("xSlider").onchange = function(event){
        at[0] = event.target.value;
    }
    document.getElementById("ySlider").onchange = function(event){
        at[1] = event.target.value;
    }
    document.getElementById("zSlider").onchange = function(event){
        at[2] = event.target.value;
    }

    //  Task4
    document.getElementById("Res64").onclick = function() {        
        data = data64;//nRows = 64; nColumns = 64;
        pointsArray = [];
        loadPoints(64);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
    };
    document.getElementById("Res128").onclick = function() {        
        data = data128;//nRows = 128; nColumns = 128;
        pointsArray = [];
        loadPoints(128);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
    };
    document.getElementById("Res256").onclick = function() {        
        data = data256;//nRows = 256;nColumns = 256;
        pointsArray = [];
        loadPoints(256);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));
    };
	
    render();
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    scaleMatrix = new Float32Array([
        scale, 0.0,   0.0,   0.0,
        0.0,   scale, 0.0,   0.0,
        0.0,   0.0,   scale, 0.0,
        0.0,   0.0,   0.0,   1.0
    ]);

    if(isOrtho) {
        projectionMatrix = ortho(left, right, bottom, vtop, near, far);
    } else {
        projectionMatrix = perspective(fovy, aspect, near, far);
    }    
    
    var x = radius * Math.sin(theta) * Math.cos(phi);
	var y = radius * Math.sin(theta) * Math.sin(phi);
    var z = radius * Math.cos(theta);  
    eye = vec3(x, y, z);
    //  Task3-2
    eyePolar.value = String(radius)+", "+String(theta)+", "+String(phi);
    eyeXYZ.value = String(x)+", "+String(y)+", "+String(z);

    modelViewMatrix = lookAt(eye, at, up);
    
    gl.uniformMatrix4fv(scaleMatrixLoc, false, scaleMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // draw each quad as two filled red triangles
    // and then as two black line loops
    for(var i=0; i<pointsArray.length; i+=4) {
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays(gl.LINE_LOOP, i, 4);
    }
    requestAnimFrame(render);
}
