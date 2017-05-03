'use strict';

import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as Promise from 'bluebird';

const exec = Promise.promisify(childProcess.exec);

let gitIndicators;
let addedCount = 0;
let removedCount = 0;

interface IGitIndicators {
  aligment: vscode.StatusBarAlignment
}

interface IIndicatorsData {
  added?: number,
  removed?: number
}

export function activate(context: vscode.ExtensionContext) {
  // let test = vscode.commands.registerTextEditorCommand(
  //   'git-indicators.sayHello',
  //   () => vscode.window.showInformationMessage('Hello World!')
  // );

  // let test2 = vscode.commands.registerTextEditorCommand(
  //   'git-indicators.test',
  //   () => updateIndicatorsData(gitIndicators, {
  //     added: 10,
  //     removed: 50
  //   })
  // );

  gitIndicators = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  gitIndicators.command = 'workbench.view.git';
  gitIndicators.text = `$(diff-modified) ${addedCount}, ${removedCount}`;
  gitIndicators.show();

  vscode.workspace.onDidSaveTextDocument(e => {
    return exec(`cd ${vscode.workspace.rootPath} && git diff --numstat`)
      .then(res => {
        const gitData = res.split('	');
        const added = gitData[0];
        const removed = gitData[1];

        updateIndicators(gitIndicators, {
          added,
          removed
        });
      });
  });
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
