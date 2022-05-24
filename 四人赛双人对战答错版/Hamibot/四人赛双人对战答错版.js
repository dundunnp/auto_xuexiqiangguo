auto.waitFor()
var { four_player_battle } = hamibot.env;
var { two_player_battle } = hamibot.env;
var { four_player_count } = hamibot.env;
var { two_player_count } = hamibot.env;
var { contest_delay_time } = hamibot.env;
var delay_time = 1000;
four_player_count = Number(four_player_count);
two_player_count = Number(two_player_count);
contest_delay_time = Number(contest_delay_time) * 1000;

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
    // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
    if (target == '我的') {
        id("comm_head_xuexi_mine").findOne().click();
    } else {
        click(target);
    }
}

/**
 * 处理访问异常
 */
function handling_access_exceptions() {
    if (text("访问异常").exists()) {
        if(text("刷新").exists()) {
            click('刷新',1)
            text("刷新").click();
            className("android.view.View").text("刷新").findOne().click();
        }
        // 滑动按钮位置
        var pos = className('android.view.View').depth(10).clickable(true).findOnce(1).bounds();
        // 滑动框右边界
        var right_border = className('android.view.View').depth(9).clickable(false).findOnce(0).bounds().right;
        // 位置取随机值
        var randomX = random(pos.left, pos.right);
        var randomY = random(pos.top, pos.bottom);
        swipe(randomX, randomY, randomX + right_border, randomY, random(200, 400));
        longClick(randomX + right_border, randomY);
    }
}

/* 
处理访问异常，滑动验证
*/
var id_handling_access_exceptions;
// 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
var thread_handling_access_exceptions = threads.start(function () {
    // 每2秒就处理访问异常
    id_handling_access_exceptions = setInterval(handling_access_exceptions, 2000);
});

function do_it() {
    while (!text('开始').exists()) handling_access_exceptions();
    while (!text('继续挑战').exists()) {
        handling_access_exceptions();
        sleep(random_time(contest_delay_time));
        // 随机选择
        try {
            var options = className('android.widget.RadioButton').depth(32).find();
            var select = random(0, options.length - 1);
            className('android.widget.RadioButton').depth(32).findOnce(select).click();
        } catch (error) {
        }
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
    entry_model(10);
    for (var i = 0; i < four_player_count; i++) {
        sleep(random_time(delay_time));
        my_click_clickable('开始比赛');
        do_it();
        if (i < four_player_count - 1) {
            sleep(random_time(delay_time));
            while (!click('继续挑战'));
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
    sleep(random_time(delay_time));
    className('android.view.View').depth(21).text('学习积分').waitFor();
    entry_model(11);

    for (var i = 0; i < two_player_count; i++) {
        // 点击随机匹配
        handling_access_exceptions();
        text('随机匹配').waitFor();
        sleep(random_time(delay_time * 2));
        try {
            className('android.view.View').clickable(true).depth(24).findOnce(1).click();
        } catch (error) {
            className("android.view.View").text("").findOne().click();
        }
        do_it();
        sleep(random_time(delay_time));
        if (i < two_player_count - 1) {
            sleep(random_time(delay_time));
            while (!click('继续挑战'));
            sleep(random_time(delay_time));
        }
    }

    sleep(random_time(delay_time));
    back();
    sleep(random_time(delay_time));
    back();
    my_click_clickable('退出');
}

// 取消访问异常处理循环
if (id_handling_access_exceptions) clearInterval(id_handling_access_exceptions);

//震动半秒
device.vibrate(500);
toast('脚本运行完成');
