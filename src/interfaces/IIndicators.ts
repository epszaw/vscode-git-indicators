import { StatusBarItem, FileSystemWatcher } from 'vscode'

import { IIndicatorsData } from './IIndicatorsData'
import { IGitDiffReader } from './IGitDiffReader'

export interface IIndicators {
  indicators: StatusBarItem
  fsWatcher: FileSystemWatcher
  reader: IGitDiffReader
}
