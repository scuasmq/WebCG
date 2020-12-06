"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var rotationMatrix;
var rotationMatrixLoc;

var  angle = 0.0;
var  axis = [0, 0, 1];

var   trackingMouse = false;  //鼠标开始移动，需要跟踪其位置的标志
var   trackballMove = false;  //鼠标开始和结束运动的标志

var lastPos = [0, 0, 0];
var startX, startY;

/*根据输入的屏幕鼠标点击位置X,Y, 将屏幕坐标2D转换为板球面上的3D坐标输出，并且单位化使得X2+Y2+Z2=1
被mouseMotion调用*/
function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

/*mouseMotion当鼠标按下了并移动时，根据新的位置X,Y,转换为半球上三维坐标后，
结合保留的上一次的三维位置，计算得出旋转轴及旋转角度，并且保留本次3D 位置。*/
function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);	
	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

           lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }
    render();
}


/*=====用鼠标键的按下和放开时，分别触发事件的处理代码=======*/
function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    //开始位置需要转换为3D半球上的坐标，并保留在lastPos***/
    lastPos = trackballView(x, y);//计算当前结束点的3D位置
	trackballMove=true;//开始跟踪鼠标的移动
}
function stopMotion( x,  y)
{
    trackingMouse = false;//不再跟踪鼠标的移动
    if (startX != x || startY != y) {
		/*这时trackballMove还是true,表示跟踪球继续按先前的速度方向继续转动，
		这时render（）中还是会计算rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
		顶点着色器中的旋转矩阵会继续更新，所以物体还是会继续转动*/
    }
    else {
		/*当鼠标停止移动时，如果鼠标按下时的开始位置start和当前鼠标弹起时的位置相同，
         表示鼠标按下又弹起来了，即鼠标没有作任何移动，物体也不会旋转！*/
	     angle = 0.0;
	     trackballMove = false;//只有鼠标点下和弹起时的坐标相同时，物体才会停止转动
    }
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "r");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

	/***用鼠标键的按下和放开，作为鼠标开始运动和结束运动的触发事件***/
    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });
	
     /***用鼠标键的按下后，开始移动时的触发事件，主要用来获取移动的屏幕位置，转换为半球上的坐标，计算转动轴***/
    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    });

    render();

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

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );

        // for interpolated colors use
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//鼠标键没有放开并继续移动时，则继续计算新的旋转轴和角度，得到新的一次旋转变换矩阵rotate(angle, axis)，
	//累乘后传递rotationMatrix给着色器
    if(trackballMove) {
      axis = normalize(axis);
	  
	  /*注意：这里R=R*cur_r, cur_r是当前旋转，R是累积的多个旋转的乘积 */ 
      //rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
	  rotationMatrix = mult( rotate(angle, axis),rotationMatrix);
	  
      gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
	
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );//绘制
	
    requestAnimFrame( render );//动画切换帧
	//setTimeout(function () {requestAnimFrame( render );}, 100 );
}
