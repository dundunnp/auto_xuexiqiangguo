<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->
# 目录
- [目录](#目录)
- [免责声明](#免责声明)
- [v15.0 更新内容:](#v150-更新内容)
- [脚本声明](#脚本声明)
- [使用说明](#使用说明)
  - [Hamibot](#hamibot)
  - [Auto.js](#autojs)
  - [满足条件](#满足条件)
  - [编辑配置说明](#编辑配置说明)
  - [百度API配置](#百度api配置)
- [额外衍生脚本](#额外衍生脚本)
- [常见问题](#常见问题)
- [待编写](#待编写)

<!-- /code_chunk_output -->

# 免责声明
**本脚本为免费使用，本脚本只供个人学习使用，不得盈利传播，不得用于违法用途，否则造成的一切后果自负！**

如果喜欢的话可以star一下噢，谢谢！

# v15.0 更新内容:
1. 增加新配置，和server酱微信推送功能
2. 修复订阅卡住的bug
3. 增加log信息
**此版本由[Lihewin](https://github.com/Lihewin)更新，感谢！**

# 脚本声明
**本脚本适用于安卓、鸿蒙系统，不适用于IOS，请将强国软件换为2.33.0版本（[安装包](https://github.com/dundunnp/auto_xuexiqiangguo/tree/version-14.5/%E5%AE%89%E8%A3%85%E5%8C%85)），这之后的版本脚本运行可能报错**
**如果因为bug或各种原因不得不终止脚本，请重新运行脚本，脚本会自动跳过已完成的部分**
**如果遇到bug问题，请先查看[常见问题](#常见问题)，如果没有找到类似问题或还是不行请反馈bug给我**
**因为本人是在校学生无法把全部精力放在这，因此如果有想合作的小伙伴请在Github上一起完成更新项目**

# 使用说明

脚本可以在Hamibot上使用，也可以在Auto.js上使用，但由于Auto.js使用的是免费版，**不支持OCR**，Auto.js只能使用百度OCR，因此如果完整运行学习强国.js脚本的话（四人赛双人对战两个平台是一样的）将可能**调用百度OCR大约35次**，请谨慎使用，**超出百度OCR免费次数所产生的费用概不负责**

具体操作如下：

## Hamibot
先跟随者[Hamibot指导](https://hamibot.com/guide)安装Hamibot并配对好机器人后，进行如下步骤进行安装脚本：

点击脚本下的脚本控制台
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/68c3e356367ccb8b.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
点击创建脚本
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/405e9a45a9212735.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
随意取一个名字，然后点击创建
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/c4b51f9c4a38d0f4.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
点击源码
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/362ac49b7ec05b84.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
将Hamibot文件夹下的学习强国.js代码复制粘贴到这里，注意要把那一行代码覆盖，同理将配置模式.json也复制粘贴到配置模式中
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/9274fbc0cd701637.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
粘贴完成后点击保存，并返回
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/48004642fbdf0fbc.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
点击配置，将信息填入后保存
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/2ce43a5d3b4e052a.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>
就可以点运行了
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/54884dc3a8fa9d01.png" alt="msedge_WRzp0mov3N" style="zoom:33%;" />
</div>

## Auto.js
先下载安装包[(安装包链接)](https://github.com/dundunnp/hamibot-auto_xuexiqiangguo/blob/version-14.4/%E5%AE%89%E8%A3%85%E5%8C%85/autojsv4.1.1alpha2_downcc.com.apk)，将Auto.js安装到手机上，打开Auto.js根据提示开启权限

点击右下角的浮球，点击文件，取一个脚本名称并确定
<div align=center>
<img src="https://user-images.githubusercontent.com/68000706/160570166-9e696d71-1cd0-4dc5-a63e-4530497668dd.jpg" alt="msedge_WRzp0mov3N" width="300px" style="zoom:33%;" />
</div>
将Auto.js文件夹下的学习强国.js文件的代码复制到这里去
<div align=center>
<img src="https://user-images.githubusercontent.com/68000706/160570183-1e384421-6f4d-461d-b8c8-a0bc5a40da2c.jpg" alt="msedge_WRzp0mov3N" width="300px" style="zoom:33%;" />
</div>
将代码划到最上面，根据提示填写配置信息，并点击右上角的保存
<div align=center>
<img src="https://user-images.githubusercontent.com/68000706/160570186-026415c6-b770-475c-86a2-5d08aeacb324.jpg" alt="msedge_WRzp0mov3N" width="300px" style="zoom:33%;" />
</div>
点击右三角运行按钮，脚本就开始运行了
<div align=center>
<img src="https://user-images.githubusercontent.com/68000706/160570195-3960b0ec-947d-4571-83c7-8732ed80c0ce.jpg" alt="msedge_WRzp0mov3N" width="300px" style="zoom:33%;" />
</div>

如果想要使用其他版本的如v10.11，可以点击这里其他流程一样（不建议）
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/12258501b035ee0e.png" alt="msedge_WRzp0mov3N"  width="300px" style="zoom:33%;" />
</div>

其他脚本也类似上述操作，只是代码不同

**如果喜欢的话可以star一下噢，谢谢！**
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/2fc8345bdc719323.png" alt="msedge_WRzp0mov3N"  width="300px" style="zoom:33%;" />
</div>

## 满足条件
请确保手机满足以下条件
1. 打开无障碍服务权限、程序保持后台运行
2. 手机尽量打开勿扰模式，防止突然的信息弹窗导致脚本的失败
3. 请不要使用花里胡哨的字体和输入法键盘，尽量使用系统默认，防止干扰ocr

## 编辑配置说明

**跳转页面加载的时间(以秒s为单位)**

填写跳转页面加载的时间(以秒s为单位)，默认为1s(支持小数点形式)，根据手机性能与网络情况自行而定，时间越长出bug的可能越小，但同时耗费的时间越长。
我的手机是华为mate20 pro用的是1s，大家可以参考一下，不建议小于1s，太快不符合正常人类点击频率，容易被系统侦测出（当然我也设置了随机时间性，你的任何等待时间都是你设定的基础值加一个随机时间）

**是否提高四人赛双人对战正确率**

脚本默认不为否，如果为否利用本地ocr识别题目，在识别速度、识别正确率上比第三方ocr差。此脚本选用百度API实现OCR功能，如果你想提高，需要按如下操作进行配置

**pushplus_token**

请根据[官网](http://www.pushplus.plus/)指导，获取token

**sct_token**

请根据[官网](https://sc.ftqq.com/?c=wechat&a=bind)指导，获取token

## 百度API配置

首先编辑脚本，将配置选项选择“是”
<div align=center><img src="https://i.bmp.ovh/imgs/2022/01/143fefa456e002b1.png"/></div>

*以下操作与百度[文字识别新手操作指引](https://cloud.baidu.com/doc/OCR/s/dk3iqnq51)一样*

第一步：注册百度账户

点击链接注册百度账户[https://passport.baidu.com/v2/?reg](https://passport.baidu.com/v2/?reg)，并完成个人认证，操作基本与华为云一致

第二步：开通文字识别服务

1. 领取免费测试资源

点击登录[文字识别控制台](https://console.bce.baidu.com/ai/?_=1634647029968&fromai=1#/ai/ocr/overview/index)，找到「领取免费资源」按钮。

<div align=center><img src="https://bce.bdstatic.com/doc/ai-cloud-share/OCR/%E5%9B%BE%E7%89%874_d439db4.png" style="zoom:50%;" /></div>

选择通用场景OCR，选择完成后点击「0元领取」，领取免费测试资源

<div align=center><img src="https://bce.bdstatic.com/doc/ai-cloud-share/OCR/%E5%9B%BE%E7%89%875_6babcb4.png" style="zoom:50%;" /></div>

领取成功的免费测试资源将会显示在[资源列表](https://console.bce.baidu.com/ai/?_=1625726102409#/ai/ocr/overview/resource/list)的「已领取资源」中。您可以选择「查看领取记录」去往「资源列表」查看。刚领取的资源大约30分钟生效，若领取接口长时间未在「资源列表」上生效显示，可[提交工单](https://ticket.bce.baidu.com/?_=1625726102409#/ticket/create~productId=96)咨询

<div align=center><img src="https://bce.bdstatic.com/doc/ai-cloud-share/OCR/%E5%9B%BE%E7%89%878_92b62f6.png" style="zoom:50%;" /></div>

2. 创建应用
领取完免费测试资源后，您需要创建应用才可正式调用文字识别能力。

进入[文字识别控制台](https://passport.baidu.com/v2/?reg)，点击 「创建应用」。
<div align=center><img src="https://bce.bdstatic.com/doc/ai-cloud-share/OCR/%E5%9B%BE%E7%89%876_7a1e4c7.png" style="zoom:50%;" /></div>

根据您的需要，填写完毕相应信息后，点击「立即创建」，即可完成应用的创建。应用创建完毕后，点击左侧导航中的「应用列表」，进行应用查看。

<div align=center><img src="https://bce.bdstatic.com/doc/ai-cloud-share/OCR/%E5%9B%BE%E7%89%873_86de384.png" style="zoom:50%;" /></div>

然后就能看到创建完的应用 API KEY 以及 Secret KEY 了。将其填入配置信息中，就完成了

<div align=center><img src="https://bce.bdstatic.com/doc/ai-cloud-share/OCR/%E5%9B%BE%E7%89%877_fa8935a.png" style="zoom:50%;" /></div>

恭喜你，到这里就算是完成了!

# 额外衍生脚本
1. [单独四人赛双人对战脚本](https://github.com/dundunnp/auto_xuexiqiangguo/tree/version-14.5/%E5%9B%9B%E4%BA%BA%E8%B5%9B%E5%8F%8C%E4%BA%BA%E5%AF%B9%E6%88%98)，相关配置说明见README.md
2. [四人赛双人对战答错脚本](https://github.com/dundunnp/auto_xuexiqiangguo/tree/version-14.5/%E5%9B%9B%E4%BA%BA%E8%B5%9B%E5%8F%8C%E4%BA%BA%E5%AF%B9%E6%88%98%E7%AD%94%E9%94%99%E7%89%88)，相关配置说明见README.md

# 常见问题

Q1: 点击运行脚本没有反应，甚至连学习强国都没有打开

A: 
1. 请确保Hamibot或Auto.js已经打开**无障碍服务权限**
2. 由于hamibot软件原因或某种原因，脚本无法运行（我也出现过这种情况）你可以重新下载hamibot软件

***

Q2: 在四人赛、双人对战正确率感人

A: 我用自己手机测试答题正确率能在90%以上，大家出现错误率高的主要原因在于：是否正确配置百度OCR
**另：错误是无法避免的，如果你有特殊的需求我一定要拿满分，非常抱歉这个脚本可能不能满足你**

***
Q3: 为什么我按照步骤配置好了第三方ocr服务，但正确率还是跟本地ocr差不多

A: 首先检查配置信息是否在提高正确率上选择了是、其次检查配置信息是否正确

***
Q4: 一直要求打开无障碍服务权限

A: 已经打开了，但还是不行，一般是因为服务被系统结束了，解决方法是重启手机或者重新下载hamibot

***
Q5: 除上面的问题

A: 请在[GitHub](https://github.com/dundunnp/hamibot-auto_xuexiqiangguo/issues)或议题上提出问题，问题尽量详细，包含图片（配置信息、学习强国主页等有助于了解问题的图片）或视频，这样对大家解决问题都快

# 待编写
1. 其他第三方ocr接口的编写
2. Auto.js OCR插件的编写
