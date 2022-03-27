/* 评估哈希表利用率 */
// 本地存储数据
var storage = storages.create('data');
var answer_question_map = storage.get('answer_question_map1');
var count = 0;
for (var i in answer_question_map) {
    if (answer_question_map[i] != null) count++;
}
toastLog('哈希表利用率 = ' + (count / answer_question_map.length).toString());