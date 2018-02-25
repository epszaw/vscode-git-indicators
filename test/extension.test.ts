import { StatusBarAlignment } from 'vscode'
import * as assert from 'assert'
import Indicators from './../src/indicators'
import { GitDiffReader } from '../src/lib/gitDiffReader'

suite('Git indicators common functional:', () => {
  let indicators = null
  let gitIndicators = null

  test('indicators are created', () => {
    indicators = new Indicators()
    gitIndicators = indicators.create(StatusBarAlignment.Left)

    assert.equal(gitIndicators.text, '', 'Created indicators text is not equals to default text')
    assert.equal(gitIndicators.alignment, 1, "Created indicators hasn't Left aligment")
  })

  test('indicators were updates', () => {
    gitIndicators.updateIndicators({
      added: 15,
      removed: 20
    })

    assert.equal(
      gitIndicators.text,
      '$(diff-modified) +15, -20',
      'Indicators text incorrent after update'
    )
  })
})
