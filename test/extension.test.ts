'use strict'

import * as assert from 'assert'
import * as vscode from 'vscode'
import Indicators from './../src/indicators'
import mocks from './mocks'

suite('Git indicators common functional:', () => {
  test('indicators are created', () => {
    const indicators = new Indicators()
    const gitIndicators = indicators.create(
      vscode.StatusBarAlignment.Left,
      {
        added: 0,
        removed: 0
      }
    )

    assert.equal(
      gitIndicators.text,
      mocks.defaultIndicatorsText,
      'Created indicators text is not equals to default text'
    )
    assert.equal(
      gitIndicators.alignment,
      1,
      'Created indicators hasn\'t Left aligment'
    )
  })

  test('raw git data is correctly parsed', () => {
    const indicators = new Indicators()
    const parsedGitData = indicators.parseGitData(mocks.rawGitData)

    assert.deepEqual(
      parsedGitData,
      {
        added: 3,
        removed: 9
      },
      'Raw git data is not correctly parsed'
    )
  })

  test('indicators updates with raw git data', () => {
    const indicators = new Indicators()
    const parsedGitData = indicators.parseGitData(mocks.rawGitData)

    indicators.activate()
    indicators.updateIndicators(parsedGitData)

    assert.notEqual(
      indicators.indicators.text,
      mocks.defaultIndicatorsText,
      'Text of indicators doesn\'t changed'
    )
  })
})
