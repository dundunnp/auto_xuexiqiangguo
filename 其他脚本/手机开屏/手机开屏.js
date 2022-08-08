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
