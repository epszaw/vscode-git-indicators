import { ExtensionContext } from 'vscode'
import Indicators from './indicators'

const indicators = new Indicators()

export function activate(context: ExtensionContext) {
  indicators.activate(context)
}

export function deactivate() {
  indicators.deactivate()
}
