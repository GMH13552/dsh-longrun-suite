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
5. **大量子 agent 拖慢 DSH**：continuable 子会话被频繁扫描，内存/CPU 占用高。

本套件用 **Mission 状态文件 + 极小任务状态内核 + 数据驱动验证计划 + 严格独立评审 + 失败强制 replan + 自主定时唤醒** 解决以上问题，并且**不硬编码任何领域流程**：

- 模型优化、数学研究、项目开发都是同一套框架；
- 每个任务开工前由主持人生成自己的 `verificationPlan`；
- 只有证据 + 独立评审通过才算 accepted；
- 最终完成必须逐条映射 success criteria，并经过 final audit。

## 组件

| 组件 | 路径 | 作用 |
|---|---|---|
| **dsh-mission-control** | `packages/dsh-mission-control/` | mission 状态机 + `mission_*` 工具 + 元校验器 |
| **Long-Run Captain 预设** | `preset/long-run-captain/` | 主持人 persona + 协议技能（联网调研、自适应验证、苏格拉底自查、LLM verifier 用法） |
| **dsh-plugin-llm-verifier** | `packages/dsh-plugin-llm-verifier/` | 参考 LLM-as-a-Verifier 论文与上游 DSH 插件、经过更严格审查修正的 LLM 验证器：`verify_rollout` / `verify_select` / `verify_compare` / `verify_track` |
| **dsh-timer-scheduler-ui** | `packages/dsh-timer-scheduler-ui/` | `schedule_reminder` 自主定时唤醒 + 右下角倒计时面板 |

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

在 Long-Run Captain 会话里直接说：

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
→ 早期大量联网调研
→ mission_add_tasks（每个任务带 acceptance + verificationPlan）
→ 派 researcher / engineer / reviewer
→ 长实验用后台任务 + schedule_reminder 定时唤醒
→ 失败任务 mission_replan + replaces 换方向继续
→ verify_track 监控方向是否跑偏
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
    └── long-run-captain/
```

## 安装

要求：Node 20+、DSH 0.1.0-rc.8+、已配置好 LLM provider。

### 方式 A：一行命令（只装插件）

```bash
dsh plugin --profile web add github:GMH13552/dsh-longrun-suite
```

这会一次安装全部三个插件。之后还需要装预设（二选一）：

```bash
# A1: 从仓库目录复制
git clone https://github.com/GMH13552/dsh-longrun-suite.git
cp -R dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/

# A2: 或从 profile 的 node_modules 里复制（版本可能与插件包不同）
cp -R ~/.dsh/profiles/web/node_modules/dsh-longrun-suite/preset/long-run-captain ~/.dsh/.agent-presets/
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
2. 把 `long-run-captain` 预设复制到 `$DSH_HOME/.agent-presets/`；
3. 打印重启提示。

重启 DSH：

```bash
dsh web
```

新建会话时选择 **Long-Run Captain** 预设即可。

### 手动安装

等价命令：

```bash
dsh plugin --profile web add ./packages/dsh-mission-control
dsh plugin --profile web add ./packages/dsh-plugin-llm-verifier
dsh plugin --profile web add ./packages/dsh-timer-scheduler-ui

mkdir -p "$HOME/.dsh/.agent-presets"
cp -R preset/long-run-captain "$HOME/.dsh/.agent-presets/long-run-captain"
```

> `dsh-plugin-llm-verifier` 默认使用 `provider: deepseek-official` + `model: deepseek-v4-flash-vision-exp`。如果你的模型路由不同，改 profile 的 `cordis.patch.yml` 中 `llm-verifier` 行的 `provider` / `model`，或者改本仓库 `packages/dsh-plugin-llm-verifier/cordis.patch.yml` 后重新安装。

## 已知边界

- DSH 流式接口不暴露 logprobs，所以 LLM verifier 用温度采样平均近似论文的 logits 期望；
- `schedule_reminder` 目前只在 session live 时唤醒；跨重启冷恢复是后续方向；
- 独立评审是流程约束，不是沙箱隔离。

## 致谢

- 验证器部分参考 [LLM-as-a-Verifier](https://github.com/llm-as-a-verifier/llm-as-a-verifier) 论文与 [dsh-plugin-llm-verifier](https://github.com/uson1x/dsh-plugin-llm-verifier)，并做了更严格的审查与修正
- 定时唤醒基于 [dsh-timer-scheduler](https://github.com/GMH13552/dsh-timer-scheduler)

## License

MIT
