/* 评估哈希表每个index占多少个元素的最大值和平均值 */
var storage = storages.create('data');
var answer_question_map = storage.get('answer_question_map1');
var count = 0;
var max_value = 0;
var avg_value = 0;
for (var i = 0; i < answer_question_map.length; i++) {
    if (answer_question_map[i] != null) {
        count++;
        max_value = Math.max(answer_question_map[i].length, max_value);
        avg_value = avg_value + answer_question_map[i].length;
    }
}
avg_value = avg_value / count;
toastLog('最大值 = ' + max_value.toString());
toastLog('平均值 = ' + avg_value.toString());