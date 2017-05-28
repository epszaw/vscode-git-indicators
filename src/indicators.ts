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
  create(aligment: vscode.StatusBarAlignment, initialData: IIndicatorsData)
  requestGitData(): Promise<Array<String>>
  parseGitData(rawGitDataLines: Array<String>): IIndicatorsData
  requestIndicatorsUpdate()
  updateIndicators(data: IIndicatorsData)
}

export default class Indicators implements IIndicators {
  indicators = null
  watcher = null
  changeTimer = null

  /**
   * Main activation method
   * @param context - vscode context
   */
  activate(context?) {
    const toggleGitPanel = vscode.commands.registerTextEditorCommand(
    'git-indicators.toggleGitPanel',
      () => {
        vscode.commands.executeCommand('workbench.view.git')
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

    this.indicators = this.create(vscode.StatusBarAlignment.Left, {
      added: 0,
      removed: 0
    })

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
  deactivate() {
    this.watcher = null
    this.indicators.hide()
  }

  /**
   * Get working project git data
   */
  async requestGitData() {
    const workDir = vscode.workspace.rootPath
    let dataLines
    let added: Number = 0
    let removed: Number = 0

    try {
      const gitData = await exec(
        workDir[1] === ':'
        ? `${workDir.slice(0, 2)} && cd ${workDir} && git diff --numstat`
        : `cd ${workDir} && git diff --numstat`
      )

      return dataLines = gitData.split('\n')
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
  async requestIndicatorsUpdate() {
    if (this.changeTimer) {
      clearTimeout(this.changeTimer)
      this.changeTimer = null
    }

    this.changeTimer = setTimeout(async () => {
      const gitData = await this.requestGitData()
      const indicatorsData = this.parseGitData(gitData)

      this.updateIndicators(indicatorsData)
    }, 250)
  }

  /**
   * Update indicators text
   * @param data - New indicators data
   */
  updateIndicators(data) {
    const { added, removed } = data
    let updatedData = this.indicators.text
    let splittedData = this.indicators.text.split(' ')

    if (added && removed) {
      splittedData = [
        '$(diff-modified)',
        `+${data.added},`,
        `-${data.removed}`
      ]
    } else if (added && !removed) {
      splittedData = [
        '$(diff-added)',
        `${data.added}`
      ]
    } else if (!added && removed) {
      splittedData = [
        '$(diff-removed)',
        `${data.removed}`
      ]
    } else {
      splittedData = []
    }

    this.indicators.text = splittedData.join(' ')
  }

  /**
   * Prepare raw git data to special object
   * @param rawGitDataLines - Raw git diff output
   */
  parseGitData(rawGitDataLines) {
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
   */
  create(aligment, initialData) {
    const {added, removed} = initialData
    let indicators = vscode.window.createStatusBarItem(aligment)

    indicators.command = 'git-indicators.toggleGitPanel'
    indicators.text = `$(diff-modified) +${added}, -${removed}`

    return indicators
  }
}
