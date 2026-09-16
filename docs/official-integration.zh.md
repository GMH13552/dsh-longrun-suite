# 与官方 DSH 0.1.5 协调能力的集成设计

状态：设计草案 / 探测已实现，适配层待排期
适用版本：DSH `0.1.5-rc.1` 及以后
更新日期：2026-09-10

## 1. 背景

DSH `0.1.5` 增强了子代理、长任务与多代理协作能力：

- `ctx.subagents`：可继续子代理（continuable subagent）、持久 child session、activation、冷恢复、父子双向消息、`listChildren()` / `listDescendants()` / `interrupt()`。
- `@deepseek-ai/dsh-experimental-agent-team`：Lead + named teammates、持久 roster、durable mailbox、共享 task DAG、CAS 修订、写路径提示、`waitForChange()`。
- `@deepseek-ai/dsh-goal` / `dsh-tool-goal`：单 session 持久目标，跨 turn / resume / 重启，round cap。
- `@deepseek-ai/dsh-tool-ralph`：fresh-agent 多轮循环，每轮只接收 bounded handoff。
- Web 端：文件上传、侧边栏文件树、左右插件扩展入口、右侧多标签/分栏。
- V4.1 Flash 深度适配：标准/PTC/极简模式，更新系统提示词保留 KV Cache。

这些能力与 `dsh-longrun-suite` / `dsh-mission-control` 有部分重叠，但定位不同。

## 2. 定位：官方是运行时协作层，我们是治理与验收层

| 维度 | 官方 DSH 0.1.5 | 本套 dsh-longrun-suite |
|---|---|---|
| 任务 DAG | Agent Teams shared task board | `.mission/<id>/mission.json` 中的正式任务 DAG |
| 队友/worker | named teammates + roster | 角色 subagent（researcher/engineer/reviewer/final_reviewer） |
| 通信 | durable mailbox（消息） | typed artifact blackboard + wiki memory |
| 任务认领 | claim + CAS revision | claim pool + lease + reclaim + capability matching |
| 长任务 | `goal` / `ralph` | long-run-router + mission rounds（router 转 legacy） |
| 验收 | 无正式任务评审/盲审/最终审计 | `mission_review` / `mission_blind_review` / `mission_final_audit` |
| 持久化 | session log | `.mission` 文件 + `.memory` wiki，可跨 session / 重启 |
| 隔离粒度 | 单 session / 单进程 | workspace / session 双 scope |

官方实验版 Agent Teams 自己声明的限制包括：单进程、共享 checkout、无 worktree/merge、写路径仅 advisory、无常驻 owner 自动释放、依赖 durable session storage。它目前**不提供**独立评审、盲审、final audit、typed artifact、wiki/method-card。因此不应替换本套项目。

## 3. 集成原则

1. **文件后端仍是 source of truth**：`mission.tasks`、`mission.review`、`mission.blindReview`、`mission.finalAudit`、artifacts 不变。
2. **官方能力只做可选增强**：消息 transport、worker 续跑、roster 展示、任务镜像。
3. **不硬依赖 experimental**：所有官方 seam 通过 `ctx.get()` 探测；缺失时保持旧行为。
4. **先探测、后适配**：先暴露能力报告，再按开关接入。
5. **router 转 legacy**：不再为“激活能力”扩展 router；保留兼容旧 DSH 预设。
6. **评审与验收不能外包给官方 mailbox**：官方 task board 只记录任务状态，不替我们做质量门禁。

## 4. 已实现：运行时能力探测

`dsh-mission-control` host 侧新增工具：

```text
mission_capabilities
```

返回 JSON，例如：

```json
{
  "official": {
    "subagents": true,
    "agentTeams": false,
    "goals": true,
    "sessionProjections": true
  },
  "subagents": {
    "startContinuable": true,
    "followup": true,
    "reportFrom": true,
    "sendMessage": false,
    "interrupt": true,
    "listChildren": true,
    "listDescendants": true,
    "listProviders": true
  },
  "agentTeams": null,
  "goals": {
    "get": true,
    "create": true,
    "update": true
  }
}
```

模型或 Captain 在决定“用官方 team 还是文件 mission”之前，先调用这个工具。

## 5. 分阶段适配计划

### Phase 0：探测（已完成）
- 新增 `mission_capabilities`。
- 不改任何现有 mission 行为。

### Phase 1：只读观察 / 镜像（低风险）
- 已实现 `mission_agent_team_view`：
  - 读取 `ctx.agentTeams.listMembers()` / `listTasks()`。
  - 返回官方 roster 与 task board 的只读快照。
  - `ctx.agentTeams` 未挂载时返回 `{ available: false, reason }`，不报错。
  - 不写官方 board，也不改 `.mission`。
- 已实现 `mission_agent_team_sync`（显式调用，默认 dry_run）：
  - 把 `mission.tasks` 以幂等方式镜像到官方 task board。
  - 使用 `[mission:<missionId>:<taskId>]` 标记去重。
  - 先创建缺失任务，再通过 `set_dependencies` 镜像依赖。
  - `dry_run=true` 只报告 planned create/set_dependencies，不写官方 board。
  - 官方 board 仍不是 mission 状态来源；不双写。

### Phase 2：消息 / worker 适配（中风险）
- 已实现只读观察：
  - `mission_subagent_view`：读取 `ctx.subagents.list()` / `listChildren()` / `listDescendants()`。
  - `mission_goal_view`：读取 `ctx.goals.get(agent)`。
  - 未挂载时返回 `{ available:false, reason }`，不报错。
- 已实现 `mission_worker_plan`（只读）：
  - 选择第一个 ready 的 open 任务，或显式 `task_id`。
  - 解析 `ctx.subagents` provider 列表，检查 `prepareContinuable` 能力。
  - 生成完整 worker prompt：mission goal/成功标准、task guidance、验收标准、必需产物、依赖、worker protocol。
  - 不 spawn、不 claim、不发消息。
- 已实现 `mission_goal_sync`（显式、默认 dry_run）：
  - 如果官方 goal 已存在：返回 `action:'none'`，不修改。
  - 如果不存在：`dry_run=true` 只报告 objective 计划；`dry_run=false` 才调用 `ctx.goals.create`。
  - 不 pause/resume/complete 已存在的 goal。
- 计划中（显式、需单独确认）：
  - 真正的 `startContinuable()` 派发（默认 dry-run，显式 opt-in）。
  - 用官方 `subagents.sendMessage()` / `followup()` 承载 worker 续跑消息。
  - 配置开关：`officialIntegration: 'off' | 'readonly' | 'messages' | 'full'`，默认 `off`。

#### 官方冷恢复语义（读 0.1.5 类型定义得出的结论）

这些是直接读安装包 `*.d.ts` 得到的硬约束，写适配层前必须遵守：

- `ResumeAgentOptions` 只有 `{ resumeSessionId, parentAgent?, agentOptions?, signal?, setup? }`：
  - **不能改 `meta`**（`cwd` / `parentSession` / `origin` / `delegationDepth` / `agentPreset` 都是持久化的会话数据）；
  - `parentAgent` 省略即按 **root** 恢复。`header.parentSession` 是**持久化的 fork 血缘**，不是运行期父子关系；
  - `setup(agentCtx, agent)` 是唯一能在发布前组合 agent 世界的钩子（`dsh-agent-presets` 的 `mount(agentCtx, id)` 就走这里）。
- 官方普通会话冷恢复 = `ApiSessionController.resumeObserved()`：
  `header.agentPreset` → `agentPresets.resolve()` → `agents.resume({ resumeSessionId, agentOptions, setup: mount })`。
  **不带 `setup` 的 `agents.resume()` 不挂任何预设，等于一个工具都没有**（这正是提醒醒来后 `unknown tool "bash"` 的根因）。路由/预设名要取持久化的 `header.agentPreset`，不能取当前默认预设。
- 持久化的 **session-backed 子代理** 不走普通会话恢复：官方用 `subagent/descriptor`（`SUBAGENT_DESCRIPTOR_VERSION = 3`）持久化 `provider` / `agentProvider|Model|ReasoningEffort` / `persona` / `toolFilter`，
  冷恢复时经 `applyChildComposition()` **重新 join 父预设并重新施加 persona+toolFilter**。
  恢复入口是 `ctx.subagents`（`sendMessage()` 缺省即 `coldResume()`；host 侧另有 symbol-keyed `deliverSubagentPrompt` 走 `queueHostSubagentPrompt/steerHostSubagentPrompt`），
  且都要求 **exact live direct parent** 作为 `sender`/`parent` 做授权。
  - 把子代理会话当 root 恢复会破坏父会话的所有权，之后 parent→child 投递会撞 `already owned by an active write handle`；反向地，`ctx.subagents` 对 `origin === 'subagent'` 的会话是唯一正确通道。
- 推论（已落到 `dsh-timer-scheduler-ui` 0.2.1）：
  - 提醒**只唤醒同一个会话**，绝不回退到血缘父会话/分支之前的会话（我方约定，非官方限制）；
  - 瞬时失败（agent-loop 尚未加载、会话仍被写句柄占用）按 2s/5s/15s 有界退避重试；
  - 预设被删/不可挂载 → 停在待人工重试并显示原因，而不是换预设恢复；
  - 子代理子会话的直接父会话离线 → 停在待人工重试，不擅自唤醒归档父会话。

### Phase 3：可选官方后端（高风险，后置）
- 评估把官方 Agent Teams 作为 mission worker 的 transport backend，但保留：
  - mission 成功标准
  - 独立任务评审
  - 盲审与 calibration gap
  - final audit
  - artifact/wiki 契约
- 只有官方 Agent Teams 脱 experimental 且写入/权限模型稳定后再做。

## 6. Router 的 legacy 化

- 新 session 优先使用官方 `goal` / `subagent` / `agent-team`。
- `long-run-router` 只保留兼容旧 DSH 和旧预设的能力，不再新增功能。
- 文档中标记为 `legacy / optional`；相关 skill 仍可服务 mission-protocol，但不依赖 router 才能启动。

## 7. 非目标

- 不把 mission state 改成纯 session-log 派生。
- 不删除 review / blind review / final audit。
- 不硬依赖 `@deepseek-ai/dsh-experimental-*`。
- 不为了“统一”而重写 claim/lease、artifact、wiki。
- 不把官方 mailbox 当作 typed artifact contract。

## 8. 验证清单

- [x] DSH `0.1.5-rc.1` 下 `dsh-mission-control` client 注册成功。
- [x] `dsh-timer-scheduler-ui` client 注册成功。
- [x] `mission_capabilities` 在模拟 0.1.5 服务面上返回正确探测结果。
- [x] `mission_agent_team_view` 在模拟 `ctx.agentTeams` 下返回 roster/task 只读快照，未挂载时返回 available=false。
- [x] `mission_agent_team_sync` 在模拟 agentTeams 下 dry_run 不写入、write 创建幂等任务并镜像依赖。
- [ ] 真实 agentTeams 挂载时验证幂等/冲突行为。
- [x] `mission_subagent_view` 在模拟 `ctx.subagents` 下返回 providers/children/descendants，未挂载时安全空转。
- [x] `mission_goal_view` 在模拟 `ctx.goals` 下返回 goal，未挂载时安全空转。
- [x] `mission_worker_plan` 在模拟 `ctx.subagents` 下返回 provider readiness、durable label 和包含 guidance/artifact/protocol 的完整 prompt，不产生副作用。
- [x] `mission_goal_sync` 在模拟 `ctx.goals` 下验证 dry-run 计划、显式 create、已存在 goal 不修改三条路径。
- [x] 冷恢复组合：普通会话按 `header.agentPreset` 挂载原预设（`dsh-timer-scheduler-ui` `test/delivery.mjs` 六类用例全绿）。
- [x] 冷恢复不回退父会话：预设缺失/子代理父离线都停在待人工重试，测试断言 resume/sendMessage 未被误用。
- [ ] 官方 mailbox 消息不丢、不重复。
- [ ] mission review / blind / final audit 全程不变。
- [ ] 旧 DSH 版本下 `mission_capabilities` 返回全 false 或 null，不报错。

## 9. 参考

- [DeepSeek Harness 发布 v0.1.5（ChainCatcher）](https://www.chaincatcher.com/article/2288815)
- [官方 subagent 文档（dsh-v0.1.5-alpha.1）](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/dsh-v0.1.5-alpha.1/docs/subsystems/subagent.zh.md)
- [@deepseek-ai/dsh-experimental-agent-team（npm）](https://www.npmjs.com/package/@deepseek-ai/dsh-experimental-agent-team)
- [官方 Agent Teams README（agent-team 包）](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/agent-team/README.zh.md)
- [官方 ralph 工具 README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/tool-ralph/README.md)
