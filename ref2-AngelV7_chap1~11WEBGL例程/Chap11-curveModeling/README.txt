Chapter 11 Programs:

-------------------------------------------------------
//三个数据顶点数据的版本
vertices.js: three versions of the data vertex data

//茶壶分片数据
patches.js: teapot patch data

-------------------------------------------------------

//采用贝塞尔曲线递归细分方法生成线框茶壶
teapot1: wire frame teapot by recursive subdivision of Bezier curves

//采用多项式求值方法生成线框茶壶
teapot2: wire frame teapot using polynomial evaluation


//同2生成法，但是有旋转交互按钮控制
teapot3: same as teapot2 with rotation

//用多项式求值和精准法向量得到着色的茶壶，交互同teapot3。还有光照，但光源看不出在哪里
teapot4: shaded teapot using polynomial evaluation and exact normals

//用多项式求值和精准法向量对每个三角形计算，得到着色的茶壶，交互同teapot3。有光照，光源看不出在哪里，但马赫带明显
teapot5: shaded teapot using polynomial evaluation and normals computed for each triangle


