auto.waitFor()
setScreenMetrics(1080, 2340);
var { password } = hamibot.env;
var { select } = hamibot.env;

function number_click(num) {
    var number = text(num).findOne().bounds();
    click(number.centerX(), number.centerY());
}

function scroll() {
    if (select == 'a') {
        swipe(500, 1700, 500, 300, 10);
    } else {
        swipe(500, 300, 500, 1700, 10);
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

home();
app.launchApp('微信');

back_home();

while (!click('通讯录'));
while (!click('公众号'));

while (!text('江西共青团').exists()) {
  swipe(500, 1700, 500, 500, 1000);
}
while (!click('江西共青团'));
while (!click('网上团课'));

// 等待页面加载
sleep(5000);

if (text('无法打开页面').exists()) {
    toast('无法打开页面');
    exit();
}

// 开始学习
className("android.widget.Image").waitFor();
var start = className("android.widget.Image").findOne().bounds();
click(start.centerX(), start.centerY());

// 去学习
// 等待信息上传
sleep(5000);
className("android.widget.Image").text("right-btn").findOne().click();

// 开始学习
sleep(5000);
className("android.view.View").clickable(true).depth(21).click();


// 默认全选
var options = className('android.view.View').clickable(true).depth(21).find();
for (var i = 0; i < options.length; i++) {
  options[i].click();
}

sleep(1000);

// 继续下一题
var options = className('android.view.View').clickable(true).depth(21).find();
options[options.length - 1].click();


