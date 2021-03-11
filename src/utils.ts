import * as core from '@actions/core'
import nodeChildProcess from 'child_process'

export function exec(cmd: string, cwd?: string) {
  nodeChildProcess.execSync(cmd, { cwd, stdio: 'inherit' })
}

export function execGet(cmd: string, cwd?: string): string {
  return (nodeChildProcess.execSync(cmd, { cwd }) || '').toString().trim()
}

export function getArrayInput(name: string, options?: core.InputOptions): string[] {
  return core
    .getInput(name, options)
    .split('\n')
    .map(s => s.trim())
    .filter(x => x !== '')
}
