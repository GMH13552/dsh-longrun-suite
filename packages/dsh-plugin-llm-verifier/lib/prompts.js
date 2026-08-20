/**
 * Prompt construction for LLM-as-a-Verifier scoring calls.
 *
 * Follows the llm-as-a-verifier reference template: an expert-reviewer
 * persona, the task and trajectories first, the evaluation criterion at the
 * prompt TAIL (so repeated calls over the same pair share a provider-cacheable
 * prefix across criteria), fine-grained integer scales (1..G) with the paper's
 * scale anchors (1 = incorrect, midpoint = borderline, G = flawless), and
 * scores inside XML tags.
 * @module dsh-plugin-llm-verifier/prompts
 */

/**
 * Default criteria decomposition for judging candidate solutions, mirroring
 * the paper's Specification / Output / Errors split for coding tasks.
 */
export const DEFAULT_CRITERIA = [
  {
    name: 'specification',
    description: 'Does the candidate address every requirement stated in the task, without ignoring, weakening, or reinterpreting any part of it?',
  },
  {
    name: 'output',
    description: 'Is the result or output the candidate produces correct, complete, and directly usable for the task?',
  },
  {
    name: 'errors',
    description: 'Is the candidate free of errors: bugs, false claims, broken logic, unsafe steps, or internally inconsistent reasoning?',
  },
]

/**
 * Default criterion for judging full agent trajectories (verify_rollout),
 * mirroring the reference implementation's agent-benchmark configuration:
 * one focused Task Success question with an explicit anti-length-bias note.
 */
export const ROLLOUT_CRITERIA = [
  {
    name: 'Task Success',
    description: 'How likely the agent correctly and completely solved the task. The strongest signal is the agent verifying its solution against the task\'s specific requirements. Trajectory length, number of steps, and apparent confidence do not predict correctness.',
  },
]

/**
 * Default ground-truth note, matching the reference implementation: judging
 * happens at inference time with no reference solution available.
 */
export const DEFAULT_GROUND_TRUTH_NOTE = 'There is no reference solution available. Judge each candidate purely on how plausibly it solved the task correctly.'

/** Single criterion used by `track` to grade partial-trajectory progress. */
export const PROGRESS_CRITERION = {
  name: 'progress',
  description: 'Given everything the agent has done up to and including the last shown step, would the agent\'s CURRENT state already satisfy the task\'s hidden grader — i.e. produce the expected files, output, or behavior the task requires? 1 means certainly no; the maximum means the task is essentially complete and correctly verified.',
}

/**
 * Scale description: the reference implementation's banded anchors for the
 * default 20-point scale (mapped from its A-best letters onto our numbers,
 * 20 = best), or the paper's three plain anchors for any other granularity.
 */
function scaleDescription(granularity) {
  if (granularity === 20) {
    return [
      'Rate how well the candidate solved the task on a 20-point scale:',
      '  20 = clearly and completely succeeded with verified output (best)',
      '  17-19 = succeeded with only minor issues',
      '  14-16 = above average, mostly correct with some issues',
      '  11-13 = uncertain, leans toward success',
      '  8-10 = uncertain, leans toward failure',
      '  5-7 = below average, significant issues remain',
      '  2-4 = failed with some partial progress',
      '  1 = clearly and completely failed (worst)',
    ].join('\n')
  }
  const borderline = Math.round((granularity + 1) / 2)
  return `Rate on an integer scale from 1 to ${granularity}, where 1 means incorrect or completely failing, ${borderline} means borderline, and ${granularity} means flawless.`
}

/** Expert-reviewer persona with the reference scale bands and output discipline. */
export function verifierSystemPrompt(granularity, tags) {
  const tagList = tags.map(tag => `<${tag}>N</${tag}>`).join(' and ')
  return [
    'You are an expert reviewer acting as a strict, impartial verifier. You judge candidate solutions to a task; you never solve the task yourself.',
    scaleDescription(granularity),
    'Judge only what is actually present in the candidate. Unsupported claims count against it. Do not reward length, style, or confidence.',
    'Keep your analysis brief — a few sentences at most.',
    `Carefully analyze, then end your reply with exactly ${tagList}, where each N is one integer from 1 to ${granularity}. Output each tag exactly once and nothing after the final tag.`,
  ].join('\n')
}

/** Shared criterion tail: keeps the task/candidate prefix identical across criteria. */
function criterionTail(criterion, subject) {
  return [
    `Evaluation criterion (${criterion.name}): ${criterion.description}`,
    '',
    `Carefully analyze ${subject} against this criterion, then provide your final scores.`,
  ].join('\n')
}

/** The optional ground-truth note as leading prompt lines. */
function noteLines(note) {
  return typeof note === 'string' && note.length > 0 ? [note, ''] : []
}

/** Frame one candidate for absolute scoring. JSON-frames untrusted text so it cannot break the structure. */
export function scoreUserPrompt(task, candidate, criterion, note) {
  return [
    ...noteLines(note),
    'Task, as a JSON string:',
    JSON.stringify(task),
    '',
    'Candidate solution, as a JSON string:',
    JSON.stringify(candidate),
    '',
    criterionTail(criterion, 'the candidate'),
  ].join('\n')
}

/** Frame a pairwise A/B comparison; the caller controls which candidate sits in each slot. */
export function compareUserPrompt(task, candidateA, candidateB, criterion, note) {
  return [
    'You will see a task description and two candidate trajectories.',
    ...noteLines(note),
    '',
    'Task, as a JSON string:',
    JSON.stringify(task),
    '',
    'Trajectory A, as a JSON string:',
    JSON.stringify(candidateA),
    '',
    'Trajectory B, as a JSON string:',
    JSON.stringify(candidateB),
    '',
    criterionTail(criterion, 'each trajectory'),
  ].join('\n')
}

/** Strict progress scale, aligned with the reference progress.py A..T bands. */
function progressScaleDescription(granularity) {
  if (granularity === 20) {
    return [
      'Use the 20-point progress scale:',
      '  20 = essentially certain YES — the agent has run the relevant verification and the observed output literally matches what the task calls for, with no outstanding errors.',
      '  14-19 = leans YES — the right artifacts appear to be in place and partial verification has worked, with minor concerns.',
      '  8-13 = uncertain — a plausible solution is taking shape, but no convincing verification yet.',
      '  2-7 = leans NO — partial work exists but key pieces are missing or broken.',
      '  1 = certainly NO — nothing useful done yet, or the agent is going down a clearly wrong path.',
    ].join('\n')
  }
  return `Use the integer progress scale from 1 to ${granularity}: 1 means certainly no progress (or actively harmful steps), ${granularity} means the task is essentially complete and correctly verified.`
}

/**
 * Strict evaluator persona for progress tracking. Ports the reference
 * progress.py calibration stance: observed output is the only evidence,
 * agent narration is zero evidence, and wrong paths should plateau.
 */
export function trackSystemPrompt(granularity) {
  return [
    'You are a strict, skeptical evaluator of agent task attempts.',
    'Agents routinely declare victory while their environment still shows errors, edit the wrong target, or never actually run the verification the task asks for. Trust observed output — NOT the agent\'s narration.',
    progressScaleDescription(granularity),
    'Effort, exploration, step count, and confident-sounding narration are NOT progress. Default to skepticism. Treat prose declarations ("done!", "all tests pass") as ZERO evidence; ground your score in the actual actions and the actual output you can see.',
    'Keep your analysis brief — a few sentences at most.',
    `Carefully analyze the partial trajectory, then end your reply with exactly <score>N</score>, where N is one integer from 1 to ${granularity}. Output the tag exactly once and nothing after it.`,
  ].join('\n')
}

/** Frame a partial trajectory for strict progress scoring. */
export function trackUserPrompt(task, steps, note) {
  return [
    ...noteLines(note),
    'Task instruction:',
    JSON.stringify(task),
    '',
    `Agent trajectory so far (${steps.length} step${steps.length === 1 ? '' : 's'}; each step is one action by the agent, with its observed output):`,
    JSON.stringify(steps),
    '',
    'You will score exactly ONE checkpoint: the state right after the LAST step shown above.',
    'The score measures exactly one thing:',
    '',
    '    "Given everything the agent has done up to and including this step, would the agent\'s CURRENT state actually satisfy the task\'s hidden grader (i.e. produce the expected files / output / behavior the task requires)?"',
    '',
    'CRITICAL CALIBRATION RULES:',
    '  * Effort, exploration, step count, and confident-sounding narration are NOT progress. An agent that ran many commands and still has not produced the right output deserves a low score.',
    '  * Default to skepticism. The hidden grader is NOT visible to you. A result with no real verification step should not score high, and even a verified-looking one should stay modest unless the verification clearly matches the task\'s stated success criterion.',
    '  * Treat the agent\'s prose declarations as ZERO evidence. Ground your score in the actual actions and the actual output you can see.',
    '  * If the agent is committed to a WRONG approach, the score should PLATEAU near its low level; if the agent regresses (breaks something that worked), the score should DECREASE. Successive calls do NOT have to rise.',
    '  * If an observed output or test literally matches the task\'s stated success criterion, that is strong positive evidence.',
    '',
    criterionTail(PROGRESS_CRITERION, 'the trajectory'),
  ].join('\n')
}

/** Self-contained task prompt for one independent rollout child. */
export function rolloutPrompt(task, index, total) {
  return [
    `You are attempt ${index + 1} of ${total} independent attempts at the same task. You do not see the other attempts.`,
    'Solve the task completely and self-containedly.',
    'Your FINAL message must contain the complete deliverable on its own: it is extracted verbatim and judged against the other attempts by a verifier that sees only that message. Do not end with a summary that omits the actual work product.',
    '',
    'Task:',
    task,
  ].join('\n')
}
