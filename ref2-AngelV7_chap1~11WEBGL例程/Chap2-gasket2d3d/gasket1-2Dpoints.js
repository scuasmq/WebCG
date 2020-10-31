"use strict";

var gl;
var points;
var NumPoints = 5000;

window.onload = function init()
{
	

	//-------------------------------------------------------------------------------
    //  Configure WebGL and init paremeters
    //-------------------------------------------------------------------------------
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	
	
	//--------------------------------------------------
	// Load shaders 
	//---------------------------------------------------
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	


	//	-----------------------------
    // initialize attribute buffers 
	//-------------------------------
	var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	

	//这段必须在createBuffer之后写, 图形才能显示出来！	//返回顶点着色器中定义的的属性变量
    var vPosition = gl.getAttribLocation( program, "vPosition" );
	//描述顶点数组中的数据形式，第2,3参数说明顶点数组的每个元素都包含两个浮点数，第4参数false说明不需要把数据归一化为（0.0,1.0），
	//第5参数0说明数组中的值是连续的.第6参数0表示从buffer偏移量为0处开始存放。
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	//开启着色器中的顶点属性
    gl.enableVertexAttribArray( vPosition );
	



	//-------------------------------------------------
    //  Initialize our data for the Sierpinski Gasket
    //-------------------------------------------------
    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices
    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points
    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex
    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    } 
	    
	//-------------------------------------------------
    //send the data into the GPU;
    //-------------------------------------------------
	//当需要向GPU传输数据时，使用MV.js里flatten函数，实现从javascript类型（对象数据）中提取所需数据并转换为GPU要求的格式（数值数据）
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );	

	//-------------------------------------------------
    //执行编写的绘制函数 
    //-------------------------------------------------
    render();
	
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	//实际绘制函数drawArrays，draw the canvas by webgl engine
    gl.drawArrays( gl.POINTS, 0, points.length );
}
