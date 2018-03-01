import { StatusBarAlignment } from 'vscode'
import * as assert from 'assert'
import Indicators from './../src/indicators'
import { GitDiffReader } from '../src/lib/gitDiffReader'

suite('Git indicators common functional:', () => {
  let gitIndicators = null

  test('indicators were activated', () => {
    gitIndicators = new Indicators()
    gitIndicators.activate()

    assert.equal(
      gitIndicators.indicators.text,
      '',
      'Created indicators text is not equals to default text'
    )
    assert.equal(
      gitIndicators.indicators.tooltip,
      '',
      'Created indicators tooltip is not equals to default text'
    )
    assert.equal(gitIndicators.indicators.alignment, 1, "Created indicators hasn't Left aligment")
  })

  test('indicators were updates', () => {
    gitIndicators.updateIndicators({
      added: 15,
      removed: 20,
      filesCount: 2
    })

    assert.equal(
      gitIndicators.indicators.text,
      '$(diff) 2  $(diff-modified) +15, -20',
      'Indicators text incorrent after update'
    )
    assert.equal(
      gitIndicators.indicators.tooltip,
      'Affected files: 2, insertions: +15, deletions: -20',
      'Indicators tooltip incorrent after update'
    )
  })

  test('indicators were deactivated', () => {
    gitIndicators.deactivate()

    console.log(gitIndicators.indicators)

    assert.equal(gitIndicators.fsWatcher, null, '')
    assert.equal(gitIndicators.reader, null, '')
  })
})
