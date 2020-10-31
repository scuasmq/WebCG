/* 
 * 导语
 * 欢迎进入计算机图形学的世界！
 * 如果你对JavaScript的语法完全陌生，你可以快速浏览一遍 https://www.runoob.com/js/js-tutorial.html 
 * 如果你准备好了，请继续阅读代码
 */

/* 
 * 目标
 * 你需要完成点、线、面的绘制
 * 每在屏幕上点击一次，便会在对应位置创建一个顶点
 * 按下P键后，这些顶点应该以点的方式绘制一次
 * 按下L键后，这些顶点应该以连续线段的方式绘制一次
 * 按下T键后，这些顶点应该以多边形（扇形）的方式绘制一次
 * 要找到需要完成的部分，搜索TODO即可
 */


/* 
 * 注：大部分WebGL变量、函数可在此处查询：https://developer.mozilla.org/zh-CN/
 * 注：如果遇到困难，请和老师或助教沟通，或是咨询同学！加油！
 */

var canvas; // canvas画布对象，渲染出来的图像会被渲染到canvas画布上
var gl; // WebGL对象，存储了WebGL提供的变量和函数

var maxNumVertices = 600; // 最大顶点数

// 颜色数组
var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // 黑
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // 红
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // 黄
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // 绿
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // 蓝
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // 洋红
    vec4( 0.0, 1.0, 1.0, 1.0 )   // 青
];

var index = 0; // 计数屏幕点击的点数，即当前有多少个顶点

// onload在网页加载完毕时调用，一般用于初始化WebGL相关的资源 
window.onload = function init() {
    // 初始化WebGL和Canvas画布
    canvas = document.getElementById( "canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    canvas.width = document.body.clientWidth;   // 获取画布宽度       
    canvas.height = document.body.clientHeight; // 获取画布高度  
    gl.viewport( 0, 0, canvas.width, canvas.height );// 设置视口大小同画布大小    
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // 设置背景色          
    gl.clear( gl.COLOR_BUFFER_BIT );  // 用背景色填充帧缓存，也就是“清屏”

    // 加载顶点着色器和片元着色器，我们将在后面学到
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // 初始化顶点位置缓冲，顶点颜色缓冲
    // 缓冲的数据会被传输到着色器对应的变量当中
    var vBuffer = gl.createBuffer(); // 创建一个缓冲
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer); // 绑定缓冲，这激活了缓冲，并指定了该缓冲的作用
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW ); // 创建缓冲，这里指创建，但没有传入数据
    var vPosition = gl.getAttribLocation(program, "vPosition"); // 获取着色器属性
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // 设置着色器属性的数据类型，这里2, FLOAT相当于vec2
    gl.enableVertexAttribArray(vPosition); // 指定该属性使用刚才绑定的缓冲
    // 若对以上函数有疑问，可以在https://developer.mozilla.org/zh-CN/ 查看说明

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    // 添加画布点击事件，鼠标点击时触发
    canvas.addEventListener("click", function(event){
        // 将屏幕坐标转换为观察裁剪坐标
        /*
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();
        var px = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
        var py = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
        var p = vec2(px,py);    
        //var p=(px,py);//！error只画出一个点，写法错误
        */        
        var p = vec2(2*event.clientX/canvas.width-1,2*(canvas.height-event.clientY)/canvas.height-1);
        // 追加数据到顶点缓存，每个点vec2含两个浮点数，总共2*4=8个字节
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(p));
        // 追加数据到颜色缓存，选择下一种颜色，每个点颜色代码vec4含四个浮点数，总共4*4=16个字节
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        var c = vec4(colors[(index)%7]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(c));
        // 计数点数
        index++;
    });
}

/* 注册键盘按键事件，在键盘按下时触发 */
window.onkeydown = function(e){
    let code = e.keyCode; // 按键码，对应ASCII码，代表按下了哪个按键
    switch (code) {
        case 32:        // 空格-清屏并清空数据
            gl.clear( gl.COLOR_BUFFER_BIT );     
            index = 0;
            break;    
            
        case 80:           // P-画点
            // TODO: 你需要完成：绘制点
            // 提示：WebGL提供了drawArray函数用于绘制
            // alert("TODO: 绘制“点”功能尚未实现");
            gl.drawArrays(gl.POINTS,0,index);
			
            break;    
                
        case 76:           // L-画线段
            // TODO: 你需要完成：绘制线段
            // 提示：WebGL提供了drawArray函数用于绘制
            // alert("TODO: 绘制“线段”功能尚未实现");
            gl.drawArrays(gl.LINE_STRIP,0,index);
			
            break;
            
        case 84:           // T-画多边形
            // TODO: 你需要完成：绘制多边形
            // 提示：WebGL提供了drawArray函数用于绘制
            // alert("TODO: 绘制“多边形”功能尚未实现");
            gl.drawArrays(gl.TRIANGLE_FAN,0,index);
			
            break;
    }

}

/* 绘图界面随窗口交互缩放而相应变化 */
window.onresize = function(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewport( 0, 0, canvas.width, canvas.height );    
    gl.clear( gl.COLOR_BUFFER_BIT );  //用背景色填充帧缓存
}