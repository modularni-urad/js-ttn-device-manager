const axios = require('axios')
const parse = require('csv-parse')
const fs = require('fs')
const crypto = require('crypto')
const pSeries = require('p-series')
const key = process.env.KEY
const app = process.env.APP
const delay = process.env.DELAY || 1000
const appEui = process.env.APP_EUY

const parser = parse({ delimiter: ',', columns: true })
  .on('readable', () => {
    const recs = []
    let record = parser.read()
    while (record) {
      recs.push(record)
      record = parser.read()
    }
    pSeries(recs.map(i => () => new Promise(resolve => {
      console.log(`creating: ${i.SN}`)
      _createDevice(i).then(() => {
        setTimeout(resolve, Number(delay))
      })
    })))
  })
  .on('error', err => {
    console.error(err.message)
  })

fs.createReadStream(process.argv[2]).pipe(parser)

// https://www.thethingsnetwork.org/docs/applications/manager/api.html
// POST /applications/{app_id}/devices
function _createDevice (rec) {
  const url = `http://eu.thethings.network:8084/applications/${app}/devices`
  const opts = { headers: { Authorization: `Key ${key}` } }
  const devId = `${rec.SN}_${rec.MODEL}`.toLowerCase()
  const data = {
    altitude: 0,
    app_id: app,
    description: rec.DESC,
    dev_id: devId,
    latitude: rec.LAT,
    longitude: rec.LNG,
    lorawan_device: {
      activation_constraints: 'local',
      app_eui: appEui,
      app_id: app,
      app_key: _randomValueHex(32),
      app_s_key: rec.APPSKEY.trim(),
      dev_addr: rec.DEVADDR.trim(),
      dev_eui: rec.DEVEUI.trim(),
      dev_id: devId,
      disable_f_cnt_check: false,
      f_cnt_down: 0,
      f_cnt_up: 0,
      last_seen: 0,
      nwk_s_key: rec.NWKSKEY.trim(),
      uses32_bit_f_cnt: true
    }
  }
  // console.log(data)
  return axios.post(url, data, opts).then(res => {
    console.log('CREATED')
  }).catch(err => {
    console.error(err.response.data)
  })
}

function _randomValueHex (len) {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len) // return required number of characters
}
