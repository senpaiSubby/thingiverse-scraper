import { Log } from '@callmekory/logger/lib'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import fetch from 'node-fetch'
import { join, normalize } from 'path'
import puppeteer from 'puppeteer'
import sanitize from 'sanitize-filename'

import { readConfig } from './utils'

const config = readConfig()

export class ThingiverseScraper {
  public thingNumber: string

  public sortDir: string

  public targetFolderPath: string

  public thingFiles: string[]

  public thingFolderName: string

  public mainPageUrl: string

  public thingFilesUrl: string

  public constructor(thingNumber: string) {
    this.thingNumber = thingNumber
    this.sortDir = config.saveFolderPath
    this.mainPageUrl = `https://www.thingiverse.com/thing:${this.thingNumber}`
    this.thingFilesUrl = `https://www.thingiverse.com/thing:${this.thingNumber}/files`
  }

  public async run() {
    await this.fetchTitleAndStlLinks()

    this.makeDirectory()

    await this.downloadStlFiles()

    await this.createPagePDF()

    this.createPageLinkShortcut()
  }

  private async fetchTitleAndStlLinks(): Promise<void> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)

    await page.goto(this.mainPageUrl, { waitUntil: 'networkidle0' })

    const pageTitle = await page.evaluate(() => {
      const index = document.title.indexOf('by')
      return document.title.substr(0, document.title.length - document.title.substr(index).length).trim()
    })

    const folderName = sanitize(pageTitle, { replacement: ' ' })

    Log.info(`Downloading Thing: ${folderName}`)

    await page.goto(this.thingFilesUrl, { waitUntil: 'networkidle0' })

    const allPageLinks = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((anchor) => anchor.href))

    const stlLinks = allPageLinks.filter((text) => text.toLocaleLowerCase().endsWith('.stl'))

    await browser.close()

    this.thingFiles = stlLinks
    this.thingFolderName = folderName
    this.targetFolderPath = normalize(join(this.sortDir, folderName))
  }

  private makeDirectory() {
    const folderExists = existsSync(this.targetFolderPath)

    if (folderExists) {
      return new Error(`The folder: | ${this.thingFolderName} | already exists. Will NOT overwrite.`)
    }

    mkdirSync(this.targetFolderPath, { recursive: true })
  }

  private async downloadStlFiles() {
    Log.info('Downloading STL Files')

    const download = async (url: string) => {
      const response = await fetch(url)
      const fileName = url.split('/').pop()

      const targetPath = normalize(join(this.targetFolderPath, fileName))
      const buffer = await response.buffer()
      writeFileSync(targetPath, buffer)

      Log.ok(`Download Complete: ${fileName}`)
    }

    for (const url of this.thingFiles) {
      try {
        await download(url)
      } catch {
        const fileName = url.split('/').pop()
        Log.error(`Failed to download file: ${fileName}`)
      }
    }
  }

  private async createPagePDF(): Promise<void> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)

    await page.goto(this.mainPageUrl, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      landscape: true,
      height: 1080,
      width: 1920
    })

    writeFileSync(normalize(join(this.targetFolderPath, 'page.pdf')), pdf)

    await browser.close()
  }

  private createPageLinkShortcut(): void {
    const fileText = `
    [InternetShortcut]
    URL=${this.mainPageUrl}
    `

    writeFileSync(normalize(join(this.targetFolderPath, 'page.url')), fileText)
  }
}
