'use strict';

import * as vscode from 'vscode';
import * as childProcess from 'child_process';

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

  // Add and configure indicators

  gitIndicators.color = '#fff';
  gitIndicators.command = 'workbench.view.git';
  // gitIndicators.command = 'git-indicators.test';
  gitIndicators.text = `$(diff-added)  ${addedCount}  $(diff-removed)  ${removedCount}`;
  gitIndicators.show();

  // context.subscriptions.push(...[test, test2]);

  vscode.workspace.onDidSaveTextDocument(e => {
    // childProcess.exec(
    //   `cd ${vscode.workspace.rootPath} && git diff --numstat`,
    //   (err, stdout) => {
    //     const gitData = stdout.split('	');

    //     console.log(gitData[0].length);


    //     if (gitData[0].length === 0) {
    //       updateIndicatorsData(
    //         gitIndicators,
    //         {
    //           added: 0,
    //           removed: 0
    //         }
    //       )
    //     } else {
    //       updateIndicatorsData(
    //       gitIndicators,
    //         {
    //           added: parseInt(gitData[0]),
    //           removed: parseInt(gitData[1])
    //         }
    //       );
    //     }
    //   }
    // )
  });
}

export function deactivate() {
  gitIndicators.hide();
}

function updateIndicatorsData(
  indicators: vscode.StatusBarItem,
  data: IIndicatorsData
) {
  const addedRegexp = /(\$\(diff-added\))\s*(\w*)/gm;
  const removedRegexp = /(\$\(diff-removed\))\s*(\w*)/gm;
  let updatedData = indicators.text;

  console.log(addedCount, removedCount);


  if (data.added && data.added !== addedCount) {
    updatedData = updatedData.replace(addedRegexp, (match, r1) => {
      addedCount = data.added;
      return `${r1}   ${data.added}`;
    });
  }

  if (data.removed && data.removed !== removedCount) {
    updatedData = updatedData.replace(removedRegexp, (match, r1) => {
      removedCount = data.removed;
      return `${r1}   ${data.removed}`;
    });
  }


  indicators.text = updatedData;
}

class GitIndicators {
  constructor(aligment: vscode.StatusBarAlignment) {
    this.aligment = aligment;
  }
}