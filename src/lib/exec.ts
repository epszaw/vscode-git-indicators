import * as childProcess from 'child_process'
import * as tp from 'typed-promisify'

export const exec = tp.promisify(childProcess.exec)
