# dsh-plugin-llm-verifier vs the LLM-as-a-Verifier paper

## Summary

The original DSH plugin is largely faithful to the paper and the official
reference implementation. This repository ships a locally patched fork that
fixes three deviations and keeps one unavoidable approximation.

## Faithful parts

- Continuous reward `R = (1/CK) * sum phi(v)`, `phi(v) = (v-1)/(G-1)`, `G=20`
- Criteria decomposition (C) × repeated evaluation (K)
- Probabilistic Pivot Tournament: random Hamiltonian ring → top-k pivots → pivot rounds → Bradley-Terry win-mass aggregation `w_i/c_i`
- Candidate JSON framing; criterion at the prompt tail for prefix caching
- Full-trajectory judging for `verify_rollout` (tool calls / tool results)

## Patched deviations

### 1. `verify_track` prompt was too permissive

The original plugin used a one-line progress criterion. This fork ports the
official `progress.py` calibration discipline:

- agent narration ("done!", "all tests pass") is zero evidence;
- observed output is the only evidence;
- effort / step count / confidence are not progress;
- wrong directions should plateau; regressions should decrease;
- the hidden grader is invisible; default to skepticism.

### 2. Pivot selection algorithm

The original plugin selected pivots by mean raw reward. The reference
implementation uses mean Bradley-Terry preference `w_i / c_i` from the ring
pass. This fork uses the official algorithm.

### 3. Ring-pass slot swapping

The reference implementation swaps A/B slots on odd repetitions for every
directed comparison, including ring edges. The original plugin did not
alternate ring edges. This fork does.

### 4. Rollout criteria

The original plugin used one `Task Success` criterion. This fork defaults to
the official Terminal-Bench decomposition: Specification Adherence / Output
Match / Error Signal Detection.

## Unavoidable approximation

The paper reads the logprob distribution over score tokens and takes the
expectation. DSH's `ctx.llm` stream does not expose logprobs, so this plugin
estimates the same expectation with repeated temperature sampling. The paper
itself treats repeated evaluation as one of its scaling axes.
