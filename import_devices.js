const axios = require('axios')
const parse = require('csv-parse')
const fs = require('fs')
const key = process.env.KEY
const app = process.env.APP

const parser = parse({ delimiter: ',', from_line: 2 })
  .on('readable', () => {
    let record = parser.read()
    while (record) {
      _createDevice(record)
      record = parser.read()
    }
  })
  .on('error', err => {
    console.error(err.message)
  })

fs.createReadStream(process.argv[2]).pipe(parser)

// https://www.thethingsnetwork.org/docs/applications/manager/api.html
// POST /applications/{app_id}/devices
function _createDevice (rec) {
  const url = `http://eu.thethings.network:8084/applications/${app}/devices`
  const opts = { headers: { 'Authorization': `Key ${key}` } }
  const devId = `${rec[11]}_${rec[10]}`.toLowerCase()
  const data = {
    'altitude': 0,
    'app_id': app,
    'description': `${rec[0]}, ${rec[1]}, ${rec[2]}: ${rec[5]}(sn:${rec[6]}, ${rec[7]}, ${rec[8]}),`,
    'dev_id': devId,
    'latitude': rec[4].slice(0, -1),
    'longitude': rec[3].slice(0, -1),
    'lorawan_device': {
      'activation_constraints': 'local',
      'app_eui': '70B3D57ED0027385',
      'app_id': app,
      'app_key': rec[15].trim(),
      'app_s_key': rec[14].trim(),
      'dev_addr': rec[13].trim(),
      'dev_eui': rec[12].trim(),
      'dev_id': devId,
      'disable_f_cnt_check': false,
      'f_cnt_down': 0,
      'f_cnt_up': 0,
      'last_seen': 0,
      'nwk_s_key': rec[14].trim(),
      'uses32_bit_f_cnt': true
    }
  }
  // console.log(data)
  return axios.post(url, data, opts)
    .then(res => {
      console.log('CREATED:')
      console.log(data)
    })
    .catch(err => {
      console.error(err)
    })
}
