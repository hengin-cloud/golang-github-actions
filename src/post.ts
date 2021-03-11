import * as core from '@actions/core'
import { saveCache } from './caching'
import { Toolchain } from './toolchain'

async function run(): Promise<void> {
  try {
    const toolchain: Toolchain = JSON.parse(await core.getState('toolchain'))
    await saveCache(toolchain)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
