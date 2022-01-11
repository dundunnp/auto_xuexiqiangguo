auto.waitFor()

var { password } = hamibot.env;
var { select } = hamibot.env;
var { slide_time } = hamibot.env;

function number_click(num) {
    var number = text(num).findOne().bounds();
    click(number.centerX(), number.centerY());
}

function scroll() {
    if (select == 'a') {
        swipe(500, 1700, 500, 300, Number(slide_time));
    } else {
        swipe(500, 300, 500, 1700, Number(slide_time));
    }
}

function back_home() {
    while (!text('通讯录').exists()) {
        id('eh').click();
    }
}

function my_click(target) {
    text(target).waitFor();
    var tmp = text(target).findOne().bounds();
    click(tmp.centerX(), tmp.centerY());
}

function mark() {
    textContains("关注南昌疾控").waitFor();
    if (!text('今天已经完成打卡').exists()) {
        click("否", 5);
        click("打卡")
    }
}

function input_password() {
    for (var i = 0; i < password.length; i++) {
        switch(password[i]) {
            case '1': number_click('1'); break;
            case '2': number_click('2'); break;
            case '3': number_click('3'); break;
            case '4': number_click('4'); break;
            case '5': number_click('5'); break;
            case '6': number_click('6'); break;
            case '7': number_click('7'); break;
            case '8': number_click('8'); break;
            case '9': number_click('9'); break;
            case '0': number_click('0'); break;
            default: toast("密码输入错误");
                exit();
        }
    }
}

while (!device.isScreenOn()) {
    device.wakeUpIfNeeded();
    scroll();
    if (password) {
        while (!text('1').exists()) scroll();
        input_password();
    }
}

app.launchApp('微信');

back_home();

// while (!click('通讯录'));
// while (!click('南昌大学'));
// while (!click('a学生疫情常态化管理'));
my_click('通讯录');
while (!click('南昌大学'));
while (!click('电子ID'));
sleep(3000);
back();
while (!click('a学生疫情常态化管理'));
sleep(3000);
if (text('用户无权访问').exists()) {
    // 如果无权访问，则要通过浏览器
    my_click('确定');
    my_click('每日健康打卡');
    my_click('确定');

    id('kl1').waitFor();
    var search = id('kl1').findOne().bounds();
    click(search.centerX(), search.centerY());

    my_click('在浏览器打开');

    mark();
} else {
    my_click('每日健康打卡');
    mark();
}

home();