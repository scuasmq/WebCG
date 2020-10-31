/********************************************************************************
明暗着色的旋转立方体，四个按钮，三个控制X,Y,Z旋转轴，toggle停止旋转切换
shadedCube: rotating cube with modified Phong shading         
----注意shadedCube中，视点在原点，WC，WC重合，模式变换矩阵其实只是模型变换矩阵。
    而光源在（1,1,1）。视点在立方体内，所以看起来有问题！！！
	/***因为at总是WC下原点，它和POS和观察者位置总是在一条线上，所以这里是简化计算的方法*/
*********************************************************************************/
"use strict";

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];//存放 按每面两个三角形6个顶点顺序放的顶点位置 数组
var normalsArray = [];//存放 按每面两个三角形6个顶点顺序放的顶点法向量 数组

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );//光源位置，A=0表示无穷远光，A=1表示点光源

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;//后面代码并没有用到？？？
var ambientColor, diffuseColor, specularColor;
var modelView;//模视变换矩阵，但是这个例子中只是立方体的模型变换
var program;

var viewerPos=vec3(0.0, 0.0, -20.0 );//wc下观察者位置,事实上没有使用，shader中默认相机在WC原点
var projection = ortho(-1, 1, -1, 1, -100, 100);//wc下正交投影裁剪范围

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];
var thetaLoc;
var flag = true;

//立方体每个面6个顶点位置及法向量,先计算每个面的法向量，
//然后，每个面分成两个三角形，按顺序分别将其顶点位置写入pointsArray数组，
//将顶点法向量装入normalsArray数组

function quad(a, b, c, d) {	
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
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

//--------------主程序-----------------------------
//1.Webgl的初始化，参数配置
//2.加载着色器，并初始化属性缓存，全局统一变量
//3.交互代码
//4.调用render进行绘制

window.onload = function init() {
	//============init WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    
    //=========Load shaders and initialize attribute buffers   
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();//立方体的所有顶点位置和法向量写入缓存

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );//顶点位置数组pointsArray写入缓存vBuffer缓存

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);                     //vBuffer缓存同SHADER中的顶点属性vPosition，建立关联

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));//传递环境反射向量
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );//传递漫反射向量
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );//传递镜面反射向量
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );//传递光源位置向量	
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);//传递镜面反射的高光系数
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projection));//传投影变换矩阵
	
	thetaLoc = gl.getUniformLocation(program, "theta"); //获取shader变量theta位置
	
	//交互控制，获取旋转轴选项X,Y,Z参数， 和是否继续旋转开关参数
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
	
	//进行渲染
    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0;

    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(modelView) );//传递旋转变换矩阵，即模视矩阵

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );//启动shader绘制三角形，numVertices初始化为36（6*6=36个三角形顶点）

    requestAnimFrame(render);//双帧
}
