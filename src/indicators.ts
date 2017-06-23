'use strict'

import * as vscode from 'vscode'
import * as childProcess from 'child_process'
import * as BluebirdPromise from 'bluebird'

const exec = BluebirdPromise.promisify(childProcess.exec)

interface IIndicatorsData {
  added: Number
  removed: Number
}

interface IIndicators {
  indicators: vscode.StatusBarItem|null
  watcher: vscode.FileSystemWatcher|null
  changeTimer: any
  activate(context?: vscode.ExtensionContext)
  create(aligment: vscode.StatusBarAlignment, initialData: IIndicatorsData, initialFilesCount: Number)
  requestChangesData(): Promise<Array<String>>
  requestChangesFilesCount(): Promise<Number>
  parseGitData(rawGitDataLines: Array<String>): IIndicatorsData
  requestIndicatorsUpdate()
  updateIndicators(data: IIndicatorsData, filesCount: Number)
}

export default class Indicators implements IIndicators {
  indicators = null
  watcher = null
  changeTimer = null

  /**
   * Main activation method
   * @param context - vscode context
   */
  activate (context?) {
    const toggleGitPanel = vscode.commands.registerTextEditorCommand(
    'git-indicators.toggleGitPanel',
      () => {
        vscode.commands.executeCommand('workbench.view.scm')
      }
    )
    const activateGitIndicators = vscode.commands.registerTextEditorCommand(
      'git-indicators.initIndicators',
      () => context && this.activate(context)
    )
    this.watcher = vscode.workspace.createFileSystemWatcher('**/.git/**')

    this.watcher.onDidChange(e => {
      return this.requestIndicatorsUpdate()
    })

    this.watcher.onDidCreate(e => {
      return this.requestIndicatorsUpdate()
    })

    this.watcher.onDidDelete(e => {
      return this.requestIndicatorsUpdate()
    })

    this.indicators = this.create(
      vscode.StatusBarAlignment.Left,
      {
        added: 0,
        removed: 0
      },
      0
    )

    vscode.workspace.onDidSaveTextDocument(e => {
      return this.requestIndicatorsUpdate()
    })

    if (context) {
      context.subscriptions.push(activateGitIndicators)
    }

    this.indicators.show()
  }

  /**
   * Common deactivate method
   */
  deactivate () {
    this.watcher = null
    this.indicators.hide()
  }

  /**
   * Get working project changes data
   */
  async requestChangesData () {
    const workDir = vscode.workspace.rootPath
    let added: Number = 0
    let removed: Number = 0

    try {
      const gitData = await exec(
        workDir[1] === ':'
        ? `${workDir.slice(0, 2)} && cd ${workDir} && git diff --numstat`
        : `cd ${workDir} && git diff --numstat`
      )

      return gitData.split('\n')
    } catch (err) {
      if (err.message.includes('Not a git repository')) {
        vscode.window.showErrorMessage(
          'Not a git repository! Init repository and restart extension.'
        )
        this.deactivate()
      } else {
        throw err
      }
    }
  }

  /**
   * Get working project changed files count
   */
  async requestChangesFilesCount () {
    const workDir = vscode.workspace.rootPath

    try {
      const filesCount = await exec(
        workDir[1] === ':'
        ? `${workDir.slice(0, 2)} && cd ${workDir} && git status --porcelain | wc -l`
        : `cd ${workDir} && git status --porcelain | wc -l`
      )

      return parseInt(filesCount)
    } catch (err) {
      if (err.message.includes('Not a git repository')) {
        vscode.window.showErrorMessage(
          'Not a git repository! Init repository and restart extension.'
        )
        this.deactivate()
      } else {
        throw err
      }
    }
  }

  /**
   * Request indicators update: get git data and update indicators text
   */
  async requestIndicatorsUpdate () {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer)
      this.changeTimer = null
    }

    this.changeTimer = setTimeout(async () => {
      const gitChangesData = await this.requestChangesData()
      const gitChangedFilesCount = await this.requestChangesFilesCount()
      const parsedChangesData = this.parseGitData(gitChangesData)

      this.updateIndicators(parsedChangesData, gitChangedFilesCount)
    }, 100)
  }

  /**
   * Update indicators text
   * @param data - New indicators data
   */
  updateIndicators (changesData, filesCount) {
    const { added, removed } = changesData
    let newData: Array<String|Number> = []

    if (filesCount) {
      newData = [
        `$(diff) ${filesCount}  `
      ]
    }

    if (added && removed) {
      newData = newData.concat([
        '$(diff-modified)',
        `+${changesData.added},`,
        `-${changesData.removed}`
      ])
    } else if (added && !removed) {
      newData = newData.concat([
        '$(diff-added)',
        `${changesData.added}`
      ])
    } else if (!added && removed) {
      newData = newData.concat([
        '$(diff-removed)',
        `${changesData.removed}`
      ])
    } else {
      newData = []
    }

    if (newData.length) {
      this.indicators.show()
      this.indicators.text = newData.join(' ')
    } else {
      this.indicators.hide()
    }
  }

  /**
   * Prepare raw git data to special object
   * @param rawGitDataLines - Raw git diff output
   */
  parseGitData (rawGitDataLines) {
    // TODO: add types to added and removed
    let added = 0
    let removed = 0

    rawGitDataLines.map(line => {
      if (line.length > 0) {
        const parsedLine = line.split('	')

        added += parsedLine[0] !== '-'
          ? parseInt(parsedLine[0], 10)
          : 0
        removed += parsedLine[0] !== '-'
          ? parseInt(parsedLine[1], 10)
          : 0
      }
    })

    return {
      added,
      removed
    }
  }

  /**
   * Create indicators instance
   * @param aligment - Aligment of indicators on status panel
   * @param initialData  - Initial indicators data
   * @param initialFilesCount - Initial changed files count
   */
  create (aligment, initialChangesData, initialFilesCount) {
    const {added, removed} = initialChangesData
    let indicators = vscode.window.createStatusBarItem(aligment, 10)

    indicators.command = 'git-indicators.toggleGitPanel'
    indicators.text = `$(diff) ${initialFilesCount} $(diff-modified) +${added}, -${removed}`

    return indicators
  }
}
