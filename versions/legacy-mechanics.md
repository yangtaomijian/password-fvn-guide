---
title: "旧版本机制档案"
description: "Password b0.7 中 Path A 的跨存档首次流程、D8 Oswin 自由问答，以及后来被移除或重组的机制"
toc: true
---

此处整理了 *Password* b0.7 中可以实际遇到、但在 b0.85 已被移除或改写的互动。

主要包括：

- Path A 后段只在首次流程完整播放的两段剧情；
- b0.85 中对应的追加场景回放；
- b0.7 的 D8 Oswin 自由文字问答；
- b0.85 删除的 D11 实验室选择。

::: {.callout-warning}
## 残留内容不等于仍可游玩

旧密码或相关对白仍然出现，不代表相应互动在 b0.85 还能使用。部分旧内容只剩零散痕迹，当前剧情或界面已经没有完整入口。
:::

## Path A 首次流程

b0.7 与 b0.85 都会跨存档记录 Path A 后段的首次完整流程：第一次正常进入时播放两段首次限定剧情，之后符合条件的进入会跳过它们。

这项记录会在不同角色线和存档槽之间共享，而不是只属于某个普通存档。

### 第一次正常流程

第一次到达这里时，剧情会这样继续：

```text
进入 Path A 后段
→ 播放第一段 Dave 剧情
→ 继续进入 Roswell 段落
→ 记录首次完成状态
→ 继续播放 Path A 后续剧情
```

**Dave's Demise** 与 **Roswell's Attempt** 这两个名称，是 b0.85 追加场景界面后来赋予两段旧剧情的标题。它们在 b0.7 中并不是两个独立菜单选择。

### 之后的正常流程

后续再次进入符合条件的 Path A 后段时：

```text
播放共同开场
→ 游戏发现已记录首次完成状态
→ 跳过两段首次限定剧情
→ 继续播放 Path A 后续剧情
```

单纯选择 **New Game（新游戏）** 不会重置这个跨存档状态。只有清除游戏的全部跨存档进度数据，才会恢复默认的首次流程状态。

### 读取旧存档

结果取决于存档位置：

- 读取在游戏检查首次完成状态**之前**保存的存档时，游戏会重新读取当前的跨存档状态，因此可能直接跳过首次段落；
- 读取已经位于首次段落**内部**的存档时，可以从保存位置继续。

## b0.85 的追加场景

b0.85 在后记的**追加场景**中加入了两个对应条目：

1. `Dave's Demise`
2. `Roswell's Attempt`

两段首次限定剧情完整经历后，两项会依据同一跨存档完成记录一起解锁。当前列表位置和解锁排查见[后记解锁索引](../collectibles/compendium.md)。

### 回放只覆盖原剧情的一部分

两个条目各自只回放 Path A 原剧情中的一段。

`Dave's Demise` 从 Dave 的对应剧情开始，并在进入 Roswell 段落前结束。

`Roswell's Attempt` 从 Roswell 段落开始，并在 Path A 后续剧情继续前结束。

回放中出现的画廊图片仍会解锁，片段内产生的剧情效果也会保留。

## D8 Oswin 自由文字问答

b0.7 在 D8 有一段正常可达的 Oswin 对话，玩家可以自行输入问题。

它的结构是一个由菜单控制的自由文字循环：

```text
Question.
→ 输入问题
→ 按关键词匹配
→ 显示回应
→ 返回问题菜单

Stay Silent.
→ 退出问答
```

提问次数没有固定上限。空输入会被单独处理；连续三次没有匹配到任何回应后，游戏会显示帮助提示，并重置未匹配次数。

### 这段问答会影响什么

这段问答会记录三项本周目状态：

::: {.oz-variable-table .table-responsive}
| 本周目状态 | 作用 |
|---|---|
| 家族历史话题 | 记录是否触发对应的家族历史信息 |
| 故事／兔子话题 | 记录相关话题是否已到达对应状态 |
| 连续未匹配输入 | 记录连续未匹配次数；第三次后显示帮助并重置 |
:::

家族历史及故事／兔子话题的状态会改变后续部分对白；这段问答不影响角色线、字母线、奖牌、主要结局或主金库密码的成功状态。

## 旧版如何识别输入

这套系统通常不要求玩家逐字输入某个固定完整句子。

它会：

1. 把输入转换为小写；
2. 删除一组固定 ASCII 标点；
3. 检查若干组必需关键词；
4. 接受同一组中的任意同义词；
5. 对单词使用完整单词匹配；
6. 对多词短语使用文字片段匹配。

所有必需关键词组都需要命中，但各组之间通常不要求固定顺序。额外单词多数情况下不会妨碍匹配。

### 输入限制

::: {.parser-boundary-table .table-responsive .table-scroll-compact}
| 输入特征 | 实际行为 |
|---|---|
| 大小写 | 会统一转为小写，因此不敏感 |
| 开头或结尾空格 | 不会自动去除，但许多输入仍可匹配 |
| 常见 ASCII 标点 | 固定列表内的标点会被移除 |
| 撇号和连字符 | 不在该删除列表中 |
| Unicode 标点 | 不会被统一处理 |
| 多个连续空格 | 可能破坏多词片段匹配 |
| 关键词组顺序 | 通常不作强制要求 |
:::

较宽泛的回应可能会先匹配输入，使后面的具体回应无法触发。

## 兔子回应的状态变化

兔子相关互动会根据此前是否触发相关话题而变化，但第二次输入并不要求精确写成 `what rabbit`。

玩家先触发兔子、野兔或故事相关回应后，相关话题状态可能随之改变。之后再次输入兔子相关内容，便可能得到后续版本的回应。

## 可以直接尝试的对话

下面的句子适合玩家直接输入。它们只是可靠示例，并不是每个话题唯一允许的写法。

大小写不影响结果。每次只输入一句，并保留 `hidden camera` 等短语中的空格。

部分例句会显得较简略或不完全符合自然英语，这是因为这种写法能更稳定地命中旧版关键词系统。

<details>
<summary><strong>展开可尝试的对话表</strong></summary>

<div class="table-responsive table-scroll-wide oswin-dialogue-table">

| 话题 | 可以尝试的输入 | Oswin 可能谈到的内容 |
|---|---|---|
| Dave 与 Oswin | `who am i` · `who are you` | 两人的身份以及 Dave 当前的处境 |
| 家庭 | `can i call you dad` · `did you want a family` | Oswin 对家庭和父职的看法 |
| 友好互动 | `can i hug you` · `can i tickle you` · `can i thank you` | 较轻松或私人化的回应 |
| 小玩笑 | `boop snoot` · `am i a good boy` | 简短角色反应 |
| 故事 | `story` · `can you tell me a story` | Oswin 的故事及相关背景 |
| 兔子后续 | `rabbit` | 之后再次询问可能得到不同回应 |
| 偏好 | `tea or coffee which do you like better` | Oswin 对饮品的偏好 |
| 一般彩蛋 | `what is love` · `got any grapes` · `do you like waffles` · `buhi` | 玩笑和引用类回应 |
| 凶手 | `who want to kill us` · `who try to kill us` | 目前威胁众人的对象 |
| 毒药 | `poison` · `did you poison dean` · `you know how to poison` | 中毒事件及 Oswin 对毒物的了解 |
| 手枪 | `gun` · `where gun` · `who has gun` · `who hide gun` | 手枪的位置、持有者和藏匿情况 |
| 匕首 | `dagger` · `where did you get dagger` | 匕首及其来源 |
| 紧急方案 | `call police` · `what if we die` | 报警、死亡以及众人的处境 |
| 监控 | `hidden camera` · `is camera still working` · `soundproof` | 摄像头、盲区、记录与隔音 |
| 信任 | `can i trust hoss` · `can i trust dean` · `can i trust you` · `can you trust me` | Dave 或 Oswin 是否信任某人 |
| Oswin 的家人 | `are you roswell's father` · `who is your brother` · `what is your sister's name` | Oswin 的亲属以及他与 Roswell 的关系 |
| 科学与研究 | `why you become a doctor` · `what is morphic resonance` · `mycology` · `you know deathcaps` | 医学、真菌、实验和形态共振 |
| Benson | `benson` · `where is benson` · `benson old job` · `benson and vault` | Benson 的身份、经历、位置与金库关系 |
| 金库 | `vault` · `who used vault` · `can you open vault` | 金库的用途和使用者 |
| 森林 | `forest` · `someone else in woods` · `cabin in woods` · `what mushrooms in woods` | 宅邸周边森林、其他居民、木屋和蘑菇 |
| 隐藏区域 | `hidden room` · `hidden path` · `safest room` | 宅邸附近的秘密或安全地点 |
| 实验室 | `where lab` · `where study` · `how you program` | Oswin 的实验室和技术工作 |
| 奖牌 | `medals` · `where medals` · `how many medals are there` · `who hid medals` | 奖牌数量、位置和放置者 |
| Hoss 的记录 | `hoss list` · `marked` | Hoss 的清单和被标记的奖牌 |
| 其他角色 | `did you meet my friends` · `have you met hoss` · `what did tyson do` | Oswin 对 Dave 同伴的了解 |

</div>

部分话题有不止一种回应，少数回答也会受到此前提问状态影响。

</details>

## b0.85 如何替代这段机制

b0.85 删除了 D8 自由输入，并用固定剧情对白替代原场景：

- 固定对白复用了部分旧话题；
- 某些旧状态仍会影响少量后续对白；
- 正常输入菜单和旧回应已不再向玩家开放。

角色档案、背景资料和追加场景中也没有提供这套完整问答库。

## D11 实验室选择

b0.7 的 Oswin 存活 D11 实验室流程还有一个独立的三选一决定：

::: {.legacy-d11-choice-table .table-responsive}
| b0.7 选择 | 旧版处理 |
|---|---|
| `Inject me.` | 不产生额外的选择记录差异 |
| `Inject him.` | 记录一种不同的选择结果 |
| `Don't inject.` | 记录另一种不同的选择结果 |
:::

这与[旧版本密码档案](legacy-passwords.md)中的 D11 可选金库不是同一机制。

b0.85 删除了这个菜单。当前剧情固定为 Oswin 从背后给 Dave 注射，之后再说明注射物其实是生理盐水。

旧版会区分上述三种选择，之后的局部对白可能因此不同；这些选择不影响角色线、字母线、奖牌或结局。b0.85 不再区分这些选择结果。

## 相关页面

- [旧版本线路档案](legacy-routes.md)
- [b0.85 版本主要变化](b085-changes.md)
