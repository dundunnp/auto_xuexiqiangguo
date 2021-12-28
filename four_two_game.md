# 免责声明
**本脚本为免费使用，本脚本只供个人学习使用，不得盈利传播，不得用于违法用途，否则造成的一切后果自负！**

如果能帮到你的话可以帮忙去[GitHub](https://github.com/dundunnp/hamibot-auto_xuexiqiangguo) star一下噢，谢谢！

# v4.0更新内容
1. 答题速度提升
2. 除去大部分配置
3. 提供本地ocr选择与增强版的选择

# 脚本声明
此脚本仅运行完成四人赛、双人对战模块，通过优化题目之间的切换间隔，增加新的题库，双题库保证正确率，现脚本已经达到**秒答与80%正确率**，如想了解其他更多信息或者想完成所有模块请安装[主脚本](https://hamibot.com/marketplace/aQlXd)

# 配置信息说明
**脚本默认不为增强版**，非增强版利用本地ocr识别题目，在识别速度、识别正确率上比第三方ocr差，因此，如果你想用增强版还需要配置以下信息

将配置选项选择“是”
<div align=center><img src="https://usercontent.hamibot.com/screenshots/u/20211228/mPyOGc7ID67KV9q0UWUObCNR"/></div>

登录[华为云官网](https://www.huaweicloud.com/)，点击注册（如果已经有账号可以直接登录）

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/4.png" style="zoom: 33%;" /></div>

注册成功后，登录

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/5.png" style="zoom: 33%;" /></div>

点击账户中心，并点击实名认证中的个人认证

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/6.png" style="zoom: 33%;" /></div>

完成认证后，大家可以在基本信息中改一个自己的账号名（我这里改为了dundunnp，注意只能改一次账号名，大家也可以选择不改），而后还需创建一个用户，点击统一身份认证

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/7.png" style="zoom:33%;" /></div>

虽然可以看到已经有一个企业管理员用户，**但华为账号不支持获取帐号Token，需要我们自己创建一个IAM用户**，授予该用户必要的权限，获取IAM用户Token，因此，点击右上角的创建用户

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/8.png" style="zoom:33%;" /></div>

填写用户名与密码，请记住，后面需要用到，点击下一步

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/9.png" style="zoom:33%;" /></div>

点击admin，使其用户加入用户组，点击创建用户

搜索框中[搜索ocr](https://www.huaweicloud.com/s/JW9jciU)，在第一条中点击立即使用

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/10.png" style="zoom:33%;" /></div>

将页面滚动到最下方

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/11.png" style="zoom:33%;" /></div>

翻到第二页，找到网络图片识别，点击开通服务，并确认

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/12.png" style="zoom:33%;" /></div>

点击左侧的调用指南其下的API调用

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/13.png" style="zoom:33%;" /></div>

在这个界面中，下面的配置参数查询下面的构造请求模块中有，Endpoint和project_id两项，将这两项填入配置中

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/14.png" style="zoom:33%;" /></div>

再将第二个模块的domainname和projectname填入配置中，**注意，这里千万不要将这里显示的dundunnp填入username中，domainname是企业管理员的账号名也就是dundunnp，而username和password填入的是刚刚创建的用户的信息，也就是dundun和XXXXX(你们设置的密码)。**

这里是我的配置文件的例子：

<div align=center><img src="https://usercontent.hamibot.com/avatars/ml/0/aQlXd/15.png" style="zoom:50%;" /></div>

恭喜你，到这里就算是完成了！
