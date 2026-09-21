---
title: "好感度机制与加点"
description: "Password b0.85 六名角色的隐藏好感度数值、阈值、关系判定与全部可获得加点"
toc: true
---

《Password》b0.85 会为六名主要角色分别记录一个隐藏好感度值。

这些数值不会以游戏内量表显示。新游戏中六项均从 0 开始，随后通过特定选择或自动剧情增加，并在后续用于判断文本差异、亲密选项、部分 CG，以及 D19 的关系结果。

::: {.callout-important}
## 好感度会控制什么，又不会控制什么？

好感度可以影响以下内容：

- 内心描写和短篇对话差异；
- 拥抱、亲吻及其他亲密选项；
- 是否发生亲吻或建立关系；
- 若干画廊 CG；
- D19 关系是自动成立、由玩家选择，还是无法成立。

任何字母线、金库密码结果、角色生死检定、奖牌检定或 Path P 条件，都不会直接读取六项好感度。
:::

## 基本机制

::: {.pw-rule-groups}

**存档与恢复**

- 六项好感度都随普通剧情存档保存，不属于持久数据；
- 读取较早存档会恢复该存档中的好感度值；

**加点与选择**

- 正常游玩中不会扣除好感度；
- 即使当前不在某名角色线上，部分选择仍可能为该角色加点；
- D5 电影菜单和 D7 家庭话题菜单可以同时为多名角色加点，但每个菜单仍只能选择一个选项；

**重置例外**

- Path C 有一个重要例外：Sal 的泳池剧情会直接把 Sal 好感度设为 0。

:::

表中各门槛均包含门槛值。例如，Hoss 好感度 15–19 表示从 15 点到 19 点。

## 阈值总览

| 角色 | 好感度阈值 |
|---|---|
| Orlando | 5、7、10、15、18、20 |
| Dean | 5、10、15、17、20 |
| Tyson | 10、15、16、17、18、20 |
| Roswell | 5、10、15、20 |
| Hoss | 5、12、15、16、20 |
| Sal | 8、15、16、20 |

## D19 关系结果

::: {.pw-key-rule}

D19 会根据当前角色线对应的好感度判定关系。

:::

::: {.affection-d19-summary-table .table-responsive .table-scroll-large}

| 角色 | 自动成立 | 可选择区间 | 玩家选项 | 低于区间 |
|---|---:|---:|---|---|
| Dean | Dean 好感度 ≥ 10 | 无 | 无 | 关系自动失败 |
| Orlando | Orlando 好感度 ≥ 20 | Orlando 好感度 10–19 | `I love you too.`／`Stay quiet.` | 自动拒绝 |
| Tyson | Tyson 好感度 ≥ 20 | Tyson 好感度 10–19 | `I love you.`／`...` | 自动拒绝 |
| Roswell | Roswell 好感度 ≥ 20 | Roswell 好感度 10–19 | `Relationship`／`Friendship` | 自动维持友情 |
| Hoss | Hoss 好感度 ≥ 20 | Hoss 好感度 15–19 | `Try dating.`／`Stay friends.` | 自动维持朋友关系 |
| Sal | Sal 好感度 ≥ 20 | Sal 好感度 15–19 | `Romantic`／`Platonic` | 自动维持朋友关系 |

:::

只有达到自动建立关系的门槛，或玩家在中间点数区间明确接受关系后，Dave 才会与该角色建立恋爱关系。Dean 是唯一没有中间选择区间的角色线。

## Hoss 阈值规划

Hoss 是最需要规划加点的角色，因为两张画廊图片分别受 D8 和 D19 的不同结果控制。

### D8 隐藏图书馆亲吻 CG

在不使用 D1 咖啡杯好感度结果、也不使用 D3 隐藏全员加点的前提下，D8 隐藏图书馆检定前最多可以获得 **13** 点。

因此，Hoss 好感度 ≥ 12 可以只靠普通可见选项达到。

如果进入图书馆时低于 12：

1. D8 亲吻和隐藏图书馆亲吻 CG 不会出现；
2. 低于 12 点时会自动增加 2 点；
3. 后续选择 `Hold his hand` 还可再增加 2 点。

::: {.pw-key-rule}

这些后续分数能帮助 D19，但都发生在 D8 检定之后，无法补回本周目已经错过的 CG。

:::

### D19 Hoss 关系成功 CG

在同样不使用 D1 咖啡杯结果和 D3 隐藏全员加点的条件下，D19 前的最高值是 **19**。这足以开放 `Try dating.`／`Stay friends.` 菜单，但不能触发 20 点自动关系。

D1 咖啡杯输入 `Hoss` 可把该普通上限恰好提高到 20。其他隐藏全员加点可以提供额外余量，但并非 D8 亲吻所必需。

## 共同加点与跨角色加点

::: {.affection-shared-gains-table .table-responsive .table-scroll-compact}

| 来源 | 效果 | 输入规则 |
|---|---:|---|
| D1 全员好感度咖啡杯答案 | 六人各 +1 | 与其他 D1 答案共用同一个输入框；去除首尾空格，但区分大小写 |
| D1 隐藏司机姓名答案 | 六人各 +1 | 与其他 D1 答案共用同一个输入框，彼此互斥 |
| D1 输入主要角色准确姓名 | 对应角色 +1 | 去除首尾空格后，必须使用准确的首字母大写拼写 |
| D3 隐藏全员好感度输入 | 六人各 +5 | 去除首尾空格，并在比较前转为大写 |

:::

D1 的所有答案共用一个输入框，因此一次流程中只能触发其中一个 D1 分支。D3 的全员加点与 D1 相互独立。

普通可见菜单也可能同时影响多名角色：

- D5 的一个电影选项可能为多名角色加点；
- D7 的一个家庭话题选项也可能为多名角色加点。

每次可以获得的加点都列在下方各角色表格中。

## 完整加点清单

以下表格列出正常游戏中全部 126 个可获得加点，以及每名角色各自的 D1 准确姓名加点。只会在回放模式出现或正常游玩中无法获得的分数不计入。

为了方便与游戏界面对照，菜单选项保留原始英文。同一互斥菜单中的多行不能在单次流程中同时取得。

::: {.panel-tabset .character-tabs group="affection-character"}

### Orlando

::: {.affection-point-table .table-responsive .table-scroll-large}

| 日期 | 选择／条件 | 要求 | 点数 |
|---|---|---|---:|
| D1 | 咖啡杯输入 `Orlando` | 去除首尾空格后必须准确区分大小写 | +1 |
| D2 | `Cherry Pie!` | — | +1 |
| D3 | `Orlando` | D3 消息对象 | +1 |
| D4 | `Wind?` | Orlando 线 | +1 |
| D5 | `Yes.` | Orlando 线 | +1 |
| D5 | `Cookies` | Orlando 线；D5 Orlando 甜点选择 | +1 |
| D5 | `Brownies` | Orlando 线；D5 Orlando 甜点选择 | +1 |
| D5 | `Comedy` | 与其他 D5 电影选项互斥 | +1 |
| D6 | `Orlando` | Sal 线或 Orlando 线 | +1 |
| D6 | `What was it like?` | Orlando 线 | +1 |
| D6 | `Yes.` | Orlando 线；D6 金库检定成功；进入选择时 Orlando 好感度 ≥ 7；D6 Orlando 后续 Yes／No 菜单 | +1 |
| D6 | 第一次练习接吻后自动增加 | Orlando 线；D6 金库检定成功；进入事件时 Orlando 好感度为 5—6 | +1 |
| D7 | `Hug.` | Orlando 线；D7 Orlando 回应 | +1 |
| D7 | `Advice.` | Orlando 线；D7 Orlando 回应 | +2 |
| D7 | `Stay.` → `Dean.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D7 | `Stay.` → `Roswell.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D7 | `Stay.` → `Orlando.` | D7 家庭话题菜单，和其他主题互斥 | +2 |
| D9 | `...Reverse.` | Roswell、Orlando 或 Sal 线；D9 Uno 最后一张牌菜单 | +1 |
| D9 | `Hold his hand.` | Orlando 线 | +2 |
| D9 | `Invite him to stay.` | Orlando 线；D9 夜间 Orlando 菜单 | +1 |
| D9 | `Reassure him.` | Orlando 线；D9 夜间 Orlando 菜单 | +2 |
| D15 | `Kiss him.` | Orlando 线；Path A 或 B | +2 |
| D16 | `Agree.` | Orlando 线；Path A 或 B；Orlando 好感度 ≥ 15 | +1 |

:::

### Dean

::: {.affection-point-table .table-responsive .table-scroll-large}

| 日期 | 选择／条件 | 要求 | 点数 |
|---|---|---|---:|
| D1 | 咖啡杯输入 `Dean` | 去除首尾空格后必须准确区分大小写 | +1 |
| D2 | `Greenhouse.`，进入房间时自动增加 | — | +1 |
| D3 | `Dean` | D3 消息对象 | +1 |
| D4 | `Call for help.` | Dean 线 | +1 |
| D5 | Dean 线早晨剧情中自动增加 | Dean 线 | +2 |
| D5 | `Dean` → `Get Closer` | Dean 线 | +1 |
| D5 | `Comedy` | 与其他 D5 电影选项互斥 | +2 |
| D5 | `Action` | 与其他 D5 电影选项互斥 | +1 |
| D5 | `Romance` → `Hold his hand` | Dean 线；与其他 D5 电影选项互斥 | +1 |
| D6 | `Dean.` → `Yes` | Dean 线；D5 已亲吻 Dean；D6 选择 Dean 后同意回吻 | +2 |
| D6 | `Hold his hand.` | Dean 线 | +1 |
| D7 | `Stay.` → `Dean.` | D7 家庭话题菜单，和其他主题互斥 | +3 |
| D7 | `Stay.` → `Hoss.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D7 | `Stay.` → `Sal.` | D7 家庭话题菜单，和其他主题互斥 | +2 |
| D9 | `Dean.` | Dean、Hoss 或 Tyson 线；D9 早晨同伴菜单 | +1 |
| D15 | `Go for it.` | Dean 线；Path A 或 B；D15 Dean 回应 | +1 |
| D15 | `Hold off.` | Dean 线；Path A 或 B；D15 Dean 回应 | +2 |

:::

### Tyson

::: {.affection-point-table .affection-tyson-table .table-responsive .table-scroll-large}

| 日期 | 选择／条件 | 要求 | 点数 |
|---|---|---|---:|
| D1 | 咖啡杯输入 `Tyson` | 去除首尾空格后必须准确区分大小写 | +1 |
| D2 | `I like how you smell.` | — | +1 |
| D3 | `Tyson` | D3 消息对象 | +1 |
| D3 | `Tyson.` | D3 午餐同伴 | +1 |
| D3 | `Tyson.` → `Chase after Tyson.` | — | +1 |
| D4 | `Grab his hand.` | Tyson 线 | +1 |
| D5 | `Beating?` | Tyson 线 | +1 |
| D5 | `Tyson` | Tyson 线 | +1 |
| D5 | `Horror` | 与其他 D5 电影选项互斥 | +1 |
| D5 | `Comedy` | 与其他 D5 电影选项互斥 | +1 |
| D5 | `Action` | 与其他 D5 电影选项互斥 | +1 |
| D5 | `Romance` | Tyson 线；与其他 D5 电影选项互斥 | +1 |
| D6 | `Tyson.` → `I didn't know I was spotting for a bitch.` | Hoss 线或 Tyson 线；D6 Tyson 鼓励选项 | +1 |
| D6 | `Tyson.` → `Keep going! You can do it!` | Hoss 线或 Tyson 线；D6 Tyson 鼓励选项 | +2 |
| D6 | `You.` | Tyson 线 | +1 |
| D6 | `Stop Tyson.` → `Save Tyson.` → `Truth.` | Tyson 线；D6 金库检定成功；Tyson 救援嵌套选项 | +1 |
| D6 | `Stop Tyson.` → `Save Tyson.` → `I've got your back too.` | Tyson 线；D6 金库检定成功；Tyson 救援嵌套选项 | +1 |
| D6 | `Stop Tyson.` → `Save Tyson.` → `Stay.` | Tyson 线；D6 金库检定成功；Tyson 救援嵌套选项 | +1 |
| D7 | `Assist.` | Tyson 线 | +1 |
| D7 | `Follow Tyson.` → `Hug him.` | Tyson 线 | +1 |
| D7 | `Follow Tyson.` → `Hug Tyson.` | Tyson 线 | +1 |
| D8 | `Pet him.` | Tyson 线 | +1 |
| D9 | `Tyson.` | Dean、Hoss 或 Tyson 线；D9 早晨同伴菜单 | +1 |
| D15 | `'Ty'.` | Tyson 线；Path A 或 B；D15 称呼选择 | +2 |
| D15 | `'Tyson'.` | Tyson 线；Path A 或 B；D15 称呼选择 | +1 |
| D16 | `As something more.` | Tyson 线；Path A 或 B；Tyson 好感度 ≥ 18 | +2 |
| D18 | `Stay by the door.` | Tyson 线 | +1 |

:::

### Roswell

::: {.affection-point-table .table-responsive .table-scroll-large}

| 日期 | 选择／条件 | 要求 | 点数 |
|---|---|---|---:|
| D1 | 咖啡杯输入 `Roswell` | 去除首尾空格后必须准确区分大小写 | +1 |
| D2 | `Museum.`，进入房间时自动增加 | — | +1 |
| D3 | `Roswell` | D3 消息对象 | +1 |
| D3 | `Roswell.` | D3 午餐同伴 | +1 |
| D4 | `Nah.` | Roswell 线 | +1 |
| D4 | `Sure.` | — | +1 |
| D4 | `Invest` | Roswell 线；D4 Roswell 投资选择 | +2 |
| D4 | `Vacation` | Roswell 线；D4 Roswell 投资选择 | +1 |
| D4 | `Pay Debts` | Roswell 线；D4 Roswell 投资选择 | +1 |
| D6 | `Okay.` | Roswell 线 | +1 |
| D6 | `Lie` | Roswell 线 | +1 |
| D6 | `Kiss him.` | Roswell 线；Roswell 好感度 ≥ 5；D6 Roswell 回应 | +2 |
| D6 | `Hug him.` | Roswell 线；Roswell 好感度 ≥ 5；D6 Roswell 回应 | +1 |
| D7 | `Stay.` → `Dean.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D7 | `Stay.` → `Roswell.` | D7 家庭话题菜单，和其他主题互斥 | +2 |
| D7 | `Stay.` → `Orlando.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D9 | `...Wild.` | Roswell、Orlando 或 Sal 线；D9 Uno 最后一张牌菜单 | +1 |
| D15 | `Agree.` | Roswell 线；Path A 或 B | +1 |
| D16 | `I like you.` | Roswell 线；Path A 或 B；Roswell 好感度 ≥ 15 | +2 |

:::

### Hoss

::: {.affection-point-table .table-responsive .table-scroll-large}

| 日期 | 选择／条件 | 要求 | 点数 |
|---|---|---|---:|
| D1 | 咖啡杯输入 `Hoss` | 去除首尾空格后必须准确区分大小写 | +1 |
| D2 | `Pilates?` | — | +1 |
| D3 | `Hoss` | D3 消息对象 | +1 |
| D4 | `Stay.` | Hoss 线 | +1 |
| D5 | `You can pick.` | Hoss 线 | +1 |
| D5 | `Oh! Thank god you're here!` | Hoss 线；D5 Hoss 威胁回应 | +1 |
| D5 | `Oh no! Not Slimes!` | Hoss 线；D5 Hoss 威胁回应 | +1 |
| D5 | `Hoss` | Hoss 线 | +1 |
| D5 | `Action` | 与其他 D5 电影选项互斥 | +1 |
| D6 | `Hoss.` | Hoss 线或 Tyson 线 | +1 |
| D6 | `Guys like me?` | Hoss 线 | +1 |
| D6 | `Neither.` | Hoss 线 | +1 |
| D7 | `Good!` | Hoss 线 | +1 |
| D7 | `Stay.` → `Roswell.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D7 | `Stay.` → `Hoss.` | D7 家庭话题菜单，和其他主题互斥 | +2 |
| D7 | `Stay.` → `Sal.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D8 | 隐藏图书馆中未达到 D8 亲吻阈值时自动增加 | Hoss 线；Hoss 好感度低于 12 | +2 |
| D8 | `Hold his hand` | Hoss 线 | +2 |
| D9 | `Hoss.` | Dean、Hoss 或 Tyson 线；D9 早晨同伴菜单 | +1 |
| D9 | `Answer.` | Hoss 线 | +1 |
| D9 | `...want you to stay.` | Hoss 线；D9 夜间 Hoss 菜单 | +1 |
| D9 | `...hope you sleep well.` | Hoss 线；D9 夜间 Hoss 菜单 | +2 |

:::

### Sal

::: {.affection-point-table .table-responsive .table-scroll-large}

| 日期 | 选择／条件 | 要求 | 点数 |
|---|---|---|---:|
| D1 | 咖啡杯输入 `Sal` | 去除首尾空格后必须准确区分大小写 | +1 |
| D2 | `Throw towel over.` | — | +1 |
| D3 | `Sal` | D3 消息对象 | +1 |
| D4 | `Continue searching.` | Sal 线 | +1 |
| D5 | `Yes` | Sal 线 | +1 |
| D5 | `Swim to Sal.` | Sal 线 | +1 |
| D5 | `The day we first met.` | Sal 线 | +1 |
| D5 | `No` | Sal 线 | +1 |
| D5 | 晚餐选择 `Sal` 后自动增加 | Sal 线 | +1 |
| D5 | `Comedy` | 与其他 D5 电影选项互斥 | +1 |
| D5 | `Action` | 与其他 D5 电影选项互斥 | +2 |
| D6 | `Sal` | Sal 线或 Orlando 线 | +1 |
| D6 | `Wait.` | Sal 线 | +1 |
| D6 | `Video games?` | Sal 线；D6 Sal 活动选择 | +1 |
| D6 | `Talk?` | Sal 线；D6 Sal 活动选择 | +1 |
| D6 | `No.` | Sal 线 | +1 |
| D7 | `Stay.` → `Hoss.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D7 | `Stay.` → `Sal.` | D7 家庭话题菜单，和其他主题互斥 | +2 |
| D7 | `Stay.` → `Orlando.` | D7 家庭话题菜单，和其他主题互斥 | +1 |
| D9 | `...Skip.` | Roswell、Orlando 或 Sal 线；D9 Uno 最后一张牌菜单 | +1 |
| D9 | `Approach.` | Sal 线；Sal 好感度 ≥ 15；D9 Sal 安慰菜单 | +1 |
| D9 | `Talk.` | Sal 线；D9 Sal 安慰菜单 | +1 |
| D9 | `...want to cuddle?` | Sal 线；D9 夜间 Sal 菜单 | +1 |
| D9 | `...want to talk more?` | Sal 线；D9 夜间 Sal 菜单 | +2 |

:::

:::

## Sal 在 b0.85 中的特殊行为

### Path C 会把 Sal 好感度重置为 0

Path C 的 Sal 泳池剧情会把 Sal 好感度重置为 0，清除该存档此前累积的全部 Sal 好感度。

正常流程中，另外五名角色没有对应的重置。

### D16 `Remain still.` 不会增加好感度

Sal 线 D16 的高好感度菜单中，`Remain still.` 显示会增加 2 点，但 b0.85 实际计为 **0 点**，后续也不会补上。

::: {.callout-warning}
## b0.85 的实际计分

规划 Sal 的 D19 结果时，不要把 `Remain still.` 计作 +2；选择后 Sal 好感度不会改变。
:::

## 相关页面

- [好感度检定与剧情差异](affection-differences.md)
- [CG 画廊查漏索引](../collectibles/gallery.md)
