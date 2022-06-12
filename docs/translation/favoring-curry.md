# [译] Favoring Curry

> [原文链接](https://fr.umio.us/favoring-curry/)

翻译并没有经过校对，如有不正确的地方，请联系[我](https://github.com/berber1016/wunblog/issues)

Curry? 像是辣的食物？ 什么 ？ 在哪里 ？
> 注： curry直译为 咖喱

实际上 `curry` 这个名字来自 Haskell Curry,他是第一个调查研究此项技术的人。

**柯里化**是将需要多个参数的函数转化为单一参数的函数。当提供较少的参数时，返回一个新的函数来等待剩余的参数。

基本的看上去像这样：

```js
// 未柯里化版本

let formatName1 = function (first, middle, last) {
    return `${first} ${middle} ${last}`
}

formatName1('John', 'Paul', 'Jones')
//=> 'John Paul Jones'

formatName1('John', 'Paul')
//=> 'John Paul undefined'

```

但柯里化的版本更有用

> 注：可以点击[这里](https://ramdajs.com/repl/#?var%20formatNames2%20%3D%20R.curry%28function%28first%2C%20middle%2C%20last%29%20%7B%0A%20%20%20%20return%20%60%24%7Bfirst%7D%20%24%7Bmiddle%7D%20%24%7Blast%7D%60%0A%7D%29%3B%0A%2F%2F%20formatNames2%28%27John%27%2C%20%27Paul%27%2C%20%27Jones%27%29%3B%0A%2F%2F%3D%3E%20%27John%20Paul%20Jones%27%20%2F%2F%20%28definitely%20the%20musician%21%29%0A%0Avar%20jp%20%3D%20formatNames2%28%27John%27%2C%20%27Paul%27%29%3B%20%2F%2F%3D%3E%20returns%20a%20function%0Ajp%28%27Jones%27%29%3B%20%2F%2F%3D%3E%20%27John%20Paul%20Jones%27%20%28maybe%20this%20one%27s%20the%20admiral%29%0Ajp%28%27Stevens%27%29%3B%20%2F%2F%3D%3E%20%27John%20Paul%20Stevens%27%20%28the%20Supreme%20Court%20Justice%29%0Ajp%28%27Pontiff%27%29%3B%20%2F%2F%3D%3E%20%27John%20Paul%20Pontiff%27%20%28ok%2C%20so%20I%20cheated.%29%0A%2F%2Fjp%28%27Ziller%27%29%3B%20%2F%2F%3D%3E%20%27John%20Paul%20Ziller%27%20%28magician%2C%20a%20wee%20bit%20fictional%29%0A%2F%2Fjp%28%27Georgeandringo%27%29%3B%20%2F%2F%3D%3E%20%27John%20Paul%20Georgeandringo%27%20%28rockers%29)来直接体验下面代码的执行结果

```js
let formatName2 = R.curry(function (first, middle, last) {
    return `${first} ${middle} ${last}`
})

formatNames2('John', 'Paul', 'Jones');
//=> 'John Paul Jones'

var jp = formatNames2('John', 'Paul'); //=> 返回一个新的函数
jp('Jones'); 
jp('Stevens'); 
jp('Pontiff'); 
jp('Ziller'); 
jp('Georgeandringo');
```

或者 

```js
['Jones', 'Stevens', 'Ziller'].map(jp);
//=> ['John Paul Jones', 'John Paul Stevens', 'John Paul Ziller']
```

也可以像这样 

```js
var james = formatNames2('James'); //=> returns a function
james('Byron', 'Dean'); //=> 'James Byron Dean'
var je = james('Earl'); // also returns a function
je('Carter'); //=> 'James Earl Carter'
je('Jones'); //=> 'James Earl Jones' 
```
(有些人坚持的认为我们所做的是 "partial application"，他们认为"柯里化"应该是这样的情况，得到的结果函数有一个参数，每个参数都解析为一个新的函数直到提供了所有必要的参数，他们可以继续坚持这样的想法)。

**这能为我做什么呢？**

这是一个稍有意义的一个例子，如果你想在一个数组中算出总和，你可以这样做：

```js
let add = function (a,b) {
    return a + b;
}
let numbers = [1,2,3,4,5];
let sum = numbers.reduce(add,0)// => 15

```

如果你想写一个更通用的函数来计算数组中的总和，你可以这样写

```js
let add = function (a,b) {
    return a + b;
}
let total = function(list) {
    return list.reduce(add,0)
}
let numbers = [1,2,3,4,5];
var sum = total(numbers); //=> 15
```

在 Ramda 中，`total` 和 `sum` 是十分相似的。你可以像这样定义 `sum`

```js
// In Ramda
let total = R.reduce(add,0);
```

你仅是返回一个可调用的函数(指 `total`)

```js
let sum = total(numbers); //=> 15
```
再次注意这里定义函数和函数对数据的应用有多么的相似

```js
var total = R.reduce(add, 0); //=> function:: [Number] -> Number
var sum =   R.reduce(add, 0, numbers); //=> 15
```

**别担心，我并不是一个数学极客！**

那么，你是一个web开发人员，对吧？ 你用AJAX请求服务器？ 你使用 [Promise](https://promisesaplus.com/)。你需要对返回的数据进行操作，filter it, subset it?， 或者你是一个服务端开发？异步查询 no-SQL 数据库，对结果进行操作？

我可以建议你看 Hugh FD Jackson 的这篇文章[Why Curry Helps](http://hughfdjackson.com/javascript/why-curry-helps/)，这是我在这之前看过最好的文章。如果是是一个视觉学习者(visual learner)，花费半个小时来看看 Dr. Boolean的这个视频[ Hey Underscore, You're Doing It Wrong](https://www.youtube.com/watch?v=m3svKOdZijA)。

> ============================

假设我们期望的数据像下面这样：

```js
var data = {
    result: "SUCCESS",
    interfaceVersion: "1.0.3",
    requested: "10/17/2013 15:31:20",
    lastUpdated: "10/16/2013 10:52:39",
    tasks: [
        {id: 104, complete: false,            priority: "high",
                  dueDate: "2013-11-29",      username: "Scott",
                  title: "Do something",      created: "9/22/2013"},
        {id: 105, complete: false,            priority: "medium",
                  dueDate: "2013-11-22",      username: "Lena",
                  title: "Do something else", created: "9/22/2013"},
        {id: 107, complete: true,             priority: "high",
                  dueDate: "2013-11-22",      username: "Mike",
                  title: "Fix the foo",       created: "9/22/2013"},
        {id: 108, complete: false,            priority: "low",
                  dueDate: "2013-11-15",      username: "Punam",
                  title: "Adjust the bar",    created: "9/25/2013"},
        {id: 110, complete: false,            priority: "medium",
                  dueDate: "2013-11-15",      username: "Scott",
                  title: "Rename everything", created: "10/2/2013"},
        {id: 112, complete: true,             priority: "high",
                  dueDate: "2013-11-27",      username: "Lena",
                  title: "Alter all quuxes",  created: "10/5/2013"}
        // , ...
    ]
};

```

我们需要一个函数 `getIncompleteTaskSummeries` 来接受一个成员名称参数，它请求数据来自服务端(或者其他地方)，选出 `complete` = true 的的成员，返回 ids、priorities、titles、和due dates，按照 due Date来排序。事实上，它返回了一个 `Promise`。

如果你想忽略 "Scott"，它应该返回 

```js
[
    {id: 110, title: "Rename everything", 
        dueDate: "2013-11-15", priority: "medium"},
    {id: 104, title: "Do something", 
        dueDate: "2013-11-29", priority: "high"}
]
```
OK,像下面这样的代码你是否熟悉呢？

```js
getIncompleteTaskSummaries = function(membername) {
    return fetchData()
        .then(function(data) {
            return data.tasks;
        })
        .then(function(tasks) {
            var results = [];
            for (var i = 0, len = tasks.length; i < len; i++) {
                if (tasks[i].username == membername) {
                    results.push(tasks[i]);
                }
            }
            return results;
        })
        .then(function(tasks) {
            var results = [];
            for (var i = 0, len = tasks.length; i < len; i++) {
                if (!tasks[i].complete) {
                    results.push(tasks[i]);
                }
            }
            return results;
        })
        .then(function(tasks) {
            var results = [], task;
            for (var i = 0, len = tasks.length; i < len; i++) {
                task = tasks[i];
                results.push({
                    id: task.id,
                    dueDate: task.dueDate,
                    title: task.title,
                    priority: task.priority
                })
            }
            return results;
        })
        .then(function(tasks) {
            tasks.sort(function(first, second) {
                var a = first.dueDate, b = second.dueDate;
                return a < b ? -1 : a > b ? 1 : 0;
            });
            return tasks;
        });
};
```
代码像下面这样是不是看起来更好呢？

```js
var getIncompleteTaskSummaries = function(membername) {
    return fetchData()
        .then(R.get('tasks'))
        .then(R.filter(R.propEq('username', membername)))
        .then(R.reject(R.propEq('complete', true)))
        .then(R.map(R.pick(['id', 'dueDate', 'title', 'priority'])))
        .then(R.sortBy(R.get('dueDate')));
};
```
如果是这样的话，柯里化就很适合你。这里所有的 Ramda 函数都进过了 `curry` 的处理。

让我们一起来看看发生了什么

`get` 的定义像这样:

```js
ramda.get = curry(function(name, obj) {
     return obj[name];
 });
```

在我们调用它时，我们仅仅提供了第一个参数 `name`，正如我们所讨论的，我们将返回一个函数来等待 `obj` 这个参数通过第一个 `then`来传递，像这样：

```js
.then(R.get('tasks'));
```

接下来的 `propEq`，像这样定义：

```js
ramda.propEq = curry(function(name, val, obj) {
    return obj[name] === val;
});
```
所以，当我们仅传"username"和 `membername`调用它时，柯里化返回了一个新的函数，它相当于：
```js
function(obj) {
    return obj['username'] === membername;
}
```
然后将这个函数传入`filter`中，Ramda 的 `filter`的实现 和 `Array.prototype.filter`几乎是一样的，但是

```js
ramda.filter = curry(function(predicate, list) { /* ... */ });
```

// TODO 还未完成


