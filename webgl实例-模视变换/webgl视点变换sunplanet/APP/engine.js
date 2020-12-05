/**
 * Created by BoxCatGarden on 2018/11/17.
 */
"use strict";

const rpd = Math.PI / 180;

var GLMat4 = {
    I: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ],

    toIdentity(m) {
        for (var i = 0; i < 16; i += 4) {
            m[i] = 0;
            m[i + 1] = 0;
            m[i + 2] = 0;
            m[i + 3] = 0;
        }
        m[0] = m[5] = m[10] = m[15] = 1;
    },

    pos(m, x, y, z) {
        m[12] = x;
        m[13] = y;
        m[14] = z;
    },
    //here the get and set are just for integrity
    getx(m) {
        return m[12];
    },
    setx(m, v) {
        m[12] = v;
    },
    gety(m) {
        return m[13];
    },
    sety(m, v) {
        m[13] = v;
    },
    getz(m) {
        return m[14];
    },
    setz(m, v) {
        m[14] = v;
    },

    scale(m, t) {
        for (var i = 0; i < 12; i += 4) {
            m[i] *= t;
            m[i + 1] *= t;
            m[i + 2] *= t;
        }
    },

    rotate(m, s, aph, bet, gma, rotMode) {
        if (!(0 <= rotMode && rotMode <= 7))
            throw new RangeError("GLMat4.rotate: illegal rotMode.");

        var cos = Math.cos,
            sin = Math.sin,
            cg = cos(gma),
            sg = sin(gma),
            ca = cos(aph),
            sa = sin(aph),
            cb = cos(bet),
            sb = sin(bet),
            a11, a12, a13,
            a21, a22, a23,
            a31, a32, a33;
        if (rotMode & 1) {
            a11 = cg * ca - sg * cb * sa;
            a12 = sg * sb;
            a13 = cg * -sa - sg * cb * ca;
            a21 = sb * sa;
            a22 = cb;
            a23 = sb * ca;
            a31 = sg * ca + cg * cb * sa;
            a32 = cg * -sb;
            a33 = sg * -sa + cg * cb * ca;
        } else {
            a11 = cg * cb + sg * sa * sb;
            a12 = sg * ca;
            a13 = cg * -sb + sg * sa * cb;
            a21 = -sg * cb + cg * sa * sb;
            a22 = cg * ca;
            a23 = sg * sb + cg * sa * cb;
            a31 = ca * sb;
            a32 = -sa;
            a33 = ca * cb;
        }
        if (rotMode & 2) {
            let b1, b2, b3;
            if (rotMode & 4) {
                b1 = m[0], b2 = m[4], b3 = m[8];
                m[0] = a11 * b1 + a12 * b2 + a13 * b3;
                m[4] = a21 * b1 + a22 * b2 + a23 * b3;
                m[8] = a31 * b1 + a32 * b2 + a33 * b3;

                b1 = m[1], b2 = m[5], b3 = m[9];
                m[1] = a11 * b1 + a12 * b2 + a13 * b3;
                m[5] = a21 * b1 + a22 * b2 + a23 * b3;
                m[9] = a31 * b1 + a32 * b2 + a33 * b3;

                b1 = m[2], b2 = m[6], b3 = m[10];
                m[2] = a11 * b1 + a12 * b2 + a13 * b3;
                m[6] = a21 * b1 + a22 * b2 + a23 * b3;
                m[10] = a31 * b1 + a32 * b2 + a33 * b3;
            } else {
                b1 = m[0], b2 = m[1], b3 = m[2];
                m[0] = b1 * a11 + b2 * a21 + b3 * a31;
                m[1] = b1 * a12 + b2 * a22 + b3 * a32;
                m[2] = b1 * a13 + b2 * a23 + b3 * a33;

                b1 = m[4], b2 = m[5], b3 = m[6];
                m[4] = b1 * a11 + b2 * a21 + b3 * a31;
                m[5] = b1 * a12 + b2 * a22 + b3 * a32;
                m[6] = b1 * a13 + b2 * a23 + b3 * a33;

                b1 = m[8], b2 = m[9], b3 = m[10];
                m[8] = b1 * a11 + b2 * a21 + b3 * a31;
                m[9] = b1 * a12 + b2 * a22 + b3 * a32;
                m[10] = b1 * a13 + b2 * a23 + b3 * a33;
            }
        } else {
            m[0] = a11 * s;
            m[1] = a12 * s;
            m[2] = a13 * s;
            m[4] = a21 * s;
            m[5] = a22 * s;
            m[6] = a23 * s;
            m[8] = a31 * s;
            m[9] = a32 * s;
            m[10] = a33 * s;
        }
    }
};
Object.defineProperties(GLMat4, {
    ROT_ZXY: {value: 0},
    ROT_ABG: {value: 1},
    ROT_INC: {value: 2},
    ROT_PIN: {value: 6}
});

class GLObject {
    constructor(vertex, topology, color, draw, maxNumVer = 0, maxNumEle = 0) {
        if (!((vertex instanceof Array)
            && (!topology || (topology instanceof Array))
            && (!color || (color instanceof Array))))
            throw new TypeError("GLObject.GLObject: expect arrays as input.");
        this.vertex = [...vertex]; //copy
        this.maxNV = maxNumVer ? maxNumVer : vertex.length / 3;
        if (topology) {
            this.topology = [...topology]; //copy
            this.maxNE = maxNumEle ? maxNumEle : topology.length;
        }
        if (!(this.maxNV > 0 && (!topology || this.maxNE > 0)))
            throw new RangeError("GLObject.GLObject: need at least one vertex to draw");

        //copy color
        if (color) {
            this.color = [...color];
        } else {
            this.color = [];
            for (let i = 0; i < vertex.length; i += 3) {
                this.color.push(255, 255, 255, 255); //rgba: white
            }
        }

        //customized draw()
        if (draw && (draw instanceof Function))
            this.draw = draw;

        //model
        this.model = new Float32Array(16);
        this.scale = 1;
        this.aph = 0; //rotX
        this.bet = 0; //rotY
        this.gma = 0; //rotZ
        this.resetModel();

        //customized parameter
        this.param = {};
    }

    resetModel() {
        GLMat4.toIdentity(this.model);
        this.scale = 1;
        this.aph = 0; //rotX
        this.bet = 0; //rotY
        this.gma = 0; //rotZ
    }

    setPos(x, y, z) {
        GLMat4.pos(this.model, x, y, z);
    }

    get x() {
        return this.model[12];
    }

    set x(v) {
        this.model[12] = v;
    }

    get y() {
        return this.model[13];
    }

    set y(v) {
        this.model[13] = v;
    }

    get z() {
        return this.model[14];
    }

    set z(v) {
        this.model[14] = v;
    }

    setScale(s) {
        GLMat4.scale(this.model, s / this.scale);
        this.scale = s;
    }

    setUnitLength(l) {
        this.setScale(1 / l);
    }

    setRotRadian(aph, bet, gma, rotMode) {
        this.aph = aph; //rotX
        this.bet = bet; //rotY
        this.gma = gma; //rotZ
        GLMat4.rotate(this.model, this.scale, aph, bet, gma, rotMode);
    }

    setRotDegree(aph, bet, gma, rotMode) {
        this.setRotRadian(aph * rpd, bet * rpd, gma * rpd, rotMode);
    }

    draw(t, gl) {
        /* Draw with the data as you like, and change the data in need.
         * Please return a code from below.
         * code:
         *   0 no change;
         *   1 change vertex or color;
         *   2 change topology;
         *   3 change both.
         * You should not change buffer binding here.
         * t: current time in millisecond.
         * gl: WebGL reference. */
        /* Here is an example. Maybe you should replace it by adding draw()
         * to an instance of GLObject. */
        gl.drawElements(gl.TRIANGLES, this.maxNE, gl.UNSIGNED_BYTE, 0);
        //gl.drawArrays(gl.LINES, 0, this.maxNV);

        return 0;
    }
}

let initGL = canvas => {
        var gl = WebGLUtils.setupWebGL(canvas);
        if (!gl) {
            alert("WebGL is not available.");
            throw new ReferenceError("GLEngine.GLEngine: WebGL is not available.");
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1); //black
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        return gl;
    },
    initGLProgram = gl => {
        //load shaders and initialize attribute buffers
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
        return program;
    },

    writeBuffervc = (buf, v, c) => {
        var view = new DataView(buf);
        for (var i = 0, j = 0, k = 0; i < v.length; i += 3, j += 4, k += ELE_SIZE) {
            view.setFloat32(k, v[i], true);
            view.setFloat32(k + 4, v[i + 1], true);
            view.setFloat32(k + 8, v[i + 2], true);
            view.setInt8(k + 12, c[j]);
            view.setInt8(k + 13, c[j + 1]);
            view.setInt8(k + 14, c[j + 2]);
            view.setInt8(k + 15, c[j + 3]);
        }
    },
    writeBuffere = (buf, e) => {
        for (var i = 0; i < e.length; ++i) {
            buf[i] = e[i];
        }
    };

const ELE_SIZE = 16;

let computeViewMatrix = (m, a, b) => {
        var a11 = a[0], a12 = a[4], a13 = a[8],
            a21 = a[1], a22 = a[5], a23 = a[9],
            a31 = a[2], a32 = a[6], a33 = a[10],
            x = -a[12], y = -a[13], z = -a[14],
            a41 = x * a11 + y * a21 + z * a31,
            a42 = x * a12 + y * a22 + z * a32,
            a43 = x * a13 + y * a23 + z * a33;
        var b1 = b[0], b2, b3, b4;
        m[0] = a11 * b1;
        m[4] = a21 * b1;
        m[8] = a31 * b1;
        m[12] = a41 * b1;

        b2 = b[5];
        m[1] = a12 * b2;
        m[5] = a22 * b2;
        m[9] = a32 * b2;
        m[13] = a42 * b2;

        b3 = b[10], b4 = b[14];
        m[2] = a13 * b3;
        m[6] = a23 * b3;
        m[10] = a33 * b3;
        m[14] = a43 * b3 + b4;

        b3 = b[11], b4 = b[15];
        m[3] = a13 * b3;
        m[7] = a23 * b3;
        m[11] = a33 * b3;
        m[15] = a43 * b3 + b4;
    },
    drawAtOnce = (t, engine) => {
        var gl = engine.gl,
            model = engine.glModel;
        //clear the canvas
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        //set the matrix projection and matrix view
        computeViewMatrix(engine.view, engine.camview, engine.projection);
        //gl.uniformMatrix4fv(engine.glProj, false, engine.projection);
        gl.uniformMatrix4fv(engine.glView, false, engine.view);

        //start drawing queue
        for (var e of engine.queue) {
            //set model
            gl.uniformMatrix4fv(model, false, e.obj.model);

            gl.bindBuffer(gl.ARRAY_BUFFER, e.ab);
            if (e.eb) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, e.eb);
            gl.vertexAttribPointer(engine.glPos, 3, gl.FLOAT, false, ELE_SIZE, 0);
            gl.vertexAttribPointer(engine.glColor, 4, gl.UNSIGNED_BYTE, true, ELE_SIZE, 12);

            var code = e.obj.draw(t, gl);
            //if change, then update.
            if (code & 1) {
                writeBuffervc(e.buf, e.obj.vertex, e.obj.color);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, e.buf);
            }
            if (code & 2) {
                writeBuffere(e.ebuf, e.obj.topology);
                gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, e.ebuf);
            }
        }
    };


class GLEngine {
    constructor(canvasId, width, height) {
        //gl
        var canvas = document.getElementById(canvasId);
        this.canvas = canvas;
        canvas.width = width;
        canvas.height = height;
        this.aspFixMode = GLEngine.FIX_X;
        this.aspectFix = height / width;

        var gl =
                this.gl = initGL(canvas),
            program =
                this.glProgram = initGLProgram(this.gl);
        //this.glProj = gl.getUniformLocation(program, "projection");
        this.glView = gl.getUniformLocation(program, "view");
        this.glModel = gl.getUniformLocation(program, "model");
        this.glPos = gl.getAttribLocation(program, "pos");
        gl.enableVertexAttribArray(this.glPos);
        this.glColor = gl.getAttribLocation(program, "color");
        gl.enableVertexAttribArray(this.glColor);

        //draw
        this.queue = [];

        //projection
        this.projection = [];//new Float32Array(16);
        GLMat4.toIdentity(this.projection);
        /* Initialized as parallel projection.
         * fov = 0 to get a infinity focal distance,
         * at which the light is parallel when in perspective projection. */
        /* unnecessary but more readable initializing of properties */
        this.fov = 0;
        this.ar = 1;
        this.near = -1;
        this.far = 1;
        this.setProjectionRadian(0, 1, -1, 1);

        //camera
        this.camview = [];//new Float32Array(16);
        this.scale = 1;
        this.aph = 0; //rotX
        this.bet = 0; //rotY
        this.gma = 0; //rotZ
        this.resetCamera();

        //view
        this.view = new Float32Array(16);
        GLMat4.toIdentity(this.view);
    }

    /**********************/
    /* GL                 */
    /**********************/
    setAspectFix(fixMode) {
        if (fixMode !== GLEngine.FIX_X && fixMode !== GLEngine.FIX_Y && fixMode !== GLEngine.FIX_NULL)
            throw new RangeError("GLEngine.setAspectFix: expect FIX_X, FIX_Y, or FIX_NULL as fixMode");

        var oldAsp = this.aspectFix;
        this.aspectFix = fixMode
            ? fixMode === GLEngine.FIX_X
                ? this.canvas.height / this.canvas.width
                : this.canvas.width / this.canvas.height
            : 1;
        if (this.aspectFix !== oldAsp || this.aspFixMode !== fixMode) {
            this.aspFixMode = fixMode;
            this.setProjectionRadian(this.fov, this.ar, this.near, this.far);
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
        if (this.aspFixMode)
            this.setAspectFix(this.aspFixMode);
    }

    addToDraw(globj) {
        var gl = this.gl,
            ab = gl.createBuffer(),
            buf = new ArrayBuffer(globj.maxNV * ELE_SIZE);
        //initialize the buffer
        writeBuffervc(buf, globj.vertex, globj.color);
        gl.bindBuffer(gl.ARRAY_BUFFER, ab);
        gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);

        if (globj.topology) {
            var eb = gl.createBuffer(),
                ebuf = globj.maxNV <= 255 ? new Uint8Array(globj.maxNE) : new Uint16Array(globj.maxNE);
            writeBuffere(ebuf, globj.topology);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eb);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ebuf, gl.STATIC_DRAW);
        }

        //add to drawing queue
        this.queue.push({
            obj: globj,
            ab: ab,
            eb: eb,
            buf: buf,
            ebuf: ebuf
        });
    }

    cancelDraw(globj) {
        var q = this.queue;
        for (var i = 0; i < q.length && q[i].obj !== globj; ++i);
        if (i < q.length) {
            var e = q[i];
            this.gl.deleteBuffer(e.ab);
            if (e.eb) this.gl.deleteBudder(e.eb);
            q.splice(i, 1);
        }
    }

    drawFrame() {
        if (!this.frameRender) {
            this.frameRender = t => {
                drawAtOnce(t, this);
            };
        }
        window.requestAnimationFrame(this.frameRender);
    }

    drawAnimation(dur) {
        this.dur = dur;
        if (!this.animRender) {
            this.animRequest = () => {
                window.requestAnimationFrame(this.animRender);
            };
            this.animRender = t => {
                drawAtOnce(t, this);
                if (this.dur > 0)
                    setTimeout(this.animRequest, this.dur);
            };
        }
        if (dur > 0)
            window.requestAnimationFrame(this.animRender);
    }

    /**********************/
    /* Camera             */
    /**********************/
    resetCamera() {
        GLMat4.toIdentity(this.camview);
        this.scale = 1;
        this.aph = 0; //rotX
        this.bet = 0; //rotY
        this.gma = 0; //rotZ
    }

    setCameraPos(x, y, z) {
        GLMat4.pos(this.camview, x, y, z);
    }

    get camerax() {
        return this.camview[12];
    }

    set camerax(v) {
        this.camview[12] = v;
    }

    get cameray() {
        return this.camview[13];
    }

    set cameray(v) {
        this.camview[13] = v;
    }

    get cameraz() {
        return this.camview[14];
    }

    set cameraz(v) {
        this.camview[14] = v;
    }

    setCameraScale(s) {
        GLMat4.scale(this.camview, s / this.scale);
        this.scale = s;
    }

    setCameraUnitLength(l) {
        this.setCameraScale(1 / l);
    }

    setCameraRotRadian(aph, bet, gma, rotMode) {
        this.aph = aph;
        this.bet = bet;
        this.gma = gma;
        GLMat4.rotate(this.camview, this.scale, aph, bet, gma, rotMode);
    }

    setCameraRotDegree(aph, bet, gma, rotMode) {
        this.setCameraRotRadian(aph * rpd, bet * rpd, gma * rpd, rotMode);
    }

    /**********************/
    /* Projection         */
    /**********************/
    /* fov = 0 to get parallel projection that has an infinity focal distance,
     * where the light is parallel when in perspective projection. */
    setProjectionRadian(fov, ar, near, far) {
        this.fov = fov;
        this.ar = ar;
        this.near = near;
        this.far = far;

        var r = 1 / (near - far),
            m = this.projection;
        if (fov) {
            var f = 1 / Math.tan(fov / 2),
                k = f - near;
            m[0] = f / ar;
            m[5] = f;
            m[10] = -(2 * k + near + far) * r;
            m[11] = 1;
            m[14] = (2 * near * far + k * (near + far)) * r;
            m[15] = k;
        } else {
            m[0] = 1 / ar;
            m[5] = 1;
            m[10] = -2 * r;
            m[11] = 0;
            m[14] = (near + far) * r;
            m[15] = 1;
        }
        if (this.aspFixMode === GLEngine.FIX_X) {
            m[0] *= this.aspectFix;
        } else {
            m[5] *= this.aspectFix;
        }
    }

    //fov in degree
    setProjectionDegree(fov, ar, near, far) {
        this.setProjectionRadian(fov * rpd, ar, near, far);
    }
}
Object.defineProperties(GLEngine, {
    rpd: {value: rpd},
    FIX_NULL: {value: 0},
    FIX_X: {value: 1},
    FIX_Y: {value: 2}
});