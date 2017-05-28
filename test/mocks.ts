const mocks = {
  defaultIndicatorsText: '$(diff-modified) +0, -0',
  dataObjectWithAddedValue: {
    added: 10,
    removed: 0
  },
  dataObjectWithRemovedValue: {
    added: 0,
    removed: 10
  },
  rawGitData: [
    '1	4	src/indicators.ts',
    '2	5	test/extension.test.ts',
    '-	-	test/index.ts'
  ]
}

export default mocks
