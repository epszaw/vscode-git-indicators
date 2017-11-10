'use strict'

import * as vscode from 'vscode'
import Indicators from './indicators'

let indicators = new Indicators()

interface IIndicatorsData {
  added?: Number,
  removed?: Number
}

export function activate(context: vscode.ExtensionContext) {
  indicators.activate(context)
}

export function deactivate() {
  indicators.deactivate()
}
