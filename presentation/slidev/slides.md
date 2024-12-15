---
background: https://cover.sli.dev
---
# 计算概论期末大作业

张庭瑞

---
layout: image-right
image: images/settings2.png
---

## 功能介绍

<br>

### 设置部分：

- 可以选择颜色
- 可以选择和电脑下，也可以选择和人下
- 支持 BGM
- 支持多语言

能够记忆上次的选项，启动时自动加载

---
layout: image-left
image: images/history2.png
---

## 功能介绍

<br>

### 用户界面部分

可以查看历史，给出推荐的棋步(推荐的下法会高亮显示 2s)

支持悔棋，复盘等操作。

---
layout: image-left
image: images/save.png
---

## 功能介绍

<br>

### 游戏保存

支持自动保存，每次进入游戏默认加载上一次的对局

--- 

## 功能介绍

<br>

### 游戏保存

支持手动保存，保存为 JSON 格式文件，可以任意加载存档

```json
{
  "board":[[2,2,1,2,0,2,0,2,0,2,0,2,1,2,0],[2,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,2,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,2,0,0,0,0,0,0,0,0,0],
  [2,1,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,2,0,0,0,0,0,0,0,0,0],
  [2,2,1,0,0,0,1,0,0,0,0,1,0,0,0],[0,1,0,0,0,0,0,1,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0,0,0,0,0,1,0,0],[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],[
    2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  "history":[{
    "playerColor":1,"position":[7,7],"id":0},
    {"playerColor":2,"position":[5,5],"id":1},
    {"playerColor":1,"position":[6,6],"id":2},
    {"playerColor":2,"position":[0,0],"id":3},
    {"playerColor":1,"position":[4,4],"id":4},
    {"playerColor":2,"position":[0,1],"id":5},
    {"playerColor":1,"position":[12,5],"id":6},
    ...
    "whoseTurn":1,"elapsedTime":137}]
}
```

---
layout: center
background: https://cover.sli.dev
---

# 算法介绍

---

### 主要实现方式

Min-Max 搜索算法

```javascript {monaco}
minmax(depth, alpha, beta, playerColor) {
  let moves = this.board.getAllValidMoves(playerColor);
  if (depth === 0 || moves.length === 0) {
      return this.board.evaluate();
  }
  if (playerColor === BLACK) {
      //We want to maximize the score
      let max = -Infinity;
      for (let i = 0; i < Math.min(MAX_MOVES, moves.length); i++) {
          let move = moves[i];
          this.board.cells[move[0]][move[1]] = BLACK;
          max = Math.max(max, this.minmax(depth - 1, alpha, beta, WHITE));
          this.board.cells[move[0]][move[1]] = EMPTY;
          alpha = Math.max(alpha, max);
          if (beta <= alpha) {
              break;
          }
      }
      return max;
  }
  else {
      //We want to minimize the score
      //...
  }
}
```

---

### 优化方法

1. alphabet 剪枝

```javascript {7,8}
//We want to maximize the score
let max = -Infinity;
for (let i = 0; i < Math.min(MAX_MOVES, moves.length); i++) {
    place();
    max = Math.max(max, this.minmax(depth - 1, alpha, beta, WHITE));
    remove();
    alpha = Math.max(alpha, max);
    if (beta <= alpha) break;
}
```

---

### 优化方法

2. 启发式搜索

在走下一步的时候，对可下子的位置优劣进行排序，然后搜索时只搜高优先级的几个，而不用全都搜索。
同时，在对局前期，靠近对方棋子的权重更高，避免了下的到处都是的情况。

```javascript{monaco}
evaluatePos(x, y, playerColor) {
  if (this._fiveInRow(x, y, playerColor)) {//1st priority
      totalScore += 1000000;
  }
  if (this._fiveInRow(x, y, otherColor)) {
      totalScore += 1000000;
  }
  if (this._liveFour(x, y, playerColor)) {//3rd priority
      totalScore += 200000;
  }
  if (this._liveFour(x, y, otherColor)) {//2nd priority
      totalScore += 100000;
  }
  if(this._nearSomething(x, y)) {//防止下到太空的地方
    totalScore += 100;
  }
}
```

---
layout: image-left
image: images/case.png
---

## 算法介绍

### 优化方法

3. 结合逻辑判断， 减少计算量

像如图所示的情况，如果出现XOOOX或者*OOOOX的情况，可以直接赢，或者不下就输了，可以直接下，不用搜索了，这样可以减少算力资源的浪费。

