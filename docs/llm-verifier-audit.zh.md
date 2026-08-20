# dsh-plugin-llm-verifier 与 LLM-as-a-Verifier 论文的核验记录

## 结论

原插件核心实现基本忠实于论文/官方参考实现。本仓库包含一个本地修补 fork，
修正了 3 处差异并保留了 1 处不可避免的差异。

## 一致的实现

- 连续奖励 `R = (1/CK) * sum phi(v)`，`phi(v) = (v-1)/(G-1)`，`G=20`
- 标准分解（C criteria）× 重复评估（K repetitions）
- Probabilistic Pivot Tournament：随机哈密顿环 → top-k pivots → pivot rounds → Bradley-Terry 软胜率聚合 `w_i/c_i`
- 候选 JSON 转义、criterion 放在 prompt 尾部以利用 prefix cache
- `verify_rollout` 的 full-trajectory 判分（tool calls / tool results）

## 已修补的差异

### 1. `verify_track` prompt 过于宽松

原插件只有一句话 progress criterion。本 fork 移植了官方 `progress.py` 的校准纪律：

- agent 的自我宣称（"done!", "all tests pass"）是零证据；
- 只看实际观测输出；
- effort / 步骤数 / 自信叙述不算 progress；
- 方向错误时分数应平台化，退化时应下降；
- 隐藏 grader 不可见，默认怀疑。

### 2. Pivot 选择算法

原插件用环赛的平均原始 reward 选 pivot；官方参考实现用环赛的
Bradley-Terry 软胜率 `w_i / c_i`。本 fork 已改为官方算法。

### 3. 环赛奇数重复换槽

官方实现对所有 directed comparison 都在奇数重复时交换 A/B 槽位；
原插件环赛阶段不换。本 fork 已补上。

### 4. rollout criteria

原插件默认 1 个 `Task Success`；本 fork 默认使用官方 Terminal-Bench 的 3 标准分解：
Specification Adherence / Output Match / Error Signal Detection。

## 不可避免的差异

论文核心是读取分数 token 的 logprobs 分布求期望。DSH 的 `ctx.llm` 流式接口不暴露
logprobs，所以只能用温度采样多次平均来近似（论文自身也把重复评估作为缩放轴）。
