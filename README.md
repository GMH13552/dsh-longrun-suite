# DSH LongRun Suite — DeepSeek Harness 长期任务套件

> 本项目意在探索 AI 在长期性科研、项目中的运行。如有交付则尽量保证可靠。尚在活跃开发中，如遇问题欢迎提交 issue，作者会及时查看；觉得好用的话给个星星，谢谢！

> 一个仓库装齐：长期自主任务管理器（mission-control）+ 长跑主持人预设（Long-Run Captain）+ 严格审查修正的 LLM 验证器 + 自主定时唤醒（timer scheduler）。克隆即用。

[English README](README.en.md)

## 这个仓库解决什么问题

DSH 原生的 `goal` / `todo` / `subagent` 适合短任务，但做**长期困难任务**时会有这些问题：

1. **任务列表规划一次就死**：方向失败后不会自动换思路、重规划、追加新任务；
2. **失败即停**：验证不通过经常直接停掉，而不是修 gap、换方向继续；
3. **中间需要人唤醒/引导**：长实验期间 agent 不会自己定时回来检查结果；
4. **完成标准太松**：任务列表空了就算完成，没人逐条核验最终目标；
5. **大量子 agent 拖慢 DSH**：continuable 子会话被频繁扫描，内存/CPU 占用高；
6. **单点汇总丢失**：总 Agent 重新转述子代理结果会丢条件、数字和细节；
7. **worker 协作原始**：只有等待/聊天，容易重复劳动、双写、不知道谁在干；
8. **模型偷懒/降级**：自研简化方案、不参考已有实现、悄悄把标准方法换成低一级方法；
9. **经验流失**：跨任务反复踩坑，记忆不可检索；
10. **自评虚高**：自己审自己，缺少独立/无记忆评审；
11. **长任务与提醒不可恢复**：提醒丢失、fork 冷启动失败、陈旧提醒反复触发。

本套件用 **Mission 状态文件 + Claim Pool/Lease + Blackboard 工件通信 + WorkReceipt + 无记忆盲审 + LLM Wiki 记忆 + 失败强制 replan + 定时唤醒** 解决以上问题，并且**不硬编码任何领域流程**：

- 模型优化、数学研究、项目开发都是同一套框架；
- 每个任务开工前由主持人生成自己的 `verificationPlan`；
- 只有证据 + 独立评审通过才算 accepted；
- 可复用 worker 按能力抢单，长任务租约化，崩溃自动回收；
- worker 之间通过类型化 artifact 通信，不靠聊天转述；
- 实现前写 `method-card`，复用优先、禁止无依据猜想、禁止悄悄降级；
- 最终完成前必须有无记忆盲审 + calibration gap；
- 跨任务经验写入 `.memory/`，可检索、可 lint；
- 最终完成必须逐条映射 success criteria，并经过 final audit。

## 组件

| 组件 | 路径 | 作用 |
|---|---|---|
| **dsh-mission-control** | `packages/dsh-mission-control/` | mission 状态机 + `mission_*` 工具 + Claim Pool/Lease + Blackboard artifacts + Blind Review + LLM Wiki 工具 + 元校验器 |
| **Long-Run Captain 预设** | `preset/long-run-captain/` | 通用完整系统提示版：主持人 persona + 协议技能（联网调研、自适应验证、苏格拉底自查、LLM verifier 用法） |
| **Long-Run Captain Router 预设** | `preset/long-run-router/` | 同上能力 + router-standard 极简首轮系统，针对 DeepSeek V4 Flash 系列调优 |
| **dsh-plugin-llm-verifier** | `packages/dsh-plugin-llm-verifier/` | 参考 LLM-as-a-Verifier 论文与上游 DSH 插件、经过更严格审查修正的 LLM 验证器：`verify_rollout` / `verify_select` / `verify_compare` / `verify_track` |
| **dsh-timer-scheduler-ui** | `packages/dsh-timer-scheduler-ui/` | `schedule_reminder` 自主定时唤醒 + 顶部会话头定时提醒入口 |

## 两个预设的区别

本仓库提供两个 Long-Run Captain 预设，**能力相同，只有首轮系统提示形态不同**：

| 预设 | 路径 | 系统提示 | 适用模型 |
|---|---|---|---|
| **Long-Run Captain** | `preset/long-run-captain/` | 完整注入 Long-Run Captain persona / 规则 / 技能 | 任意模型，首轮上下文较重 |
| **Long-Run Captain Router** | `preset/long-run-router/` | 仅保留 router-standard 极简首轮（`You are a helpful software engineer assistant.`），角色信息通过派发 prompt 中的 Role Card 携带 | **针对 DeepSeek V4 Flash 系列调优**（`deepseek-v4-flash` / `deepseek-v4-flash-vision-exp`），用来保持 `We / Let's` 集体规划风格 |

简要规则：

- 如果你用的是 **DeepSeek V4 Flash 系列**，推荐 **Long-Run Captain Router**：首轮更轻，使命门工具 / 子代理 / 定时唤醒能力完全保留，子代理角色约束通过 Role Card 写在派发提示词里。
- 如果你用 **其他模型**，或者想要重一点的完整系统提示，选 **Long-Run Captain**。
- 两个预设都依赖 `dsh-mission-control`，且任务流程、mission 状态机、评审/重规划规则完全一致。

## DSH Store 提交说明

本仓库是三个独立插件的 monorepo，DSS STORE 上架时必须分别提交明确的子路径：

| 插件 | 子路径 | Entry ID | 版本 |
|---|---|---|---|
| dsh-mission-control | `packages/dsh-mission-control` | `dsh-mission-control` | 0.2.0 |
| llm-as-a-verifier | `packages/dsh-plugin-llm-verifier` | `llm-verifier` | 0.9.0 |
| timer-scheduler-ui | `packages/dsh-timer-scheduler-ui` | `timer-scheduler-ui` | 0.2.0 |

每个子包 `package.json` 都声明了精确的 DSH 兼容矩阵：

```json
"dsh": {
  "compatibility": {
    "dshReleases": {
      "0.1.0-rc.8": "compatible",
      "0.1.1-rc.1": "compatible",
      "0.1.1-rc.2": "compatible"
    }
  }
}
```

详细说明见 [`STORE_SUBMISSION.md`](STORE_SUBMISSION.md)。

## 快速开始

在 Long-Run Captain 或 Long-Run Captain Router 会话里直接说：

```text
启动一个 mission：开发一个命令行工具，递归扫描指定目录下的 Markdown 文件，
按标题生成带层级、文件路径和更新时间的索引 index.md。
termination_policy: success
budget: { maxRounds: 6, maxHours: 4 }
成功标准：
- CLI 能递归扫描目录并生成 index.md
- 索引按标题层级组织，包含文件相对路径和更新时间
- 提供 3 个测试用例并全部通过
- 输出 README 说明安装和使用方式
- 由 reviewer 独立验证索引内容正确
```

预期流程：

```text
mission_start
→ 早期大量联网调研 + wiki_search 查历史经验
→ mission_add_tasks（每个任务带 acceptance + verificationPlan + capabilities）
→ worker 按能力 mission_claim；长任务 mission_heartbeat 续租；干不完 mission_release
→ 研究方法/工具先写 method-card，已有实现优先复用，防降级/防猜想
→ 长实验用后台任务 + schedule_reminder 定时唤醒
→ worker 之间用 mission_publish_artifact / mission_consume_artifacts 交换
→ 完成先 mission_submit + WorkReceipt，再由独立 reviewer 评审
→ 失败任务 mission_replan + replaces 换方向继续
→ verify_track 监控方向是否跑偏
→ 经验写入 wiki_write，最终前 mission_blind_review + wiki_lint
→ mission_final_audit 逐条核验成功标准
→ mission_complete
```

## 核心机制

- **任务状态只保留 5 个**：`open → active → needs_review → accepted / rejected`
- **拒绝必须有 follow-up**：rejected 任务必须有 `replaces=...` 后续任务，否则 `mission_complete` 拒绝完成
- **完成必须有真实 outcome**：默认 `terminationPolicy=success`，映射到成功标准的任务必须 `outcome=success`
- **元校验器**：`mission_check` 只检查证据诚实性（缺证据/缺评审/缺 final audit 一律 FAIL）
- **苏格拉底自查**：提交前用 `socratic-self-audit` 技能攻击自己的结论
- **严格 verify_track**：使用 LLM-as-a-Verifier 参考实现的校准 prompt，不信任 agent 的自我宣称；pivot 选择与 rollout 评分标准也已对齐论文/参考实现
- **WorkReceipt**：提交任务时记录证据文件 SHA-256，评审通过后生成不可变工作收据
- **蜂群式 Worker 池**：任务可带 `capabilities`，worker 凭能力匹配抢单；长任务用 `mission_heartbeat` 续租、`mission_release` 释放，过期自动回收，多次回收自动 blocked
- **Blackboard 工件通信**：`mission_publish_artifact` / `mission_consume_artifacts`，worker 之间通过类型化 artifact 交换，不靠聊天
- **无记忆盲审**：`mission_blind_review` 生成 `blind_review.md` + `calibration_gap`，实质交付型 mission 完成前作为硬门
- **LLM Wiki 记忆**：`wiki_write` / `wiki_search` / `wiki_lint`，维护 `.memory/` 下可检索、可 lint 的跨任务经验

## Worker 池 / Claim Pool & Lease

任务不再只是“由 Captain 指派”，worker 可以凭能力抢单：

```text
mission_claim
  task_id: t-impl
  worker: worker-1
  capabilities: [python, pytorch, remote-gpu]
  lease_seconds: 7200
```

- 任务可以声明 `capabilities`，worker 能力不覆盖则拒绝；
- 抢到后持有租约；
- 长任务用 `mission_heartbeat` 续租；
- 干不完用 `mission_release` 放回队列；
- 租约过期自动回收；
- 同一个任务被回收 3 次自动 `leaseBlocked`，需要人工看原因；
- 过期 worker 迟到回写会被拒绝（claim lost）。

## Blackboard / artifact 通信

worker 之间不直接聊天，使用类型化工件：

```text
mission_publish_artifact
  task_id: t-run
  artifact_type: run-metrics.json
  path: results/run-metrics.json
  summary: 11 个数据集指标

mission_consume_artifacts
  artifact_type: run-metrics.json
```

所有 artifacts 存在 mission 状态中，下游按类型/生产者读取。

## LLM Wiki 记忆

跨任务经验维护在 `.memory/`：

```text
.memory/
├── _schema.md
├── _capabilities.md
├── methods/
├── pitfalls/
├── decisions/
├── missions/
└── workers/
```

- `wiki_write`：新增/更新页面，带 `[[slug]]` 链接；
- `wiki_search`：按文本/domain 搜索；
- `wiki_lint`：检查缺摘要、断链、孤儿页、过期声明、worker 简历缺能力；
- `_capabilities.md`：每个 workspace 自定义能力词表/别名，系统不做硬编码；
- `workers/*.md`：worker 简历（role / capabilities / skills / history）。

## 方法出处卡与防偷懒

- `method-card` 技能用于非平凡实现前记录：
  - 标准/经典方法；
  - 每个组件是 existing / verified-no-existing / uncertain；
  - 复用 vs 自研；
  - 是否有方法降级（如用网格搜索代替适用优化器）；
  - 未证实的假设列表。
- `mission-protocol` 强制“复用优先 + 反猜想”；
- reviewer 会检查是否悄悄降级、是否把猜想当事实。

## 独立盲审

`mission_blind_review` 生成：

```text
blind_review.md
avg_rating
n_reviews
decision
top_weaknesses
self_claimed_rating
calibration_gap
```

- 只给脱水后的交付物，不给历史/自评/内部结论；
- 实质交付型 mission（有 accepted 的 research / engineering / deliverable-style 任务或 reportPath）完成前必须有盲审记录；
- bookkeeping / synthesis / coordination-only 任务豁免。

## 工具使用地图（防止模型忽略）

| 阶段 | 必须/建议使用 |
|---|---|
| 规划前 | `wiki_search` |
| 非平凡实现前 | `method-card` |
| 学到的经验 | `wiki_write` |
| 长任务 | `mission_heartbeat` |
| 不能完成 | `mission_release` |
| worker 交换数据 | `mission_publish_artifact` / `mission_consume_artifacts` |
| 最终审计前 | `mission_blind_review` + `wiki_lint` |

## 整体结构

```text
Host / 插件层
├── dsh-mission-control
│   ├── lib/core.js          # 纯任务状态机（无 DSH 依赖）
│   ├── lib/index.js         # mission_* / wiki_* / artifact 工具注册
│   ├── bin/mission_check.mjs
│   └── preset/              # Captain 预设与协议技能
├── dsh-timer-scheduler-ui    # 定时唤醒 + 提醒自动取消 + 父会话回退
└── dsh-plugin-llm-verifier   # LLM-as-a-Verifier

Agent / 预设层
├── long-run-captain/         # 完整系统提示版
└── long-run-router/          # router-standard 极简版（DeepSeek V4 Flash 优化）

技能层
├── mission-protocol          # 任务拆解、派发、复用优先、反猜想、工具地图
├── task-profile              # Input/Decision/Output/Core Challenge/No-Lazy
├── plan-critique             # 计划批判 + A/B/C + 模块契约 + 反降级
├── adaptive-verification     # 最低验证包
├── method-card               # 方法出处卡 / 标准方法对照 / 降级检测
├── wiki-memory               # LLM Wiki：ingest/query/lint
├── lessons                   # 任务内经验 + mission-legacy + mission-cases
└── report-protocol / socratic-self-audit / etc.

运行时数据层
├── .mission/<id>/mission.json   # mission/task/attempt/receipt/blindReview/artifacts
├── .memory/                     # 跨任务 LLM Wiki + 能力词表 + worker 简历
├── .mission-cases/              # 轻量案例卡
└── timer-reminders.json         # 提醒持久化
```

## 参考与借鉴

本项目不是从零发明，而是吸收了多个公开 Agent 系统的“机制层”设计：

| 项目 | 借鉴了什么 | 我们怎么做 |
|---|---|---|
| **AutoResearch (EvoMap)** | workflow queue、claim pool、lease、receipt、blind review | mission 队列 + `mission_claim/heartbeat/release` + WorkReceipt + 盲审硬门 |
| **ZZBoard** | 去中心化工作板、artifact、signed receipt | Blackboard tools + `mission_publish/consume_artifacts` |
| **Clawix** | LLM Wiki 记忆、性能词表、角色化 worker | `.memory/` + `wiki_write/search/lint` + `_capabilities.md` + worker 简历 |
| **Flock** | Blackboard 原则：不用聊天，用类型化工件通信 | artifact type 发布/消费 |
| **unsorry** | repo 即队列、claim substrate、expiry/reclaim | 租约过期回收 + 多次回收 blocked |
| **CUMCM math-modeling Skill** | 结构诊断、A/B/C 候选、最低验证、创新证据 | 通用化为 Input/Decision/Output + A/B/C + 验证包 |
| **Karpathy LLM Wiki** | ingest/query/lint 的 wiki 记忆范式 | 落地为 wiki-memory |

“参考”不是照搬：我们保留 DSH 通用性，领域内容全部交给 mission/task 数据，不硬编码任何数学/软件/研究流程。

## 仓库结构

```text
dsh-longrun-suite/
├── README.md                 # 中文入口
├── README.en.md              # English version
├── install.sh                # 一键安装
├── packages/
│   ├── dsh-mission-control/
│   ├── dsh-plugin-llm-verifier/
│   └── dsh-timer-scheduler-ui/
└── preset/
    ├── long-run-captain/
    └── long-run-router/
```

## 安装

要求：Node 20+、DSH 0.1.0-rc.8+、已配置好 LLM provider。

### 方式 A：一行命令（只装插件）

```bash
dsh plugin --profile web add github:GMH13552/dsh-longrun-suite
```

这会一次安装全部三个插件。之后还需要装预设（两个都装，按需选用）：

```bash
# A1: 从仓库目录复制
git clone https://github.com/GMH13552/dsh-longrun-suite.git
cp -R dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/long-run-captain
cp -R dsh-longrun-suite/preset/long-run-router   ~/.dsh/.agent-presets/long-run-router

# A2: 或从 profile 的 node_modules 里复制（版本可能与插件包不同）
cp -R ~/.dsh/profiles/web/node_modules/dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/long-run-captain
cp -R ~/.dsh/profiles/web/node_modules/dsh-longrun-suite/preset/long-run-router   ~/.dsh/.agent-presets/long-run-router
```

### 方式 B：克隆 + 一键脚本（推荐，插件和预设一起装）

```bash
git clone https://github.com/GMH13552/dsh-longrun-suite.git
cd dsh-longrun-suite
./install.sh            # 默认安装到 web profile
# ./install.sh tui      # 安装到其他 profile
```

安装脚本会：

1. 把三个插件加入你的 profile；
2. 把 `long-run-captain` 和 `long-run-router` 两个预设复制到 `$DSH_HOME/.agent-presets/`；
3. 打印重启提示。

重启 DSH：

```bash
dsh web
```

新建会话时选择 **Long-Run Captain**（通用完整系统提示）或 **Long-Run Captain Router**（DeepSeek V4 Flash 优化极简版）预设。

### 手动安装

等价命令：

```bash
dsh plugin --profile web add ./packages/dsh-mission-control
dsh plugin --profile web add ./packages/dsh-plugin-llm-verifier
dsh plugin --profile web add ./packages/dsh-timer-scheduler-ui

mkdir -p "$HOME/.dsh/.agent-presets"
cp -R preset/long-run-captain "$HOME/.dsh/.agent-presets/long-run-captain"
cp -R preset/long-run-router   "$HOME/.dsh/.agent-presets/long-run-router"
```

> `dsh-plugin-llm-verifier` 默认使用 `provider: deepseek-official` + `model: deepseek-v4-flash-vision-exp`。如果你的模型路由不同，改 profile 的 `cordis.patch.yml` 中 `llm-verifier` 行的 `provider` / `model`，或者改本仓库 `packages/dsh-plugin-llm-verifier/cordis.patch.yml` 后重新安装。

## 已知边界

- DSH 流式接口不暴露 logprobs，所以 LLM verifier 用温度采样平均近似论文的 logits 期望；
- `schedule_reminder` 目前只在 session live 时唤醒；跨重启冷恢复是后续方向；
- 独立评审是流程约束，不是沙箱隔离。
- Claim Pool / Lease 是文件级实现（mission.json + 时间戳），不是独立服务；租约过期自动回收，连续 3 次回收自动 blocked。
- Capability Matching 是 tag 集合匹配，不内置领域词表；每个 workspace 需自行维护 `.memory/_capabilities.md`，否则标签可能不一致。
- Blackboard artifact 记录的是 artifact 元数据（类型/路径/生产者），真实文件仍在磁盘上，不做托管复制。
- `mission_blind_review` 记录外部评审结果并生成 `blind_review.md`；实际评分需要由独立 reviewer/模型调用产生，工具不会自动打分。
- LLM Wiki 工具是 Markdown + grep 的轻量实现，不是向量库/数据库；`wiki_lint` 只做文本级检查。
- `method-card` / `wiki_*` 多数是软协议，不强制所有任务；只有实质交付型 mission 的 blind review 是硬门。

## 致谢

- 验证器部分参考 [LLM-as-a-Verifier](https://github.com/llm-as-a-verifier/llm-as-a-verifier) 论文与 [dsh-plugin-llm-verifier](https://github.com/uson1x/dsh-plugin-llm-verifier)，并做了更严格的审查与修正
- 定时唤醒基于 [dsh-timer-scheduler](https://github.com/GMH13552/dsh-timer-scheduler)

## License

MIT
