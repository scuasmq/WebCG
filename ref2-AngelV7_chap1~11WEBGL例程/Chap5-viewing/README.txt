Chapter 5 Programs
The first four programs allow you to resize the object and the rotate and move the camera through buttons. 
Note that because the clipping volume is measured from the camera, 
it easy to clip out the entire object by moving the camera. 
You may also get odd views if you move the camera inside the object.



--------------------参见书：P184 $5.4.6交互式观察立方体----备注在ortho2------
ortho ,ortho1: Interactive orthographic viewing of cube
对立方体的交互正投影观察,参数除了眼坐标三个，裁剪体只有Z方向一对值

perspective,perspective1: Interactive perspective viewing of cube
对立方体的交互透视观察。交互参数数除了眼坐标三个，裁剪体只有Z方向一对值

ortho2 and perspective2 use slide bars instead of buttons
用滑动条替代按钮进行交互，（正投影和透视投影），参数是眼坐标的三个极坐标，裁剪体的三对参数


?眼坐标的设定没有按照书上的来设定的，错误还是故意！！！
        /*eye = vec3(radius*Math.sin(phi), 
		           radius*Math.sin(theta),
                   radius*Math.cos(phi));
		*/
        eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
		           radius*Math.sin(theta)*Math.sin(phi),
                   radius*Math.cos(theta));

--------------------参见书：P195 $5.9 显示网格----------主要备注hat---------
hata: Display of the sombero function using line strips in two directions
采用线条带在两个方向上显示墨西哥帽函数

hat: Display of sombrero function using both filled triangles and line loops
使用三角形面和线回路显示墨西哥帽函数


--------------------参见书：P200 $5.10 投影和阴影----------
shadow: projective shadow of a square onto y = 0 plane with moving light
在Y=0面上，模拟运动光源下，基于投影的阴影






