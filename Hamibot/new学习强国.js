/**
 * 获取配置参数及本地存储数据
 */
// 基础数据
var { delay_time } = hamibot.env;
delay_time = Number(delay_time) * 1000;
var { whether_improve_accuracy } = hamibot.env;
var { all_weekly_answers_completed, all_special_answer_completed } = hamibot.env;
var { whether_complete_subscription } = hamibot.env;
var { whether_complete_speech } = hamibot.env;
var { sct_token, pushplus_token } = hamibot.env;
var { whether_mute } = hamibot.env;
var { whether_froze_app } = hamibot.env;

// 调用百度api所需参数
var { AK, SK } = hamibot.env;

// 本地存储数据
var storage = storages.create("data");

/**
 * 检查和设置运行环境
 * @param whether_mute {String} 是否在运行过程中静音 "yes":开启; "no"(默认):不开启
 * @param whether_froze_app {String} 是否要冻结学习强国(需要root授权) "yes":开启; "no"(默认):不开启
 * @param open_console {Boolean} 是否开启控制台悬浮窗 true:开启; false(默认):不开启
 * @param whether_improve_accuracy {String} 是否提高ocr精度 "yes":开启; "no"(默认):不开启
 * @param AK {String} 百度API KEY
 * @param SK {String} 百度Secret KEY
 * @return {int} 静音前的音量
 */
function check_set_env(whether_mute, whether_froze_app,
    open_console, whether_improve_accuracy, AK, SK) {
    // 检查无障碍服务是否已经启用
    auto.waitFor();

    // 检查在选择提高精确度的情况下，AK和SK是否填写
    if (whether_improve_accuracy == "yes" && (!AK || !SK)) {
        toast("如果你选择了增强版，请配置信息，具体看脚本说明");
        exit();
    }

    // 检查Hamibot版本是否支持ocr
    if (app.versionName < "1.3.1") {
        toast("请将Hamibot更新至v1.3.1版本或更高版本");
        exit();
    }

    // 将设备保持常亮
    device.keepScreenDim();

    //请求横屏截图权限
    threads.start(function () {
        try {
            var beginBtn;
            if ((beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time)));
            else beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time);
            beginBtn.click();
        } catch (error) { }
    });
    requestScreenCapture(false);

    // 是否开启控制台悬浮窗
    if (open_console == "yes") console.show();

    // 可选，是否静音,需要给hamibot添加修改系统设置权限
    if (whether_mute == "yes") {
        // 保留静音前音量大小
        var vol = device.getMusicVolume();
        device.setMusicVolume(0);
    }

    // 可选，是否要冻结学习强国，该操作需要root授权
    if (whether_froze_app == "yes") {
        result = shell("pm enable cn.xuexi.android", true);
        if (result.code != 0 || result) {
            toast("解冻失败，请查看配置模式中的'冻结学习强国'选项是否选择'否'");
            if (pushplus_token)
                push_weixin_message("解冻失败，请查看配置模式中的'冻结学习强国'选项是否选择'否'");
            exit(0);
        }
    }

    return vol;
}


// 更新题库为answer_question_map1
storage.remove("answer_question_map");

var vol = check_set_env(whether_mute, whether_froze_app,
    "no", whether_improve_accuracy, AK, SK);

/**
 * 定义HashTable类(貌似hamibot有问题，无法定义class， 因此写为函数)，用于存储本地题库，查找效率更高
 * 由于hamibot不支持存储自定义对象和new Map()，因此这里用列表存储自己实现
 * 在存储时，不需要存储整个question，可以仅根据选项来对应question，这样可以省去ocr题目的花费
 * 但如果遇到选项为special_problem数组中的模糊词，无法对应question，则需要存储整个问题
 */
var answer_question_map = [];

// 当题目为这些词时，题目较多会造成hash表上的一个index过多，此时存储其选项
var special_problem = "选择正确的读音 选择词语的正确词形 下列词形正确的是 根据《中华人民共和国";
// 当题目为这些词时，在线搜索书名号和逗号后的内容
var special_problem2 = "根据《中国共 根据《中华人 《中华人民共 根据《化妆品";
var special_problem3 = "下列选项中，";

/**
 * hash函数，6469通过从3967到5591中的质数，算出的最优值，具体可以看评估代码
 * @param string {String} 需要计算hash值的String
 * @return {int} string的hash值
 */
function get_hash(string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        hash += string.charCodeAt(i);
    }
    return hash % 6469;
}

/**
 * 将题目和答案存入answer_question_map
 * @param key {String} 键：表示题目的问题
 * @param value {String} 值：表示题目的答案
 * @return void
 */
function map_set(key, value) {
    var index = get_hash(key);
    if (answer_question_map[index] === undefined) {
        answer_question_map[index] = [[key, value]];
    } else {
        // 去重
        for (var i = 0; i < answer_question_map[index].length; i++) {
            if (answer_question_map[index][i][0] == key) {
                return null;
            }
        }
        answer_question_map[index].push([key, value]);
    }
}

/**
 * 根据题目在answer_question_map中搜索答案
 * @param key {String} 键：表示题目的问题
 * @return {String} 题目的答案，如果没有搜索到则返回null
 */
function map_get(key) {
    var index = get_hash(key);
    if (answer_question_map[index] != undefined) {
        for (var i = 0; i < answer_question_map[index].length; i++) {
            if (answer_question_map[index][i][0] == key) {
                return answer_question_map[index][i][1];
            }
        }
    }
    return null;
}

/**
 * 通过Http更新\下载题库到本地，并进行处理，如果本地已经存在则无需下载
 * @return {List} 题库
 */
function map_update() {
    toast("正在下载题库");
    // 使用 Github 文件加速服务：https://gh-proxy.com
    var answer_question_bank = http.get("https://gh-proxy.com/https://raw.githubusercontent.com/Mondayfirst/XXQG_TiKu/main/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json");
    // 如果资源过期或无法访问则换成别的云盘
    if (!(answer_question_bank.statusCode >= 200 && answer_question_bank.statusCode < 300)) {
        // 使用腾讯云
        var answer_question_bank = http.get("https://xxqg-tiku-1305531293.cos.ap-nanjing.myqcloud.com/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json");
    }
    answer_question_bank = answer_question_bank.body.string();
    answer_question_bank = JSON.parse(answer_question_bank);

    for (var question in answer_question_bank) {
        var answer = answer_question_bank[question];
        if (special_problem.indexOf(question.slice(0, 7)) != -1) question = question.slice(question.indexOf("|") + 1);
        else {
            question = question.slice(0, question.indexOf("|"));
            question = question.slice(0, question.indexOf(" "));
            question = question.slice(0, 10);
        }
        map_set(question, answer);
    }
    // 将题库存储到本地
    storage.put("answer_question_map1", answer_question_map);
}

if (!storage.contains("answer_question_map1")) {
    map_update();
} else {
    answer_question_map = storage.get("answer_question_map1");
}

/**
 * 模拟点击不可以点击元素
 * @param {UiObject / string} target 控件或者是控件文本
 */
function my_click_non_clickable(target) {
    if (typeof target == "string") {
        text(target).waitFor();
        var tmp = text(target).findOne().bounds();
    } else {
        var tmp = target.bounds();
    }
    var randomX = random(tmp.left, tmp.right);
    var randomY = random(tmp.top, tmp.bottom);
    click(randomX, randomY);
}

/**
 * 模拟点击可点击元素
 * @param {string} target 控件文本
 */
function my_click_clickable(target) {
    text(target).waitFor();
    // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
    if (target == "我的") {
        log("点击:" + "comm_head_xuexi_mine");
        id("comm_head_xuexi_mine").findOne().click();
    } else {
        click(target);
    }
}

/**
 * 模拟点击可点击元素
 * @param {int} time 时间
 * @return {int} 随机后的时间值
 */
function random_time(time) {
    return time + random(100, 1000);
}

/**
 * 刷新页面
 * @param {boolean} orientation 方向标识 true表示从下至上 false表示从上至下
 */
function refresh(orientation) {
    if (orientation)
        swipe(device.width / 2, (device.height * 13) / 15,
            device.width / 2, (device.height * 2) / 15,
            random_time(delay_time / 2));
    else
        swipe(device.width / 2, (device.height * 6) / 15,
            device.width / 2, (device.height * 12) / 15,
            random_time(delay_time / 2));
    sleep(random_time(delay_time));
}

/**
 * 推送通知到微信
 * @param {string} account 账号
 * @param {string} score 分数
 */
function push_weixin_message(message) {
    if (sct_token != "") {
        URL = "https://sctapi.ftqq.com/" + sct_token + ".send";
        http.post(URL, {
            title: "学习通知",
            desp: message,
        });
    }
    if (pushplus_token != "") {
        http.postJson("http://www.pushplus.plus/send", {
            token: pushplus_token,
            title: "学习通知",
            content: message,
        });
    }
}

/**
 * 如果因为某种不知道的bug退出了界面，则使其回到正轨
 * 全局变量back_track_flag说明:
 * back_track_flag = 0时，表示阅读部分
 * back_track_flag = 1时，表示视听部分
 * back_track_flag = 2时，表示竞赛、答题部分和准备部分
 */
function back_track() {
    do {
        app.launchApp("学习强国");
        sleep(random_time(delay_time * back_track_wait_time));
        if (text("新用户注册").exists()) {
            device.cancelKeepingAwake();
            //震动一秒
            device.vibrate(1000);
            push_weixin_message("请先登录学习强国");
            toast("请先登录学习强国");
            exit(0);
        }
        if (text("立即升级").exists()) {
            log("点击:" + "取消");
            text("取消").findOne().click();
        }
        var while_count = 0;
        while (!id("comm_head_title").exists() && while_count < 5) {
            while_count++;
            back();
            sleep(random_time(delay_time));
        }
        switch (back_track_flag) {
            case 0:
                // 去中心模块
                log("等待:" + "home_bottom_tab_icon_large");
                id("home_bottom_tab_icon_large").waitFor();
                sleep(random_time(delay_time));
                var home_bottom = id("home_bottom_tab_icon_large").findOne().bounds();
                click(home_bottom.centerX(), home_bottom.centerY());
                // 去province模块
                log("等待:" + "android.view.ViewGroup");
                className("android.view.ViewGroup").depth(15).waitFor();
                sleep(random_time(delay_time));
                log("点击:" + "android.view.ViewGroup");
                if (text("亮点").exists()) {
                    className("android.view.ViewGroup").depth(15).findOnce(2).child(4).click();
                } else {
                    className("android.view.ViewGroup").depth(15).findOnce(2).child(3).click();
                }
                break;
            case 1:
                break;
            case 2:
                // 当网络不稳定时容易碰见积分规则更新中的情况
                while (true) {
                    my_click_clickable("我的");
                    sleep(random_time(delay_time));
                    my_click_clickable("学习积分");
                    sleep(random_time(delay_time));
                    log("等待:" + "积分规则");
                    text("积分规则").waitFor();
                    sleep(random_time(delay_time));
                    if (text("登录").exists()) break;
                    back();
                    sleep(random_time(delay_time));
                    back();
                }
        }
        // 当由于未知原因退出学习强国，则重新执行
    } while (!className("FrameLayout").packageName("cn.xuexi.android").exists());
}

/**
 * 获取各模块完成情况的列表、以及全局变量
 * 先获取有哪些模块还没有完成，并生成一个列表，其中第一个是我要选读文章模块，以此类推
 * 再获取阅读模块和视听模块已完成的时间和次数
 */

// 已阅读文章次数
var completed_read_count;
// 已观看视频次数
var completed_watch_count;
// 每周答题已得分
var weekly_answer_scored;
// 专项答题已得分
var special_answer_scored;
// 四人赛已得分
var four_players_scored;
// 双人对战已得分
var two_players_scored;

function get_finish_list() {
    var finish_list = [];
    for (var i = 4; i < 17; i++) {
        // 由于模拟器有model无法读取因此用try catch
        try {
            var model = className("android.view.View").depth(24).findOnce(i);
            if (i == 4) {
                completed_read_count = parseInt(model.child(3).child(0).text()) / 2;
            } else if (i == 5) {
                completed_watch_count = parseInt(model.child(3).child(0).text());
            } else if (i == 16) {
                weekly_answer_scored = parseInt(model.child(3).child(0).text());
            } else if (i == 8) {
                special_answer_scored = parseInt(model.child(3).child(0).text());
            } else if (i == 10) {
                four_players_scored = parseInt(model.child(3).child(0).text());
            } else if (i == 11) {
                two_players_scored = parseInt(model.child(3).child(0).text());
            }
            finish_list.push(model.child(4).text() == "已完成");
        } catch (error) {
            finish_list.push(false);
        }
    }
    log("已完成模块列表：" + finish_list);
    return finish_list;
}
/*
 *********************准备部分********************
 */

var back_track_flag = 2;
// 首次运行可能弹升级，等久一点
var back_track_wait_time = 4;
back_track();
// 等待时间可以少一点了
back_track_wait_time = 1.5;
var finish_list = get_finish_list();

// 返回首页
log("返回首页");
log("点击:" + "android.view.View");
className("android.view.View").clickable(true).depth(22).findOne().click();
log("等待:" + "my_back");
id("my_back").waitFor();
sleep(random_time(delay_time / 2));
log("点击:" + "my_back");
id("my_back").findOne().click();

// 去province模块
log("去province模块");
sleep(random_time(delay_time));
log("等待:" + "android.view.ViewGroup");
className("android.view.ViewGroup").depth(15).waitFor();
sleep(random_time(delay_time));
log("点击:" + "android.view.ViewGroup");
if (text("亮点").exists()) {
    className("android.view.ViewGroup").depth(15).findOnce(2).child(4).click();
} else {
    className("android.view.ViewGroup").depth(15).findOnce(2).child(3).click();
}

/*
 **********本地频道*********
 */
if (!finish_list[10]) {
    // 去本地频道
    log("去本地频道");
    log("等待:" + "android.widget.LinearLayout");
    className("android.widget.LinearLayout").clickable(true).depth(26).waitFor();
    sleep(random_time(delay_time));
    log("点击:" + "android.widget.LinearLayout");
    className("android.widget.LinearLayout").clickable(true).depth(26).drawingOrder(1).findOne().click();
    sleep(random_time(delay_time));
    back();
}

/*
 *********************阅读部分********************
 */

// 把音乐暂停
//
log("把音乐暂停");
media.pauseMusic();
var back_track_flag = 0;

/*
 **********我要选读文章与分享与广播学习*********
 */

// 打开电台广播
if (!finish_list[2] && !finish_list[0]) {
    log("打开电台广播");
    sleep(random_time(delay_time));
    my_click_clickable("电台");
    sleep(random_time(delay_time));
    my_click_clickable("听广播");
    sleep(random_time(delay_time));
    log("等待:" + "lay_state_icon");
    id("lay_state_icon").waitFor();
    var lay_state_icon_pos = id("lay_state_icon").findOne().bounds();
    click(lay_state_icon_pos.centerX(), lay_state_icon_pos.centerY());
    sleep(random_time(delay_time));
    var home_bottom = id("home_bottom_tab_icon_large").findOne().bounds();
    click(home_bottom.centerX(), home_bottom.centerY());
}

// 阅读文章次数
var count = 0;

while (count < 6 - completed_read_count && !finish_list[0]) {
    if (!id("comm_head_title").exists() || !className("android.widget.TextView").depth(27).text("切换地区").exists()) back_track();
    sleep(random_time(delay_time));

    refresh(false);

    var article = id("general_card_image_id").find();

    if (article.length == 0) {
        refresh(false);
        continue;
    }

    for (var i = 0; i < article.length; i++) {
        log("阅读文章：" + i);
        sleep(random_time(500));

        try {
            click(article[i].bounds().centerX(), article[i].bounds().centerY());
        } catch (error) {
            continue;
        }
        sleep(random_time(delay_time));
        // 跳过专栏与音乐
        if (className("ImageView").depth(10).clickable(true).findOnce(1) == null || textContains("专题").findOne(1000) != null) {
            log("跳过专栏与音乐");
            back();
            continue;
        }

        // 观看时长
        sleep(random_time(65000));

        back();
        count++;
    }
    sleep(random_time(500));
}

/*
 *********************视听部分********************
 */

// 关闭电台广播
if (!finish_list[2] && !finish_list[0]) {
    log("关闭电台广播");
    sleep(random_time(delay_time));
    my_click_clickable("电台");
    sleep(random_time(delay_time));
    my_click_clickable("听广播");
    sleep(random_time(delay_time));

    if (!textStartsWith("最近收听").exists() && !textStartsWith("推荐收听").exists()) {
        log("等待:" + "v_playing");
        // 不应该直接通过id寻找控件，因为此页面过多控件，寻找耗时太大
        // className("android.widget.ImageView").clickable(true).id("v_playing").waitFor();
        // 换成通过text寻找控件
        textStartsWith("正在收听").waitFor();
        log("点击:" + "v_playing");
        // className("android.widget.ImageView").clickable(true).id("v_playing").findOne().click();
        textStartsWith("正在收听").findOne().parent().child(1).child(0).click();
    }
    sleep(random_time(delay_time));
}

back_track_flag = 1;

/*
 **********视听学习、听学习时长*********
 */
if (!finish_list[1] || !finish_list[2]) {
    log("视听学习、听学习");
    if (!id("comm_head_title").exists()) back_track();
    my_click_clickable("百灵");
    sleep(random_time(delay_time / 2));
    my_click_clickable("竖");
    // 刷新视频列表
    sleep(random_time(delay_time / 2));
    my_click_clickable("竖")
    // 等待视频加载
    sleep(random_time(delay_time * 3));
    // 点击第一个视频
    log("点击:" + "android.widget.FrameLayout");
    className("android.widget.FrameLayout").clickable(true).depth(24).findOne().click();

    // 为了兼容强国版本为v2.32.0
    sleep(random_time(delay_time));
    if (!id("iv_back").exists()) {
        log("点击:" + "android.widget.FrameLayout");
        className("android.widget.FrameLayout").clickable(true).depth(24).findOnce(7).click();
    }
    sleep(random_time(delay_time));
    if (text("继续播放").exists()) click("继续播放");
    if (text("刷新重试").exists()) click("刷新重试");

    while (completed_watch_count < 6) {
        log("视听学习：" + completed_watch_count);
        sleep(random_time(delay_time / 2));
        log("等待:" + "android.widget.LinearLayout");
        className("android.widget.LinearLayout").clickable(true).depth(16).waitFor();
        // 当前视频的时间长度
        try {
            var current_video_time = className("android.widget.TextView").clickable(false).depth(16).findOne().text().match(/\/.*/).toString().slice(1);
            // 如果视频超过一分钟就跳过
            if (Number(current_video_time.slice(0, 3)) >= 1) {
                refresh(true)
                sleep(random_time(delay_time));
                continue;
            }
            sleep(Number(current_video_time.slice(4)) * 1000 + 500);
        } catch (error) {
            // 如果被"即将播放"将读取不到视频的时间长度，此时就sleep 3秒
            sleep(3000);
        }
        completed_watch_count++;
    }

    back();
}

// 过渡
my_click_clickable("我的");
sleep(random_time(delay_time / 2));
my_click_clickable("学习积分");
sleep(random_time(delay_time / 2));

/*
 *********************竞赛部分********************
 */
// 把音乐打开
media.resumeMusic();
back_track_flag = 2;

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
            log("点击:" + "android.widget.RadioButton");
            className("android.widget.RadioButton").depth(depth_click_option).clickable(true).findOnce(option_i).click();
            return;
        } catch (error) { }
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
            log("点击:" + "android.widget.RadioButton");
            className("android.widget.RadioButton").depth(depth_click_option).clickable(true).findOnce(max_similarity_index).click();
            return;
        } catch (error) { }
    } else {
        try {
            // 没找到答案，点击第一个
            log("点击:" + "android.widget.RadioButton");
            className("android.widget.RadioButton").depth(depth_click_option).clickable(true).findOne(delay_time * 3).click();
        } catch (error) { }
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
        question = sorted_options_text.join("|");
    }
    // 从哈希表中取出答案
    var answer = map_get(question);

    // 如果本地题库没搜到，则搜网络题库
    if (answer == null) {
        var result;
        if (special_problem2.indexOf(question.slice(0, 6)) != -1 && question.slice(18, 25) != -1) question = question.slice(18, 25);
        if (special_problem3.indexOf(question.slice(0, 6)) != -1 && question.slice(6, 12) != -1) question = question.slice(6, 12);
        // 发送http请求获取答案 网站搜题速度 r1 > r2
        try {
            // 此网站只支持十个字符的搜索
            var r1 = http.get("http://www.syiban.com/search/index/init.html?modelid=1&q=" + encodeURI(question.slice(0, 10)));
            result = r1.body.string().match(/答案：.*</);
        } catch (error) { }
        // 如果第一个网站没获取到正确答案，则利用第二个网站
        if (!(result && result[0].charCodeAt(3) > 64 && result[0].charCodeAt(3) < 69)) {
            try {
                // 截掉一部分，再在syiban.com上搜索一遍 六个字符的搜索 解决如题目开头嫦娥识别成娟娥、根据《书名号搜不到等类似的问题
                var r2 = http.get("http://www.syiban.com/search/index/init.html?modelid=1&q=" + encodeURI(question.slice(3, 9)));
                result = r2.body.string().match(/答案：.*</);
            } catch (error) { }
        }

        if (result) {
            // 答案文本
            var result = result[0].slice(5, result[0].indexOf("<"));
            log("答案: " + result);
            select_option(result, depth_click_option, options_text);
        } else {
            // 没找到答案，点击第一个
            log("点击:" + "android.widget.RadioButton");
            try {
                className("android.widget.RadioButton").depth(depth_click_option).clickable(true).findOne(delay_time * 3).click();
            } catch (error) { }
        }
    } else {
        log("答案: " + answer);
        select_option(answer, depth_click_option, options_text);
    }
}

/*
 ********************答题部分********************
 */

back_track_flag = 2;

// 填空题
function fill_in_blank(answer) {
    // 获取每个空
    var blanks = className("android.view.View").depth(25).find();
    for (var i = 0; i < blanks.length; i++) {
        // 需要点击一下空才能paste
        blanks[i].click();
        setClip(answer[i]);
        blanks[i].paste();
        // 需要缓冲
        sleep(500);
    }
}

/**
 * 视频题
 * @param {string} video_question 视频题问题
 * @returns {string} video_answer 答案
 */
function video_answer_question(video_question) {
    // 找到中文标点符号
    var punctuation_index = video_question.search(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/);
    video_question = video_question.slice(0, Math.max(5, punctuation_index));
    try {
        var video_result = http.get("https://www.365shenghuo.com/?s=" + encodeURI(video_question));
    } catch (error) { }
    var video_answer = video_result.body.string().match(/答案：.+</);
    if (video_answer) video_answer = video_answer[0].slice(3, video_answer[0].indexOf("<"));
    return video_answer;
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

// 选择题
function multiple_choice(answer) {
    var whether_selected = false;
    // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
    var options = className("android.view.View").depth(26).find();
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
    var options = className("android.view.View").depth(26).find();
    // question是题目(专项答题是第4个，其他是第2个)
    var question = className("android.view.View").depth(23).findOnce(1).text().length > 2 ? className("android.view.View").depth(23).findOnce(1).text() : className("android.view.View").depth(23).findOnce(3).text();
    return options.length / 2 == (question.match(/\s+/g) || []).length;
}

/**
 * 点击对应的去答题或去看看
 * @param {int} number 7对应为每日答题模块，以此类推
 */
function entry_model(number) {
    var model = className("android.view.View").depth(24).findOnce(number);
    while (!model.child(4).click());
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
    my_click_clickable("退出");
    switch (restart_flag) {
        case 0:
            log("等待:" + "登录");
            text("登录").waitFor();
            entry_model(7);
            break;
        case 1:
            // 设置标志位
            if_restart_flag = true;
            // 等待列表加载
            log("等待:" + "本月");
            text("本月").waitFor();
            // 打开第一个出现未作答的题目
            while (!text("未作答").exists()) {
                refresh(true);
            }
            log("点击:" + "未作答");
            text("未作答").findOne().parent().click();
            break;
    }
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
    text = text.replace(/\s*/g, "");
    text = text.replace(/_/g, "一");
    text = text.replace(/\-/g, "－");
    text = text.replace(/;/g, "；");
    text = text.replace(/`/g, "、");
    text = text.replace(/\?/g, "？");
    text = text.replace(/:/g, "：");
    text = text.replace(/!/g, "！");
    text = text.replace(/\(/g, "（");
    text = text.replace(/\)/g, "）");
    // 拼音修改
    text = text.replace(/ā/g, "a");
    text = text.replace(/á/g, "a");
    text = text.replace(/ǎ/g, "a");
    text = text.replace(/à/g, "a");
    text = text.replace(/ō/g, "o");
    text = text.replace(/ó/g, "o");
    text = text.replace(/ǒ/g, "o");
    text = text.replace(/ò/g, "o");
    text = text.replace(/ē/g, "e");
    text = text.replace(/é/g, "e");
    text = text.replace(/ě/g, "e");
    text = text.replace(/è/g, "e");
    text = text.replace(/ī/g, "i");
    text = text.replace(/í/g, "i");
    text = text.replace(/ǐ/g, "i");
    text = text.replace(/ì/g, "i");
    text = text.replace(/ū/g, "u");
    text = text.replace(/ú/g, "u");
    text = text.replace(/ǔ/g, "u");
    text = text.replace(/ù/g, "u");

    if (if_question) {
        text = text.slice(text.indexOf(".") + 1);
        text = text.slice(0, 25);
    }
    return text;
}
/**
 * 答题（每日、每周、专项）
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
            // 下滑到底防止题目过长，选项没有读取到
            refresh(true);
            sleep(random_time(delay_time));

            // 判断是否是全选，这样就不用ocr
            if (textContains("多选题").exists() && is_select_all_choice()) {
                // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
                var options = className("android.view.View").depth(26).find();
                for (var i = 1; i < options.length; i += 2) {
                    my_click_non_clickable(options[i].text());
                }
            } else if (className("android.widget.Image").exists() && text('填空题').exists()) {
                // 如果存在视频题
                var video_question = className("android.view.View").depth(24).findOnce(2).text();
                answer = video_answer_question(video_question);
                if (answer) {
                    fill_in_blank(answer);
                } else {
                    // 如果没搜到答案
                    // 如果是每周答题那么重做也没用就直接跳过
                    if (restart_flag == 1) {
                        fill_in_blank("cao");
                        sleep(random_time(delay_time * 2));
                        if (text("下一题").exists()) click("下一题");
                        if (text("确定").exists()) click("确定");
                        sleep(random_time(delay_time));
                        if (text("完成").exists()) {
                            click("完成");
                            flag = true;
                            break;
                        }
                    } else {
                        restart();
                        break;
                    }
                }
            } else {
                my_click_clickable("查看提示");
                // 打开查看提示的时间
                sleep(random_time(delay_time));
                var img = images.inRange(captureScreen(), "#600000", "#FF6060");
                if (if_restart_flag && whether_improve_accuracy == "yes") {
                    answer = baidu_ocr_api(img)[0];
                } else {
                    try {
                        answer = ocr.recognizeText(img);
                    } catch (error) {
                        log("请将hamibot软件升级至最新版本");
                        exit();
                    }
                }
                img.recycle();
                answer = ocr_processing(answer, false);
                log("等待:" + "提示");
                text("提示").waitFor();
                back();
                sleep(random_time(delay_time));

                if (textContains("多选题").exists() || textContains("单选题").exists()) {
                    multiple_choice(answer);
                } else {
                    fill_in_blank(answer);
                }
            }
            sleep(random_time(delay_time * 2));

            if (text("下一题").exists()) {
                // 对于专项答题没有确定
                click("下一题");
            } else if (text("完成").exists()) {
                // 如果专项答题完成点击完成
                click("完成");
            } else {
                // 不是专项答题时
                click("确定");
                sleep(random_time(delay_time)); // 等待提交的时间
                // 如果错误（ocr识别有误）则重来
                if (text("下一题").exists() || (text("完成").exists() && !special_flag)) {
                    // 如果没有选择精确答题或视频题错误，则每周答题就不需要重新答
                    if (restart_flag == 1 && (whether_improve_accuracy == "no" || className("android.widget.Image").exists())) {
                        if (text("下一题").exists()) click("下一题");
                        else click("完成");
                    } else {
                        // 每日答题重答
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

/**
 * 处理访问异常
 */
function handling_access_exceptions() {
    // 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
    var thread_handling_access_exceptions = threads.start(function () {
        while (true) {
            textContains("访问异常").waitFor();
            // 滑动按钮">>"位置
            idContains("nc_1_n1t").waitFor();
            var bound = idContains("nc_1_n1t").findOne().bounds();
            // 滑动边框位置
            text("向右滑动验证").waitFor();
            var slider_bound = text("向右滑动验证").findOne().bounds();
            // 通过更复杂的手势验证（先右后左再右）
            var x_start = bound.centerX();
            var dx = x_start - slider_bound.left;
            var x_end = slider_bound.right - dx;
            var x_mid = (x_end - x_start) * random(5, 8) / 10 + x_start;
            var back_x = (x_end - x_start) * random(2, 3) / 10;
            var y_start = random(bound.top, bound.bottom);
            var y_end = random(bound.top, bound.bottom);
            x_start = random(x_start - 7, x_start);
            x_end = random(x_end, x_end + 10);
            gesture(random_time(delay_time), [x_start, y_start], [x_mid, y_end], [x_mid - back_x, y_start], [x_end, y_end]);
            sleep(random_time(delay_time));
            while (textContains("访问异常").exists());
            sleep(random_time(delay_time));
            if (textContains("刷新").exists()) {
                // 重答
                my_click_clickable('刷新');
                text("登录").waitFor();
                entry_model(7);
                log("等待:" + "查看提示");
                text("查看提示").waitFor();
                do_periodic_answer(5);
            }
            if (textContains("网络开小差").exists()) {
                // 重答
                my_click_clickable("确定");
                text("登录").waitFor();
                entry_model(7);
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

/*
 **********每日答题*********
 */
var restart_flag = 0;

if (!finish_list[3]) {
    log("每日答题");
    sleep(random_time(delay_time));
    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(7);
    // 等待题目加载
    log("等待:" + "查看提示");
    text("查看提示").waitFor();
    do_periodic_answer(5);
    my_click_clickable("返回");
}

/*
 **********每周答题*********
 */
var restart_flag = 1;
// 是否重做过，如果重做，也即错了，则换用精度更高的华为ocr
var if_restart_flag = false;
// 保存本地变量，如果已经做完之前的所有题目则跳过
if (!storage.contains("all_weekly_answers_completed_storage")) {
    storage.put("all_weekly_answers_completed_storage", "no");
}
if (all_weekly_answers_completed == "no") {
    all_weekly_answers_completed = storage.get("all_weekly_answers_completed_storage");
}

if (!finish_list[12] && weekly_answer_scored < 4 && all_weekly_answers_completed == "no") {
    log("每周答题");
    sleep(random_time(delay_time));
    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(16);
    // 等待列表加载
    log("等待:" + "月");
    textContains("月").waitFor();
    sleep(random_time(delay_time * 2));
    // 打开第一个出现未作答的题目
    // 如果之前的答题全部完成则不向下搜索
    if (all_weekly_answers_completed == "no") {
        while (!text("未作答").exists() && !text("您已经看到了我的底线").exists()) {
            refresh(true);
        }
        if (text("您已经看到了我的底线").exists()) storage.put("all_weekly_answers_completed_storage", "yes");
    }
    sleep(random_time(delay_time * 2));
    if (text("未作答").exists()) {
        log("点击:" + "未作答");
        text("未作答").findOne().parent().click();
        do_periodic_answer(5);
        my_click_clickable("返回");
        sleep(random_time(delay_time));
    }
    log("等待:" + "android.view.View");
    className("android.view.View").clickable(true).depth(23).waitFor();
    log("点击:" + "android.view.View");
    className("android.view.View").clickable(true).depth(23).findOne().click();
}

/*
 **********专项答题*********
 */

// 保存本地变量，如果已经做完之前的所有题目则跳过
if (!storage.contains("all_special_answer_completed_storage")) {
    storage.put("all_special_answer_completed_storage", "no");
}

// 保存本地变量，改变存储上次搜索未完成的题目所需时间，用于加速搜索
if (!storage.contains("quick_search_special_answer_time_storage")) {
    storage.put("quick_search_special_answer_time_storage", 0);
}

// 当该账号已完成专项答题，但配置没有转为yes时，也自动跳过
if (all_special_answer_completed == "no") {
    all_special_answer_completed = storage.get("all_special_answer_completed_storage");
}

if (!finish_list[4] && special_answer_scored < 8) {
    log("专项答题");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(8);
    // 等待列表加载
    log("等待:" + "android.view.View");
    className("android.view.View").clickable(true).depth(23).waitFor();
    // 打开第一个出现未完成作答的题目
    // 第一个未完成作答的索引
    var special_i = 0;
    // 是否找到未作答的标志
    var special_flag = false;
    // 是否答题的标志
    var is_answer_special_flag = false;
    // 均速搜索次数（需要根据此更新加速搜索次数）
    var comm_search_special_answer_time = 0
    // 加速搜索次数
    var quick_search_special_answer_time = storage.get("quick_search_special_answer_time_storage");

    // 如果之前的答题全部完成则不向下搜索
    if (all_special_answer_completed == "yes") {
        special_flag = true;
    }
    while (!special_flag) {
        if (text("开始答题").exists()) {
            special_flag = true;
            break;
        }
        while (text("继续答题").findOnce(special_i)) {
            if (text("继续答题").findOnce(special_i).parent().childCount() < 3) {
                special_flag = true;
                break;
            } else {
                special_i++;
            }
        }
        // 根据上次搜索时间 加速搜索
        while (quick_search_special_answer_time > 0) {
            swipe(device.width / 2, (device.height * 13) / 15, device.width / 2, (device.height * 2) / 15, 100);
            quick_search_special_answer_time--;
        }
        if (!special_flag) {
            refresh(true);
            comm_search_special_answer_time++;
        }
        // 如果搜索到底部
        if (text("您已经看到了我的底线").exists()) {
            storage.put("all_special_answers_completed_storage", "yes");
            break;
        }
    }
    sleep(random_time(delay_time * 2));
    // 更新加速搜索次数
    if (storage.get("quick_search_special_answer_time_storage") == 0) {
        // 如果是第一次更新
        storage.put("quick_search_special_answer_time_storage", comm_search_special_answer_time);
    } else {
        var tmp = storage.get("quick_search_special_answer_time_storage");
        storage.put("quick_search_special_answer_time_storage", tmp + comm_search_special_answer_time);
    }


    if (text("开始答题").exists() || text("您已经看到了我的底线").exists()) {
        log("点击:" + "开始答题");
        text("开始答题").findOne().click();
        is_answer_special_flag = true;
        // 总题数
        className("android.view.View").depth(24).waitFor();
        sleep(random_time(delay_time));
        // 为兼容新版本新题只有5题，老版有10题
        var num_string = className("android.view.View").depth(24).findOnce(1).text();
        var total_question_num = parseInt(num_string.slice(num_string.indexOf('/') + 1));
        do_periodic_answer(total_question_num);
    } else if (text("继续答题").exists()) {
        log("点击:" + "继续答题");
        text("继续答题").findOnce(special_i).click();
        // 等待题目加载
        sleep(random_time(delay_time));
        is_answer_special_flag = true;
        className("android.view.View").depth(24).waitFor();
        sleep(random_time(delay_time));
        var num_string = className("android.view.View").depth(24).findOnce(1).text();
        // 已完成题数
        var completed_question_num = parseInt(num_string);
        // 总题数
        var total_question_num = parseInt(num_string.slice(num_string.indexOf('/') + 1));
        do_periodic_answer(total_question_num - completed_question_num + 1);
    } else {
        sleep(random_time(delay_time));
        log("等待:" + "android.view.View");
        className("android.view.View").clickable(true).depth(23).waitFor();
        log("点击:" + "android.view.View");
        className("android.view.View").clickable(true).depth(23).findOne().click();
    }

    if (is_answer_special_flag) {
        // 点击退出
        sleep(random_time(delay_time));
        log("等待:" + "android.view.View");
        className("android.view.View").clickable(true).depth(20).waitFor();
        log("点击:" + "android.view.View");
        className("android.view.View").clickable(true).depth(20).findOne().click();
        sleep(random_time(delay_time));
        log("等待:" + "android.view.View");
        className("android.view.View").clickable(true).depth(23).waitFor();
        log("点击:" + "android.view.View");
        className("android.view.View").clickable(true).depth(23).findOne().click();
    }
}

/*
 **********挑战答题*********
 */
if (!finish_list[5]) {
    log("挑战答题");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(9);
    // 加载页面
    log("等待:" + "android.view.View");
    className("android.view.View").clickable(true).depth(22).waitFor();
    // flag为true时挑战成功拿到6分
    var flag = false;
    while (!flag) {
        sleep(random_time(delay_time * 3));
        var num = 0;
        while (num < 5) {
            // 每题的过渡
            sleep(random_time(delay_time * 2));
            // 如果答错，第一次通过分享复活
            if (text("立即复活").exists()) {
                num -= 2;
                click("立即复活");
                sleep(random_time(delay_time / 2));
                // 等待题目加载
                sleep(random_time(delay_time * 2));
            }
            // 第二次重新开局
            if (text("再来一局").exists()) {
                my_click_clickable("再来一局");
                break;
            }
            // 题目
            log("等待:" + "android.view.View");
            className("android.view.View").depth(25).waitFor();
            var question = className("android.view.View").depth(25).findOne().text();
            // 截取到下划线前
            question = question.slice(0, question.indexOf(" "));
            // 选项文字列表
            var options_text = [];
            // 等待选项加载
            log("等待:" + "android.widget.RadioButton");
            className("android.widget.RadioButton").depth(28).clickable(true).waitFor();
            // 获取所有选项控件，以RadioButton对象为基准，根据UI控件树相对位置寻找选项文字内容
            var options = className("android.widget.RadioButton").depth(28).find();
            // 选项文本
            options.forEach((element, index) => {
                //挑战答题中，选项文字位于RadioButton对象的兄弟对象中
                options_text[index] = element.parent().child(1).text();
            });
            do_contest_answer(28, question, options_text);
            num++;
        }
        sleep(random_time(delay_time * 2));
        if (num == 5 && !text("再来一局").exists() && !text("结束本局").exists()) flag = true;
    }
    // 对了5道题后随意点击直到退出
    do {
        sleep(random_time(delay_time * 2.5));
        log("点击:" + "android.widget.RadioButton");
        className("android.widget.RadioButton").depth(28).findOne().click();
        sleep(random_time(delay_time * 2.5));
    } while (!text("再来一局").exists() && !text("结束本局").exists());
    click("结束本局");
    sleep(random_time(delay_time));
    back();
}

/*
 ********************四人赛、双人对战********************
 */

/**
 * 答题
 */
function do_contest() {
    while (!text("开始").exists());
    while (!text("继续挑战").exists()) {
        // 等待下一题题目加载
        log("等待:" + "android.view.View");
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
        log("等待:" + "android.widget.RadioButton");
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
                log("请将hamibot软件升级至最新版本");
                exit();
            }
        }
        // img.recycle(); 对于captureScreen()可以自动回收，可有可无
        log("题目: " + question);
        log("选项: " + options_text);
        if (question) do_contest_answer(32, question, options_text);
        else {
            log("等待:" + "android.widget.RadioButton");
            className("android.widget.RadioButton").depth(32).waitFor();
            log("点击:" + "android.widget.RadioButton");
            className("android.widget.RadioButton").depth(32).findOne(delay_time * 3).click();
        }
        // 等待新题目加载
        while (!textMatches(/第\d题/).exists() && !text("继续挑战").exists() && !text("开始").exists());
    }
}

/*
 **********四人赛*********
 */
if (!finish_list[6] && four_players_scored < 3) {
    log("四人赛");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
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
    sleep(random_time(delay_time));
    back();
    sleep(random_time(delay_time));
    back();
}

/*
 **********双人对战*********
 */
if (!finish_list[7] && two_players_scored < 1) {
    log("双人对战");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(11);

    // 点击随机匹配
    log("等待:" + "随机匹配");
    text("随机匹配").waitFor();
    sleep(random_time(delay_time * 2));
    try {
        log("点击:" + "android.view.View");
        className("android.view.View").clickable(true).depth(24).findOnce(1).click();
    } catch (error) {
        log("点击:" + "");
        className("android.view.View").text("").findOne().click();
    }
    do_contest();
    sleep(random_time(delay_time));
    back();
    sleep(random_time(delay_time));
    back();
    my_click_clickable("退出");
}

/*
 **********订阅*********
 */
while (!finish_list[8] && whether_complete_subscription == "yes") {
    log("订阅");
    sleep(random_time(delay_time));
    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(12);
    // 等待加载
    sleep(random_time(delay_time * 3));

    if (!className("android.view.View").desc("强国号\nTab 1 of 2").exists()) {
        toast("强国版本v2.34.0及以上不支持订阅功能");
        back();
    } else {
        // 获取第一个订阅按钮位置
        var subscribe_button_pos = className("android.widget.ImageView").clickable(true).depth(16).findOnce(1).bounds();
        // 订阅数
        var num_subscribe = 0;

        // 强国号
        // 创建本地存储，记忆每次遍历起始点
        if (!storage.contains("subscription_strong_country_startup")) {
            storage.put("subscription_strong_country_startup", 0);
        }
        var subscription_strong_country_startup = storage.get("subscription_strong_country_startup");

        for (var i = subscription_strong_country_startup; i < 10; i++) {
            log("点击:" + "android.view.View");
            className("android.view.View").clickable(true).depth(15).findOnce(i).click();
            sleep(random_time(delay_time));

            while (num_subscribe < 2) {
                // 点击红色的订阅按钮
                do {
                    var subscribe_pos = findColor(captureScreen(), "#E42417", {
                        region: [subscribe_button_pos.left, subscribe_button_pos.top, subscribe_button_pos.width(), device.height - subscribe_button_pos.top],
                        threshold: 10,
                    });
                    if (subscribe_pos) {
                        sleep(random_time(delay_time * 2));
                        click(subscribe_pos.x + subscribe_button_pos.width() / 2, subscribe_pos.y + subscribe_button_pos.height() / 2);
                        num_subscribe++;
                        sleep(random_time(delay_time));
                    }
                } while (subscribe_pos && num_subscribe < 2);
                if (num_subscribe >= 2) break;
                // 通过对比 检测到的已订阅控件 的位置来判断是否滑到底部
                // 滑动前的已订阅控件的位置
                var complete_subscribe_pos1 = findColor(captureScreen(), "#B2B3B7", {
                    region: [subscribe_button_pos.left, subscribe_button_pos.top, subscribe_button_pos.width(), device.height - subscribe_button_pos.top],
                    threshold: 10,
                });

                swipe(device.width / 2, device.height - subscribe_button_pos.top, device.width / 2, subscribe_button_pos.top, random_time(0));
                sleep(random_time(delay_time / 2));
                // 滑动后的已订阅控件的位置
                var complete_subscribe_pos2 = findColor(captureScreen(), "#B2B3B7", {
                    region: [subscribe_button_pos.left, subscribe_button_pos.top, subscribe_button_pos.width(), device.height - subscribe_button_pos.top],
                    threshold: 10,
                });
                // 如果滑动前后已订阅控件的位置不变则判断滑到底部
                if (complete_subscribe_pos1.x == complete_subscribe_pos2.x && complete_subscribe_pos1.y == complete_subscribe_pos2.y) break;
            }
            // 更新本地存储值
            if (i > subscription_strong_country_startup) storage.put("subscription_strong_country_startup", i);
            if (num_subscribe >= 2) break;
            sleep(random_time(delay_time * 2));
        }

        // 地方平台
        // 创建本地存储，记忆每次遍历起始点
        if (!storage.contains("subscription_local_platform_startup")) {
            storage.put("subscription_local_platform_startup", 0);
        }
        var subscription_local_platform_startup = storage.get("subscription_local_platform_startup");

        if (num_subscribe < 2) {
            log("点击:" + "地方平台\nTab 2 of 2");
            desc("地方平台\nTab 2 of 2").findOne().click();
            sleep(random_time(delay_time));
            for (var i = subscription_local_platform_startup; i < 5; i++) {
                log("点击:" + "android.view.View");
                className("android.view.View").clickable(true).depth(15).findOnce(i).click();
                sleep(random_time(delay_time));
                // 刷新次数
                var num_refresh = 0;
                // 定义最大刷新次数
                if (i == 2) var max_num_refresh = 20;
                else var max_num_refresh = 2;
                while (num_subscribe < 2 && num_refresh < max_num_refresh) {
                    do {
                        var subscribe_pos = findColor(captureScreen(), "#E42417", {
                            region: [subscribe_button_pos.left, subscribe_button_pos.top, subscribe_button_pos.width(), device.height - subscribe_button_pos.top],
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
                if (i > subscription_local_platform_startup) storage.put("subscription_local_platform_startup", i);
                if (num_subscribe >= 2) break;
                sleep(random_time(delay_time * 2));
            }
        }

        // 退回
        log("点击:" + "android.widget.Button");
        className("android.widget.Button").clickable(true).depth(11).findOne().click();
    }
    // 在订阅模块中若未拿满分，则重试
    back_track_flag = 2;
    back_track();
    finish_list = get_finish_list();
}

/*
 **********发表观点*********
 */

if (!finish_list[9] && whether_complete_speech == "yes") {
    var speechs = ["好好学习，天天向上", "大国领袖，高瞻远瞩", "请党放心，强国有我", "坚持信念，砥砺奋进", "团结一致，共建美好", "为人民谋幸福"];
    log("发表观点");
    sleep(random_time(delay_time));
    if (!text("欢迎发表你的观点").exists()) {
        if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
        entry_model(13);
        // 随意找一篇文章
        sleep(random_time(delay_time));
        my_click_clickable("推荐");
        sleep(random_time(delay_time * 2));
        log("点击:" + "android.widget.FrameLayout");
        className("android.widget.FrameLayout").clickable(true).depth(22).findOnce(0).click();
        sleep(random_time(delay_time * 2));
    }
    my_click_clickable("欢迎发表你的观点");
    sleep(random_time(delay_time));
    setText(speechs[random(0, speechs.length - 1)]);
    sleep(random_time(delay_time));
    my_click_clickable("发布");
    sleep(random_time(delay_time * 2));
    my_click_clickable("删除");
    sleep(random_time(delay_time));
    my_click_clickable("确认");
}

if (sct_token || pushplus_token) {
    log("执行完毕，正在生成推送内容");
    back_track_flag = 2;
    back_track();
    // 获取今日得分
    var score = textStartsWith("今日已累积").findOne().text();
    score = score.match(/\d+/);
    cap_img = captureScreen();
    sleep(random_time(delay_time));
    back();
    // 获取账号名
    var account = id("my_display_name").findOne().text();

    // 推送消息
    push_weixin_message(account + ",您的今日得分" + score + "分。");
}

// 解除静音
if (whether_mute == "yes") {
    device.setMusicVolume(vol);
}

//震动一秒
device.vibrate(1000);
toastLog("脚本运行完成");
home();

//解冻app
if (whether_froze_app == "yes") {
    result = shell("pm disable cn.xuexi.android", true);
    if (result.code != 0) {
        log("冻结失败");
        push_weixin_message("学习强国冻结失败！");
        exit(0);
    }
}
