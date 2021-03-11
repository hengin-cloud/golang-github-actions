import * as core from '@actions/core'
import * as io from '@actions/io'
import * as toolCache from '@actions/tool-cache'
import nodeFs from 'fs'
import nodeOS from 'os'
import nodePath from 'path'
import { v4 as uuid } from 'uuid'
import { exec, execGet } from './utils'

export interface Toolchain {
  goVersion: string
  GOPATH: string
  GOBIN: string
  go: string
  tempPath: string
}

export async function setupToolchain(goVersion: string): Promise<Toolchain> {
  return core.group(
    `Setting up Go ${goVersion} Toolchain`,
    async (): Promise<Toolchain> => {
      const os = getOs()
      const arch = getArch()
      const ext = getExt(os)

      const downloadUrl = `https://storage.googleapis.com/golang/go${goVersion}.${os}-${arch}.${ext}`
      core.info(`Downloading package from "${downloadUrl}"...`)
      const downloadPath = await toolCache.downloadTool(downloadUrl)

      core.info('Extracting package...')
      const extractFunc = arch === 'windows' ? toolCache.extractZip : toolCache.extractTar
      const installPath = await extractFunc(downloadPath)

      core.info('Finalizing setup...')
      core.exportVariable('GOROOT', nodePath.join(installPath, 'go'))
      core.exportVariable('GO111MODULE', 'on')
      core.addPath(nodePath.join(installPath, 'go', 'bin'))
      const go = await io.which('go')

      core.info('Adding $GOPATH/bin to $PATH...')
      const GOPATH = execGet(`${go} env GOPATH`)
      const GOBIN = nodePath.join(GOPATH, 'bin')
      if (GOPATH) {
        if (!nodeFs.existsSync(GOBIN)) {
          await io.mkdirP(GOBIN)
        }
        core.addPath(GOBIN)
      }

      core.info('Preparing for tools...')
      const tempPath = nodePath.join(process.env.RUNNER_TEMP!, uuid())
      await io.mkdirP(tempPath)
      exec(`${go} mod init tools`, tempPath)

      core.info('Toolchain Info')
      const toolchain = { goVersion, GOPATH, GOBIN, go, tempPath }
      core.info(JSON.stringify(toolchain, null, '  '))
      await core.saveState('toolchain', toolchain)

      return toolchain
    },
  )
}

export async function validateToolchain(toolchain: Toolchain): Promise<void> {
  await core.group(`Validating Toolchain`, async () => {
    exec(`${toolchain.go} version`)
    exec(`${toolchain.go} env`)
  })
}

function getOs(): string {
  const os = nodeOS.platform()
  return os === 'win32' ? 'windows' : os
}

function getArch(): string {
  const arch = nodeOS.arch()
  return arch === 'x64' ? 'amd64' : arch === 'x32' ? '386' : arch
}

function getExt(os: string): string {
  return os === 'windows' ? 'zip' : 'tar.gz'
}
