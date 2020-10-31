Chapter 7 Programs:(分6部分）
7.1~7.4: 帧缓存，数字图像，采样与反走样，映射方法
----------------------------------------------------------------------------------------------------------------------------------
书 7.5纹理映射~7.6 纹理生成：
需要在APP，顶点着色器以及片元着色器之间进行交互，其实现需要三个基本的步骤。
首先，必须生成纹理图像并将它存储在GPU的纹理内存中。---存储（在APP中代码）
齐次，必须把纹理坐标赋给每个片元。---纹理坐标关联（在APP中代码）
最后，必须将纹理施加给每个片元。---采样器着色（在片员着色器中实现）

textureCube1: texture map of a gif image onto cube. 
             - Note some browsers such as Chrome will not allow the use of an external file as texture image. 
              -Program also displays the image on the right.

textureCubev2: texture mapping checkerboard onto cube
纹理图案换成 黑白棋盘 ，其它同1

textureCubev3: texture map onto cube using two texture images multiplied together in fragment shader
APP中生成两个棋盘图像，分别生成两个纹理对象，然后片元着色器中，用使用两个纹理图案相乘及顶点插值颜色相乘。
交互增加了一个按钮：toggle(切换键）

textureCube4: texture map with two texture units. First applies checkerboard, second a sinusoid.
APP中生成两个团：棋盘图案和正弦图案sinusoid，分别生成两个纹理对象；然后片元着色器中，用使用两个纹理图案相乘及顶点插值颜色相乘。
交互增加了一个按钮：toggle(切换键）


textureSquare: demo of aliasing with different texture parameters.
对纹理对象设置不同参数，对比不同的纹理采样效果：走样作轻重比较
1透视投影参数从界面获取参数。
2放大缩小映射参数也是从界面获取


--------------------------------------------------------------------------------------------------------------------------------------
书7.7环境贴图/反射贴图 -7.8示例程序主要是 reflectionMap,reflectingCube
reflectionMap: reflection map of a colored cube onto another cube rotating inside of it
环境贴图是盒子6面图（3D）
物体表面是立方体表面，在纹理盒里面
界面交互是X,Y,Z轴旋转和自动转开关，控制物体运动。

reflectingCube:  reflection map of a colored cube onto another cube rotating inside of it,
similar to relectionMap but lets the user rotate the object instead of appearing to rotate the texture cube.
纹理坐标四立方体6个面（每个面单一颜色纹理，各面不同颜色）围成的，
镜面表面多边形也是立方体，在纹理盒里面。
界面参数改变可动的视点位置，可观察到物体表面贴图的变化。

reflectionMap2: reflection map of a sphere inside a cube.
环境贴图是盒子6面图（3D）
物体表面是球体，在纹理盒里面。
界面交互是X,Y,Z轴旋转纹理盒和自动转开关，控制物体运动。

reflectingSphere:  reflection map of a sphere inside a cube.
similar to relectionMap2 but lets the user rotate the object instead of appearing to rotate the texture cube.
纹理坐标四立方体6个面（每个面单一颜色纹理，各面不同颜色）围成的，
镜面表面是球面，在纹理盒里面。
界面参数是控制旋转物体而不是旋转纹理盒，以及球面递归生成的细分次数。
有光源 WC下：var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
gl_FragColor = fColor*texColor;//最后表面颜色是混合的，fColor是phong模型着色，texColor是纹理采样色



--------------------------------------------------------------------------------------------------------------------------------------
书7.9 凹凸映射
bumpMap: bump map of a single square with a square "bump" in the middle and a rotating light

bumpMap2: bump map using 256 x 256 version of the honolulu data. 
One rotation moves the light source and the other rotates the single polygon that is bump mapped,



7.10 融合技术
--------------------------------------------------------------------------------------------------------------------------------------
hatImage: image of the sombero function with colors assigned to the y values and the resulting image as texture mapped to a square

honoluluImage: image display of height data from hawaii using a texture map with edge enhancement in the fragment shader

cubit: rotating translucent cube. Hidden-surface removal can be toggled on and off.



7.12 帧缓存对象(FBO)~7.13缓存交换
--------------------------------------------------------------------------------------------------------------------------------------
render1: Sierpinski gasket rendered to a texture and then display on a square.

render1v2: renders a triangle to a texture and displays it by a second rendering on a smaller square so blue clear color is visible around rendered square

render3: renders Sierpinski gasket and diffuses result over successive renderings

render4: similar to render2 but renders only a single triangle

render5: same as render4 but only renders the triangle on the first rendering

particleDiffusion: buffer ping ponging of 50 particles initially placed randomly and then moving randomly with their previous positions diffused as a texture.

--------------------------------------------------------------------------------------------------------------------------------------

pickCube: rotating cube rendered off screen with solid colors for each face which are used to identify which face the mouse is clicked on. Color of face is logged onto the console.

pickCube2: rotating cube with lighting. When mouse is clicked, the face name (front, back, right, left, top, bottom, background) is logged onto the console. 

pickCube3: changes the material properties so each face has a color but lighting still still causes varying shades across each face. Name of face color is displayed in window instead of on console

pickCube4: similar to pickCube2 but displays name of picked face in window


