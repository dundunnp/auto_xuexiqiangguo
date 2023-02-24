/* **********************请填写如下信息********************** */

/**
 * 跳转页面加载的时间(以秒s为单位)
 * 默认为1s(支持小数点形式)，根据手机性能与网络情况自行而定
 * 时间越长出bug的可能越小，但同时耗费的时间越长
 *  */
var delay_time = 1;

/**
 * 是否完成四人赛
 * 请填入"yes"或"no"(默认为"yes")
 *  */
var four_player_battle = "yes";

/**
 * 完成四人赛几次(只能选择1或2)
 * 默认为2
 *  */
var count = 2;

/**
 * 是否完成双人对战
 * 请填入"yes"或"no"(默认为"yes")
 *  */
var two_player_battle = "yes";

/**
 * 请在双引号里填写百度AK和SK，如何获取请看README
 *  */
var AK = "";
var SK = "";

/* **********************请填写如上信息********************** */

auto.waitFor()
count = Number(count);
delay_time = Number(delay_time) * 1000;

// 本地存储数据
var storage = storages.create('data');
// 更新题库为answer_question_map3
storage.remove('answer_question_map1');
storage.remove('answer_question_map2');
storage.remove('answer_question_map3');

//请求横屏截图权限
threads.start(function () {
    try {
        var beginBtn;
        if (beginBtn = classNameContains('Button').textContains("开始").findOne(delay_time));
        else (beginBtn = classNameContains('Button').textContains("允许").findOne(delay_time));
        beginBtn.click();
    } catch (error) {
    }
});
requestScreenCapture(false);
sleep(delay_time);

if (whether_improve_accuracy == 'yes' && !AK) {
    toast("如果你选择了增强版，请配置信息，具体看脚本说明");
    exit();
}

/**
 * 定义HashTable类，用于存储本地题库，查找效率更高
 * 由于hamibot不支持存储自定义对象和new Map()，因此这里用列表存储自己实现
 * 在存储时，不需要存储整个question，可以仅根据选项来对应question，这样可以省去ocr题目的花费
 * 但如果遇到选项为special_problem数组中的模糊词，无法对应question，则需要存储整个问题
 */

var answer_question_map = [];

// 当题目为这些词时，题目较多会造成hash表上的一个index过多，此时存储其选项
var special_problem = '选择正确的读音 选择词语的正确词形 下列词形正确的是 根据《中华人民共和国';

/**
 * hash函数
 * 6469通过从3967到5591中的质数，算出的最优值，具体可以看评估代码
 */
function hash(string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        hash += string.charCodeAt(i);
    }
    return hash % 6469;
}

// 存入
function map_set(key, value) {
    var index = hash(key);
    if (answer_question_map[index] === undefined) {
        answer_question_map[index] = [
            [key, value]
        ];
    } else {
        // 去重
        for (var i = 0; i < answer_question_map[index].length; i++) {
            if (answer_question_map[index][i][0] == key) {
                return null;
            }
        }
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
    return null;
};

/**
 * 通过Http下载题库到本地，并进行处理，如果本地已经存在则无需下载
 */
if (!storage.contains('answer_question_map')) {
    toast("正在下载题库");
    // 使用 Github 文件加速服务：https://git.yumenaka.net
    var answer_question_bank = http.get("https://git.yumenaka.net/https://raw.githubusercontent.com/McMug2020/XXQG_TiKu/main/%E9%A2%98%E5%BA%93_McMug2020.json");
    sleep(random_time(delay_time * 5));
    // 如果资源过期或无法访问则换成别的地址
    if (!(answer_question_bank.statusCode >= 200 && answer_question_bank.statusCode < 300)) {
        // 使用XXQG_TiKu挑战答题腾讯云题库地址
        var answer_question_bank = http.get("https://xxqg-tiku-1305531293.cos.ap-nanjing.myqcloud.com/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json");
        toast("下载XXQG_TiKu题库");
        sleep(random_time(delay_time * 5));
    }
    answer_question_bank = answer_question_bank.body.string();
    answer_question_bank = JSON.parse(answer_question_bank);

    for (var question in answer_question_bank) {
        var answer = answer_question_bank[question];
        if (special_problem.indexOf(question.slice(0, 7)) != -1) question = question.slice(question.indexOf('|') + 1);
        else {
            question = question.slice(0, question.indexOf('|'));
            question = question.slice(0, question.indexOf(' '));
            question = question.slice(0, 10);
        }
        map_set(question, answer);
    }
    sleep(random_time(delay_time * 5));
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
    var model = className('android.view.View').depth(24).findOnce(number);
    while (!model.child(4).click());
}

// 模拟点击可点击元素
function my_click_clickable(target) {
    text(target).waitFor();
    // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
    if (target == '我的') {
        id('comm_head_xuexi_mine').findOne().click();
    } else {
        click(target);
    }
}

/**
 * 选出选项
 * @param {answer} answer 答案
 * @param {int} depth_click_option 点击选项控件的深度，用于点击选项
 * @param {list[string]} options_text 每个选项文本
 */
function select_option(answer, depth_click_option, options_text) {
    // 注意这里一定要用original_options_text
    var option_i = options_text.indexOf(answer);
    // 如果找到答案对应的选项
    if (option_i != -1) {
        try {
            className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce(option_i).click();
            return;
        } catch (error) {
        }
    }

    // 如果运行到这，说明很有可能是选项ocr错误，导致答案无法匹配，因此用最大相似度匹配
    if (answer != null) {
        var max_similarity = 0;
        var max_similarity_index = 0;
        for (var i = 0; i < options_text.length; ++i) {
            if (options_text[i]) {
                var similarity = getSimilarity(options_text[i], answer);
                if (similarity > max_similarity) {
                    max_similarity = similarity;
                    max_similarity_index = i;
                }
            }
        }
        try {
            className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce(max_similarity_index).click();
            return;
        } catch (error) {
        }
    } else {
        try {
            // 没找到答案，点击第一个
            className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOne(delay_time * 3).click();
        } catch (error) {
        }
    }
}

/**
 * 答题（挑战答题、四人赛与双人对战）
 * @param {int} depth_click_option 点击选项控件的深度，用于点击选项
 * @param {string} question 问题
 * @param {list[string]} options_text 每个选项文本
 */
function do_contest_answer(depth_click_option, question, options_text) {
    question = question.slice(0, 10);
    // 如果是特殊问题需要用选项搜索答案，而不是问题
    if (special_problem.indexOf(question.slice(0, 7)) != -1) {
        var original_options_text = options_text.concat();
        var sorted_options_text = original_options_text.sort();
        question = sorted_options_text.join('|');
    }
    // 从哈希表中取出答案
    var answer = map_get(question);

    // 如果本地题库没搜到，则搜网络题库
    if (answer == null) {
        var result;
        // 发送http请求获取答案 网站搜题速度 r1 > r2
        try {
            // 此网站只支持十个字符的搜索
            var r1 = http.get("http://www.syiban.com/search/index/init.html?modelid=1&q=" + encodeURI(question.slice(0, 10)));
            result = r1.body.string().match(/答案：.*</);
        } catch (error) {
        }
        // 如果第一个网站没获取到正确答案，则利用第二个网站
        if (!(result && result[0].charCodeAt(3) > 64 && result[0].charCodeAt(3) < 69)) {
            try {
                // 此网站只支持六个字符的搜索
                var r2 = http.get("https://www.souwen123.com/search/select.php?age=" + encodeURI(question.slice(0, 6)));
                result = r2.body.string().match(/答案：.*</);
            } catch (error) {
            }
        }

        if (result) {
            // 答案文本
            var result = result[0].slice(5, result[0].indexOf('<'));
            log("答案: " + result);
            select_option(result, depth_click_option, options_text);
        } else {
            // 没找到答案，点击第一个
            try {
                className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOne(delay_time * 3).click();
            } catch (error) {
            }
        }
    } else {
        log("答案: " + answer);
        select_option(answer, depth_click_option, options_text);
    }
}

/**
 * 用于下面选择题
 * 获取2个字符串的相似度
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns {number} 相似度
 */
function getSimilarity(str1, str2) {
    var sameNum = 0;
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
 ********************调用百度API实现ocr********************
 */

/**
 * 获取用户token
 */
function get_baidu_token() {
    var res = http.post("https://aip.baidubce.com/oauth/2.0/token", {
        grant_type: "client_credentials",
        client_id: AK,
        client_secret: SK,
    });
    return res.body.json()["access_token"];
}

if (whether_improve_accuracy == "yes") var token = get_baidu_token();

/**
 * 百度ocr接口，传入图片返回文字和选项文字
 * @param {image} img 传入图片
 * @returns {string} question 文字
 * @returns {list[string]} options_text 选项文字
 */
function baidu_ocr_api(img) {
    var options_text = [];
    var question = "";
    var res = http.post("https://aip.baidubce.com/rest/2.0/ocr/v1/general", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        access_token: token,
        image: images.toBase64(img),
    });
    var res = res.body.json();
    try {
        var words_list = res.words_result;
    } catch (error) { }
    if (words_list) {
        // question是否读取完成的标志位
        var question_flag = false;
        for (var i in words_list) {
            if (!question_flag) {
                // 如果是选项则后面不需要加到question中
                if (words_list[i].words[0] == "A") question_flag = true;
                // 将题目读取到下划线处，如果读到下划线则不需要加到question中
                // 利用location之差判断是否之中有下划线
                /**
                 * location:
                 * 识别到的文字块的区域位置信息，列表形式，
                 * location['left']表示定位位置的长方形左上顶点的水平坐标
                 * location['top']表示定位位置的长方形左上顶点的垂直坐标
                 */
                if (words_list[0].words.indexOf(".") != -1 && i > 0 && Math.abs(words_list[i].location["left"] - words_list[i - 1].location["left"]) > 100) question_flag = true;
                if (!question_flag) question += words_list[i].words;
                // 如果question已经大于10了也不需要读取了
                if (question > 10) question_flag = true;
            }
            // 这里不能用else，会漏读一次
            if (question_flag) {
                // 其他的就是选项了
                if (words_list[i].words[1] == ".") options_text.push(words_list[i].words.slice(2));
            }
        }
    }
    // 处理question
    question = question.replace(/\s*/g, "");
    question = question.replace(/,/g, "，");
    question = question.slice(question.indexOf(".") + 1);
    question = question.slice(0, 10);
    return [question, options_text];
}

/**
 * 从ocr.recognize()中提取出题目和选项文字
 * @param {object} object ocr.recongnize()返回的json对象
 * @returns {string} question 文字
 * @returns {list[string]} options_text 选项文字
 * */
function extract_ocr_recognize(object) {
    var options_text = [];
    var question = "";
    var words_list = object.results;
    if (words_list) {
        // question是否读取完成的标志位
        var question_flag = false;
        for (var i in words_list) {
            if (!question_flag) {
                // 如果是选项则后面不需要加到question中
                if (words_list[i].text[0] == "A") question_flag = true;
                // 将题目读取到下划线处，如果读到下划线则不需要加到question中
                // 利用bounds之差判断是否之中有下划线
                /**
                 * bounds:
                 * 识别到的文字块的区域位置信息，列表形式，
                 * bounds.left表示定位位置的长方形左上顶点的水平坐标
                 */
                if (words_list[0].text.indexOf(".") != -1 && i > 0 && Math.abs(words_list[i].bounds.left - words_list[i - 1].bounds.left) > 100) question_flag = true;
                if (!question_flag) question += words_list[i].text;
                // 如果question已经大于10了也不需要读取了
                if (question > 10) question_flag = true;
            }
            // 这里不能用else，会漏读一次
            if (question_flag) {
                // 其他的就是选项了
                if (words_list[i].text[1] == ".") options_text.push(words_list[i].text.slice(2));
                // else则是选项没有读取完全，这是由于hamibot本地ocr比较鸡肋，无法直接ocr完的缘故
                else options_text[options_text.length - 1] = options_text[options_text.length - 1] + words_list[i].text;
            }
        }
    }
    question = ocr_processing(question, true);
    return [question, options_text];
}

/**
 * 本地ocr标点错词处理
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
        text = text.slice(text.indexOf(".") + 1);
        text = text.slice(0, 10);
    }
    return text;
}

/*
********************四人赛、双人对战********************
 */

/**
 * 处理访问异常
 */
function handling_access_exceptions() {
    // 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
    var thread_handling_access_exceptions = threads.start(function () {
        while (true) {
            textContains("访问异常").waitFor();
            sleep(random_time(delay_time * 2));
            // 如果是新版验证，手动方式
            if (text("拖动滑块直到出现").exists()) {
                // 震动提示
                device.vibrate(1000);
                sleep(random_time(delay_time * 4));
            } else {
                // 旧版验证
                // 滑动按钮">>"位置
                idContains("nc_1_n1t").waitFor();
                var bound = idContains("nc_1_n1t").findOne().bounds();
                // 滑动边框位置
                text("向右滑动验证").waitFor();
                var slider_bound = text("向右滑动验证").findOne().bounds();

                // 通过随机选择动作库中的手势验证
                /**
                 * 动作库
                 */
                // x轴起点位置
                var x_start = bound.centerX();
                // x轴终点位置
                var x_end = slider_bound.right;
                // y轴位置
                var y = random(bound.top, bound.bottom);
                // 随机选择手势
                var choice_number = random(1, 3);
                switch (choice_number) {
                    case 1:
                        // 1. 先左后右，快速
                        gesture(random_time(delay_time) * random(), [x_start, y], [x_end, y])
                        break
                    case 2:
                        // 2. 先左后右，慢速
                        gesture(random_time(delay_time) * random(1, 4), [x_start, y], [x_end, y])
                        break
                    case 3:
                        // 3. 先右到中右位置后到中左位置再右
                        var x_mid = (x_end - x_start) * random(5, 8) / 10 + x_start;
                        var back_x = (x_end - x_start) * random(2, 3) / 10;
                        gesture(random_time(delay_time), [x_start, y], [x_mid, y], [x_mid - back_x, y], [x_end, y]);
                        break
                }
            }
            sleep(random_time(delay_time * 2));
            if (textContains("刷新").exists()) {
                my_click_clickable('刷新');
            }
            if (textContains("网络开小差").exists()) {
                // 重答
                my_click_clickable("确定");
                text("登录").waitFor();
                entry_model('每日答题');
                log("等待:" + "查看提示");
                text("查看提示").waitFor();
                do_periodic_answer(5);
            }
        }
    });
    return thread_handling_access_exceptions;
}

/* 
处理访问异常，滑动验证
*/
var thread_handling_access_exceptions = handling_access_exceptions();

/**
 * 答题
 */
function do_contest() {
    while (!text("开始").exists());
    while (!text("继续挑战").exists()) {
        // 等待下一题题目加载

        className("android.view.View").depth(28).waitFor();
        var pos = className("android.view.View").depth(28).findOne().bounds();
        if (className("android.view.View").text("        ").exists()) pos = className("android.view.View").text("        ").findOne().bounds();
        do {
            var point = findColor(captureScreen(), "#1B1F25", {
                region: [pos.left, pos.top, pos.width(), pos.height()],
                threshold: 10,
            });
        } while (!point);
        // 等待选项加载

        className("android.widget.RadioButton").depth(32).clickable(true).waitFor();
        var img = images.inRange(captureScreen(), "#000000", "#444444");
        img = images.clip(img, pos.left, pos.top, pos.width(), device.height - pos.top);
        if (whether_improve_accuracy == "yes") {
            var result = baidu_ocr_api(img);
            var question = result[0];
            var options_text = result[1];
        } else {
            try {
                var result = extract_ocr_recognize(ocr.recognize(img));
                var question = result[0];
                var options_text = result[1];
            } catch (error) {
                exit();
            }
        }
        img.recycle();
        log("题目: " + question);
        log("选项: " + options_text);
        if (question) do_contest_answer(32, question, options_text);
        else {
            className("android.widget.RadioButton").depth(32).waitFor();
            className("android.widget.RadioButton").depth(32).findOne(delay_time * 3).click();
        }

        // 等待新题目加载
        while (!textMatches(/第\d题/).exists() && !text("继续挑战").exists() && !text("开始").exists());
    }
}

if (!className('android.view.View').depth(22).text('学习积分').exists()) {
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
    log("四人赛");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    className("android.view.View").depth(22).text("学习积分").waitFor();
    entry_model(10);

    for (var i = 0; i < 2; i++) {
        sleep(random_time(delay_time));
        my_click_clickable("开始比赛");

        do_contest();

        if (i == 0) {
            sleep(random_time(delay_time * 2));

            my_click_clickable("继续挑战");

            sleep(random_time(delay_time));
        }
    }
    sleep(random_time(delay_time * 3));
    back();
    sleep(random_time(delay_time));
    back();
}

/*
**********双人对战*********
*/
if (two_player_battle == 'yes') {
    log("双人对战");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    className("android.view.View").depth(22).text("学习积分").waitFor();
    entry_model(11);

    // 点击随机匹配

    text("随机匹配").waitFor();
    sleep(random_time(delay_time * 2));
    try {
        className("android.view.View").clickable(true).depth(24).findOnce(1).click();
    } catch (error) {
        className("android.view.View").text("").findOne().click();
    }

    do_contest();

    sleep(random_time(delay_time));
    back();
    sleep(random_time(delay_time));
    back();
    my_click_clickable("退出");
}

// 震动半秒
device.vibrate(500);
toast('脚本运行完成');
exit();
