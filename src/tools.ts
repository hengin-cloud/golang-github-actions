import * as core from '@actions/core'
import * as io from '@actions/io'
import nodeFs from 'fs'
import { Toolchain } from './toolchain'
import { exec, getArrayInput } from './utils'

export async function installTools(toolchain: Toolchain, goPackages: string[]): Promise<void> {
  await core.group('Installing Tools', async () => {
    for (const i in goPackages) {
      await installTool(toolchain, goPackages[i])
    }
  })
}

export async function validateTools(toolchain: Toolchain): Promise<void> {
  await core.group('Validating Tools', async () => {
    core.info(nodeFs.readdirSync(toolchain.GOBIN).join('\n'))
    await io.rmRF(toolchain.tempPath)
  })
}

async function installTool(toolchain: Toolchain, pkg: string): Promise<void> {
  core.info(pkg)
  exec(`${toolchain.go} get ${pkg}`, toolchain.tempPath)
}
