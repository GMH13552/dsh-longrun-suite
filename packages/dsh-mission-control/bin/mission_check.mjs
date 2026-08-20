#!/usr/bin/env node
/**
 * dsh-mission-control / mission_check
 *
 * CLI meta-validator. Usage:
 *   node bin/mission_check.mjs <path-to-mission.json> [--final]
 *
 * --final also requires mission.finalAudit.passed and, when a reportPath is
 * present, verifies the report file exists.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { checkMission } from '../lib/core.js'

const args = process.argv.slice(2)
const help = args.includes('--help') || args.includes('-h')
if (help || args.length === 0) {
  console.log(`Usage: mission_check <mission.json> [--final]

Structural meta-validator for dsh-mission-control.

Checks (always):
  - mission has id and non-empty successCriteria
  - every accepted task has a pass review + non-empty evidence
  - every pass review includes all verificationPlan.requiredEvidence

With --final:
  - finalAudit must exist and cover every successCriteria
  - mission.status completed requires finalAudit.passed
  - when mission.reportPath is set, the report file must exist
`)
  process.exit(help ? 0 : 1)
}

const file = resolve(args[0])
const isFinal = args.includes('--final')

let mission
try {
  mission = JSON.parse(readFileSync(file, 'utf8'))
} catch (err) {
  console.error(`mission_check: cannot read mission file ${file}: ${err.message}`)
  process.exit(2)
}

const result = checkMission(mission)
const errors = [...result.errors]

if (isFinal) {
  if (mission.status === 'completed' && !mission.finalAudit?.passed) {
    errors.push('mission completed but finalAudit did not pass')
  }
  if (mission.reportPath) {
    const report = resolve(dirname(file), mission.reportPath)
    if (!existsSync(report)) {
      errors.push(`final report missing: ${mission.reportPath}`)
    }
  }
}

if (errors.length === 0) {
  console.log('mission_check: PASS')
  process.exit(0)
}

console.log('mission_check: FAIL')
for (const e of errors) console.log(`- ${e}`)
process.exit(1)
