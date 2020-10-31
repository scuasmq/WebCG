Chapter 4 programs
========================================================================================================================

书上：例子一让立方体旋转起来，P150，这里的模-视变换矩阵是立方体绕X轴，Y轴和Z轴的旋转变换矩阵的级联（欧拉角序列）。
这是一个非平滑的变换，不具有实际意义，只是讲解旋转可以由多个变换组合得到。



//第一种方法（未提供代码）：
  应用程序中生成一个新的模视变换矩阵，并通过将该矩阵应用于顶点数据计算来获得变换后的新顶点数据，
  之后必须把新的顶点数据发送到GPU，直接在着色器中赋值.
  这种方法效率很低，因为它从CPU向GPUT发送顶点数组。--将变换后计算好的新顶点发给每个着色器


--------------------------------------------------------------------------

//第二章方法（未提供代码）：
  应用程序中计算新的模-视变换矩阵，
  并将变换矩阵发送到顶点着色器中，最后在顶点着色器中将这个模-视变换矩阵应用于顶点数据。--组合变换矩阵发送给每个着色器

--------------------------------------------------------------------------

//第三种方法：
  应用程序中只将当前累积的三个旋转角度发送到顶点着色器，
  然后在着色器中重新计算模-视变换矩阵，并将其应用于该顶点数据做变换。--每个着色器计算变换矩阵。
  
每个面的颜色是按面的第1个顶点颜色着色

cube: displays a rotating cube with vertex colors interpolated across faces 
gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
gl.drawArrays( gl.TRIANGLES, 0, NumVertices );//render 时

cubev: same as cube but with element arrays
//cubev里采用ELEMENT_ARRAY_BUFFER
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );//render 时 
--------------------------------------------------------------------------


//采用四元数方法，在顶点着色器中进行顶点的旋转变换(采用四元素表示和乘法公式计算） p‘=rpr-1。

cubeq: same as cube but uses quaternions(四元数） to do the rotation in the vertex shader

总结：---------------------------------------------------------------------------------------------

上面的方法没有那种明显优于其它，
第三种方法只向顶点着色器传3个数值，但是将获取每个点新位置所需要的计算留给了着色器
而第二种方法传16个数值，但是着色器的计算量小了。
尽管如此，第三种方法非常适合现代GPU.因为三角函数运算在GPU中是硬编码，因此计算时间几乎可以忽略不计。
此外，GPU的并行性可以使GPU同时处理立方体的多个顶点。
而四元数法法也只是从程序传3个数值给着色器，每个着色器中自行计算得到变换后的新位置。
========================================================================================================================



========================================================================================================================


书上4.13.2：虚拟跟踪球
操作：
鼠标键点下不松：表示开始跟踪鼠标移动，物体按鼠标移动的新位置和前一鼠标位置，可得到新的旋转变换矩阵，进行旋转。
      
鼠标键弹起放开：表示结束跟踪鼠标移动，不再获取鼠标新的移动位置；
此外物体是否继续旋转分两种情况；
	                 
1）如果鼠标弹起位置和开始按下时位置相同，则物体停止转动
	。			  
2）否则，物体按最近先前旋转方向和速度，继续旋转。

//原始程序,但是旋转结果不正确，因为采用前次R，右乘当前旋转矩阵得到新的R，多次旋转后错误。

trackball: creates a virtual trackball to control rotation of cube. Increments rotation matrix(增量旋转矩阵） in application and send it to vertex shader
--------------------------------------------------------------------------


trackballQuaternion: similar to trackball but uses quaternions. Rotation quaternion is incremented in application and sent to vertex shader
采用四元素计算，传递累积的旋转变换四元素r (rotation), 


