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

// 调用华为api所需参数
var { username } = hamibot.env;
var { password } = hamibot.env;
var { domainname } = hamibot.env;
var { projectname } = hamibot.env;
var { endpoint } = hamibot.env;
var { projectId } = hamibot.env;

requestScreenCapture(false);
sleep(1000);

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
      if (result2 && -1 < result2[0].charCodeAt(3) - 65 < 4) result = result2;
      else if (result1 && -1 < result1[0].charCodeAt(3) - 65 < 4) result = result1;
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

var token = get_token();

/**
 * 点击对应的去答题或去看看
 * @param {image} img 传入图片
 */
function huawei_ocr_api(img) {
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
    toastLog(error);
    exit();
  }
  for (var i in words_list) {
    // 如果是选项则后面不需要读取
    if (words_list[i].words[0] == "A") break;
    // 如果两词块之间有分割线，则不读取
    // 利用location之差判断是否之中有分割线
    /**
       * location:
       * 识别到的文字块的区域位置信息，列表形式，
       * 分别表示文字块4个顶点的（x,y）坐标；采用图像坐标系，
       * 图像坐标原点为图像左上角，x轴沿水平方向，y轴沿竖直方向。
       */
    if (words_list[0].words[1] == '.' && i > 0 &&
      Math.abs(words_list[i].location[0][0] -
        words_list[i - 1].location[0][0]) > 100) break;
    answer += words_list[i].words;
  }
  return answer.replace(/\s*/g, "");
}

app.launchApp('学习强国');
sleep(random_time(delay_time * 3));
var while_count = 0;
while (!id('comm_head_title').exists() && while_count < 5) {
  while_count++;
  back();
  sleep(random_time(delay_time));
}
app.launchApp('学习强国');
my_click_clickable('我的');
my_click_clickable('学习积分');

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
      var question = huawei_ocr_api(img);
      log(question);
      question = question.slice(question.indexOf('.') + 1);
      question = question.slice(0, 20);
      question = question.replace(/\s*/g, "");
      question = question.replace(/,/g, "，");
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
  className('android.view.View').clickable(true).depth(24).findOnce(1).click();
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
    var question = huawei_ocr_api(img);
    log(question);
    // 对识别出的题目进行处理
    question = question.slice(question.indexOf('.') + 1);
    question = question.replace(/\s*/g, "");
    question = question.replace(/,/g, "，");
    question = question.slice(0, 20);
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
