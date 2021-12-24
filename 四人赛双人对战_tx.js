/**
 * @Description: TX接口，只需要SecretId、SecretKey和Region即可，免费额度同HW
 * @version: tx ocr
 * @Author: GaviTate
 * @Date: 2021-12-24
 * @Refer: 操作指引[https://cloud.tencent.com/document/product/866/17622];API密钥[https://console.cloud.tencent.com/cam/capi]
 */

auto.waitFor()
var { four_player_battle } = hamibot.env;
var { two_player_battle } = hamibot.env;
var { count } = hamibot.env;
var { distance1, distance2, distance3, width, height } = hamibot.env;
var delay_time = 1000;
count = Number(count);
if (!distance1 && !distance2 && !distance3 && !width && !height) {
  distance1 = 0.4;
  distance2 = 2.8;
  distance3 = 0.4;
  width = 5.5;
  height = 10.4;
} else {
  distance1 = Number(distance1);
  distance2 = Number(distance2);
  distance3 = Number(distance3);
  width = Number(width);
  height = Number(height);
}

// 调用腾讯api所需参数
var { Region } = hamibot.env;
var { SecretId } = hamibot.env;
var { SecretKey } = hamibot.env;

threads.start(function () {
    var beginBtn;
    if (beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time));
    else (beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time)); 
    beginBtn.click();
});
requestScreenCapture(false);

sleep(delay_time);

// 模拟随机时间
function random_time(time) {
  return time + random(100, 1000);
}

function entry_model(number) {
  sleep(random_time(delay_time * 2));
  var model = className('android.view.View').depth(22).findOnce(number);
  while (!model.child(3).click());
}

// 模拟点击可点击元素
function my_click_clickable(target) {
  text(target).waitFor();
  click(target);
}

/**
 * 答题
 * @param {int} depth_option 选项控件的深度
 * @param {string} question 问题
 */
function do_contest_answer(depth_option, question) {
  if (question == "选择正确的读音" || question == "选择词语的正确词形" || question == "下列词形正确的是") {
    // 选择第一个
    className('android.widget.RadioButton').depth(depth_option).findOne().click();
  } else {
    // 发送http请求获取答案
    var question1 = question.slice(0, 10);
    var r1 = http.get('http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question1));
    var r2 = http.get('https://www.souwen123.com/search/select.php?age=' + encodeURI(question));
    var result1 = r1.body.string().match(/答案：./);
    var result2 = r2.body.string().match(/答案：./);
    var result;
    if (result1 || result2) {
      if (result2 && result2[0].charCodeAt(3) > 64 && result2[0].charCodeAt(3) < 69) result = result2;
      else if (result1 && result1[0].charCodeAt(3) > 64 && result1[0].charCodeAt(3) < 69) result = result1;
      else result = result1;
      try {
        className('android.widget.RadioButton').depth(depth_option).findOnce(result[0].charCodeAt(3) - 65).click();
      } catch (error) {
        // 如果选项不存在，则点击第一个
        if (className('android.widget.RadioButton').depth(depth_option).exists())
          className('android.widget.RadioButton').depth(depth_option).findOne().click();
      }
    } else {
      // 如果没找到结果则选择第一个
      if (className('android.widget.RadioButton').depth(depth_option).exists())
        className('android.widget.RadioButton').depth(depth_option).findOne().click();
    }
  }
}

/**
 * 获取用户token
 */
function get_token_tx(img) {
  var res = http.postJson(
    'https://api.cloud.tencent.com/getsigntc3',
    {
      'Product': 'ocr',
      'Action': 'GeneralBasicOCR',
      'Version': '2018-11-19',
      'JsonData': '{"ImageBase64":"'+img+'"}',
      'SecretId': SecretId,
      'SecretKey': SecretKey,
      'Region': Region,
      'Endpoint': Region,
      'Area': Region,
      'Method': 'POST',            
      'Language': 'zh-CN'
    },
    {
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  res_data = res.body.json()['data'];  
  return res_data['Headers'];
}


/**
 * 点击对应的去答题或去看看
 * @param {image} img 传入图片
 */
function tx_ocr_api(img) {
  var answer = "";
  var token = get_token_tx(img)
  var source = '{"ImageBase64":"' + img + '"}'
  var cmd = 'curl ' + token + "-d '" + source + "' 'https://ocr." + Region + ".tencentcloudapi.com/'";
  var res = shell(cmd);
  try {
    var words_list = JSON.parse(res.result)['Response']['TextDetections'];
  } catch (error) {
    toastLog(error);
    exit();
  }
  for (var i in words_list) {
    // 如果是选项则后面不需要读取
    if (words_list[i].DetectedText.indexOf("A.") != -1) break;
    // 如果两词块之间有分割线，则不读取
    // 利用location之差判断是否之中有分割线【填空题空格TX接口不识别为字符】
    answer += words_list[i].DetectedText;
  }
  return answer.replace(/\s*/g, "");
}

if (!className('android.view.View').depth(21).text('学习积分').exists()) {
  app.launchApp('学习强国');
  sleep(random_time(delay_time * 3));
  var while_count = 0;
  while (!id('comm_head_title').exists() && while_count < 5) {
    while_count++;
    back();
    sleep(random_time(delay_time));
  }
  app.launchApp('学习强国');
  sleep(random_time(delay_time));
  my_click_clickable('我的');
  my_click_clickable('学习积分');
}

/*
**********四人赛*********
*/
if (four_player_battle == 'yes') {
  sleep(random_time(delay_time));
  className('android.view.View').depth(21).text('学习积分').waitFor();
  entry_model(11);
  for (var i = 0; i < count; i++) {
    sleep(random_time(delay_time));
    my_click_clickable('开始比赛');
    className('android.widget.RadioButton').depth(32).waitFor();
    while (!text('继续挑战').exists()) {
      do {
        var img = captureScreen();
        var point = findColor(img, '#1B1F25', {
          region: [device.width * distance1 / width, device.height * distance2 / height,
             device.width * (1 - 2 * distance1 / width), device.height * (1 - distance2 / height - distance3 / height)],
          threshold: 10,
        });
      } while (!point);
      var img = images.inRange(img, '#000000', '#444444');
      img = images.clip(img, device.width * distance1 / width, device.height * distance2 / height,
        device.width * (1 - 2 * distance1 / width), device.height * (1 - distance2 / height - distance3 / height));
      img = String(images.toBase64(img));
      var question = tx_ocr_api(img);
      question = question.slice(question.indexOf('.') + 1);
      question = question.slice(0, 20);
      question = question.replace(/,/g, "，");
      log(question);
      className('android.widget.RadioButton').depth(32).waitFor();
      if (question) do_contest_answer(32, question);
      do {
        var img = captureScreen();
        var point = findColor(img, '#555AB6', {
          region: [device.width * distance1 / width, device.height * distance2 / height,
            device.width * (1 - 2 * distance1 / width), device.height * (1 - distance2 / height - distance3 / height)],
          threshold: 10,
        });
      } while (!point);
    }
    if (i == 0 && count == 2) {
      sleep(random_time(delay_time));
      while (!click('继续挑战'));
      sleep(random_time(delay_time));
    }
  }
  sleep(random_time(delay_time));
  back();
  sleep(random_time(delay_time));
  back();
}

/*
**********双人对战*********
*/
if (two_player_battle == 'yes') {
  sleep(random_time(delay_time));
  className('android.view.View').depth(21).text('学习积分').waitFor();
  entry_model(12);
  // 点击随机匹配
  text('随机匹配').waitFor();
  sleep(random_time(delay_time * 2));
  try {
    className('android.view.View').clickable(true).depth(24).findOnce(1).click();
  } catch (error) {
    className("android.view.View").text("").findOne().click();
  }

  className('android.widget.RadioButton').depth(32).waitFor();
  while (!text('继续挑战').exists()) {
    // 等待题目加载
    do {
      var img = captureScreen();
      var point = findColor(img, '#1B1F25', {
        region: [device.width * distance1 / width, device.height * distance2 / height,
          device.width * (1 - 2 * distance1 / width), device.height * (1 - distance2 / height - distance3 / height)],
        threshold: 10,
      });
    } while (!point);
    var img = images.inRange(img, '#000000', '#444444');
    img = images.clip(img, device.width * distance1 / width, device.height * distance2 / height,
      device.width * (1 - 2 * distance1 / width), device.height * (1 - distance2 / height - distance3 / height));
    img = String(images.toBase64(img));
    var question = tx_ocr_api(img);
    question = question.slice(question.indexOf('.') + 1);
    question = question.slice(0, 20);
    question = question.replace(/,/g, "，");
    log(question);
    // 等待选项加载
    className('android.widget.RadioButton').depth(32).waitFor();
    if (question) do_contest_answer(32, question);
    // 等待下一题加载
    do {
      var point = findColor(captureScreen(), '#555AB6', {
        region: [device.width * distance1 / width, device.height * distance2 / height,
          device.width * (1 - 2 * distance1 / width), device.height * (1 - distance2 / height - distance3 / height)],
        threshold: 10,
      });
    } while (!point);
  }
  sleep(random_time(delay_time));
  back();
  sleep(random_time(delay_time));
  back();
  my_click_clickable('退出');
}
