import { workspace, ExtensionContext } from 'vscode'
import Indicators from './indicators'

const indicators = new Indicators()

export function activate(context: ExtensionContext) {
  const { git } = workspace.getConfiguration()

  if (git && git.enabled === false) return

  indicators.activate()
}

export function deactivate() {
  indicators.deactivate()
}
