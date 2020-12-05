var points = [];
var colors = [];

// 常量颜色数组
var VertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 0.0, 0.5, 0.0, 1.0 ),  // light-green        
    vec4( 0.0, 0.0, 0.5, 1.0 ),  // light-blue
    vec4( 0.5, 0.0, 0.0, 1.0 ),  // light-red
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.5, 0.5, 0.5, 1.0 )   // grey
];

/****************************************************
 * 生成场景中坐标轴模型：X轴，Y轴，Z轴的顶点位置和颜色
 ****************************************************/
function vertextsXYZ()
{
    var len = 0.9;
    var XYZaxis = [
        vec4(-len,  0.0,  0.0, 1.0), // X
        vec4( len,  0.0,  0.0, 1.0),
        vec4( len, 0.0, 0.0, 1.0),
        vec4(len-0.01, 0.01, 0.0, 1.0),
        vec4(len, 0.0, 0.0, 1.0),
        vec4(len-0.01, -0.01, 0.0, 1.0),
        
        vec4( 0.0, -len,  0.0, 1.0), // Y
        vec4( 0.0,  len,  0.0, 1.0),
        vec4( 0.0, len,0.0, 1.0),
        vec4(0.01, len-0.01, 0.0, 1.0),
        vec4(0.0, len, 0.0, 1.0),
        vec4(-0.01, len-0.01, 0.0, 1.0),
        
        vec4( 0.0,  0.0, -len, 1.0), // Z
        vec4( 0.0,  0.0,  len, 1.0),
        vec4( 0.0, 0.0, len, 1.0),
        vec4( 0.01, 0.0,  len-0.01, 1.0),
        vec4( 0.0, 0.0, len, 1.0),
        vec4( -0.01,0.0,  len-0.01, 1.0)
    ];
    
    var XYZColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
    ];
    
    for (var i = 0; i < XYZaxis.length; i++){    
        points.push(XYZaxis[i]);
        var j = Math.trunc(i/6); // JS取整运算Math.trunc//每个方向轴用6个顶点
        colors.push(XYZColors[j]);
    }
}

/****************************************************
 * 立方体模型生成
 ****************************************************/
var vertexMC = 0.5; // 顶点沿轴到原点的最远距离
function generateCube()
{
    quad( 1, 0, 3, 2 ); //Z正-前
    quad( 4, 5, 6, 7 ); //Z负-后
    
    quad( 2, 3, 7, 6 ); //X正-右
    quad( 5, 4, 0, 1 ); //X负-左
    
    quad( 6, 5, 1, 2 ); //Y正-上
    quad( 3, 0, 4, 7 ); //Y负-下
} 

function quad(a, b, c, d) 
{
    var vertices = [
        vec4( -vertexMC, -vertexMC,  vertexMC, 1.0 ), //Z正前面左下角点V0，顺时针四点0~3
        vec4( -vertexMC,  vertexMC,  vertexMC, 1.0 ),
        vec4(  vertexMC,  vertexMC,  vertexMC, 1.0 ),
        vec4(  vertexMC, -vertexMC,  vertexMC, 1.0 ),
        vec4( -vertexMC, -vertexMC, -vertexMC, 1.0 ),   //Z负后面左下角点V4，顺时针四点4~7
        vec4( -vertexMC,  vertexMC, -vertexMC, 1.0 ),
        vec4(  vertexMC,  vertexMC, -vertexMC, 1.0 ),
        vec4(  vertexMC, -vertexMC, -vertexMC, 1.0 )
    ];

    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        points.push(vertices[indices[i]]);  // 保存一个顶点坐标到定点给数组vertices中        
        colors.push(VertexColors[a]); // 立方体每面为单色
    }
}

/****************************************************
 * 球体模型生成：由四面体递归生成
 ****************************************************/
function generateSphere(){
    // 细分次数和顶点
    var numTimesToSubdivide = 5; // 球体细分次数
    var va = vec4(0.0, 0.0, -1.0, 1.0);
    var vb = vec4(0.0, 0.942809, 0.333333, 1.0);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1.0);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1.0);
    
    function triangle(a, b, c) {
        points.push(a);
        points.push(b);
        points.push(c);
        
        colors.push(vec4(1.0, 0.0, 0.0, 1.0));
        colors.push(vec4(0.0, 1.0, 0.0, 1.0));
        colors.push(vec4(0.0, 0.0, 1.0, 1.0));
    };

    function divideTriangle(a, b, c, count) {
        if ( count > 0 ) {
            var ab = mix( a, b, 0.5);
            var ac = mix( a, c, 0.5);
            var bc = mix( b, c, 0.5);

            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);

            divideTriangle(  a, ab, ac, count - 1 );
            divideTriangle( ab,  b, bc, count - 1 );
            divideTriangle( bc,  c, ac, count - 1 );
            divideTriangle( ab, bc, ac, count - 1 );
        }
        else {
            triangle( a, b, c );
        }
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    };

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide); // 递归细分
}

/****************************************************
* 墨西哥帽模型生成，等距细分得z,x，函数计算得到Y
****************************************************/
function generateHat()
{
    
    // 这里(x,z)是区域（-1，-1）到（1，1）平均划分成nRows*nColumns得到的交点坐标；
    var nRows = 11; // 线数，实际格数=nRows-1,
    var nColumns = 11; // 线数,实际格数=nColumns-1

    // 嵌套数组用于存储网格上对应点的高值(y)值。
    var data = new Array(nRows);
    for(var i = 0; i < nRows; i++) {
        data[i] = new Array(nColumns);
    };
    
    // 遍历网格上每个点，求该点的高度
    for(var i = 0;i < nRows; i++) {
        var x = 2 * i / (nRows - 1) - 1.0; 
        for(var j = 0; j < nColumns; j++) {
            var z = 2 * j / (nRows - 1) - 1.0;
            var r = 2 * Math.PI * Math.sqrt(x*x + z*z);// 乘以2PI后，帽子边缘才会翘 
            if(r){
                data[i][j] = Math.sin(r)/(r);
            }else{
                data[i][j] = 1;
            }
        }
    }
    
    // 顶点数据按每四个片元构成一个四边形网格图元，存放到顶点数组中,使用points.push(),colors.push()
    // 网格面的行/列数 比 网格线的行/列数 少 1，这样模型会以Y轴对称
	ncell=nRows - 1;  //ncell=nColumns-1;这里行列相同，统一用ncell
    for(var i = 0; i < ncell; i++) {
        for(var j = 0; j < nColumns -1; j++) {
            points.push( vec4(2*i/ncell-1, data[i][j], 2*j/ncell-1, 1.0));
            colors.push( VertexColors[i%8]);
            points.push( vec4(2*(i+1)/ncell-1, data[i+1][j], 2*j/ncell-1, 1.0));
            colors.push( VertexColors[i%8]);
            points.push( vec4(2*(i+1)/ncell-1, data[i+1][j+1], 2*(j+1)/ncell-1, 1.0));
            colors.push( VertexColors[i%8]);
            points.push( vec4(2*i/ncell-1, data[i][j], 2*j/(nColumns-1)-1, 1.0));
            colors.push( VertexColors[j%8]);
            points.push( vec4(2*(i+1)/ncell-1, data[i+1][j+1], 2*(j+1)/ncell-1, 1.0));
            colors.push( VertexColors[j%8]);
            points.push( vec4(2*i/ncell-1, data[i][j+1], 2*(j+1)/ncell-1, 1.0) );
            colors.push( VertexColors[j%8]);
        }  
    }
	
}

