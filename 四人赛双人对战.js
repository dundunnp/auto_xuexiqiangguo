auto.waitFor()
var { four_player_battle } = hamibot.env;
var { two_player_battle } = hamibot.env;
var { count } = hamibot.env;
var { whether_improve_accuracy } = hamibot.env;
var delay_time = 1000;
count = Number(count);

// 调用华为api所需参数
var { username } = hamibot.env;
var { password } = hamibot.env;
var { domainname } = hamibot.env;
var { projectname } = hamibot.env;
var { endpoint } = hamibot.env;
var { projectId } = hamibot.env;

if (whether_improve_accuracy == 'yes' && !password) {
  toast("如果你选择了增强版，请配置信息，具体看脚本说明");
  exit();
}

//请求横屏截图权限
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
    var r2 = http.get('https://www.souwen123.com/search/select.php?age=' + encodeURI(question));
    var question = question.slice(0, 10);
    var r1 = http.get('http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question));
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
 * @param {image} img 传入图片
 */
function ocr_api(img) {
  try {
    var answer = ocr.ocrImage(img);
  } catch (error) {
    toast("请将脚本升级至最新版");
    exit();
  }
  answer = answer.text;
  // 标点修改
  answer = answer.replace(/,/g, "，");
  answer = answer.replace(/〈〈/g, "《");
  answer = answer.replace(/〉〉/g, "》");
  answer = answer.replace(/\s*/g, "");
  answer = answer.replace(/_/g, "一");
  answer = answer.replace(/;/g, "；");
  answer = answer.replace(/o/g, "");
  answer = answer.replace(/。/g, "");
  answer = answer.replace(/`/g, "、");
  answer = answer.replace(/\?/g, "？");

  // 文字修改
  answer = answer.replace(/营理/g, "管理");
  answer = answer.replace(/土也/g, "地");
  answer = answer.replace(/未口/g, "和");
  answer = answer.replace(/晋查/g, "普查");
  answer = answer.replace(/扶悌/g, "扶梯");

  answer = answer.slice(answer.indexOf('.') + 1);
  answer = answer.slice(0, 10);
  return answer;
}

/**
 * 获取用户token
 */
function get_token() {
  var res = http.postJson(
    'https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens',
    {
      "auth": {
        "identity": {
          "methods": [
            "password"
          ],
          "password": {
            "user": {
              "name": username, //替换为实际用户名
              "password": password, //替换为实际的用户密码
              "domain": {
                "name": domainname //替换为实际账号名
              }
            }
          }
        },
        "scope": {
          "project": {
            "name": projectname //替换为实际的project name，如cn-north-4
          }
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json;charset=utf8'
      }
    }
  );
  return res.headers['X-Subject-Token'];
}

if (whether_improve_accuracy == 'yes') var token = get_token();

/**
* 华为ocr接口，传入图片返回文字
* @param {image} img 传入图片
* @returns {string} answer 文字
*/
function huawei_ocr_api(img) {
  var right_flag = false;
  var answer_left = "";
  var answer_right = "";
  var answer = "";
  var res = http.postJson(
    'https://' + endpoint + '/v2/' + projectId + '/ocr/web-image',
    {
      "image": images.toBase64(img)
    },
    {
      headers: {
        "User-Agent": "API Explorer",
        "X-Auth-Token": token,
        "Content-Type": "application/json;charset=UTF-8"
      }
    }
  );
  var res = res.body.json();
  try {
    var words_list = res.result.words_block_list;
  } catch (error) {
  }
  if (words_list) {
    for (var i in words_list) {
      // 如果是选项则后面不需要读取
      if (words_list[i].words[0] == "A") break;
      // 将题目以分割线分为两块
      // 利用location之差判断是否之中有分割线
      /**
       * location:
       * 识别到的文字块的区域位置信息，列表形式，
       * 分别表示文字块4个顶点的（x,y）坐标；采用图像坐标系，
       * 图像坐标原点为图像左上角，x轴沿水平方向，y轴沿竖直方向。
       */
      if (words_list[0].words.indexOf('.') != -1 && i > 0 &&
        Math.abs(words_list[i].location[0][0] -
          words_list[i - 1].location[0][0]) > 100) right_flag = true;
      if (right_flag) answer_right += words_list[i].words;
      else answer_left += words_list[i].words;
      if (answer_left.length >= 20 || answer_right.length >= 20) break;
    }
  }
  // 取信息最多的块
  answer = answer_right.length > answer_left.length ? answer_right : answer_left;
  answer = answer.replace(/\s*/g, "");
  answer = answer.replace(/,/g, "，");
  answer = answer.slice(answer.indexOf('.') + 1);
  answer = answer.slice(0, 20);
  return answer;
}

function do_it() {
  if (whether_improve_accuracy == 'no') {
    var min_pos_width = device.width;
    var min_pos_height = device.height;
  }
  while (!text('开始').exists());
  while (!text('继续挑战').exists()) {
    className("android.view.View").depth(28).waitFor();
    var pos = className("android.view.View").depth(28).findOne().bounds();
    if (className("android.view.View").text("        ").exists())
      pos = className("android.view.View").text("        ").findOne().bounds();
    do {
      var point = findColor(captureScreen(), '#1B1F25', {
        region: [pos.left, pos.top, pos.width(), pos.height()],
        threshold: 10,
      });
    } while (!point);

    if (whether_improve_accuracy == 'no') {
      min_pos_width = Math.min(pos.width(), min_pos_width);
      min_pos_height = Math.min(pos.height(), min_pos_height);
      var img = images.clip(captureScreen(), pos.left, pos.top, min_pos_width, min_pos_height);
    } else {
      var img = images.inRange(captureScreen(), '#000000', '#444444');
      img = images.clip(img, pos.left, pos.top, pos.width(), pos.height());
    }

    if (whether_improve_accuracy == 'yes') var question = huawei_ocr_api(img);
    else var question = ocr_api(img);

    log(question);
    className('android.widget.RadioButton').depth(32).waitFor();
    if (question) do_contest_answer(32, question);
    else className('android.widget.RadioButton').depth(32).findOne().click();
    // 等待新题目加载
    while (!textMatches(/第\d题/).exists() && !text('继续挑战').exists() && !text('开始').exists());
  }
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
    do_it();
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
  do_it();
  sleep(random_time(delay_time));
  back();
  sleep(random_time(delay_time));
  back();
  my_click_clickable('退出');
}

toast('脚本运行完成');
