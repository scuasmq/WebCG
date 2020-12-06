var canvas;
var gl;

var numTimesToSubdivide = 3;
var pointsArray = [];

var radius = 2;//眼睛在半径为1的球面上运动
var eye=vec3(0.0,0.0,radius);////lookat参数，交互可改变
var theta  = 10.0*Math.PI/180.0;
var phi    = 0.0*Math.PI/180.0;
var dr = 3.0 * Math.PI/180.0;
var at = vec3(0.0, 0.0, 0.0);//lookat参数
var up = vec3(0.0, 1.0, 0.0);//lookat参数


var left = -2.0;
var right = 2.0;
var ytop =2.0;
var bottom = -2.0;
var near = 1;//都应该为正，near=-10不当
var far =5;//都应该为正

const radius_earth = 0.3; //地球半径
const radius_sun = 0.5; //太阳半径

var thetaAuto = 0.0; //自转角度
var thetaAutoLOC;
var speedAuto = 10.0; //自转速度(度数)

var radiusRevo = 0.8; //公转半径
var radiusRevoLoc;
var thetaRevo = 0.0; //公转角度
var thetaRevoLOC;
var speedRevo = 2.0; //公转速度(度数)



var colorLOC; 
var colorList = [];//每种图元用不同颜色
colorList['black'] = vec4(0.0, 0.0, 0.0, 1.0);//轨道
colorList['orange'] = vec4(0.91, 0.59, 0.48, 1.0);//太阳
colorList['grey'] = vec4(0.5, 0.5, 0.5, 1.0);//地轴
colorList['blue'] = vec4(0.0, 0.0, 0.8, 1.0);//地球

var subline = 180.0;//绘制轨道的顶点数

var ctm;//当前的模型变换矩阵，本例是放到shader里计算，其实放在这里
var ViewMatrix,ViewMatrixLoc; //当前的观察变换矩阵
var projectionMatrix, projectionMatrixLoc;//设置的投影变换矩阵


function triangle(a, b, c) { 
        pointsArray.push(a);
        pointsArray.push(b);      
        pointsArray.push(c);
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
        
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c);
    }
}

function tetrahedron(a, b, c, d, r, n) {
    a[3] /= r;
    b[3] /= r;
    c[3] /= r;
    d[3] /= r;
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function drawTrack(radiusRevo){
    var angel = Math.PI/subline;
    for(var i = 0; i < subline; i++){
        var p1 = vec4(radiusRevo*Math.cos(2*i*angel), 0.0, radiusRevo*Math.sin(2*i*angel), 1);
        var p2 = vec4(radiusRevo*Math.cos((2*i+1)*angel), 0.0, radiusRevo*Math.sin((2*i+1)*angel), 1);
        pointsArray.push(p1);
        pointsArray.push(p2);
    }
    pointsArray.push(vec4(0.0, 0.5, 0.0, 1.0));
    pointsArray.push(vec4(0.0, -0.5, 0.0, 1.0));
}



window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	canvas.width = document.body.clientWidth;   //获取画布宽度       
    canvas.height = document.body.clientHeight; //获取画布高度  
	gl.viewport( 0, 0, canvas.width, canvas.height );//设置视口大小同画布大小
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
   //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
   
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);

    tetrahedron(va, vb, vc, vd, radius_sun, numTimesToSubdivide); //太阳
    tetrahedron(va, vb, vc, vd, radius_earth, numTimesToSubdivide); //地球

    drawTrack(radiusRevo);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
	colorLOC = gl.getUniformLocation( program, "color" );
    
	ViewMatrixLoc = gl.getUniformLocation( program, "ViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
    thetaAutoLOC = gl.getUniformLocation( program, "thetaAuto" );
    thetaRevoLOC = gl.getUniformLocation( program, "thetaRevo" );
    radiusRevoLOC = gl.getUniformLocation( program, "radiusRevo" );
    document.getElementById("thetaSlider").onchange = function() {
        theta = event.srcElement.value* Math.PI/180.0;
    };
    document.getElementById("phiSlider").onchange = function() {
        phi = event.srcElement.value* Math.PI/180.0;
    };

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.cos(theta)*Math.sin(phi), radius*Math.sin(theta), radius*Math.cos(theta)*Math.cos(phi));
    ViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	           
    gl.uniformMatrix4fv(ViewMatrixLoc, false, flatten(ViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	
    var pointNumber = (pointsArray.length - subline*2 - 2)/2;

    //console.log("facenumber:", pointNumber, pointsArray.length/2);
    //绘制橙色-太阳
    gl.uniform1f(thetaAutoLOC, 0.0);
    gl.uniform1f(thetaRevoLOC, 0.0);
    gl.uniform1f(radiusRevoLOC, 0.0);
    gl.uniform4fv(colorLOC, colorList['orange']);
    gl.drawArrays( gl.LINE_LOOP, 0, pointNumber);

	//绘制黑色地球公转轨道
    gl.uniform4fv(colorLOC, colorList['black']);
    gl.drawArrays(gl.LINES, pointNumber*2, subline*2);

	//绘制蓝色的地球
    thetaRevo = (thetaRevo + speedRevo*Math.PI/180)%(2*Math.PI);
    thetaAuto = (thetaAuto + speedAuto*Math.PI/180)%(2*Math.PI);
    gl.uniform1f(thetaAutoLOC, thetaAuto);
    gl.uniform1f(thetaRevoLOC, thetaRevo);
    gl.uniform1f(radiusRevoLOC, radiusRevo);
    gl.uniform4fv(colorLOC, colorList['blue']);
    gl.drawArrays( gl.LINE_LOOP, pointNumber, pointNumber);
    
	//绘制灰色的地心轴
	gl.uniform4fv(colorLOC, colorList['grey']);
    gl.drawArrays( gl.LINES, (pointNumber+subline)*2, 2);
    
    //window.requestAnimFrame(render);
    setTimeout(
        function () {requestAnimFrame( render );}, 100  );
}

/*********绘图界面随窗口交互缩放而相应变化**************/
window.onresize = function(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewport( 0, 0, canvas.width, canvas.height );		
	render();
}
