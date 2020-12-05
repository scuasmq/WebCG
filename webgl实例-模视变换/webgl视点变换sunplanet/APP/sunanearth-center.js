/**
 * Created by BoxCatGarden on 2018/9/28.
 */
"use strict";

let engine;

//投影
const near = -2,
    far = 50,
    fovy = 60; // Field-of-view in Y direction angle (in degrees)

//球体顶点数组
let pointsArray = [],
    colorsArray = [],
    elementArray = [],

    sin = Math.sin,
    cos = Math.cos;

//generate the mesh
function ballmesh() {
    let dp = 15,
        dt = 15;

    //compute the positions of all points
    for (var p = dp; p < 180; p += dp) {
        var pr = p * GLEngine.rpd,
            rs = sin(pr),
            y = cos(pr);
        for (var t = 0; t < 360; t += dt) {
            var tr = t * GLEngine.rpd;
            pointsArray.push(rs * sin(tr), y, rs * cos(tr));
        }
    }
    pointsArray.push(0, 1, 0, 0, -1, 0);

    //generate the topology
    let pnum = Math.floor(180 / dp) - 1,
        tnum = Math.floor(360 / dt);
    for (var i = 1; i < pnum; ++i) {
        var lnst = i * tnum, st;
        for (var j = 1; j < tnum; ++j) {
            st = lnst + j;
            elementArray.push(st, st - tnum, st - tnum - 1);
            elementArray.push(st, st - tnum - 1, st - 1);
        }
        elementArray.push(lnst, lnst - tnum, st - tnum);
        elementArray.push(lnst, st - tnum, st);
    }
    ++st;
    for (j = 1; j < tnum; ++j) {
        elementArray.push(st, j - 1, j);
        elementArray.push(st + 1, lnst + j, lnst + j - 1);
    }
    elementArray.push(st, tnum - 1, 0);
    elementArray.push(st + 1, lnst, lnst + tnum - 1);
}

//fill the color
function fillcolor() {
    for (var i = 0; i < pointsArray.length; i += 3) {
        colorsArray.push(255, 0, 0, 255);
    }
    for (i = 0; i < pointsArray.length; i += 3) {
        colorsArray.push(255, 255, 255, 255);
    }
}

//change color for earth
function earthcolor() {
    var k = colorsArray.length >> 1;
    for (var i = 0; i < k; i += 4) {
        colorsArray[i] = 0;
        colorsArray[i + 2] = 255;
    }
}

//element type: byte or short
let eletype = 0,
//number of vertices in a ball
    arrayLength = 0;

let sun,
    earth,
    xcross;

window.addEventListener('load', function init(evt) {
    window.removeEventListener(evt.type, init, false);

    engine = new GLEngine("gl-canvas", document.body.clientWidth, document.body.offsetHeight * 0.97);
    var gl = engine.gl;
    gl.depthFunc(gl.LEQUAL);

    //highlight the outline
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 2);

    //generate the ball
    ballmesh();
    fillcolor();
    arrayLength = pointsArray.length / 3;
    //add outline
    pointsArray.push(...pointsArray);
    eletype = pointsArray.length * 2 / 3 > 255 ? engine.gl.UNSIGNED_SHORT : engine.gl.UNSIGNED_BYTE;

    //add sun and earth
    sun = new GLObject(
        pointsArray,
        elementArray,
        colorsArray,
        function (t, gl) {
            gl.drawElements(gl.TRIANGLES, this.maxNE, eletype, 0);
            gl.drawArrays(gl.LINE_LOOP, arrayLength, arrayLength);
            return 0;
        }
    );
    sun.setScale(0.7);
    engine.addToDraw(sun);

    earthcolor();
    pointsArray.length -= 6;
    pointsArray.push(0, -1, 0, 0, -2, 0, 0, 2, 0, 0, 1, 0);
    earth = new GLObject(
        pointsArray,
        elementArray,
        colorsArray,
        function (t, gl) {
            gl.drawElements(gl.TRIANGLES, this.maxNE, eletype, 0);
            gl.drawArrays(gl.LINE_LOOP, arrayLength, arrayLength + 2);
            var r = this.param.radious, th = this.param.theta * GLEngine.rpd;
            this.x = r * cos(th);
            this.z = r * sin(th);
            this.param.theta = (this.param.theta + 0.16) % 360;
            this.setRotRadian(this.aph, this.bet, this.gma - 60 * GLEngine.rpd, GLMat4.ROT_ABG);
            return 0;
        }
    );
    earth.setScale(0.2);
    earth.z = -1.3;
    earth.param.radious = 1.3;
    earth.param.theta = 270;
    earth.setRotDegree(90, 23.43, 0, GLMat4.ROT_ABG);
    engine.addToDraw(earth);

    xcross = new GLObject(
        [
            0, 0.02, near + 0.02,
            0, -0.02, near + 0.02,
            0.02, 0, near + 0.02,
            -0.02, 0, near + 0.02
        ],
        null,
        [
            255, 255, 255, 255,
            255, 255, 255, 255,
            255, 255, 255, 255,
            255, 255, 255, 255
        ],
        function (t, gl) {
            gl.drawArrays(gl.LINES, 0, 4);
        }
    );
    engine.addToDraw(xcross);

    //set camera
    engine.setCameraPos(0, 0, 0);
    engine.setProjectionRadian(0, 1, near, far);
    engine.setCameraScale(0.9);
    engine.setAspectFix(GLEngine.FIX_Y);

    engine.drawAnimation(30);
}, false);

/* ========================= control ====================== */
let persOn = false,
    rvel = 1, //rotation velocity in degree
    oldx, oldy;

window.addEventListener('load', function initCtrl(evt) {
    window.removeEventListener(evt.type, initCtrl, false);

    //turn on/off perspective
    persOn = false;
    window.addEventListener('keydown', evt => {
        switch (evt.keyCode) {
            case 87:
                movecenter(0, rvel);
                break;
            case 83:
                movecenter(0, -rvel);
                break;
            case 65:
                movecenter(rvel, 0);
                break;
            case 68:
                movecenter(-rvel, 0);
                break;
            case 81:
                if (!persOn) {
                    persOn = true;
                    engine.setProjectionDegree(fovy, 1, near, far);
                } else {
                    persOn = false;
                    engine.setProjectionDegree(0, 1, near, far);
                }
                break;
        }
    }, false);

    function movecenter(dx, dy) {
        engine.setCameraRotRadian(
            dy * rvel % 360 * GLEngine.rpd,
            dx * rvel % 360 * GLEngine.rpd,
            0,
            GLMat4.ROT_ZXY | GLMat4.ROT_PIN);
        xcross.setRotRadian(engine.aph, engine.bet, 0, GLMat4.ROT_ZXY | GLMat4.ROT_PIN);
    }

    //rotate the camera
    function mousemove(evt) {
        movecenter(evt.clientX - oldx, evt.clientY - oldy);
        oldx = evt.clientX;
        oldy = evt.clientY;
    }

    engine.canvas.addEventListener("mousedown", evt => {
        oldx = evt.clientX;
        oldy = evt.clientY;
        engine.canvas.addEventListener("mousemove", mousemove, false);
    }, false);

    engine.canvas.addEventListener("mouseup", evt => {
        engine.canvas.removeEventListener("mousemove", mousemove, false);
    }, false);
}, false);

//self-adapting
window.addEventListener('resize', evt => {
    engine.resize(document.body.clientWidth, document.body.offsetHeight * 0.97);
}, false);
