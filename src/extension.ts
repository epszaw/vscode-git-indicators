'use strict';

import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as Promise from 'bluebird';

const exec = Promise.promisify(childProcess.exec);

let gitIndicators;
let addedCount = 0;
let removedCount = 0;
let changeTimer;

interface IGitIndicators {
  aligment: vscode.StatusBarAlignment
}

interface IIndicatorsData {
  added?: number,
  removed?: number
}

export function activate(context: vscode.ExtensionContext) {
  let toggleGitPanel = vscode.commands.registerTextEditorCommand(
    'git-indicators.toggleGitPanel',
    () => {
      vscode.commands.executeCommand('workbench.view.git');
    }
  );

  gitIndicators = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  gitIndicators.command = 'git-indicators.toggleGitPanel';
  gitIndicators.text = `$(diff-modified) +${addedCount}, -${removedCount}`;

  vscode.workspace.onDidChangeTextDocument(e => {
    if (changeTimer) {
      clearTimeout(changeTimer);
      changeTimer = null;
    }

    changeTimer = setTimeout(() => {
      return getGitData();
    }, 250);
  })

  return getGitData().then(() => gitIndicators.show());
}

export function deactivate() {
  gitIndicators.hide();
}

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

function getGitData() {
  return exec(`cd ${vscode.workspace.rootPath} && git diff --numstat`)
    .then(res => {
      const dataLines = res.split('\n');
      let added = 0;
      let removed = 0;

      dataLines.map(line => {
        if (line.length > 0) {
          const parsedLine = line.split('	');
          added += parseInt(parsedLine[0]);
          removed += parseInt(parsedLine[1]);
        }
      })

      updateIndicators(gitIndicators, {
        added,
        removed
      });
    });
}
