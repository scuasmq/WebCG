/* 
 * 目标
 * 你需要制作，使用滑动条调整图片切换间隔
 * 你需要编辑html，加入一个滑动条
 * 在滑动条滑动时，同步更改图片切换间隔
 */

/* 
 * 注：关于html和js，网络上有很多资源，善用搜索
 * 注：如果遇到困难，请和老师或助教沟通，或是咨询同学！加油！
 */

var canvas; // 画布对象
var gl; // WebGL对象
var k = 1;
// Uniform对象
var u_aspect, u_sampler;

// 顶点数据
var points = [
    vec2(-1, -1),
    vec2(-1, 1),
    vec2(1, 1),
    vec2(-1, -1),
    vec2(1, 1),
    vec2(1, -1),
];

var texCoords = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(0, 0),
	vec2(1, 1),
    vec2(1, 0), 
];

/* window.onload在网页加载完成时调用 */
window.onload = function() {
    //
    // 获取画布和WebGL对象
    //
    canvas = document.getElementById( "canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL不可用！" ); }
    
    //
    // 设置画布
    //
    canvas.width = document.body.clientWidth;   // 获取画布宽度       
    canvas.height = document.body.clientHeight; // 获取画布高度  
    gl.viewport( 0, 0, canvas.width, canvas.height );// 设置视口大小同画布大小    
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // 设置背景色
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear( gl.COLOR_BUFFER_BIT );  // 用背景色填充帧缓存

    //
    // 读取着色器
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" ); // 从html中读取顶点着色器和片元着色器
    gl.useProgram( program ); // 使用该着色器

    //
    // 加载纹理
    // 
    loadImgs();
    
    // 
    // 初始化属性缓冲，这里包括了 顶点位置数组pointBuffer 和 顶点颜色数组colorBuffer
    // 
    var pointBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, pointBuffer); 
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW ); 
    var vPosition = gl.getAttribLocation(program, "vPosition" ); 
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 ) ; 
    gl.enableVertexAttribArray( vPosition ); 
    
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoordBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // 
    // 初始化uniform变量
    // 
    u_aspect = gl.getUniformLocation(program, "aspect");
    u_sampler = gl.getUniformLocation(program, "textureSampler");

    render();
}


/* 渲染函数 */
var cFrame = 0;
function render(){
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    cFrame++;
    window.requestAnimFrame(render);
}

/* 窗口大小改变，绘图界面也改变 */
window.onresize = function(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewport( 0, 0, canvas.width, canvas.height );    
    gl.clear( gl.COLOR_BUFFER_BIT );  //用背景色填充帧缓存
}

function setTexture(image){    
    var texture = gl.createTexture();//创建纹理对象
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, texture );//绑定为当前2D纹理对象    

    //把纹理对象从顶端翻转到底部（因APP和纹理图像用不同坐标系）
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);           
    //将图像数组image指定为当前二维纹理，即存到纹理内存
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    //gl.TEXTURE_MIN_FILTER：像素比纹素大，单个像素对应多个纹素，纹理需要缩小,
    //gl.NEAREST_MIPMAP_LINEAR：采用点采样方式得到相邻的Mipmap纹理， 并且在得到的Mipmap纹理内部使用线性滤波。
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_LINEAR );    
    //gl.TEXTURE_MAG_FILTER：像素比纹素小，多个像素对应单个纹素，纹理需要放大。
    //gl.NEAREST :采用点采样方式得纹理
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR  );

    /*为当前纹理对象设置属性参数，控制纹理映射到物体表面的方式*/
    gl.generateMipmap( gl.TEXTURE_2D );        
   
    /*关联当前纹理对象和片元SHADER中的采样器对象sampler*/
    gl.uniform1i(u_sampler, 0);
}

var imgs = []; // 图片列表
var cImgIndex = 0; // 当前是第几帧
var isLoadingImgs = true;

function loadImgs(files){
    isLoadingImgs = true;
    imgs = [];
    if (!files){ // 初始状态，加载html里的四张图片
        for (var i = 1; i <= 4; i++){
            imgs.push(document.getElementById("texture-" + i));
        }
        cImgIndex = 0;
        setTexture(imgs[0]);
        isLoadingImgs = false;
    }
    else{ // 加载选择的本地图片
        if(!files) return;
        
        var loadedImg = 0;
        for(let i = 0; i < files.length; i++){
            url = URL.createObjectURL(files[i]),
            img = new Image();
    
            img.onload = function() {
                loadedImg++;
                if (loadedImg == files.length){
                    console.log("图片加载完毕")
                    cImgIndex = 0;
                    setTexture(imgs[0]);
                    isLoadingImgs = false;
                }
            };
            img.src = url;
            imgs.push(img);
        }
        
    }
}

// 下一张图片
function nextImg(){
    if (imgs.length == 0) {
        alert("图片列表为空");
        return;
    }
    cImgIndex = (cImgIndex + 1) % imgs.length;
    setTexture(imgs[cImgIndex]);
    gl.uniform1f(u_aspect, (imgs[cImgIndex].width / imgs[cImgIndex].height) / (canvas.width / canvas.height));
}

var interval = 500; // 动画间隔时间，单位是毫秒

function animation(){ // 动画主函数
    if(!isLoadingImgs) nextImg();
    setTimeout(animation, interval); // interval毫秒后切换下一张图片
}
animation();

var setFrameSpeed = setInterval(function(){
    var intervalTime = document.getElementById("intervalTime");
    intervalTime.innerHTML = interval/1000 + "s";

    document.getElementById("slide").onchange = function(){
        interval = event.srcElement.value;
    }
},100)

// fps计算
var fpsCounter = setInterval(function(){
    var fpsText = document.getElementById("fps");
    fpsText.innerHTML = "帧数：" + cFrame + " FPS";
    cFrame = 0;
}, 1000)
