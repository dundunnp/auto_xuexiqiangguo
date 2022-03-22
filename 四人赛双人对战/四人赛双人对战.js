auto.waitFor()
var { four_player_battle } = hamibot.env;
var { two_player_battle } = hamibot.env;
var { count } = hamibot.env;
var { whether_improve_accuracy } = hamibot.env;
var { baidu_or_huawei } = hamibot.env;
var delay_time = 1000;
count = Number(count);

// 调用华为api所需参数
var { username } = hamibot.env;
var { password } = hamibot.env;
var { domainname } = hamibot.env;
var { projectname } = hamibot.env;
var { endpoint } = hamibot.env;
var { projectId } = hamibot.env;

// 调用百度api所需参数
var { AK } = hamibot.env;
var { SK } = hamibot.env;

// 本地存储数据
var storage = storages.create('data');

if (whether_improve_accuracy == 'yes' && !password && !AK) {
  toast("如果你选择了增强版，请配置信息，具体看脚本说明");
  exit();
}

// 检查Hamibot版本是否支持ocr
if (app.versionName < "1.3.1") {
  toast("请到官网将Hamibot更新至v1.3.1版本或更高版本");
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

/**
 * 定义HashTable类，用于存储本地题库，查找效率更高
 * 由于hamibot不支持存储自定义对象和new Map()，因此这里用列表存储自己实现
 * 在存储时，不需要存储整个question，可以仅根据选项来对应question，这样可以省去ocr题目的花费
 * 但如果遇到选项为vague_words数组中的模糊词，无法对应question，则需要存储整个问题
*/

var answer_question_map = [];

// 模糊词，当选项为这些词时，无法根据选项对应题目
var vague_words = '正确|错误 不会|会 不是|是'

// hash函数
function hash(string) {
  var hash = 0;
  for (var i = 0; i < string.length; i++) {
    hash += string.charCodeAt(i);
  }
  return hash % 5653;
}

// 存入
function map_set(key, value) {
  var index = hash(key);
  if (answer_question_map[index] === undefined) {
    answer_question_map[index] = [
      [key, value]
    ];
  } else {
    answer_question_map[index].push([key, value]);
  }
};

// 取出
function map_get(key) {
  var index = hash(key);
  if (answer_question_map[index] != undefined) {
    for (var i = 0; i < answer_question_map[index].length; i++) {
      if (answer_question_map[index][i][0] == key) {
        return answer_question_map[index][i][1];
      }
    }
  }
  return null
};

/**
 * 通过Http下载题库到本地，并进行处理，如果本地已经存在则无需下载
 */
if (!storage.contains('answer_question_map')) {
  // 使用牛七云云盘
  var answer_question_bank = http.get('http://r90w4pku5.hn-bkt.clouddn.com/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json')
  // 如果资源过期换成别的云盘
  if (!(answer_question_bank.statusCode >= 200 && answer_question_bank.statusCode < 300)) {
    // 使用腾讯云
    var answer_question_bank = http.get('https://xxqg-tiku-1305531293.cos.ap-nanjing.myqcloud.com/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json')
  }
  answer_question_bank = answer_question_bank.body.string();
  answer_question_bank = JSON.parse(answer_question_bank);

  for (var question in answer_question_bank) {
    var answer = answer_question_bank[question];
    // 根据选项就可以对应出题目，因此不需要存储完整问题，只需要存储选项
    if (vague_words.indexOf(answer) == -1) question = question.slice(question.indexOf('|') + 1);
    // 如果答案是以上的一些模糊词（无法根据选项就推测出题目），那么就需要存储整个问题
    else {
      question = question.slice(0, question.indexOf('|'));
      question = question.slice(0, question.indexOf(' '));
      question = question.slice(0, 10);
    }
    map_set(question, answer);
  }

  storage.put('answer_question_map', answer_question_map);
}

var answer_question_map = storage.get('answer_question_map');


/**
 * 模拟点击不可以点击元素
 * @param {UiObject / string} target 控件或者是控件文本
 */
function my_click_non_clickable(target) {
  if (typeof (target) == 'string') {
    text(target).waitFor();
    var tmp = text(target).findOne().bounds();
  } else {
    var tmp = target.bounds();
  }
  var randomX = random(tmp.left, tmp.right);
  var randomY = random(tmp.top, tmp.bottom);
  click(randomX, randomY);
}

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
  // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
  if (target == '我的') {
    id("comm_head_xuexi_mine").findOne().click();
  } else {
    click(target);
  }
}

/**
 * 答题
 * @param {int} depth_click_option 点击选项控件的深度，用于点击选项
 * @param {Image / string} img_question或question 问题截取图片或问题（挑战答题可以直接获取问题文本）
 */
function do_contest_answer(depth_click_option, img_question) {
  // 等待选项加载
  className('android.widget.RadioButton').depth(depth_click_option).clickable(true).waitFor();
  // 选项文字列表
  var options_text = [];
  // 获取所有选项控件，以RadioButton对象为基准，根据UI控件树相对位置寻找选项文字内容
  var options = className('android.widget.RadioButton').depth(depth_click_option).find();
  try {
    options.forEach((element, index) => {
      //挑战答题中，选项文字位于RadioButton对象的兄弟对象中
      options_text[index] = element.parent().child(1).text();
    });
  } catch (error) {
    options.forEach((element, index) => {
      // 对战答题中，选项截图区域为RadioButton的祖父对象
      var pos = element.parent().parent().bounds();
      var img = images.clip(captureScreen(), pos.left, pos.top, pos.width(), pos.height());
      var option_text = ocr.recognizeText(img);
      // 如果是四人赛双人对战还会带有A.需要处理
      if (option_text[1] == '.') {
        option_text = option_text.slice(2);
      }
      options_text[index] = option_text;
    });
  }

  // 将选项排序，为了统一格式，但要保留原顺序，为了选择，注意这里不要直接赋值，而需要concat()方法浅拷贝
  var original_options_text = options_text.concat();
  var sorted_options_text = options_text.sort();
  // 将题目改为指定格式
  var question = sorted_options_text.join('|');

  if (vague_words.indexOf(question) != -1) {
    if (typeof (img_question) == 'string') {
      question = img_question;
    } else {
      // 需要识别题目
      if (whether_improve_accuracy == 'yes') {
        if (baidu_or_huawei == 'huawei') var question = huawei_ocr_api(img_question);
        else var question = baidu_ocr_api(img_question);
      } else {
        try {
          var question = ocr.recognizeText(img_question);
        } catch (error) {
          toast("请将hamibot软件升级至最新版本");
          exit();
        }
        var question = ocr_processing(question, true);
      }
    }
    question.slice(0, 10);
  }

  try {
    var answer = map_get(question);
  } catch (error) {
  }

  // 如果本地题库没搜到，则搜网络题库
  if (!answer) {
    // 如果ocr了题目就用问题搜，否则用第一个选项搜
    question = question.indexOf('|') != -1 ? question.slice(0, question.indexOf('|')) : question

    var result;
    // 发送http请求获取答案 网站搜题速度 r1 > r2
    try {
      // 此网站只支持十个字符的搜索
      var r1 = http.get('http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question.slice(0, 10)));
      result = r1.body.string().match(/答案：.*</);
    } catch (error) {
    }
    // 如果第一个网站没获取到正确答案，则利用第二个网站
    if (!(result && result[0].charCodeAt(3) > 64 && result[0].charCodeAt(3) < 69)) {
      try {
        // 此网站只支持六个字符的搜索
        var r2 = http.get('https://www.souwen123.com/search/select.php?age=' + encodeURI(question.slice(0, 6)));
        result = r2.body.string().match(/答案：.*</);
      } catch (error) {
      }
    }

    if (result && options_text) {
      // 答案文本
      var result = result[0].slice(5, result[0].indexOf('<'));
      var option_i = original_options_text.indexOf(result);
      if (option_i != -1) {
        try {
          my_click_non_clickable(options[option_i]);
        } catch (error) {
          // 如果选项不存在，则点击第一个
          my_click_non_clickable(options[0]);
        }
      } else {
        // 如果没找到结果则根据相似度选择最相似的那个
        var max_similarity = 0;
        var max_similarity_index = 1;
        for (var i = 0; i < options_text.length; ++i) {
          var similarity = getSimilarity(options_text[i], result);
          if (similarity > max_similarity) {
            max_similarity = similarity;
            max_similarity_index = i;
          }
        }
        my_click_non_clickable(options[max_similarity_index]);
      }
    } else {
      // 没找到答案，点击第一个
      className('android.widget.RadioButton').depth(32).clickable(true).findOne().click();
    }
  }

  // 本地题库找到了答案
  if (answer && options_text) {
    // 注意这里一定要用original_options_text
    var option_i = original_options_text.indexOf(answer);
    try {
      my_click_non_clickable(options[option_i]);
    } catch (error) {
      // 如果选项不存在，则点击第一个
      my_click_non_clickable(options[0]);
    }
  } else {
    // 没找到答案，点击第一个
    className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOne().click();
  }
}

/**
 * ocr处理
 * @param {string} text 需要处理的文本
 * @param {boolean} if_question 是否处理的是问题（四人赛双人对战）
 */
function ocr_processing(text, if_question) {
  // 标点修改
  text = text.replace(/,/g, "，");
  text = text.replace(/〈〈/g, "《");
  text = text.replace(/〉〉/g, "》");
  text = text.replace(/\s*/g, "");
  text = text.replace(/_/g, "一");
  text = text.replace(/;/g, "；");
  text = text.replace(/o/g, "");
  text = text.replace(/。/g, "");
  text = text.replace(/`/g, "、");
  text = text.replace(/\?/g, "？");
  text = text.replace(/:/g, "：");
  text = text.replace(/!/g, "!");
  text = text.replace(/\(/g, "（");
  text = text.replace(/\)/g, "）");
  // 文字修改
  text = text.replace(/营理/g, "管理");
  text = text.replace(/土也/g, "地");
  text = text.replace(/未口/g, "和");
  text = text.replace(/晋查/g, "普查");
  text = text.replace(/扶悌/g, "扶梯");

  if (if_question) {
    text = text.slice(text.indexOf('.') + 1);
    text = text.slice(0, 10);
  }
  return text;
}

/**
 * 用于下面选择题
 * 获取2个字符串的相似度
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns {number} 相似度 
 */
function getSimilarity(str1, str2) {
  var sameNum = 0
  //寻找相同字符
  for (var i = 0; i < str1.length; i++) {
    for (var j = 0; j < str2.length; j++) {
      if (str1[i] === str2[j]) {
        sameNum++;
        break;
      }
    }
  }
  return sameNum / str2.length;
}
/*
********************调用华为API实现ocr********************
*/

/**
 * 获取用户token
 */
function get_huawei_token() {
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

if (whether_improve_accuracy == 'yes' && baidu_or_huawei == 'huawei') var token = get_huawei_token();

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

/*
********************调用百度API实现ocr********************
*/

/**
* 获取用户token
*/
function get_baidu_token() {
  var res = http.post(
    'https://aip.baidubce.com/oauth/2.0/token',
    {
      grant_type: 'client_credentials',
      client_id: AK,
      client_secret: SK
    }
  );
  return res.body.json()['access_token'];
}

if (whether_improve_accuracy == 'yes' && baidu_or_huawei == 'baidu') var token = get_baidu_token();

/**
* 百度ocr接口，传入图片返回文字
* @param {image} img 传入图片
* @returns {string} answer 文字
*/
function baidu_ocr_api(img) {
  var right_flag = false;
  var answer_left = "";
  var answer_right = "";
  var answer = "";
  var res = http.post(
    'https://aip.baidubce.com/rest/2.0/ocr/v1/general',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      access_token: token,
      image: images.toBase64(img),
    }
  );
  var res = res.body.json();
  try {
    var words_list = res.words_result;
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
       * location['left']表示定位位置的长方形左上顶点的水平坐标
       * location['top']表示定位位置的长方形左上顶点的垂直坐标
       */
      if (words_list[0].words.indexOf('.') != -1 && i > 0 &&
        Math.abs(words_list[i].location['left'] -
          words_list[i - 1].location['left']) > 100) right_flag = true;
      if (right_flag) answer_right += words_list[i].words;
      else answer_left += words_list[i].words;
      if (answer_left.length >= 20 || answer_right.length >= 20) break;
    }
  }
  answer = answer_right.length > answer_left.length ? answer_right : answer_left;
  answer = answer.replace(/\s*/g, "");
  answer = answer.replace(/,/g, "，");
  answer = answer.slice(answer.indexOf('.') + 1);
  answer = answer.slice(0, 20);
  return answer;
}

function do_contest() {
  // 识别题目并不需要整个题目都要ocr出来，可能只需要一行字，每次遍历找到最小行
  var min_pos_width = device.width;
  var min_pos_height = device.height;

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

    min_pos_width = Math.min(pos.width(), min_pos_width);
    min_pos_height = Math.min(pos.height(), min_pos_height);
    var img = images.clip(captureScreen(), pos.left, pos.top, min_pos_width, min_pos_height);

    do_contest_answer(32, img);

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
    do_contest();
    if (i == 0 && count == 2) {
      sleep(random_time(delay_time * 2));
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
  do_contest();
  sleep(random_time(delay_time));
  back();
  sleep(random_time(delay_time));
  back();
  my_click_clickable('退出');
}

//震动两秒
device.vibrate(1000);
toast('脚本运行完成');
