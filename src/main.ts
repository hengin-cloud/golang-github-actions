import * as core from '@actions/core'
import { restoreCache } from './caching'
import { setupToolchain, validateToolchain } from './toolchain'
import { installTools, validateTools } from './tools'
import { getArrayInput } from './utils'

async function run(): Promise<void> {
  try {
    const goVersion = core.getInput('go-version', { required: true })
    const goPackages = ['golang.org/x/lint/golint@latest'].concat(getArrayInput('go-packages'))

    const toolchain = await setupToolchain(goVersion)
    await validateToolchain(toolchain)
    await restoreCache(toolchain)
    await installTools(toolchain, goPackages)
    await validateTools(toolchain)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
