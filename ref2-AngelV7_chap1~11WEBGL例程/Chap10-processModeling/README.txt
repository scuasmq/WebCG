Chapter 10 Programs:

------------------------------------------------------------------------------------------------------------
particleSystem: （粒子系统）
particles in box with repulsion(排斥）, gravity（重力）, restitution（恢复，赔偿）

-------------------------------------------------------------------------------------------------------------
particleDiffusion1: （随机移动粒子，留下颜色和前面的帧进行融合）
randomly moving  particles leaving colors at their positions which are diffused on successive frames.

particleDiffusion2: （相同粒子系统，但是粒子看环境，并依赖于他们的颜色和新位置的颜色）
same particle system but particles look at their environment and depending on their color and color at new location move to x or y axis.

particlediffusion5: （粒子不断加入两个固定点集，每个粒子渲染成黑色点。颜色是每个粒子位置颜色的融合）
Particles are added over time from two fixed points.Each particle is rendered as a black dot. Colors show diffusion of each particle’s position.

particleDiffusion9: （简单类型粒子，从一个固定点产生。中心位置处粒子不能进入）
Single type of particle edited from a fixed point. There is an area in the middle which particles cannot enter.

------------------------------------------------------------------------------------------------------------
mandelbrot1: 分形几何生成mandelbrot集，在集中成员在片元着色器中绘制
mandelbrot set generating program. Note computation of membership in the Mandelbrot set is done in the fragment shader

mandelbrot2: 交互式mandelbrot集产生程序
interactive mandelbrot set generating program.