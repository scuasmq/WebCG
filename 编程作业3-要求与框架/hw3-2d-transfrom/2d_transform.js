var canvas;
var gl;
var program;

// 计算复合变换矩阵需要的矩阵
var CurrentInteractionMatrix = mat3(); //保存当前交互对应的变换矩阵，初始值为单位矩阵
var CTM = mat3(); //累积变换矩阵CTM:current Transformation Matrix,初始值为单位矩阵

// 场景中的物体：X轴，Y轴，一个正方形
var verticesXYT = new Float32Array([
    -0.9,   0.0,    // X轴
     0.9,   0.0,
     0.9,   0.0,
    0.87,  0.03,
     0.9,   0.0,
    0.87, -0.03,
    
      0.0,  0.9,    // Y轴
      0.0, -0.9,
      0.0,  0.9,
     0.03, 0.87,
      0.0,  0.9,
    -0.03, 0.87,

     0.2,  0.2,     // 正方形
    -0.2,  0.2,
    -0.2, -0.2,
     0.2, -0.2
]);

// 向GPU传送的数据和绑定的变量
var u_Color; // 颜色
var u_Flag; // 标记，区分坐标轴的绘制和物体的绘制
var u_CompositeMatrix; // 复合变换矩阵，和CTM对应

window.onload = function() {
    canvas = document.getElementById( "canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    resize();
    gl.viewport( 0, 0, canvas.width, canvas.height );// 设置视口大小同画布大小
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // 设置背景色          
    gl.clear( gl.COLOR_BUFFER_BIT ); // 用背景色填充帧缓存

    program = initShaders( gl, "vertex-shader", "fragment-shader" ); // 初始化shader
    gl.useProgram( program );

    // 初始化数据缓冲区，并关联shader变量
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );    
    gl.bufferData( gl.ARRAY_BUFFER, verticesXYT, gl.STATIC_DRAW );    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // 全局变量关联
    u_CompositeMatrix = gl.getUniformLocation(program, "u_CompositeMatrix");
    u_Color = gl.getUniformLocation(program, "u_Color"); // 当前图元颜色
    u_Flag = gl.getUniformLocation(program, "u_Flag"); // 当前图元标志
     
    render(); // 调用绘制函数
}

/* 绘制函数render */
function render(){    
    // 清屏
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // 标志位为0，用顶点绘制坐标系
    gl.uniform1i(u_Flag, 0);                    
    gl.uniform4f(u_Color, 0, 0, 0, 1); // X轴颜色
    gl.drawArrays(gl.LINES, 0, 6); // 绘制X轴，6个顶点
    gl.uniform4f(u_Color, 0, 0, 0, 1); // y轴颜色
    gl.drawArrays(gl.LINES, 6, 6); // 绘制y轴，6个顶点
    
    // 标志位为1，用顶点绘制矩形
    gl.uniformMatrix3fv(u_CompositeMatrix, false, flatten(CTM)); // 传递复合变换矩阵
    gl.uniform1i(u_Flag, 1);                   
    gl.uniform4f(u_Color, 1, 0, 0, 1); // 图形颜色    
    gl.drawArrays(gl.LINE_LOOP, 12, 4); // 绘制正方形
}

/* 绘图界面随窗口交互缩放而相应变化，保持1:1防止图形变形 */
window.onresize = resize;
function resize(){
    var size = Math.min(document.body.clientWidth, document.body.clientHeight);
    canvas.width = canvas.height = size;
    gl.viewport( 0, 0, canvas.width, canvas.height );
    render();
}

/* 注册键盘按键事件 */
window.onkeydown = function(e){
    let code = e.keyCode;
    switch (code) {
        case 32:    // 空格-重置
            reset();
            break;
        case 68:    // D-X轴正向移动
            incX();
            break;
        case 65:    // A-X轴负向移动
            decX();
            break;
        case 87:    // W-Y轴正向移动
            incY();
            break;
        case 83:    // S-Y轴负向移动
            decY();
            break;
            
        case 82:    // R-逆时针旋转
            rotateCounter(); 
            break;
        case 85:    // U-顺时针旋转
            rotate();        
            break;
            
        case 74:       // J-缩放X-放大
            xLarger();
            break;
        case 76:       // L-缩放X-缩小
            xSmaller();
            break;
        case 73:       // I-缩放Y-放大
            yLarger();
            break;
        case 75:       // K-缩放Y-缩小
            ySmaller();
            break;    
            
        case 88:       // X轴反射
            xReflex();
            break;
        case 89:       // Y轴反射
            yReflex();
            break;
        case 79:       // 原点反射
            oReflex();
            break;
            
        case 86:       // V-错切X:x=x+my
            xShearInc();
            break;
        case 66:       // B-错切X:x=x-my
            xShearDec();
            break;
        case 78:       // N-错切Y:y=y+mx
            yShearInc();
            break;
        case 77:       // M-错切Y:y=y-mx
            yShearDec();
            break;
        default:
            return;
    }   
    // TODO: 根据当前变换CurrentInteractionMatrix和累积变换矩阵CTM得到绘制该帧的组合变换矩阵
	
	// 交互后需要调用render重新绘制
    render();
}

/* 重置复位 */
function reset(){
	CurrentInteractionMatrix = mat3();
    CTM = mat3();
    render();
}

/*********************************** X, Y方向的平移*******************************/
function incX(){
    CurrentInteractionMatrix = mat3(
        1, 0, 0.1,
        0, 1, 0,
        0, 0, 1
    );
}

function decX(){
    CurrentInteractionMatrix = mat3(
        1, 0, -0.1,
        0, 1, 0,
        0, 0, 1
    );
}

function incY(){
    CurrentInteractionMatrix = mat3(
        1, 0, 0,
        0, 1, 0.1,
        0, 0, 1
    );
}

function decY(){
    CurrentInteractionMatrix = mat3(
        1, 0, 0,
        0, 1, -0.1,
        0, 0, 1
    );
}


/***************************************X,Y方向的缩放****************************/
function xLarger(){
    // TODO: 构造缩放矩阵，缩放倍数任意
}

function xSmaller(){
    // TODO: 构造缩放矩阵，缩放倍数任意
}

function yLarger(){
    // TODO: 构造缩放矩阵，缩放倍数任意
}

function ySmaller(){
    // TODO: 构造缩放矩阵，缩放倍数任意
}

/**********************绕原点的旋转，顺时针和逆时针旋转******************************/
function rotate(){
    var ROTATE_FACTOR = 10;  // 旋转角度
    // TODO: 构造旋转矩阵（顺时针旋转），旋转量为ROTATE_FACTOR，角度需要转换为弧度代入三角函数计算
}

function rotateCounter(){
    var ROTATE_FACTOR = 10;  // 旋转角
    // 提示：构造旋转矩阵（逆时针旋转），旋转量为ROTATE_FACTOR，角度需要转换为弧度代入三角函数计算
}


/**************************** X轴，Y轴，原点的 反射（即对称） ****************************/
function xReflex(){
    // TODO: 构造反射矩阵
}

function yReflex(){
    // TODO: 构造反射矩阵
}

function oReflex(){
    // TODO: 构造反射矩阵
}
/********************************************* X, Y方向的错切*********************************/
function xShearInc(){
    var SHEAR_FACTOR = 0.1;
    // TODO：构造错切矩阵，错切因子为SHEAR_FACTOR
}

function xShearDec(){
    var SHEAR_FACTOR = 0.1;
    // TODO：构造错切矩阵，错切因子为SHEAR_FACTOR
}

function yShearInc(){
    var SHEAR_FACTOR = 0.1;
    // TODO：构造错切矩阵，错切因子为SHEAR_FACTOR
}

function yShearDec(){
    var SHEAR_FACTOR = 0.1;
    // TODO：构造错切矩阵，错切因子为SHEAR_FACTOR
}