/*立方体划分，三角形面图元填充，每个面一种颜色，立体感很好，效果好*/
"use strict";

var canvas;
var gl;

var points = [];
var colors = [];

var NumTimesToSubdivide = 3;

window.onload = function init()
{
    //=====================================================
    //  Initialize our data for the Sierpinski Gasket
    //=====================================================

    // First, initialize the vertices of our 3D gasket
    // Four vertices on unit circle
    // Intial tetrahedron with equal length sides

    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];

    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
				 

    //======================================================
    //  Configure WebGL and load shaders
    //==========================================================
	canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    // enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );	




	//==================================================================
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
	//注意： 语句顺序，默认是把当前数组缓存中传递数据到GPU.位置和颜色两组语句不能混杂排列！！！
    //==================================================================
	
	//创建顶点颜色缓存当前缓存，将JS颜色数组colors转换后放入cBuffer.
	//并关联属性变量vColor和顶点着色器中的颜色变量“vColor”. 
	//传递数据到GPU：
	
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	  

    var vColor = gl.getAttribLocation( program, "vColor" );//返回顶点着色器中属性变量的索引
    //描述数组中的数据形式（这里每3个浮点数一组，不归一化，跨幅为0，从buffer偏移0开始）
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );//描述顶点属性数组中的数据形式	
    gl.enableVertexAttribArray( vColor );//开启着色器中的属性变量
	

    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );//传递当前缓存数据到GPU


	

	//创建顶点位置缓存为当前缓存，将JS顶点数组points转换后放入vBuffer.
	//关联属性变量vPositon和顶点着色器中的位置变量"vPosition" 
	//传递数据到GPU：
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    

	var vPosition = gl.getAttribLocation( program, "vPosition" );//返回顶点着色器中属性变量的索引
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );//描述顶点属性数组中的数据形式	
    gl.enableVertexAttribArray( vPosition );//开启着色器中的属性变量

    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );//传递当前缓存数据到GPU
	
	
    //==================================================================
    // 简单的调用绘制图形函数的自定义渲染函数render function
	//==================================================================
    render();
};

function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using 
    // a different color

    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion

    if ( count === 0 ) {
        tetra( a, b, c, d );
    }

    // find midpoints of sides
    // divide four smaller tetrahedra

    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;

        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function render()
{
	//注意：这里不仅设背景色，而且增加了深度缓存的清除，设置初始颜色。
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//这里调用绘制的是buffer中的顶点数据，按照三角形基本图元来绘制，四个点一组。
	gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
