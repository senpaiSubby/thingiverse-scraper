import fs, { existsSync } from 'fs'
import { join, normalize } from 'path'

import { ConfigFile } from './types'

export const readConfig = () => {
  const path = normalize(join(__dirname, '..', 'config.json'))

  // IF config does not exist create one in its place
  if (!existsSync(path)) {
    fs.writeFileSync(
      path,
      JSON.stringify({
        port: 8585,
        saveFolderPath: 'D:\\Downloads'
      })
    )
  }

  const read = fs.readFileSync(path, 'utf-8')

  return JSON.parse(read) as ConfigFile
}
