"use strict";

var canvas;
var gl;  //webgl画布

var numTimesToSubdivide = 3;//初始细分次数

var index = 0;
var pointsArray = []; //三角顶点计数及存放数组

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);//建立观察变换矩阵的三个参数

var near = -10;
var far = 10;
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;//投影用矩形窗口参数

var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;//球极坐标三个参数

var dr = 5.0 * Math.PI/180.0; //交互参数，每次变化5度，并转换为弧度

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;//模视变换矩阵传递给shader的参数

//-----------------------------functions----------------------------------------
function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);
     index += 3;
}
function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
}
function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

//------------------------------------------------------------------------------
window.onload = function init() {	
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 0.0, 1.0 );

    //-----------------------------------------------
    //  Load shaders and initialize attribute buffers
    //-------------------------------------------------
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);//根据交互剖分次数，生成所有三棱锥顶点

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);//初始化顶点属性数组

	var vPosition = gl.getAttribLocation( program, "vPosition");//关联参数-顶点属性位置
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );//关联参数-模视矩阵
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );//关联参数-投影矩阵
	//-----------------------------------------------
    // interaction parameter get and set
    //-------------------------------------------------
    document.getElementById("Button0").onclick = function(){theta += dr;};
    document.getElementById("Button1").onclick = function(){theta -= dr;};
    document.getElementById("Button2").onclick = function(){phi += dr;};
    document.getElementById("Button3").onclick = function(){phi -= dr;};

    document.getElementById("Button4").onclick = function(){ 
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        init();//更新环境参数
    };
    document.getElementById("Button5").onclick = function(){ //Decrease Subdivisions
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        init();//更新环境参数
    };	
    render();//开始绘制
}

//------------------------------------------------------------------------------
function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//背景色和深度缓存开启    
	
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta)); //根据交互参数生成视点位置
    modelViewMatrix = lookAt(eye, at , up);//生成模视矩阵
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);//生成投影矩阵

	//projectionMatrix*modelViewMatrix*vPosition 三个参数传递给shader
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.LINE_LOOP, i, 3 );    
    window.requestAnimFrame(render);//双帧绘制


}
