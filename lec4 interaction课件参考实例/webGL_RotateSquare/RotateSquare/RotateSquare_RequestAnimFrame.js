"use strict";

var canvas;
var gl;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );



    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
    render();
};

//*******************************************************
var theta = 0.0;
var vertices = [
        vec2(  0,  1 ),  vec2(  -1,  0 ),
        vec2( 1,  0 ),  vec2(  0, -1 )
];
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );//清屏
	
	//更新旋转角度，重新计算顶点坐标
    theta += 0.1;
	vertices[0] =vec2(Math.cos(theta),Math.sin(theta));
	vertices[1] =vec2(-Math.sin(theta),Math.cos(theta));	   
	vertices[2] =vec2(-Math.cos(theta),-Math.sin(theta)); 
	vertices[3] =vec2(Math.sin(theta),-Math.cos(theta));
	       
    //发送顶点坐标
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	
    //绘制正方形
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
	
	//要求浏览器显示下次刷新时将要绘制的内容，双帧，递归调用绘制函数
    window.requestAnimFrame(render);
}
