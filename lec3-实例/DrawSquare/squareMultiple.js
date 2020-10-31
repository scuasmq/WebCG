var gl;

/* onload 的init函数相当于主程序,执行代码的入口，配置环境等参数，canvas,data,buffer,shader varibles,并调用render绘图
onload: determines where to start execution determines where to start execution */
window.onload = function init(){	
	//canvas gets WebGL context from HTML file
    var canvas = document.getElementById( "gl-canvas" );    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
  		
	 //配置WEBGL的绘图环境，等价于设置一些初始参数，这里有设置视口大小，设置背景色
	 //  Configure WebGL 
	 gl.viewport( 0, 0, canvas.width, canvas.height );
	 gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	
	//装载shader，并使用程序容器
	 //  Load shaders 
	 var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	 gl.useProgram( program );	 
	
	//定义场景中的景物顶点数据，并需要将其转换格式后写入GPU缓存，并且将shader里的属性变量与缓存关联
    //Four Vertices,vertices use vec2 type in MV.js
    var vertices = [ 
     	vec2( -0.5, -0.5 ),
		vec2(  -0.5,  0.5 ),
        vec2(  0.5, 0.5 ),
		vec2( 0.5, -0.5)
    ];	
	//必须创建GPU缓存，设置缓存类型并绑定，再写入转换格式的数据
	// and initialize attribute buffers 
	 var bufferId = gl.createBuffer();
	 gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	// Load data onto GPU by creating a vertex buffer object on the GPU
	 gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	 
	//必须关联 WEBGL APP中的变量 与 shader中的变量 
	//must connect variable in program with variable in shader
	//Associate out shader variables with our data buffer
	 var vPosition = gl.getAttribLocation( program, "vPosition" );
	 gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	 gl.enableVertexAttribArray( vPosition );    

	//调用自己写的绘制图形函数
    render();
};

/*该应用的绘制函数*/
function render() {
	//清屏
    gl.clear( gl.COLOR_BUFFER_BIT );
	//调用画图函数
	vertices=[ vec2( -0.5+0.3, -0.5+0.3 ),	vec2(  -0.5+0.3,  0.5+0.3 ), vec2( 0.5+0.3, 0.5+0.3), vec2(  0.5+0.3, -0.5+0.3 )];	
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );	
	//三角扇的第一个是固定公共顶点，和接着的两个顶点确定第一个三角形，而第四顶点开始和它的前一个顶点和第一点确定一个三角形。
	gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 ); // 0, 1 , 2, 3
	
	
	vertices=[ 
     	vec2( -0.5, -0.5 ),	vec2(  -0.5,  0.5 ),  vec2(  0.5, 0.5 ),	
		vec2( -0.5, -0.5 ),	vec2(  0.5, 0.5 ),	vec2( 0.5, -0.5) ];	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.drawArrays( gl.TRIANGLES, 0, 6 ); // 0, 1, 2, 0, 2, 3 
	
	
	
	vertices=[ vec2( -0.5-0.2, -0.5-0.2 ),	vec2(  -0.5-0.2,  0.5-0.2 ), vec2( 0.5-0.2, -0.5-0.2), vec2(  0.5-0.2, 0.5-0.2 )];	
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );	
	//对于三角带，每个顶点和其前两个顶点组合起来定义一个三角形
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4); // 0, 1, 3, 2
	
	
}
