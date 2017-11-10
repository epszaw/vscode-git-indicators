'use strict'

import * as childProcess from 'child_process'

function exec (command: string): Promise<any> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (err, res) => {
      if (!err) {
        return resolve(res)
      } else {
        return reject(err)
      }
    })
  })
}

export default exec
