/* 评估选项获取时，是一个一个选项ocr快，还是全部一下ocr快 */
requestScreenCapture(false);
sleep(1000);

// 一个一个
var options_text = [];
console.time('onebyone')
// 获取所有选项控件，以RadioButton对象为基准，根据UI控件树相对位置寻找选项文字内容
var options = className('android.widget.RadioButton').depth(32).find();
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
log('花费时间: ')
console.timeEnd('onebyone')
toastLog(options_text)

// 全部
var options_text = [];
console.time('all')
var options = className('android.widget.RadioButton').depth(32).find();
// 对战答题中，选项截图区域为RadioButton的祖父对象
var first_pos = options[0].parent().parent().bounds();
var last_pos = options[options.length - 1].parent().parent().bounds();
var img = images.clip(captureScreen(), first_pos.left, first_pos.top, first_pos.width(), last_pos.bottom - first_pos.top);
var option_text = ocr.recognize(img);
for (var i in option_text.results) {
    var text = option_text.results[i].text
    options_text.push(text.slice(text.indexOf('.') + 1))
}
log('花费时间: ')
console.timeEnd('all')
toastLog(options_text)