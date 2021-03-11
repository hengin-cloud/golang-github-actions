import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { v4 as uuid } from 'uuid'
import { Toolchain } from './toolchain'
import { execGet } from './utils'

const CACHE_KEY_PREFIX = 'golang-github-actions-cache-'

export async function restoreCache(toolchain: Toolchain): Promise<void> {
  await core.group(
    'Restoring Go Cache',
    async (): Promise<void> => {
      await cache.restoreCache(getCachePaths(toolchain), `${CACHE_KEY_PREFIX}${uuid()}`, [CACHE_KEY_PREFIX])
    },
  )
}

export async function saveCache(toolchain: Toolchain): Promise<void> {
  await core.group(
    'Saving Go Cache',
    async (): Promise<void> => {
      await cache.saveCache(getCachePaths(toolchain), `${CACHE_KEY_PREFIX}${uuid()}`)
    },
  )
}

function getCachePaths(toolchain: Toolchain): string[] {
  return [execGet(`${toolchain.go} env GOCACHE`), execGet(`${toolchain.go} env GOMODCACHE`)]
}
