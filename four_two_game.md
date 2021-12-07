# 免责声明
**本脚本为免费使用，本脚本只供个人学习使用，不得盈利传播，不得用于违法用途，否则造成的一切后果自负！**

如果能帮到你的话可以帮忙去[GitHub](https://github.com/dundunnp/hamibot-auto_xuexiqiangguo) star一下噢，谢谢！

# v3.0更新内容
1. 解决全选a的问题
2. 可能解决第一题不能答得问题
3. 现可在hamibot日志里查看ocr出来的题目

# 脚本声明
此脚本仅运行完成四人赛、双人对战模块，通过优化题目之间的切换间隔，增加新的题库，双题库保证正确率，现脚本已经达到**秒答与80%正确率**，如想了解其他更多信息或者想完成所有模块请安装[主脚本](https://hamibot.com/marketplace/aQlXd)

# 配置信息说明
如果正确率较低，可能原因是无法读取到题目信息，因此需要定位到题目框中，需要大家量出1、2、3、屏幕总宽度和屏幕总长度的距离（**单位无所谓重要的是比例**）

<div align=center><img src="https://usercontent.hamibot.com/screenshots/u/20211204/wfe9rPyb2HKLa1BBRJB04rG1" style="zoom:50%;" /></div>

例如：我这量出了1和屏幕总宽度，**但是文字到边框其实是有一段白色的距离，为了避免因人工测量误差，我可以选择将1的距离稍微增大**，因此我将1量出的距离0.3cm加上0.1cm，随后依次将0.4和5.5填入distance1和width中，注意不要带单位，只需要填入数值

<div align=center><img src="https://usercontent.hamibot.com/screenshots/u/20211204/46WKh3iHW3ifj2jhYytnncCi" style="zoom:50%;" /></div>

例如：我这量出了2、3和屏幕总长度，**同样为了避免因人工测量误差，将2、3的距离稍微增大**，依次将2.8、0.4和10.4填入distance2、distance3和height中，注意不要带单位，只需要填入数值

<div align=center><img src="https://usercontent.hamibot.com/screenshots/u/20211204/kvVEgL1h88NuxatPCD8jalFv" style="zoom:50%;" /></div>
