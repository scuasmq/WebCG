/*不同于square的地方，这里是画三角带，第三个点后开始画三角形，	而第四个点开始结合前两个点画三角形。	
每个顶点的颜色从7种颜色中随机选择出来，	用varying变量传递插值到片元着色器*/

"use strict";

var canvas;
var gl;


var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;

var colors = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    //canvas.addEventListener("click", function(){//用mousedown也可以
    canvas.addEventListener("click", function(event){

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        var t = vec2(2*event.clientX/canvas.width-1,
             2*(canvas.height-event.clientY)/canvas.height-1);
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));//在原有顶点数据基础上，增加数据

        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[index%7]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
        index++;
    } );


    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
	
	/*不同于square的地方，这里是画三角带，第三个点后开始画三角形，
	而第四个点开始结合前两个点画三角形。
	每个顶点的颜色从7种颜色中随机选择出来，
	用varying变量传递插值到片元着色器*/
	
	
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, index );

    window.requestAnimFrame(render);
}
