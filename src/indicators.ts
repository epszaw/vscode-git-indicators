import { workspace, commands, window, StatusBarAlignment } from 'vscode'
import { debounce } from 'throttle-debounce'
import { GitDiffReader } from './lib/gitDiffReader'

import { IIndicators, IIndicatorsData } from './interfaces'

export default class Indicators implements IIndicators {
  indicators = null
  fsWatcher = null
  reader = null

  activate(context?) {
    const workDir = workspace.rootPath
    const fsWatcher = workspace.createFileSystemWatcher(`${workspace.rootPath}/**/*`)
    const toggleGitPanel = commands.registerTextEditorCommand(
      'git-indicators.toggleGitPanel',
      () => {
        commands.executeCommand('workbench.view.scm')
      }
    )
    const activateGitIndicators = commands.registerTextEditorCommand(
      'git-indicators.initIndicators',
      () => context && this.activate(context)
    )

    this.indicators = this.create(
      StatusBarAlignment.Left,
      {
        added: 0,
        removed: 0
      },
      0
    )

    if (!this.reader) {
      this.reader = new GitDiffReader(workDir, fsWatcher)
      this.reader.on('data', this.handleReaderData.bind(this))
    }

    if (context) {
      context.subscriptions.push(activateGitIndicators)
    }
  }

  create(aligment, initialChangesData, initialFilesCount) {
    const { added, removed } = initialChangesData
    let indicators = window.createStatusBarItem(aligment, 10)

    indicators.command = 'git-indicators.toggleGitPanel'
    indicators.text = ''

    return indicators
  }

  deactivate() {
    this.reader.removeListener('data', this.handleReaderData)
    this.fsWatcher = null
    this.indicators.hide()
  }

  handleReaderData(data: IIndicatorsData) {
    const { added, removed } = data

    this.updateIndicators(added, removed)
  }

  updateIndicators(added, removed) {
    const source: string[] = []

    if (added && removed) {
      source.push(`$(diff-modified) +${added}, -${removed}`)
    } else if (added) {
      source.push(`$(diff-added) ${added}`)
    } else if (removed) {
      source.push(`$(diff-removed) ${removed}`)
    }

    if (source.length > 0) {
      this.indicators.text = source.join('  ')
      this.indicators.show()
    } else {
      this.indicators.hide()
      this.indicators.text = ''
    }
  }
}
