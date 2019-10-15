import { workspace, window, StatusBarItem, StatusBarAlignment } from 'vscode'
import { GitDiffReader } from './lib/gitDiffReader'
import { IIndicators, IIndicatorsData } from './interfaces'

export default class Indicators implements IIndicators {
  indicators = null
  fsWatcher = null
  reader = null

  activate(): void {
    const { rootPath } = workspace
    const fsWatcher = workspace.createFileSystemWatcher(`${rootPath}/**/*`)

    this.indicators = this.create(StatusBarAlignment.Left)

    if (!this.reader) {
      this.reader = new GitDiffReader(rootPath, fsWatcher)
      this.reader.on('data', this.handleReaderData.bind(this))
      this.reader.on('error', this.handleReaderError.bind(this))
    }
  }

  create(aligment: StatusBarAlignment): StatusBarItem {
    let indicators = window.createStatusBarItem(aligment, 10)

    indicators.text = ''
    indicators.tooltip = ''
    indicators.command = 'workbench.view.scm'

    return indicators
  }

  deactivate(): void {
    this.reader.removeListener('data', this.handleReaderData)
    this.reader.removeListener('error', this.handleReaderError)

    this.reader = null
    this.fsWatcher = null

    this.indicators.hide()
  }

  handleReaderData(data: IIndicatorsData): void {
    this.updateIndicators(data)
  }

  handleReaderError(err: any): void {
    window.showErrorMessage(err)
  }

  formatTooltipText(data: IIndicatorsData): string {
    const { added, removed, filesCount } = data
    const tooltipParts = []

    if (filesCount) {
      tooltipParts.push(`affected files: ${filesCount}`)
    }

    if (added) {
      tooltipParts.push(`insertions: +${added}`)
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

  updateIndicators(data: IIndicatorsData): void {
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
