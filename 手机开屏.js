auto.waitFor()
setScreenMetrics(1080, 2340);
var { password } = hamibot.env;
var { select } = hamibot.env;
var { slide_time } = hamibot.env;

function number_click(num) {
    var number = text(num).findOne().bounds();
    click(number.centerX(), number.centerY());
}

function scroll() {
    if (select == 'a') {
        swipe(device.width / 2, device.height * 12 / 15, device.width / 2, device.height * 6 / 15, Number(slide_time));
    } else {
        swipe(device.width / 2, device.height * 6 / 15, device.width / 2, device.height * 12 / 15, Number(slide_time));
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
  sleep(1000);
  scroll();
  if (password) {
    while (!text('1').exists()) scroll();
    input_password();
  }
}

home();




//-----------------------------------配置文件-----------------------------------
[
    {
      "name": "password",
      "type": "text",
      "label": "开屏密码",
      "help": "开屏密码只能是数字形式，比如:123456，如果无密码不需要填写"
    },
    {
      "name": "select",
      "type": "select",
      "label": "亮屏后是上滑开锁还是下滑",
      "options": {
        "a": "上滑",
        "b": "下滑"
      },
      "validation": "required",
      "help": "如果不需要滑动就选择默认上滑"
    },
    {
      "name": "slide_time",
      "type": "number",
      "label": "滑动时间(以毫秒ms为单位)",
      "validation": "required",
      "help": "默认为10ms，因不同手机而异，如果解锁不成功可以尝试其他数值"
    }
]
