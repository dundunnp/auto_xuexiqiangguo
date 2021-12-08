<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->
# 目录
- [免责声明](#免责声明)
- [脚本声明](#脚本声明)
- [v5.2 更新内容:](#v52-更新内容)
- [使用说明](#使用说明)
  - [Hamibot](#hamibothttpshamibotcom)
  - [安装脚本](#安装脚本)
  - [满足条件](#满足条件)
  - [编辑配置](#编辑配置)
- [常见问题](#常见问题)
- [待编写](#待编写)

<!-- /code_chunk_output -->

# 免责声明
**本脚本为免费使用，本脚本只供个人学习使用，不得盈利传播，不得用于违法用途，否则造成的一切后果自负！**

如果喜欢的话可以star一下噢，谢谢！

# 脚本声明
**本脚本适用于安卓、鸿蒙系统，不适用于IOS，尽量将强国软件升级至最新版本，如有其他版本出现报错，我也无法解决**
**如果因为bug或各种原因不得不终止脚本，请重新运行脚本，脚本会自动跳过已完成的部分**
**如果遇到bug问题，请先查看[常见问题](#常见问题)，如果没有找到类似问题或还是不行请反馈bug给我，对于其他问题，由于我还在上课实在无暇顾及，抱歉**
目前版本**无法**完成订阅、发表观点模块，其他模块均可自动化完成（当然不包括强国运动！），因为本人是在校学生无法把全部精力放在这，因此如果有想合作的小伙伴请在Github上一起完成更新项目

# v5.2 更新内容:
1. 修复百灵视频无法点击的bug
2. 修复四人赛第二轮无法进行的bug

***
# 使用说明

## [Hamibot](https://hamibot.com/)
如果知道这款软件的小伙伴可以直接跳到配置，这是它的[官网](https://hamibot.com/)https://hamibot.com，里面有详细的介绍， 目前这款软件只适用于安卓系统
## 安装脚本
在手机上安装完成Hamibot之后，在[脚本市场](https://hamibot.com/marketplace)搜索["Auto学习强国"](https://hamibot.com/marketplace/aQlXd)并安装脚本
## 满足条件
请确保手机满足以下条件
1. 打开无障碍服务权限、程序保持后台运行
2. 手机屏保设置时长大于2分钟
3. 手机打开勿扰模式，防止突然的信息弹窗导致脚本的失败
4. 手机后台不要播放音乐，可能会影响看视频的部分
5. 在应用中尽量不要有其他弹窗，比如打开应用，提示你发现新版本的弹窗
6. 如果要完成答题，请在执行脚本后，点击手机弹窗出来的打开截图权限
7. 请不要使用花里胡哨的字体和输入法键盘，尽量使用系统默认，防止干扰ocr
## 编辑配置
在控制台脚本中，在刚刚安装好的脚本中，点击编辑
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_WRzp0mov3N.png" width="600px" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/b095b81f07d19bd4b347052e5b9ace0.png" width="350px" alt="b095b81f07d19bd4b347052e5b9ace0" style="zoom:50%;" />
</div>
填写你对应的省份，用于打开本地频道可以积一分（一分也是分!注意不要多加一个省字），比如我这里是江西，然后随意选择一个本地频道（比如我选择的是江西卫视）
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/HwMirror_zmj2eavi85.png" width="300px" alt="HwMirror_zmj2eavi85" style="zoom:50%;" />
</div>
而后填写跳转页面加载的时间(以秒s为单位)，默认为1s(支持小数点形式)，根据手机性能与网络情况自行而定，时间越长出bug的可能越小，但同时耗费的时间越长。
我的手机是华为mate20 pro用的是1s，大家可以参考一下，不建议小于1s，太快不符合正常人类点击频率，容易被系统侦测出（当然我也设置了随机时间性，你的任何等待时间都是你设定的基础值加一个随机时间）

目前脚本支持两种模式：
1. 不完成每日答题、每周答题、专项答题、四人赛和双人对战，其他都完成
2. 全部完成

但是第二种模式需要通过华为API实现OCR功能，从而完成答题，注意这里通过华为API的收费标准如下，可以看到每个月有一千次免费使用，是完全够用的，相当于免费
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_QmQEm4XND4.png" width="700px" alt="msedge_QmQEm4XND4" style="zoom:50%;" />
</div>
因此如果只想实现模式一的用户后面的选项不需要填写，到这里脚本就可以正常运行了！

**但如果想实现答题功能你还需要完成以下步骤：**

登录[华为云官网](https://www.huaweicloud.com/)，点击注册（如果已经有账号可以直接登录）
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_LAXxJYLH9v.png" width="700px" alt="msedge_LAXxJYLH9v" style="zoom: 33%;" />
</div>
注册成功后，登录
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_MF3EQpHYfl.png" width="700px" alt="msedge_MF3EQpHYfl" style="zoom: 33%;" />
</div>
点击账户中心，并点击实名认证中的个人认证
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_i0WswextDv.png" width="700px" alt="msedge_i0WswextDv" style="zoom: 33%;" />
</div>
完成认证后，大家可以在基本信息中改一个自己的账号名（我这里改为了dundunnp，注意只能改一次账号名，大家也可以选择不改），而后还需创建一个用户，点击统一身份认证
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_KaElfaa67l.png" width="700px" alt="msedge_KaElfaa67l" style="zoom:33%;" />
</div>
虽然可以看到已经有一个企业管理员用户，**但华为账号不支持获取帐号Token，需要我们自己创建一个IAM用户**，授予该用户必要的权限，获取IAM用户Token，因此，点击右上角的创建用户
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_DF8MDpI9Ck.png" width="700px" alt="msedge_DF8MDpI9Ck" style="zoom:33%;" />
</div>
填写用户名与密码，请记住，后面需要用到，点击下一步
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_uNigytTpFa.png" width="700px" alt="msedge_uNigytTpFa" style="zoom:33%;" />
</div>
点击admin，使其用户加入用户组，点击创建用户

搜索框中[搜索ocr](https://www.huaweicloud.com/s/JW9jciU)，在第一条中点击立即使用
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_HNfceTw9ey.png" width="700px" alt="msedge_HNfceTw9ey" style="zoom:33%;" />
</div>
将页面滚动到最下方
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_uUOIuwfWH1.png" width="700px" alt="msedge_uUOIuwfWH1" style="zoom:33%;" />
</div>
翻到第二页，找到网络图片识别，点击开通服务，并确认
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_lLg8QqR7m8.png" width="700px" alt="msedge_lLg8QqR7m8" style="zoom:33%;" />
</div>
点击左侧的调用指南其下的API调用
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_ccv7yxXG7h.png" width="700px" alt="msedge_ccv7yxXG7h" style="zoom:33%;" />
</div>
在这个界面中，下面的配置参数查询下面的构造请求模块中有，Endpoint和project_id两项，将这两项填入配置中
<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_iHvmohHfBh.png" width="700px" alt="msedge_iHvmohHfBh" style="zoom:33%;" />
</div>
再将第二个模块的domainname和projectname填入配置中，**注意**，这里千万不要将这里显示的dundunnp填入username中，domainname是企业管理员的账号名也就是dundunnp，而username和password填入的是刚刚创建的用户的信息，也就是dundun和XXXXX(你们设置的密码)。

这里是我的配置文件的例子：

<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_4qInvihBwb.png" width="400px" alt="msedge_4qInvihBwb" style="zoom:50%;" />
</div>

恭喜你，到这里就算是完成了!

# 常见问题

Q1: 运行脚本后出现这个报错

<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/msedge_nGw9SZG0Ov.png" width="300px" alt="HwMirror_zmj2eavi85" style="zoom:50%;" />
</div>

A: 配置信息没有填写，这个脚本不是给连安装说明都不看、配置信息都不填，点击安装就想拿分的人用的

***

Q2: 点击运行脚本没有反应，甚至连学习强国都没有打开

A: 请确保Hamibot已经打开**无障碍服务权限**

***

Q3: 在四人赛、双人对战正确率感人

A: 我用自己手机测试答题正确率能在80%以上，大家出现错误率高的主要原因在于：**手机性能和网速。每人的手机不同，导致还没有等待题目加载就ocr了，题目并没有识别正确**。次要原因是：题库的数目有限。
解决方法：适当提高延迟时间，让题目加载出来，后续版本会利用更好的题库
**另：错误是无法避免的，如果你有特殊的需求我一定要拿满分，非常抱歉这个脚本可能不能满足你**

***

Q4: 进去到“我的”->“学习积分”，再退回到首页后，脚本卡主不动了

A: 请确保配置信息中的**省份与本地频道名是自己学习强国界面对应的，而不是你自己现居地**，比如假设我现在住在北京，而我学习强国界面如下，那么我应该填写的是江西，而不是北京

<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/16.png" width="400px" alt="HwMirror_zmj2eavi85" style="zoom:50%;" />
</div>

***

Q5: 为什么我按照步骤配置好了华为ocr服务，但还是不答题

A: 首先检查配置信息是否正确，其次检查是否打开如图所示的权限，如果运行脚本时，手机没有自动弹出打开权限的提示，可能原因是：

1. 配置信息里是否答题选择了否 
2. 软件没有弹窗权限

<div align=center>
<img src="http://r32wozj47.hn-bkt.clouddn.com/img/18.jpg" width="300px" alt="18" style="zoom:33%;" />
</div>

***

Q6: 除上面的问题

A: 请在[GitHub](https://github.com/dundunnp/hamibot-auto_xuexiqiangguo/issues)上提出问题，问题尽量详细，最好包含图片或视频，这样对大家解决问题都快

# 待编写
1. 填空题如果文本框有分开的情况还未解决
2. 订阅与发表言论模块未编写
