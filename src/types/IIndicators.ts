import * as vscode from 'vscode'
import IIndicatorsData from './IIndicatorsData'

interface IIndicators {
  indicators: vscode.StatusBarItem|null
  fsWatcher: vscode.FileSystemWatcher|null
  changeTimer: any
  activate(context?: vscode.ExtensionContext)
  create(aligment: vscode.StatusBarAlignment, initialData: IIndicatorsData, initialFilesCount: number)
  requestChangesData(): Promise<Array<string>>
  requestChangesFilesCount(): Promise<number>
  parseGitData(rawGitDataLines: Array<string>): IIndicatorsData
  requestIndicatorsUpdate()
  updateIndicators(data: IIndicatorsData, filesCount: number)
}

export default IIndicators
