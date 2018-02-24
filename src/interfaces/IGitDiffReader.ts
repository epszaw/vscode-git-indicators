import { FileSystemWatcher } from 'vscode'
import { Readable } from 'stream'

export interface IGitDiffReader extends Readable {
  workDir: string
  fsWatcher: FileSystemWatcher
}
