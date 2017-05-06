'use strict';

import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as Promise from 'bluebird';

const exec = Promise.promisify(childProcess.exec);

let gitIndicators;
let changeTimer;

interface IIndicatorsData {
  added?: number,
  removed?: number
}

export function activate(context: vscode.ExtensionContext) {
  const toggleGitPanel = vscode.commands.registerTextEditorCommand(
    'git-indicators.toggleGitPanel',
    () => {
      vscode.commands.executeCommand('workbench.view.git');
    }
  );
  const activateGitIndicators = vscode.commands.registerTextEditorCommand(
    'git-indicators.initIndicators',
    () => this.activate()
  );
  const updateGitIndicators = vscode.commands.registerTextEditorCommand(
    'git-indicators.updateIndicators',
    () => getGitData(gitIndicators)
  );

  gitIndicators = createIndicators(vscode.StatusBarAlignment.Left, {
    added: 0,
    removed: 0
  });

  vscode.workspace.onDidChangeTextDocument(e => {
    if (changeTimer) {
      clearTimeout(changeTimer);
      changeTimer = null;
    }

    changeTimer = setTimeout(() => getGitData(gitIndicators), 250);
  })

  context.subscriptions.push(activateGitIndicators, updateGitIndicators);

  return getGitData(gitIndicators).then(() => gitIndicators.show());
}

export function deactivate() {
  gitIndicators.hide();
}


/**
 * Creates indicators status bar item
 * @param {vscode.StatusBarAlignment} aligment
 * @param {IIndicatorsData} initialData
 * @returns {vscode.StatusBarItem} indicators
 */

function createIndicators(
  aligment: vscode.StatusBarAlignment,
  initialData: IIndicatorsData,
): vscode.StatusBarItem {
  const {added, removed} = initialData;
  let indicators = vscode.window.createStatusBarItem(aligment);

  indicators.command = 'git-indicators.toggleGitPanel';
  indicators.text = `$(diff-modified) +${added}, -${removed}`;

  return indicators;
}

/**
 * Update indicators by data object
 * @param indicators {vscode.StatusBarItem} - Indicators
 * @param data {IIndicatorsData} - New data indicators
 */

function updateIndicators(
  indicators: vscode.StatusBarItem,
  data: IIndicatorsData
) {
  const { added, removed } = data;
  let updatedData = indicators.text;
  let splittedData = indicators.text.split(' ');

  if (added === 0 && removed === 0) {
    indicators.color = null;
  } else {
    indicators.color = '#e2c08d';
  }

  splittedData[0] = `${splittedData[0]}`;
  splittedData[1] = `+${data.added},`;
  splittedData[2] = `-${data.removed}`;

  indicators.text = splittedData.join(' ');
}

/**
 * Execute shell script to get diff data and update indicators
 * @param {vscode.StatusBarItem} indicators
 * @returns {Promise}
 */

function getGitData(
  indicators: vscode.StatusBarItem
): Promise<String> {
  return exec(`cd ${vscode.workspace.rootPath} && git diff --numstat`)
    .then(res => {
      const dataLines = res.split('\n');
      let added = 0;
      let removed = 0;

      dataLines.map(line => {
        if (line.length > 0) {
          const parsedLine = line.split('	');
          added += parsedLine[0] !== '-' ? parseInt(parsedLine[0]) : 0;
          removed += parsedLine[0] !== '-' ? parseInt(parsedLine[1]) : 0;
        }
      })

      updateIndicators(indicators, {
        added,
        removed
      });
    })
    .catch(err => {
      if (err.message.includes('Not a git repository')) {
        vscode.window.showErrorMessage(
          'Not a git repository! Init repository and restart extension.'
        );
        deactivate();
      } else {
        throw err;
      }
    });
}
