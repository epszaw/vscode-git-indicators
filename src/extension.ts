'use strict';

import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as BluebirdPromise from 'bluebird';

const exec = BluebirdPromise.promisify(childProcess.exec);

let gitIndicators: vscode.StatusBarItem;
let gitWatcher: vscode.FileSystemWatcher|null;
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
  gitWatcher = vscode.workspace.createFileSystemWatcher('**/.git/**');

  gitWatcher.onDidChange(e => {
    return requestIndicatorUpdate(gitIndicators);
  });

  gitWatcher.onDidCreate(e => {
    return requestIndicatorUpdate(gitIndicators);
  });

  gitWatcher.onDidDelete(e => {
    return requestIndicatorUpdate(gitIndicators);
  });

  gitIndicators = createIndicators(vscode.StatusBarAlignment.Left, {
    added: 0,
    removed: 0
  });

  vscode.workspace.onDidSaveTextDocument(e => {
    return requestIndicatorUpdate(gitIndicators);
  });

  context.subscriptions.push(activateGitIndicators);

  gitIndicators.show();
}

export function deactivate() {
  gitWatcher = null;
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
 * Request new indicators data and update indicators, when data were
 * successfully recieved
 * @param {vscode.StatusBarItem} indicators
 */
async function requestIndicatorUpdate(
  indicators: vscode.StatusBarItem
) {
  if (changeTimer) {
    clearTimeout(changeTimer);
    changeTimer = null;
  }

  changeTimer = setTimeout(async () => {
    const indicatorsData = await getGitData();

    updateIndicators(indicators, indicatorsData);
  }, 250);
}

/**
 * Execute shell script to get diff data and update indicators
 * @param {vscode.StatusBarItem} indicators
 * @returns {Promise}
 */
function getGitData(): Promise<String> {
  const workDir = vscode.workspace.rootPath;

  return exec(
    workDir[1] === ':'
    ? `${workDir.slice(0, 2)} && cd ${workDir} && git diff --numstat`
    : `cd ${workDir} && git diff --numstat`
  )
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
      });

      return {
        added,
        removed
      }
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

  if (added && removed) {
    splittedData = [
      '$(diff-modified)',
      `+${data.added},`,
      `-${data.removed}`
    ];
  } else if (added && !removed) {
    splittedData = [
      '$(diff-added)',
      `${data.added}`
    ];
  } else if (!added && removed) {
    splittedData = [
      '$(diff-removed)',
      `${data.removed}`
    ];
  } else {
    splittedData = [];
  }

  indicators.text = splittedData.join(' ');
}
