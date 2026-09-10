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
- 用官方 `subagents.sendMessage()` 替代部分自定义 subagent 唤醒路径：
  - 角色 worker 的完成通知、checkpoint、继续执行走官方 durable mailbox。
  - mission artifact 仍走 `mission_publish_artifact` / `mission_consume_artifacts`。
- 用官方 `startContinuable()` 管理长期 worker 的冷恢复，减少 timer 兜底。
- 配置开关：`officialIntegration: 'off' | 'readonly' | 'messages' | 'full'`，默认 `off`。

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
- [ ] 官方 mailbox 消息不丢、不重复。
- [ ] mission review / blind / final audit 全程不变。
- [ ] 旧 DSH 版本下 `mission_capabilities` 返回全 false 或 null，不报错。

## 9. 参考

- [DeepSeek Harness 发布 v0.1.5（ChainCatcher）](https://www.chaincatcher.com/article/2288815)
- [官方 subagent 文档（dsh-v0.1.5-alpha.1）](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/dsh-v0.1.5-alpha.1/docs/subsystems/subagent.zh.md)
- [@deepseek-ai/dsh-experimental-agent-team（npm）](https://www.npmjs.com/package/@deepseek-ai/dsh-experimental-agent-team)
- [官方 Agent Teams README（agent-team 包）](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/experimental/agent-team/README.zh.md)
- [官方 ralph 工具 README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/workflow/tool-ralph/README.md)
