# 百度API配置

Note:
> 脚本可以在Hamibot上使用，也可以在Auto.js上使用，但由于Auto.js使用的是免费版，**不支持OCR**，Auto.js只能使用百度OCR，因此如果完整运行学习强国.js脚本的话（四人赛双人对战两个平台是一样的）将可能**调用百度OCR大约35次**，请谨慎使用，**超出百度OCR免费次数(每个月1000次)所产生的费用概不负责**

首先编辑脚本，将配置选项选择“是”

<div align=center><img src="https://user-images.githubusercontent.com/68000706/189031339-f52b77c8-97c7-42ef-a5a9-6fa4dd4da008.png" width="400px"/></div>

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