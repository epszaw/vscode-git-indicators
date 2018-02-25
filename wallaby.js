module.exports = wallaby => {
  return {
    files: ['src/**/*.ts'],
    tests: ['./test/*.test.ts'],
    env: {
      type: 'node'
    },
    testFramework: 'mocha'
  }
}
