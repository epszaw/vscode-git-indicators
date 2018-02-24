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
      },
      0
    )

    assert.equal(
      gitIndicators.text,
      mocks.defaultIndicatorsText,
      'Created indicators text is not equals to default text'
    )
    assert.equal(gitIndicators.alignment, 1, "Created indicators hasn't Left aligment")
  })
})
