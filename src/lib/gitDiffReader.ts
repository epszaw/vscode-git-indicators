import { Readable } from 'stream'
import { debounce } from 'throttle-debounce'
import { exec } from './exec'

import { IIndicatorsData, IGitDiffReader } from '../interfaces'

class GitDiffReader extends Readable implements IGitDiffReader {
  workDir = null
  fsWatcher = null
  inited = false

  constructor(workDir, fsWatcher) {
    super({
      objectMode: true
    })
    this.workDir = workDir
    this.fsWatcher = fsWatcher
  }

  getWorkDirCd(): string {
    if (this.workDir[1] === ':') {
      return `${this.workDir.slice(0, 2)} && cd ${this.workDir}`
    }

    return `cd ${this.workDir}`
  }

  async getRawGitDiff(cdCommand: string): Promise<any> {
    const rawDiff = await exec(`${cdCommand} && git diff --shortstat`)

    return rawDiff
  }

  async getParsedGitDiff(cdCommand: string): Promise<IIndicatorsData> {
    const rawDiff = await this.getRawGitDiff(this.getWorkDirCd())

    return this.parseGitDiff(rawDiff)
  }

  async fsCahngesHandler() {
    const gitData = await this.getParsedGitDiff(this.getWorkDirCd())

    this.push(gitData)
  }

  debouncedFsCahngesHandler = debounce(1250, this.fsCahngesHandler.bind(this))

  parseGitDiff(rawDiff: any): IIndicatorsData {
    if (rawDiff) {
      const [filesCount = 0, added = 0, removed = 0] = rawDiff.match(/\d+/g)

      return {
        added,
        removed
      }
    }

    return {
      added: 0,
      removed: 0
    }
  }

  _read() {
    try {
      if (!this.inited) {
        this.inited = true

        this.fsWatcher.onDidChange(this.debouncedFsCahngesHandler)
        this.fsWatcher.onDidDelete(this.debouncedFsCahngesHandler)
      }
    } catch (err) {
      console.error(`Git indicators error: ${err}`)
    }
  }
}

export { GitDiffReader }
