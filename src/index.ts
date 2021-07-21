import { Log } from '@callmekory/logger'
import alert from 'alert'
import express from 'express'

import { ThingiverseScraper } from './ThingiverseScraper'
import { readConfig } from './utils'

const config = readConfig()

const app = express()
const port = config.port

app.get('/', (req, res) => {
  res.send("I'm up bitch!")
})

app.get('/download', async (req, res) => {
  console.log(req.query)

  // Check that the page url is provided and that it is a thingiverse url
  const targetUrl = req.query.targetURL as string
  if (!targetUrl) {
    return
  } else if (!targetUrl.includes('thingiverse.com')) {
    return alert('This script will only work on a thingiverse thing page.')
  }

  // Check that the thing number is in the url
  const split = targetUrl.split('thing:')
  if (!split.length) {
    return alert('There where no thing results for the url you requested.')
  }

  const thingNumber = split.pop().replace(/\D/g, '')

  await new ThingiverseScraper(thingNumber).run()

  alert('Thing has been downloaded and sorted to your specified folder in config.')

  return res.redirect(targetUrl)
})

app.listen(port, () => Log.info(`Thingiverse Scraper listening on port: ${config.port}`))
