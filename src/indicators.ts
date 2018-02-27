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

    this.indicators = this.create(StatusBarAlignment.Left)

    if (!this.reader) {
      this.reader = new GitDiffReader(workDir, fsWatcher)
      this.reader.on('data', this.handleReaderData.bind(this))
    }

    if (context) {
      context.subscriptions.push(activateGitIndicators)
    }
  }

  create(aligment: StatusBarAlignment) {
    let indicators = window.createStatusBarItem(aligment, 10)

    indicators.text = ''
    indicators.command = 'git-indicators.toggleGitPanel'

    return indicators
  }

  deactivate() {
    this.reader.removeListener('data', this.handleReaderData)
    this.fsWatcher = null
    this.indicators.hide()
  }

  handleReaderData(data: IIndicatorsData) {
    this.updateIndicators(data)
  }

  formatTooltipText(data: IIndicatorsData): string {
    const { added, removed, filesCount } = data
    const tooltipParts = []

    if (filesCount) {
      tooltipParts.push(`affected files: ${filesCount}`)
    }

    if (added) {
      tooltipParts.push(`inserions: +${added}`)
    }

    if (removed) {
      tooltipParts.push(`deletions: -${removed}`)
    }

    if (tooltipParts.length > 0) {
      const tooltipText = tooltipParts.join(', ')

      return `${tooltipText.charAt(0).toUpperCase()}${tooltipText.slice(1)}`
    }

    return 'Git indicators'
  }

  formatStatusBarItemText(data: IIndicatorsData): string {
    const { added, removed, filesCount } = data
    const source: string[] = filesCount ? [`$(diff) ${filesCount}`] : []

    if (added && removed) {
      source.push(`$(diff-modified) +${added}, -${removed}`)
    } else if (added) {
      source.push(`$(diff-added) ${added}`)
    } else if (removed) {
      source.push(`$(diff-removed) ${removed}`)
    }

    if (source.length > 0) {
      return source.join('  ')
    }

    return ''
  }

  updateIndicators(data: IIndicatorsData) {
    const statusBarText = this.formatStatusBarItemText(data)
    const tooltipText = this.formatTooltipText(data)

    if (statusBarText.length > 0) {
      this.indicators.text = statusBarText
      this.indicators.tooltip = tooltipText
      this.indicators.show()
    } else {
      this.indicators.hide()
      this.indicators.text = statusBarText
      this.indicators.tooltip = tooltipText
    }
  }
}
