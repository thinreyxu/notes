在 Node.js 中是用 SQLite3
===========================

> SQLite3 是轻量级的进程内 SQL 引擎 <cite>——《Node Web 开发》</cite>

<!--  -->

> SQLite3 是一个无服务器且无需配置的 SQL 数据库引擎，仅仅作为一个独立的库被链接到应用程序上。
> <cite>——《Node Web 开发》</cite>



使用 sqlite3 模块
-----------------

模块主页： http://github.com/mapbox/node-sqlite3  
文档： https://github.com/mapbox/node-sqlite3/wiki



### 安装

```
$ npm install sqlite3
```



### 使用

使用 sqlite3 模块进行查询操作，可以划分为两个阵营：其一是以 Datebase 对象为基础执行 Database 对象方法进行查询；另一是以 Statement 对象为基础执行 Statement 对象方法进行查询。所谓 Statement 对象及是包装了查询字符串的对象，该对象可能还持有查询参数，结果集的行指针。


#### 引入模块

``` javascript
var sqlite3 = require('sqlite3');
```



#### 创建数据库实例

``` javascript
var db = new sqlite3.Database(
  'notes', 
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  function (err) {
    // 处理错误 或 使用 db 提供的接口执行数据库操作
  }
);
```
上面的代码中，使用 `new sqlite3.Datebase()` 创建数据库，该构造函数接收 1-3 个参数：

1. 第一个为数据库文件的名称，上面代码中的是 `'notes'` ，会在磁盘上查找或建立同名的数据库文件。如果不希望数据库在磁盘上长久的保存，可以使用 `':memory:'` 作为数据库文件名在内存创建一个匿名的数据库，或者使用空字符串 `''` 作为文件名建立一个基于磁盘的匿名数据库。当与此数据库的连接被关闭时，此匿名数据库及存储的所有数据就会随之自动清除；
2. 第二个为访问模式（可选），可以为以下这三者中的一个或多个：`sqlite3.OPEN_READONLY`，`sqlite3.OPEN_READWRITE` 和 `sqlite3.OPEN_CREATE`；
3. 第三个为回调函数（可选），参数为错误对象或空。



#### 执行数据库查询

``` javascript
db.run(
  'CREATE TABLE IF NOT EXISTS notes \
    (ts DATETIME, author VARCHAR(255), note TEXT)',
  function (err) {
    // 处理错误 或 执行其他操作
  }
);
```
上面的代码中，调用了 `db.run()` 方法，创建了名为 notes 的数据表，包含三列，分别为 ts（时间戳）、author（作者，最长为 255 个字符）、note（便签内容，文本类型）。此例中的 `db.run()` 方法接收了两个参数，分别为查询字符串和回调函数。

该方法可以接收三个参数，如下所示：
``` javascript
db.run(
  'INSERT INTO notes (ts, author, note) VALUES (?, ?, ?);',
  [new Date(), author, note],
  function (err) {
    // 处理错误 或 执行其他操作
  }
);
```
上面的代码中，调用 `db.run()` 方法传入了三个参数，第一个参数为查询字符串，字符串中的 `?` 为占位符，他们中的每一个将被方法调用时传入的第二个参数，一个数组，中的每一个元素依次替换。第三个参数仍为回调函数。

除了使用 `？` 做占位符，还可以使用 `$` 开头的标识符，相应的第二个参数也变为一个以这些占位符为 key 的对象。


**如更新**：

``` javascript
db.run(
  'UPDATE notes SET author = $author, note = $note WHERE ts = $ts;',
  {
    $author: author,
    $note: note,
    $ts: ts
  },
  function (err) { }
);
```


**又如删除**：

``` javascript
db.run(
  'DELETE FROM notes WHERE ts = $ts;',
  { $ts: ts },
  function (err) { }
);
```

由于 `db.run()` 方法不会取回任何查询数据，所以对于数据查询，sqlite3 模块提供了除 `db.run()` 之外的另外的方法：`db.get()`、`db.all()`、`db.each()`，使用事例如下：

**查询符合的第一行数据**：
``` javascript
db.get(
  'SELECT * FROM notes',
  function (err, row) { }
);
```

**查询符合的所有数据行**：
``` javascript
db.all(
  'SELECT * FROM notes',
  function (err, rows) { }
);
```
上面的代码中，`db.all()` 方法会将查询到的所有数据行收集在一个数组 `rows` 中。

**查询符合的每一行数据**：
``` javascript
db.each(
  'SELECT * FORM notes',
  function (err, row) {
    // 处理错误 或 处理符合查询条件的一行数据
  },
  function (err, numOfRows) {
    // 处理错误 或 质询其他操作
  }
);
```
`db.each()` 方法接收三个参数。第一个为查询字符串，另外两个都为回调函数，不过两个函数调用的时机不同。由于 `db.each()` 是一次处理每一行符合条件的数据，所以每当找到一行数据，便调用第二个参数指定的回调函数。当整个查询完成后，则会调用第三个参数指定的回调函数。



#### 关于控制流（Control Flow）

sqlite3 模块提供了两种控制流模式：串行（serial）和并行（parallel）。默认情况下，所有操作都在并行模式下运行。可以使用 `db.serialize()` 或 `db.parallelize()` 两个方法改变控制流的模式。

唯一的例外发生在 `db.close()` 操作，此操作不再两种模式中的任何一种中执行，他有自身的专有（exclusive）模式。当执行此操作时，如果还有未执行完成的查询操作，那么此操作会进入等候（pending）状态，等到所有的查询操作都执行完成再执行。同时，一旦此操作进入等候状态，则不再允许其他查询操作进入串行执行队列或者并行执行其他新的查询操作。


**串行模式** *以下代码出自[官方文档][1]*
``` javascript
// 此处的查询操作会在「某一」模式下执行
db.serialize(function () {
  // 此处的查询操作会在「串行」模式下执行
  db.serialize(function () {
    // 此处的查询操作会在「串行」模式下执行
  });
  // 此处的查询操作会在「串行」模式下执行
});
// 此处的查询操作会恢复在「某一」模式下执行
```

**并行模式** *以下代码同样出自[官方文档][2]*
``` javascript
// 此处的查询操作会在「某一」模式下执行
db.serialize(function() {
  // 此处的查询操作会在「串行」模式下执行
  db.parallelize(function() {
    // 此处的查询操作会在「并行」模式下执行
  });
  // 此处的查询操作会在「串行」模式下执行
});
// 此处的查询操作会恢复在「某一」模式下执行
```

上面的两块代码中，两个方法同样的可以接受一个参数，即回调函数。该回调函数会立即在指定的模式下执行，当该回调函数执行完毕后，控制流模式会立即恢复成执行之前的样子。

两个方法同样的可以没有参数，当这两个方法无参数调用时，控制流会立刻进入指定的模式，但何时发生改变或改变与否要等到下一次调用这两个方法才能确定，遗迹在此种情况调用下，模式不会自行恢复。

``` javascript
db.serialize();
// 此处的查询操作会在**串行**模式下执行
db.parallelize();
// 此处的查询操作会在**并行**模式下执行
```



#### 事件

``` javascript
db.on('open', function () { });
db.on('error', function (err) { });
db.on('trace', function (sql) { });
db.on('profile', function (sql, timeCosts) { })
```



#### debug

``` javascript
// 输出调用栈信息以帮助调试
sqlite3.verbose() 
```



模块部分接口概览
---------------

+ new sqlite3.Database(filename, [mode], [callback])
+ sqlite3.verbose()

### Database 阵营
+ Database#run(sql, [param, ...], [callback])
+ Database#get(sql, [param, ...], [callback])
+ Database#all(sql, [param, ...], [callback])
+ Database#each(sql, [param, ...], [callback], [complete])
+ Database#exec(sql, [callback])
+ Database#prepare(sql, [param, ...], [callback])

*注意： `prepare()` 方法返回 Statement 对象，其余方法返回 Datebase 对象以便链式调用。*

### Statement 阵营
+ Statement#bind([param, ...], [callback])
+ Statement#reset([callback])
+ Statement#finalize([callback])
+ Statement#run([param, ...], [callback])
+ Statement#get([param, ...], [callback])
+ Statement#all([param, ...], [callback])
+ Statement#each([param, ...], [callback], [complete])

*注意： 除 `finalize()` 的返回值在官方文档没有明确说明外，其余方法返回 Statement 对象以便链式调用。*


[1]: https://github.com/mapbox/node-sqlite3/wiki/Control-Flow#databaseserializecallback "Contorl Flow - Database#serialize([callback])"
[2]: https://github.com/mapbox/node-sqlite3/wiki/Control-Flow#databaseparallelizecallback "Contorl Flow - Database#parallelize([callback])"