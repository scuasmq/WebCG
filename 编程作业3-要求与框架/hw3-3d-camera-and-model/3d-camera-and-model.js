var canvas;
var gl;
var program;
var vBuffer, cBuffer;

// 各类全局变量参数
var modelTheta = 0.0; //物体变换绕Y轴旋转角
var theta = 0; // θ值，参考极坐标
var phi = 90; // φ值，参考极坐标
var fov = 120; // 透视投影的俯仰角，fov越大视野范围越大
var isOrth = true ; // 默认是平行投影

var ModelMatrix = mat4(); // 模型变换矩阵，固定为单位矩阵
var ViewMatrix = mat4(); // 视图变换矩阵，初始化为单位矩阵
var ProjectionMatrix = mat4(); // 投影变换矩阵，初始化为单位矩阵

// 对应shader里的变量
var u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix;
var u_Flag;

/* 窗口加载时调用:程序环境初始化程序 */
window.onload = function() {
    canvas = document.getElementById( "canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    canvas.width = document.body.clientWidth;   
    canvas.height = document.body.clientHeight;	
	var size=Math.min(canvas.width,canvas.height);
   	gl.viewport( 0+(canvas.width-size)/2, 0+(canvas.height-size)/2, size, size );//设置视口,保持比例
    
    gl.enable(gl.DEPTH_TEST); // 开启深度缓存，以正确渲染物体的前后关系
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // 设置背景色  

    // 生成模型数据
    vertextsXYZ(); // 生成XYZ坐标轴需要的顶点位置和颜色
    generateCube(); // 生成方块数据

    // 初始化数据缓冲区，并关联shader变量
    vBuffer = gl.createBuffer();//为points存储的缓存
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    cBuffer = gl.createBuffer();//为colors存储的缓存
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    refreshData(); // 刷新数据
    
    // 绑定着色器变量
    u_ModelMatrix = gl.getUniformLocation(program,"u_ModelMatrix");
    u_ViewMatrix = gl.getUniformLocation( program, "u_ViewMatrix" );
    u_ProjectionMatrix = gl.getUniformLocation( program, "u_ProjectionMatrix" );
    u_Flag = gl.getUniformLocation(program, "u_Flag");

    render(); // 调用绘制函数
}

function refreshData(){
    var pointsData = flatten(points);
    var colorsData = flatten(colors);

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, pointsData, gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, colorsData, gl.STATIC_DRAW );
}

/* 绘制函数render */
function render(){    
    // 清屏
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // 构造视图矩阵和投影矩阵
    formModelMatrix();
    formViewMatrix();
    formProjectMatrix();
    
    // 传递变换矩阵    
    gl.uniformMatrix4fv( u_ModelMatrix, false, flatten(ModelMatrix) ); // 传递模型变换矩阵    
    gl.uniformMatrix4fv( u_ViewMatrix, false, flatten(ViewMatrix) ); // 传递视点变换矩阵
    gl.uniformMatrix4fv( u_ProjectionMatrix, false, flatten(ProjectionMatrix) ); // 传递投影变换矩阵
    
    // 标志位为0，用顶点绘制坐标系
    gl.uniform1i( u_Flag, 0 );
    gl.drawArrays( gl.LINES, 0, 6 ); // 绘制X轴，从0开始，读6个点
    gl.drawArrays( gl.LINES, 6, 6 ); // 绘制y轴，从6开始，读6个点
    gl.drawArrays( gl.LINES, 12, 6 ); // 绘制z轴，从12开始，读6个点        

    // 标志位为1，用顶点绘制面单色立方体
    gl.uniform1i( u_Flag, 1 );
    gl.drawArrays( gl.TRIANGLES, 18, points.length - 18 ); // 绘制物体,都是三角形网格表面
}

/* 绘图界面随窗口交互缩放而相应变化，保持1:1防止图形变形 */
window.onresize = resize;
function resize(){
    var size = Math.min(document.body.clientWidth, document.body.clientHeight);
    gl.viewport( (document.body.clientWidth-size)/2, (document.body.clientHeight-size)/2, size, size );
	render();
}

/* 注册键盘按键事件 */
window.onkeydown = function(e){
    switch (e.keyCode) {
        case 32:    // 空格-重置
            initViewingParameters();
            break;

        case 87:    // W-视点绕X轴顺时针旋转5度
            phi -= 5;
            break;
        case 83:    // S-视点绕X轴逆时针旋转5度
            phi += 5;
            break;
        case 65:    // A-视点绕Y轴顺时针旋转5度
            theta -= 5;
            break;
        case 68:    // D-视点绕Y轴逆时针旋转5度
            theta += 5;
            break;
                
        case 80:    // P-切换投影方式
            isOrth = !isOrth;
            break;
        case 77:    // M-放大俯仰角
            fov = Math.min(fov + 5, 170);
            break;
        case 78:    // N-较小俯仰角
            fov = Math.max(fov - 5, 5);
            break; 

        case 85:    // U-模型沿Y轴旋转
            modelTheta += 5;
            break;
        case 79:    // O-模型沿Y轴反向旋转
            modelTheta -= 5;
            break;
    }    
    
    render();
}

/* 复位 */
function initViewingParameters(){
	modelTheta=0;		
    theta = 0;     phi = 90;
    isOrth = true;     fov = 120;
    ViewMatrix = mat4();
    ProjectionMatrix = mat4();
};

/* 生成模型变换矩阵 */
function formModelMatrix(){
    var s = Math.sin(modelTheta * Math.PI / 180);
    var c = Math.cos(modelTheta * Math.PI / 180);
    ModelMatrix = mat4(
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    )
}

/* 生成观察变换矩阵/相机变换矩阵/视点变换矩阵 */
function formViewMatrix(){
    var radius = 2.0; // 眼睛绕X和Y轴转动所依球的半径，模型坐标规约到[0, 1]之间  

    // 运动的观察者（eye）的位置，使用radius、theta和phi参数表示
    // radians是MV.js提供的函数，它将角度转换为弧度
    var eye = vec3( radius * Math.sin(radians(phi)) * Math.sin(radians(theta)), 
                radius * Math.cos(radians(phi)), 
                radius * Math.sin(radians(phi)) * Math.cos(radians(theta)));

    // 观察方向上的点，固定为原点，观察方向n=at-eye;
    const at = vec3(0.0, 0.0, 0.0);

    // 计算得到与观察方向n垂直的并且向上的向量UP，
    // 你可以简单使用y轴正方向作为up向量，但是当相机视线方向和up平行时会出错!
	// 计算方法多种。可找垂直与观察方向n并且过eye的线段作为up向量
    var up = vec3( 2 * radius * Math.sin(radians(phi-90)) * Math.sin(radians(theta)), 
              2 * radius * Math.cos(radians(phi-90)),
              2 * radius * Math.sin(radians(phi-90)) * Math.cos(radians(theta)));
    
    //-------------TODO: 计算观察矩阵并赋值给ViewMatrix--------------------------------
    // 提示：需要的参数有eye, at, up，可调用common目录下的MV.js里函数
    alert("TODO: 未实现观察矩阵构造"); // 完成后删除本行即可
};

/* 生成规范化投影变换矩阵 */
function formProjectMatrix(){
    const near = 0.1;
    const far = 10;
    if(isOrth){ // 计算平行投影（正交投影）矩阵
        const left = -1.0; 
        const right = 1.0;
        const bottom = -1.0;
        const ytop = 1.0; // top是js全局变量，所以这里改名为ytop
        
		//----------TODO: 计算平行投影矩阵并赋值给ProjectionMatrix-------------
        // 提示：需要的参数有left, right, bottom, ytop, near, far
        // 提示：webGL是左手坐标系，在常规算法得基础上可能需要对Z轴进行反转处理
        alert("TODO: 未实现平行投影矩阵构造"); // 完成后删除本行即可
    }
    else{ // 计算透视投影矩阵
        var aspect = 1;canvas.height/canvas.width; // 纵横比
		
        //-------TODO: 计算透视投影矩阵并赋值给ProjectionMatrix--------------
        // 提示：需要的参数有fov, aspect, near, far，可调用common目录下的MV.js里函数
        // 提示：webGL是左手坐标系，在常规算法得基础上可能需要对Z轴进行反转处理
        alert("TODO: 未实现透视投影矩阵构造"); // 完成后删除本行即可
    }
}

function modelChange(model){
    points = [];
    colors = [];
    switch(model){
        case 'cube':{
            vertextsXYZ();
            generateCube();
            break;
        }
        case 'sphere':{
            vertextsXYZ();
            generateSphere();
            break;
        }
        case 'hat':{
            vertextsXYZ();
            generateHat();
            break;
        }
    }
    refreshData();//重新发送数据
	render();//重新渲染
}