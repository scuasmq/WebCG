"use strict";
/**********************************************************************************************************
修改部分： 增加设置了视点变动，视点不在原点了，APP需要传递观察方向给shader。
           shader中的光照计算（顶点位置，顶点法向量需要先进行模型变换后再和不动光源入射向量和观察向量进行计算）		    
           shader中计算顶点新位置，模视变换不再只有模型变换，。APP中生成视点变换矩阵并传递给shader
***********************************************************************************************************/

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

/*********修改后的代码：光源放在Z轴上*****************************************************/
//var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );//光源位置，A=0表示无穷远光，A=1表示点光源
var lightPosition = vec4(0.0, 0.0, 2.0, 0.0 );
/*********修改后的代码：光源放在Z轴上*******************************************************/


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

//var viewerPos=vec3(0.0, 0.0, -20.0 );//wc下观察者位置,事实上没有用之！！！
/*********修改后的代码：让观察者相机位置至于Z轴上，并传入shader*************************************/
var viewerPos=vec3(0.0, 0.0, 20.0 );
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var viewMatrix=lookAt(viewerPos, at , up);
/*********修改后的代码：让观察者相机位置至于Z轴上，并传入shader**************************************/


var projection = ortho(-1, 1, -1, 1, -100, 100);//wc下正交投影裁剪范围

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];
var thetaLoc;
var flag = true;

//立方体每个面6个顶点位置及法向量
//先计算每个面的法向量，
//然后，每个面分成两个三角形，按顺序分别将其顶点位置写入pointsArray数组，将顶点法向量装入normalsArray数组

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

//-----主程序-------
//1.Webgl的初始化，参数配置
//2.加载着色器，并初始化属性缓存，全局统一变量
//3.交互界面
//4.调用render渲染

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
	
	
	/********增加视点位置的传递用于计算光照, 视点变换矩阵的传递*************************************************/
	gl.uniform3fv(gl.getUniformLocation(program, "viewerPos"),flatten(viewerPos) );//传递光源位置向量	
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "viewMatrix"),  false, flatten(viewMatrix));//传递观察变换（视点变换阵）
	//thetaLoc = gl.getUniformLocation(program, "theta"); //此句移动到render中 	
	/********增加视点位置的传递用于计算光照, 视点变换矩阵的传递*************************************************/
	
	
	
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
	
	//thetaLoc = gl.getUniformLocation(program, "theta"); //此句移动到render中，关联shader中的全局变量和APP中变量
    thetaLoc = gl.getUniformLocation(program, "theta"); 
    if(flag) theta[axis] += 2.0;

    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(modelView) );//传递旋转变换矩阵，即模视矩阵
    
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );//启动shader绘制三角形，numVertices初始化为36（6*6=36个三角形顶点）

    requestAnimFrame(render);//双帧
}
