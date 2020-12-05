/*
 * 导语
 * 本次实验只需完成四个算法
 */

/*
 * 目标
 * 你需要完成以下光栅化算法
 * 1. Bresenham 线段光栅化算法
 * 2. 中点 圆圈光栅化算法
 * 3. 有序边表 多边形光栅化算法
 * 3. 任意一种 三次贝塞尔曲线光栅化算法
 * 需要编写的算法的位置已添加TODO和引导！
 */

/*
 * 注：大部分WebGL变量、函数可在此处查询：https://developer.mozilla.org/zh-CN/
 * 注：如果遇到困难，请和老师或助教沟通，或是咨询同学！加油！
 */

var canvas;
var gl;
var program;

var shapes = []; // 存储图形
var rasterPoints = []; // 存储像素点的位置

const CanvasResolution = { width: 200, height: 150 }; // 画布的分辨率，为了清楚看见每个像素，分辨率应该设置得比较小

var drawType = "line"; // 当前绘制类型
var isDraging = false;
var isDrawingPolygon = false;
var isDrawingCurve = 0;

window.onload = function init() {
  // 初始化WebGL和Canvas画布
  canvas = document.getElementById("canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  canvas.width = CanvasResolution.width; // 设置画布宽度
  canvas.height = CanvasResolution.height; // 设置画布高度
  gl.viewport(0, 0, canvas.width, canvas.height); //设置视口大小同画布大小
  gl.clearColor(1.0, 1.0, 1.0, 1.0); //设置背景色
  gl.clear(gl.COLOR_BUFFER_BIT); //用背景色填充帧缓存-清屏

  // 加载顶点着色器和片元着色器
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // 初始化顶点位置缓冲，顶点颜色缓冲
  // 缓冲的数据会被传输到着色器对应的变量当中
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // 事件
  // 添加画布的鼠标事件
  // 三个事件（鼠标按下、鼠标移动、鼠标松开）用于实现橡皮条交互
  canvas.addEventListener("mousedown", function (event) {
    if (event.which == 1) {
      var curPoint = vec2(
        Math.round(
          (event.offsetX / canvas.clientWidth) * CanvasResolution.width
        ),
        Math.round(
          (1 - event.offsetY / canvas.clientHeight) * CanvasResolution.height
        )
      );
      if (drawType == "line") {
        isDraging = true;
        shapes.push({ type: drawType, start: curPoint, end: curPoint });
      } else if (drawType == "circle") {
        isDraging = true;
        shapes.push({ type: drawType, center: curPoint, radius: 0 });
      } else if (drawType == "polygon") {
        if (isDrawingPolygon) {
          var pointIndex = shapes[shapes.length - 1].points.length;
          shapes[shapes.length - 1].points[pointIndex] = curPoint;
        } else {
          isDrawingPolygon = true;
          shapes.push({ type: drawType, points: [curPoint, curPoint] });
        }
      } else if (drawType == "curve") {
        if (isDrawingCurve == 0) {
          // 第一次点击
          isDrawingCurve = 1;
          shapes.push({
            type: drawType,
            p1: curPoint,
            p2: null,
            p3: null,
            p4: curPoint,
            isComplete: false,
          });
        } else if (isDrawingCurve == 1) {
          isDrawingCurve = 2;
          shapes[shapes.length - 1].p4 = curPoint;
          shapes[shapes.length - 1].p2 = curPoint;
        } else if (isDrawingCurve == 2) {
          isDrawingCurve = 3;
          shapes[shapes.length - 1].p2 = curPoint;
          shapes[shapes.length - 1].p3 = curPoint;
        } else if (isDrawingCurve == 3) {
          isDrawingCurve = 0;
          shapes[shapes.length - 1].isComplete = true;
          shapes[shapes.length - 1].p3 = curPoint;
        }
      }
    } else if (event.which == 2) {
      if (isDrawingPolygon) {
        shapes[shapes.length - 1].points.push(curPoint);
        isDrawingPolygon = false;
      }
    }
  });

  canvas.addEventListener("dblclick", function (event) {
    if (event.which != 1) return;
    var curPoint = vec2(
      Math.round((event.offsetX / canvas.clientWidth) * CanvasResolution.width),
      Math.round(
        (1 - event.offsetY / canvas.clientHeight) * CanvasResolution.height
      )
    );
    if (isDrawingPolygon) {
      shapes[shapes.length - 1].points.push(curPoint);
      isDrawingPolygon = false;
    }
  });

  canvas.addEventListener("mousemove", function (event) {
    var curPoint = vec2(
      Math.round((event.offsetX / canvas.clientWidth) * CanvasResolution.width),
      Math.round(
        (1 - event.offsetY / canvas.clientHeight) * CanvasResolution.height
      )
    );
    if (drawType == "line") {
      if (!isDraging) return;
      shapes[shapes.length - 1].end = curPoint;
    } else if (drawType == "circle") {
      if (!isDraging) return;
      shapes[shapes.length - 1].radius = length(
        subtract(shapes[shapes.length - 1].center, curPoint)
      );
    } else if (drawType == "polygon") {
      if (!isDrawingPolygon) return;
      var points = shapes[shapes.length - 1].points;
      points[points.length - 1] = curPoint;
    } else if (drawType == "curve") {
      if (isDrawingCurve == 0) return;
      else if (isDrawingCurve == 1) {
        shapes[shapes.length - 1].p4 = curPoint;
      } else if (isDrawingCurve == 2) {
        shapes[shapes.length - 1].p2 = curPoint;
      } else if (isDrawingCurve == 3) {
        shapes[shapes.length - 1].p3 = curPoint;
      }
    }
  });

  canvas.addEventListener("mouseup", function (event) {
    if (event.which != 1) return;
    isDraging = false;
  });

  // 注册键盘事件
  window.onkeydown = function (e) {
    let code = e.keyCode;
    switch (code) {
      case 32: // 空格-清屏并清空数据
        clearClickData();
        break;
    }
  };

  // 注册窗口大小改变事件
  window.onresize = function () {
    canvas.width = CanvasResolution.width;
    canvas.height = CanvasResolution.height;
    gl.viewport(0, 0, canvas.width, canvas.height);

    canvas.clientHeight =
      (canvas.clientWidth / CanvasResolution.width) * CanvasResolution.height;
    gl.clear(gl.COLOR_BUFFER_BIT); //用背景色填充帧缓存
  };

  render();
};

// 渲染函数，会渲染shapes里的图形
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  rasterPoints = [];
  for (shape of shapes) {
    switch (shape.type) {
      case "line": {
        drawLine(shape.start, shape.end);
        break;
      }
      case "circle": {
        drawCircle(shape.center, shape.radius);
        break;
      }
      case "polygon": {
        drawPolygon(shape.points);
        break;
      }
      case "curve": {
        if (shape.p2 == null && shape.p3 == null) {
          // 只有两个点时，绘制直线
          drawLine(shape.p1, shape.p4);
          break;
        } else if (shape.p3 == null) {
          // 有三个点时，假设最后一个控制点与第一个控制点对称
          var a = subtract(shape.p2, shape.p1);
          var b = subtract(shape.p4, shape.p1);
          var d1 = dot(a, b) / length(b);
          var p3 = add(shape.p2, scale(length(b) - 2 * d1, normalize(b)));
          p3[0] = Math.round(p3[0]);
          p3[1] = Math.round(p3[1]);
          drawLine(shape.p1, shape.p2);
          drawLine(p3, shape.p4);
          drawCurve(shape.p1, shape.p2, p3, shape.p4);
        } else {
          if (!shape.isComplete) {
            // 未完成编辑时参考线
            drawLine(shape.p1, shape.p2);
            drawLine(shape.p3, shape.p4);
          }
          drawCurve(shape.p1, shape.p2, shape.p3, shape.p4);
        }
        break;
      }
    }
  }

  // 重新发送数据
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(rasterPoints), gl.STATIC_DRAW);

  // 绘制软光栅生成的像素点
  gl.drawArrays(gl.POINTS, 0, rasterPoints.length);

  window.requestAnimFrame(render);
}

// 设置当前绘制的类型
function setDrawType(type) {
  drawType = type;
  var tipElement = document.getElementById("tip");
  switch (type) {
    case "line": {
      tipElement.innerText = "按住鼠标左键拖拽来绘制线";
      break;
    }
    case "circle": {
      tipElement.innerText = "按住鼠标左键拖拽来绘制圆";
      break;
    }
    case "polygon": {
      tipElement.innerText =
        "点击鼠标左键来添加多边形的顶点，双击结束多边形编辑";
      break;
    }
    case "curve": {
      tipElement.innerText =
        "三次贝塞尔曲线，点击鼠标左键来依次添加四个控制点，前两个点为起始和终止点(p1, p4)，后两个点为剩余两个控制点(p2, p3)";
      break;
    }
  }
  if (isDrawingPolygon || isDrawingCurve != 0) {
    isDrawingPolygon = false;
    isDrawingCurve = 0;
    shapes.pop();
  }
}

function clearClickData() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  shapes = [];
}

// 添加像素到画布
function addPixel(x, y) {
  x = Math.round(x) + 0.5;
  y = Math.round(y) + 0.5;
  rasterPoints.push(
    vec2(
      (x / CanvasResolution.width) * 2 - 1,
      (y / CanvasResolution.height) * 2 - 1
    )
  );
}

// TODO: 软光栅绘制线段
function drawLine(p1, p2) {
  /*
   * 目标：
   *   使用Bresenham算法，对给定的线段进行光栅化
   * 输入：
   *   p1和p2，都是vec2类型（本质是一个含两个元素的二维数组），代表了线段的两个顶点
   * 注：
   *   画布的大小为200 * 150（对应CanvasResolution变量）
   *   使用addPixel(x, y)函数来添加像素点到画布，你无需搭建渲染管线！
   * 例：
   *   如p1=[0,0], p2=[0,2]
   *   你应该调用addPixel(0, 0), addPixel(0, 1), addPixel(0, 2)来完成本次光栅化
   */
  var x1 = p1[0],
    y1 = p1[1];
  var x2 = p2[0],
    y2 = p2[1];
  var dy = y2 - y1,
    dx = x2 - x1;
  var dx2 = 2 * Math.abs(dx),
    dy2 = 2 * Math.abs(dy);
  var crit;
  var x = x1;
  var y = y1;
  var xlen = Math.abs(dx);
  var ylen = Math.abs(dy);
  var etx = dx > 0 ? 1 : -1;
  var ety = dy > 0 ? 1 : -1;
  /// 下方代码用以绘制线段
  // crit = dx-2*dy;
  // if(xlen>=ylen){
  //     for(var i =0;i<xlen;++i){
  //         if(crit>0){
  //             y -= 1;
  //             crit -= 2*dx;
  //         }
  //         crit -=2*dy;
  //         console.log(crit)
  //         addPixel(++x,y);
  //     }
  // }
  if (xlen >= ylen) {
    crit = -dx;
    for (x = x1; x != x2 + etx; x += etx) {
      crit += dy2;
      if (crit > 0) {
        y += ety;
        crit = crit - dx2;
      }
      addPixel(x, y);
    }
  } else {
    crit = -dy;
    for (y = y1; y != y2 + ety; y += ety) {
      crit += dx2;
      if (crit > 0) {
        x += etx;
        crit = crit - dy2;
      }
      addPixel(x, y);
    }
  }
  /// 上方代码用以绘制线段
}

function CirclePoints(x, y, x0, y0) {
  addPixel(x, y);
  addPixel(y - (y0 - x0), x + (y0 - x0));
  addPixel(y - (y0 - x0), x0 + y0 - x);
  addPixel(x, 2 * y0 - y);
  addPixel(2 * x0 - x, 2 * y0 - y);
  addPixel(x0 + y0 - y, x0 + y0 - x);
  addPixel(x0 + y0 - y, x + (y0 - x0));
  addPixel(2 * x0 - x, y);
}

// TODO: 软光栅绘制圆圈
function drawCircle(center, radius) {
  /*
   * 目标：
   *   使用中点法，对给定的圆进行光栅化
   * 输入：
   *   center是vec2类型，代表了圆的圆心，radius是圆的半径
   * 注：
   *   绘制圆圈只需要绘制外圈，无需填充圆圈内部像素
   * 提示：
   *   只需要计算出圆的八分之一，剩余的点可通过对称性计算得到
   */
  var centerx = center[0],
    centery = center[1];

  /// 下方代码用以绘制圆圈
  var x = 0,
    y = radius,
    d = 1.25 - radius;
  while (x < y) {
    CirclePoints(x + centerx, y + centery, centerx, centery);
    if (d <= 0) d += 2 * x + 3;
    else {
      d += 2 * (x - y) + 5;
      --y;
    }
    x++;
  }
  /// 上方代码用以绘制圆圈
}


function drawIntersection(x1, x2, y) {
  for (var i = x1; i <= x2; i++) {
    addPixel(i, y);
  }
}
// TODO: 软光栅绘制多边形
function drawPolygon(points) {
  /*
   * 目标：
   *   使用有序边表法，对给定的多边形进行光栅化
   * 输入：
   *   points是一个数组，数组每个元素都是一个vec2，代表多边形的一个顶点，这些顶点是按顺序给出的
   * 提示：
   *   首先建立边表ET，然后遍历y进行扫描，每一轮扫描中，你需要使用动态边表AET，进行包括删除无用边、求交、添加新边、排序、配对和填充的操作
   */

  /// 下方代码用以绘制多边形
  /// 绘制顶点
  var pCnt = points.length
  for (var h = 0; h < pCnt; h++) {
    addPixel(points[h][0], points[h][1]);
  }
  //建立边表
  var ET = [];
  for (var i = 0; i < 201; ++i) {
    ET[i] = [];
  }
  var minY = 201
  var maxY = -1
  for (var i = 0; i < pCnt; i++) {
    var nxt = (i + 1) % pCnt;
    if (points[i][1] != points[nxt][1]) {
      var p1 = points[i][1] < points[nxt][1] ? points[i] : points[nxt];
      var p2 = points[i][1] > points[nxt][1] ? points[i] : points[nxt];
      var edge = {
        x: p1[0],
        ymax: p2[1],
        m: (p1[0] - p2[0]) / (p1[1] - p2[1])
      }
      var ymin = p1[1];
      ET[ymin].push(edge);
      minY = Math.min(minY, ymin);
      maxY = Math.max(maxY, p2[1]);
    }
  }
  var AET = [];
  for (var y = minY; y <= maxY; ++y) {
    //删除与求交
    for (i = AET.length-1; i >=0; --i) {
      var e = AET[i];
      if (e.ymax <= y) {
        AET.splice(i, 1)
      } else {
        AET[i].x += AET[i].m;
      }
    }
    //添加新边
    for (var j = 0; j < ET[y].length; ++j) {
      AET.push(ET[y][j]);
    }
    // 排序
    AET.sort(function (a, b) {
      if (a.x == b.x) return a.m - b.m;
      else return a.x - b.x;
    })
    for (var i = 0; i < AET.length; i += 2) {
      drawIntersection(AET[i].x, AET[i + 1].x, y);
    }
  }
}

// TODO: 软光栅绘制三次贝塞尔曲线
function getPoint(p1, p2, p3, p4, t) {
  var a =
    Math.pow(1 - t, 3) * p1[0] +
    3 * t * Math.pow(1 - t, 2) * p2[0] +
    3 * t * t * (1 - t) * p3[0] +
    Math.pow(t, 3) * p4[0];
  var b =
    Math.pow(1 - t, 3) * p1[1] +
    3 * t * Math.pow(1 - t, 2) * p2[1] +
    3 * t * t * (1 - t) * p3[1] +
    Math.pow(t, 3) * p4[1];
  return vec2(a, b);
}

function drawCurve(p1, p2, p3, p4) {
  /*
   * 目标：
   *   对给定的三次贝塞尔曲线进行光栅化
   * 输入：
   *   p1,p2,p3,p4都是vec2，代表了三次贝塞尔曲线的四个控制点
   * 注：
   *   绘制曲线的参考线依赖于drawLine，请先完成drawLine线段光栅化再完成drawCurve
   * 提示：
   *   化曲为直：如果两点距离足够短，可以用线段代替曲线
   *   光栅化有以下方法，选择一个即可：
   *   1. 简单光栅化：通过参数方程，取采样点并算出函数值，最后把这些点连起来
   *   2. Horner方法：前向差分法，只适合均匀网络，容易累积数值误差
   *   3. de Casteljau递归算法：递归得将一条贝塞尔曲线分成两个贝塞尔曲线，并得到新曲线的控制点，递归下去最终把短曲线当作直线绘制
   */

  /// 下方代码用以绘制曲线
  for (var t = 0; t <= 1; t += 0.005) {
    var p = getPoint(p1, p2, p3, p4, t);
    addPixel(p[0], p[1]);
    console.log(p);
  }
  /// 上方代码用以绘制曲线
}
