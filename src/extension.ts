'use strict'

import * as vscode from 'vscode'
import * as childProcess from 'child_process'
import * as BluebirdPromise from 'bluebird'
import Indicators from './indicators'

const exec = BluebirdPromise.promisify(childProcess.exec)

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
