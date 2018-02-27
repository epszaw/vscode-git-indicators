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

  async getRawGitStatus(cdCommand: string): Promise<any> {
    const rawStatus = await exec(`${cdCommand} && git status -s`)

    return rawStatus
  }

  async getParsedGitDiff(cdCommand: string): Promise<IIndicatorsData> {
    const workDirCd = this.getWorkDirCd()
    const rawDiff = await this.getRawGitDiff(workDirCd)
    const changedFiles = await this.getRawGitStatus(workDirCd)
    const changedFilesCount = changedFiles.split('\n').length - 1

    return this.parseGitDiff(rawDiff, changedFilesCount)
  }

  async fsCahngesHandler() {
    const gitData = await this.getParsedGitDiff(this.getWorkDirCd())

    this.push(gitData)
  }

  debouncedFsCahngesHandler = debounce(1250, this.fsCahngesHandler.bind(this))

  parseGitDiff(rawDiff: any, filesCount: number): IIndicatorsData {
    if (rawDiff) {
      let added = 0
      let removed = 0

      rawDiff.split(', ').forEach(part => {
        const [value] = part.match(/\d+/g)

        if (part.includes('insertion')) {
          added = value
        } else if (part.includes('deletion')) {
          removed = value
        }
      })

      return {
        added,
        removed,
        filesCount
      }
    }

    return {
      added: 0,
      removed: 0,
      filesCount: 0
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
