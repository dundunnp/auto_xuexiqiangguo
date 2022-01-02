/**
 * 待编写项：
 * 1. fill_in_blank() 填空题如果文本框有分开的情况还未解决
 */

auto.waitFor()

// 将设备保持常亮
device.keepScreenDim();

// 检查Hamibot是否为最新版
if (app.versionName != "1.1.0") {
    toast("请在Hamibot更新至最新版v1.1.0");
    exit();
}

// setScreenMetrics(1080, 2340);

// 获取基础数据
var { province } = hamibot.env;
var { channel } = hamibot.env;
var { delay_time } = hamibot.env;
var { whether_improve_accuracy } = hamibot.env;
var { all_weekly_answers_completed } = hamibot.env;
var { all_special_answer_completed } = hamibot.env;

delay_time = Number(delay_time) * 1000;
// 调用华为api所需参数
var { username } = hamibot.env;
var { password } = hamibot.env;
var { domainname } = hamibot.env;
var { projectname } = hamibot.env;
var { endpoint } = hamibot.env;
var { projectId } = hamibot.env;

//请求横屏截图权限
threads.start(function () {
    var beginBtn;
    if (beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time));
    else (beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time));
    beginBtn.click();
});
requestScreenCapture(false);
sleep(delay_time);

// 模拟点击不可以点击元素
function my_click_non_clickable(target) {
    text(target).waitFor();
    var tmp = text(target).findOne().bounds();
    click(tmp.centerX(), tmp.centerY());
}

// 模拟点击可点击元素
function my_click_clickable(target) {
    text(target).waitFor();
    // 由于部分机型在boundsInside函数上有bug，无法点击，遗弃
    // 防止点到页面中其他有包含“我的”的控件
    // if (target == '我的') {
    //     text('我的').boundsInside(device.width * 3/4 , 0, device.width, device.height / 2).findOne().click();
    // } else {
    //     click(target);
    // }
    click(target);
}

// 模拟随机时间
function random_time(time) {
    return time + random(100, 1000);
}

// 刷新页面
function refresh() {
    swipe(device.width / 2, device.height * 6 / 15, device.width / 2, device.height * 12 / 15, random_time(delay_time / 2));
    sleep(random_time(delay_time * 2));
}

/**
 * 如果因为某种不知道的bug退出了界面，则使其回到正轨
 * 全局变量back_track_flag说明:
 * back_track_flag = 0时，表示阅读部分
 * back_track_flag = 1时，表示视听部分
 * back_track_flag = 2时，表示竞赛、答题部分和准备部分
 */
function back_track() {
    app.launchApp('学习强国');
    sleep(random_time(delay_time * 3));
    var while_count = 0;
    while (!id('comm_head_title').exists() && while_count < 5) {
        while_count++;
        back();
        sleep(random_time(delay_time));
    }
    app.launchApp('学习强国');
    switch (back_track_flag) {
        case 0:
            // 去中心模块
            id('home_bottom_tab_icon_large').waitFor();
            var home_bottom = id('home_bottom_tab_icon_large').findOne().bounds();
            click(home_bottom.centerX(), home_bottom.centerY());
            // 去province模块
            text(province).depth(17).waitFor();
            var province_index = text(province).depth(17).findOne().bounds();
            click(province_index.centerX(), province_index.centerY());
            break;
        case 1:
            break;
        case 2:
            my_click_clickable('我的');
            my_click_clickable('学习积分');
            text('登录').waitFor();
            break;
    }
}

/*
*********************准备部分********************
*/
var back_track_flag = 2;

/**
 * 先获取有哪些模块还没有完成，并生成一个列表，其中第一个是我要选读文章模块，以此类推
 * 再获取阅读模块和视听模块已完成的时间和次数
 */

back_track();

var finish_list = [];
for (var i = 4; i < 17; i++) {
    var model = className('android.view.View').depth(22).findOnce(i);
    if (i == 4) {
        // 已阅读文章次数
        var completed_count = parseInt(model.child(2).text().match(/\d+/)) / 2;
    } else if (i == 5) {
        var other_model = className('android.view.View').depth(22).findOnce(i + 1);
        // 已观看视频时间
        var completed_time = Math.min(parseInt(model.child(2).text().match(/\d+/)),
            parseInt(other_model.child(2).text().match(/\d+/))) * 60000;
    } else if (i == 8) {
        var weekly_answer_scored = parseInt(model.child(2).text().match(/\d+/));
    } else if (i == 11) {
        // 四人赛已得分
        var four_players_scored = parseInt(model.child(2).text().match(/\d+/));
    } else if (i == 12) {
        // 双人对战已得分
        var two_players_scored = parseInt(model.child(2).text().match(/\d+/));
    }
    finish_list.push(model.child(3).text() == '已完成');
}

// 返回首页
className('android.view.View').clickable(true).depth(21).findOne().click();
id('my_back').waitFor();
id('my_back').findOne().click();
// 去province模块
// 这里有未知bug跳转不了
sleep(random_time(delay_time));
text(province).depth(17).waitFor();
var province_index = text(province).depth(17).findOne().bounds();
click(province_index.centerX(), province_index.centerY());

/*
**********本地频道*********
*/
if (!finish_list[12]) {
    my_click_clickable(channel);
    sleep(random_time(1000));
    back();
}

/*
*********************阅读部分********************
*/
var back_track_flag = 0;
/*
**********我要选读文章与分享*********
*/

// 阅读文章次数
var count = 0;

while ((count < 6 - completed_count) && !finish_list[0]) {
    refresh();

    if (!id('comm_head_title').exists() || !className('android.widget.TextView').depth(27).text('切换地区').exists()) back_track();
    sleep(random_time(delay_time));

    var article = id('general_card_image_id').find();

    if (article.length == 0) {
        refresh();
        continue;
    }

    for (var i = 0; i < article.length; i++) {

        sleep(random_time(500));

        try {
            click(article[i].bounds().centerX(),
                article[i].bounds().centerY());
        } catch (error) {
            continue;
        }

        sleep(random_time(delay_time));
        // 跳过专栏与音乐
        if (className("ImageView").depth(10).clickable(true).findOnce(1) == null ||
            textContains("专题").findOne(1000) != null) {
            back();
            continue;
        }

        // 观看时长
        sleep(random_time(65000));

        // 分享两次
        if (count < 2 && !finish_list[10]) {
            try {
                // 分享按键
                className("ImageView").depth(10).clickable(true).findOnce(1).click();
                my_click_clickable('分享到学习强国');
                sleep(random_time(delay_time));
                back();
                sleep(random_time(delay_time));
            } catch (error) {
            }
        }
        back();
        count++;
    }
    sleep(random_time(500));
}

/*
*********************视听部分********************
*/
back_track_flag = 1;

/*
**********视听学习、听学习时长*********
*/
if (!finish_list[1] || !finish_list[2]) {
    if (!id('comm_head_title').exists()) back_track();
    my_click_clickable('百灵');
    my_click_clickable('竖');
    // 等待视频加载
    sleep(random_time(delay_time * 3));
    // 点击第一个视频
    className('android.widget.FrameLayout').clickable(true).depth(24).findOne().click();
    
    sleep(random_time(delay_time));
    if (!id('iv_back').exists()) {
        // 最新版为v2.32.0
        className('android.widget.FrameLayout').clickable(true).depth(24).findOnce(7).click();
    }

    sleep(random_time(delay_time));
    if (text('继续播放').exists()) click('继续播放');
    if (text('刷新重试').exists()) click('刷新重试');
    // 阅读时间
    sleep(random_time(380000 - completed_time));
    back();
}

// 过渡
my_click_clickable('我的');
my_click_clickable('学习积分');

/*
*********************竞赛部分********************
*/
back_track_flag = 2;
// 注意：四人赛和双人对战因无法获取题目，需要ocr

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

/*
********************答题部分********************
*/

back_track_flag = 2;

// 填空题
function fill_in_blank(answer) {
    // 需要点击一下第一个框才能paste
    className('android.view.View').depth(25).findOne().click();
    setClip(answer);
    var blanks = className('android.view.View').depth(25).find();
    for (var i = 0; i < blanks.length; i++) {
        blanks[i].paste();
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

// 选择题
function multiple_choice(answer) {
    var whether_selected = false;
    // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
    var options = className('android.view.View').depth(26).find();
    for (var i = 1; i < options.length; i += 2) {
        if (answer.indexOf(options[i].text()) != -1) {
            // 答案正确
            my_click_non_clickable(options[i].text());
            // 设置标志位
            whether_selected = true;
        }
    }
    // 如果这里因为ocr错误没选到一个选项，那么则选择相似度最大的
    if (!whether_selected) {
        var max_similarity = 0;
        var max_similarity_index = 1;
        for (var i = 1; i < options.length; i += 2) {
            var similarity = getSimilarity(options[i].text(), answer);
            if (similarity > max_similarity) {
                max_similarity = similarity;
                max_similarity_index = i;
            }
        }
        my_click_non_clickable(options[max_similarity_index].text());
    }
}

// 多选题是否全选
function is_select_all_choice() {
    // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
    var options = className('android.view.View').depth(26).find();
    // question是题目(专项答题是第4个，其他是第2个)
    var question = (className('android.view.View').depth(23).findOnce(1).text().length > 2) ?
        className('android.view.View').depth(23).findOnce(1).text() :
        className('android.view.View').depth(23).findOnce(3).text();
    return options.length / 2 == (question.match(/\s+/g) || []).length;
}

/**
 * 点击对应的去答题或去看看
 * @param {int} number 7对应为每日答题模块，以此类推
 */
function entry_model(number) {
    var model = className('android.view.View').depth(22).findOnce(number);
    while (!model.child(3).click());
}

/**
 * 如果错误则重新答题
 * 全局变量restart_flag说明:
 * restart_flag = 0时，表示每日答题
 * restart_flag = 1时，表示每周答题
 */
function restart() {
    // 点击退出
    sleep(random_time(delay_time));
    back();
    my_click_clickable('退出');
    switch (restart_flag) {
        case 0:
            text('登录').waitFor();
            entry_model(7);
            break;
        case 1:
            // 设置标志位
            if_restart_flag = true;
            // 等待列表加载
            text('本月').waitFor();
            // 打开第一个出现未作答的题目
            while (!text('未作答').exists()) {
                swipe(500, 1700, 500, 500, random_time(delay_time / 2));
            }
            text('未作答').findOne().parent().click();
            break;
    }
}

/*
********************调用华为API实现ocr********************
*/

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
 * 答题
 * @param {int} number 需要做题目的数量
 */
function do_periodic_answer(number) {
    // 保证拿满分，如果ocr识别有误而扣分重来
    // flag为true时全对
    var flag = false;
    while (!flag) {
        sleep(random_time(delay_time));
        // 局部变量用于保存答案
        var answer = "";
        var num = 0;
        for (num; num < number; num++) {
            // 如果存在视频题
            if (className("android.widget.Image").exists()) {
                // 如果是每周答题那么重做也没用就直接跳过
                if (restart_flag == 1) {
                    fill_in_blank('cao');
                    sleep(random_time(delay_time * 2));
                    if (text('下一题').exists()) click('下一题');
                    if (text('确定').exists()) click('确定');
                    sleep(random_time(delay_time));
                    if (text('完成').exists()) {
                        click('完成');
                        flag = true;
                        break;
                    }
                } else {
                    restart();
                    break;
                }
            }

            // 下滑到底防止题目过长，选项没有读取到
            swipe(500, 1700, 500, 500, random_time(delay_time / 2));
            sleep(random_time(delay_time));

            // 判断是否是全选，这样就不用ocr
            if (textContains('多选题').exists() && is_select_all_choice()) {
                // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
                var options = className('android.view.View').depth(26).find();
                for (var i = 1; i < options.length; i += 2) {
                    my_click_non_clickable(options[i].text());
                }
            } else {
                my_click_clickable('查看提示');
                // 打开查看提示的时间
                sleep(random_time(delay_time));
                var img = images.inRange(captureScreen(), '#800000', '#FF0000');
                if (if_restart_flag && whether_improve_accuracy == 'yes') answer = huawei_ocr_api(img);
                else {
                    try {
                        answer = ocr.ocrImage(img).text;
                    } catch (error) {
                        toast("请将hamibot软件升级至最新版本");
                        exit();
                    }
                }
                answer = ocr_processing(answer, false);

                text('提示').waitFor();
                back();
                sleep(random_time(delay_time));

                if (textContains('多选题').exists() || textContains('单选题').exists()) {
                    multiple_choice(answer);
                } else {
                    fill_in_blank(answer);
                }
            }

            sleep(random_time(delay_time * 2));
            // 对于专项答题没有确定
            if (text('下一题').exists()) {
                click('下一题');
            } else {
                // 不是专项答题时
                click('确定');
                sleep(random_time(delay_time)); // 等待提交的时间
                // 如果错误（ocr识别有误）则重来
                if (text('下一题').exists() || (text('完成').exists() && !special_flag)) {
                    // 如果没有选择精确答题，则每周答题就不需要重新答
                    if (restart_flag == 1 && whether_improve_accuracy == 'no') {
                        click('下一题');
                    } else {
                        restart();
                        break;
                    }
                }
            }

            sleep(random_time(delay_time * 2)); // 每题之间的过渡时间
        }
        if (num == number) flag = true;
    }
}

/*
**********每日答题*********
*/
var restart_flag = 0;

if (!finish_list[3]) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    entry_model(7);
    // 等待题目加载
    text('查看提示').waitFor();
    do_periodic_answer(5);
    my_click_clickable('返回');
}

/*
**********每周答题*********
*/
var restart_flag = 1;
// 是否重做过，如果重做，也即错了，则换用精度更高的华为ocr
var if_restart_flag = false;

if (!finish_list[4] && weekly_answer_scored < 4) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    entry_model(8);
    // 等待列表加载
    textContains('月').waitFor();
    sleep(random_time(delay_time));
    // 打开第一个出现未作答的题目
    // 如果之前的答题全部完成则不向下搜索
    if (all_weekly_answers_completed == 'no') {
        while (!text('未作答').exists()) {
            swipe(500, 1700, 500, 500, random_time(delay_time / 2));
        }
    }
    if (text('未作答').exists()) {
        text('未作答').findOne().parent().click();
        do_periodic_answer(5);
        my_click_clickable('返回');
        sleep(random_time(delay_time));
    }
    className('android.view.View').clickable(true).depth(23).waitFor();
    className('android.view.View').clickable(true).depth(23).findOne().click();
}

/*
**********专项答题*********
*/
if (!finish_list[5]) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    entry_model(9);
    // 等待列表加载
    className('android.view.View').clickable(true).depth(23).waitFor();
    // 打开第一个出现未完成作答的题目
    // 第一个未完成作答的索引
    var special_i = 0;
    // 是否找到未作答的标志
    var special_flag = false;
    // 是否答题的标志
    var is_answer_special_flag = false;

    // 如果之前的答题全部完成则不向下搜索
    if (all_special_answer_completed == 'yes') {
        special_flag = true;
    }
    while (!special_flag) {
        if (text('开始答题').exists()) {
            special_flag = true;
            break;
        }
        while (text('继续答题').findOnce(special_i)) {
            if (text('继续答题').findOnce(special_i).parent().childCount() < 3) {
                special_flag = true;
                break;
            } else {
                special_i++;
            }
        }
        if (!special_flag)
            swipe(500, 1700, 500, 500, random_time(delay_time / 2));
    }

    if (text('开始答题').exists()) {
        text('开始答题').findOne().click();
        is_answer_special_flag = true;
        do_periodic_answer(10);
    } else if (text('继续答题').exists()) {
        text('继续答题').findOnce(special_i).click();
        // 等待题目加载
        sleep(random_time(delay_time));
        // 已完成题数
        var completed_num = parseInt(className('android.view.View').depth(24).findOnce(1).text());
        is_answer_special_flag = true;
        do_periodic_answer(10 - completed_num + 1);
    } else {
        sleep(random_time(delay_time));
        className('android.view.View').clickable(true).depth(23).waitFor();
        className('android.view.View').clickable(true).depth(23).findOne().click();
    }

    if (is_answer_special_flag) {
        // 点击完成
        sleep(random_time(delay_time));
        text('完成').waitFor();
        text('完成').click();
        // 点击退出
        sleep(random_time(delay_time));
        className('android.view.View').clickable(true).depth(20).waitFor();
        className('android.view.View').clickable(true).depth(20).findOne().click();
        sleep(random_time(delay_time));
        className('android.view.View').clickable(true).depth(23).waitFor();
        className('android.view.View').clickable(true).depth(23).findOne().click();
    }
}

/*
**********挑战答题*********
*/
if (!finish_list[6]) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    entry_model(10);
    // 加载页面
    className('android.view.View').clickable(true).depth(22).waitFor();
    // flag为true时挑战成功拿到6分
    var flag = false;
    while (!flag) {
        sleep(random_time(delay_time * 3));
        var num = 0;
        while (num < 5) {
            // 每题的过渡
            sleep(random_time(delay_time * 2));
            // 如果答错，第一次通过分享复活
            if (text('分享就能复活').exists()) {
                num -= 2;
                click('分享就能复活');
                sleep(random_time(delay_time / 2));
                back();
                // 等待题目加载
                sleep(random_time(delay_time * 3));
            }
            // 第二次重新开局
            if (text('再来一局').exists()) {
                my_click_clickable('再来一局');
                break;
            }
            // 题目
            var question = className('android.view.View').depth(25).findOne().text();
            // 截取到下划线前
            question = question.slice(0, question.indexOf(' '));
            // 截取前20个字符就行
            question = question.slice(0, 20);
            do_contest_answer(28, question);
            num++;
        }
        sleep(random_time(delay_time * 2));
        if (num == 5 && !text('再来一局').exists() && !text('结束本局').exists()) flag = true;
    }
    // 随意点击直到退出
    do {
        sleep(random_time(delay_time * 2.5));
        className('android.widget.RadioButton').depth(28).findOne().click();
        sleep(random_time(delay_time * 2.5));
    } while (!text('再来一局').exists() && !text('结束本局').exists());
    click('结束本局');
    sleep(random_time(delay_time));
    back();
}

/*
********************四人赛、双人对战********************
*/
function do_contest() {
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
        else {
            try {
                var question = ocr.ocrImage(img).text;
            } catch (error) {
                toast("请将hamibot软件升级至最新版本");
                exit();
            }
            var question = ocr_processing(question, true);
        }


        log(question);
        className('android.widget.RadioButton').depth(32).waitFor();
        if (question) do_contest_answer(32, question);
        else className('android.widget.RadioButton').depth(32).findOne().click();
        // 等待新题目加载
        while (!textMatches(/第\d题/).exists() && !text('继续挑战').exists() && !text('开始').exists());
    }
}

/*
**********四人赛*********
*/
if (!finish_list[7] && four_players_scored < 3) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    className('android.view.View').depth(21).text('学习积分').waitFor();
    entry_model(11);

    for (var i = 0; i < 2; i++) {
        sleep(random_time(delay_time));
        my_click_clickable('开始比赛');
        do_contest();
        if (i == 0) {
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
if (!finish_list[8] && two_players_scored < 1) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
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

/*
**********订阅*********
*/
if (!finish_list[9]) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    entry_model(13);
    // 等待加载
    className("android.view.View").desc("强国号\nTab 1 of 2").waitFor();
    sleep(random_time(delay_time));
    // 获取第一个订阅按钮位置
    var subscribe_button_pos = className('android.widget.ImageView').clickable(true).depth(16).findOnce(1).bounds();
    // 订阅数
    var num_subscribe = 0;

    for (var i = 0; i < 8; i++) {
        className('android.view.View').clickable(true).depth(15).findOnce(i).click();
        sleep(random_time(delay_time));
        // 刷新次数
        var num_refresh = 0;
        // 定义最大刷新次数
        if (i == 3 || i == 4 || i == 6) var max_num_refresh = 40;
        else if (i == 0) var max_num_refresh = 4;
        else if (i == 1) var max_num_refresh = 6;
        else var max_num_refresh = 8;
        while (num_subscribe < 2 && num_refresh < max_num_refresh) {
            do {
                var subscribe_pos = findColor(captureScreen(), '#E42417', {
                    region: [subscribe_button_pos.left, subscribe_button_pos.top,
                    subscribe_button_pos.width(), device.height - subscribe_button_pos.top],
                    threshold: 10,
                });
                if (subscribe_pos) {
                    sleep(random_time(delay_time * 2));
                    click(subscribe_pos.x + subscribe_button_pos.width() / 2, subscribe_pos.y + subscribe_button_pos.height() / 2);
                    num_subscribe++;
                    sleep(random_time(delay_time));
                }
            } while (subscribe_pos && num_subscribe < 2);
            swipe(device.width / 2, device.height - subscribe_button_pos.top, device.width / 2, subscribe_button_pos.top, random_time(0));
            num_refresh++;
            sleep(random_time(delay_time / 2));
        }
        if (num_subscribe >= 2) break;
        sleep(random_time(delay_time * 2));
    }
    // 退回
    className("android.widget.Button").clickable(true).depth(11).findOne().click();
}

/*
**********发表观点*********
*/
if (!finish_list[11]) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(21).text('学习积分').exists()) back_track();
    entry_model(15);
    var speechs = ["好好学习，天天向上", "大国领袖，高瞻远瞩", "请党放心，强国有我", "坚持信念，砥砺奋进", "团结一致，共建美好"];
    // 随意找一篇文章
    sleep(random_time(delay_time));
    my_click_clickable('推荐');
    sleep(random_time(delay_time * 2));
    className('android.widget.FrameLayout').clickable(true).depth(22).findOnce(0).click();
    sleep(random_time(delay_time * 2));
    my_click_clickable('欢迎发表你的观点');
    sleep(random_time(delay_time));
    setText(speechs[random(0, speechs.length - 1)]);
    sleep(random_time(delay_time));
    my_click_clickable('发布');
    sleep(random_time(delay_time * 2));
    my_click_clickable('删除');
    sleep(random_time(delay_time));
    my_click_clickable('确认');
}

// var num_subscribe = 0;

// while (num_subscribe < 2) {
//     // 奇数为按钮
//     var i = 1;
//     while (className('android.widget.ImageView').clickable(true).depth(16).findOnce(i) && num_subscribe < 2) {
//         var subscribe_button_pos = className('android.widget.ImageView').clickable(true).depth(16).findOnce(i).bounds();
//         if (i == 1) {
//             var first_subscribe_button_pos_top = subscribe_button_pos.top;
//             // 是否有一个是未订阅的
//             var all_is_subscribe = findColor(captureScreen(), '#E42417', {
//                 region: [subscribe_button_pos.left, subscribe_button_pos.top,
//                 subscribe_button_pos.width(), device.height - subscribe_button_pos.top],
//                 threshold: 10,
//             });
//         }
//         if (all_is_subscribe) {
//             var subscribe = findColor(captureScreen(), '#E42417', {
//                 region: [subscribe_button_pos.left, subscribe_button_pos.top,
//                 subscribe_button_pos.width(), subscribe_button_pos.height()],
//                 threshold: 10,
//             });
//             if (subscribe) {
//                 className('android.widget.ImageView').clickable(true).depth(16).findOnce(i).click();
//                 num_subscribe++;
//                 sleep(random_time(delay_time));
//             }
//         } else {
//             // 如果到底则直接退出
//             if (num_fine_tuning && num_fine_tuning >= 8) {
//                 toast('已经没有新的平台可以订阅');
//                 num_subscribe = 2;
//                 break;
//             }
//         }
//         i += 2;
//     }
//     // 滑到上个页面中最后一个按钮的下一个
//     if (num_subscribe < 2) {
//         var last_subscribe_button_pos_top = className('android.widget.ImageView').clickable(true).depth(16).findOnce(i - 2).bounds().top;
//         var last_subscribe_desc = className('android.widget.ImageView').clickable(true).depth(16).findOnce(i - 2).parent().child(1).desc();

//         swipe(device.width / 2, last_subscribe_button_pos_top - subscribe_button_pos.width(), device.width / 2, first_subscribe_button_pos_top, random_time(0));
//         // 微调次数如果过大则表明到底了
//         var num_fine_tuning = 0;
//         while (desc(last_subscribe_desc).exists() && num_fine_tuning < 8) {
//             swipe(device.width / 2, device.height / 2 + subscribe_button_pos.width() * 2, device.width / 2, device.height / 2, random_time(0));
//             num_fine_tuning++;
//         }
//         sleep(random_time(delay_time));
//     }
// }

device.cancelKeepingAwake();

//震动两秒
device.vibrate(1000);
toast('脚本运行完成');
