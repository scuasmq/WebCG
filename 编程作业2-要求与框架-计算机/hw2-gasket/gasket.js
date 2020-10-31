/* 
 * 目标
 * 完成gasket的生成
 */

/* 
 * 注：如果遇到困难，请和老师或助教沟通，或是咨询同学！加油！
 */

var canvas;
var gl;
var program;

window.onload = function init() {
    // 初始化WebGL和Canvas画布
    canvas = document.getElementById( "canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    // 设置画布和WebGL上下文
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport( 0, 0, canvas.width, canvas.height ); 
    gl.clearColor(1.0, 1.0, 1.0, 1.0);   
    gl.clear( gl.COLOR_BUFFER_BIT );

    // 加载顶点着色器和片元着色器
    program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.useProgram( program );
    
    // 初始化顶点位置缓冲，顶点颜色缓冲
    // 缓冲的数据会被传输到着色器对应的变量当中
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // 绘制Gasket
    drawGasket(0);
}

// 注册窗口大小改变事件
window.onresize = function(){
    canvas.width = canvas.clientWidth;  
    canvas.height = canvas.clientHeight;
    gl.viewport( 0, 0, canvas.width, canvas.height );

    var depth = parseInt(document.getElementById("recur-depth-slider").value);
    drawGasket(depth);
}

function recurDepthSliderInput(depth){
    document.getElementById("recur-depth-text").innerText = depth + "次";
    drawGasket(depth);
}

function drawGasket(depth){
    gl.clear( gl.COLOR_BUFFER_BIT );
    // gasket结果
    triangles = [];
    triangleColors = [];

    // 这里给定了生成gasket的基本三角形的顶点
    var basePoint1 = vec2(-1, -1);
    var basePoint2 = vec2(0, 1);
    var basePoint3 = vec2(1, -1);

    // TODO: 根据基本三角形和给定的递归次数（深度），递归计算出gasket结果，存入triangles和triangleColors数组
    // triangles数组存储顶点位置，每个元素都是vec2
    // triangleColors数组存储顶点颜色，每个元素都是vec4

    /// 下方代码用以生成gasket
    alert("请完成gasket的生成"); // alert函数仅用于弹出提示，编辑时删除即可

    /// 上方代码用以生成gasket

    // 发送结果到缓存
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangleColors), gl.STATIC_DRAW );

    // 绘制结果
    gl.drawArrays( gl.TRIANGLES, 0, triangles.length );
}