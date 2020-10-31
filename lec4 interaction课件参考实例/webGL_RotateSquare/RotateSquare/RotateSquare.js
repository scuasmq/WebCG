var gl;
var points;
	
//*****************************************************

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


	
	/***************************input code*******************************/
	//按钮监听器
	var myButton = document.getElementById("DirectionButton");
		myButton.addEventListener("click", function() { 
		direction = !direction;
    });
	
	//菜单监听器
	var m = document.getElementById("mymenu");
	m.addEventListener("click", function() {
	   switch (m.selectedIndex) {
		  case 0:
			  direction = !direction;
			  break;
		  case 1:
			  delay /= 2.0;
			  break;
		  case 2:
			  delay *= 2.0;
			  break;
		   }
	}); 
    
	//键盘监听器
	window.addEventListener("keydown", function() {
	   switch (event.keyCode) {
		  case 49: // ’1’ key
			 direction = !direction;
			 break;
		  case 50: // ’2’ key
			 delay /= 2.0;
			 break;
		  case 51: // ’3’ key
			 delay *= 2.0;
			 break;
	   }
	});
	
	//滑动条监听器
	document.getElementById("slider").onchange = 
	function(event) 
	{
			 delay= 100-event.target.value;    
	};	 
	/*
	document.getElementById("slider").onchange =
	 function()
	 { 
		delay =100- event.srcElement.value;
	};
	*/
	
/********************************************************************/
	
	//调用自己写的绘制图形函数	
    render();
};


//********************************************************
var direction = true; // 旋转方向global initialization
var theta=0.0; //旋转角度
var vertices = [
     	vec2( 0, 1 ),
		vec2(  -1,  0 ),
        vec2(  0, -1 ),
		vec2( 1, 0)
];//图形初始
var delay = 100; //延迟时间


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

       if(direction) theta += 0.1;     else theta -= 0.1;	  
	   
	   vertices[0] =vec2(Math.cos(theta),Math.sin(theta));
	   vertices[1] =vec2(-Math.sin(theta),Math.cos(theta));	   
	   vertices[2] =vec2(-Math.cos(theta),-Math.sin(theta)); 
	   vertices[3] =vec2(Math.sin(theta),-Math.cos(theta));
	
       
	   gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	   gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    setTimeout(
        function () {requestAnimFrame( render );}, delay);
}


	