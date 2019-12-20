const axios = require('axios')
const key = process.env.KEY
const app = process.env.APP

const url = `http://eu.thethings.network:8084/applications/${app}/devices`
const opts = { headers: { 'Authorization': `Key ${key}` } }
axios.get(url, opts)
  .then(res => {
    const promises = res.data.devices.map(i => _deleteDevice(i.dev_id))
    return Promise.all(promises)
  })
  .then(() => {
    console.log('all deleted')
  })
  .catch(err => {
    console.error(err)
  })

// https://www.thethingsnetwork.org/docs/applications/manager/api.html
function _deleteDevice (dev) {
  const url = `http://eu.thethings.network:8084/applications/${app}/devices/${dev}`
  const opts = { headers: { 'Authorization': `Key ${key}` } }
  return axios.delete(url, opts)
    .then(res => {
      console.log(`${dev} deleted`)
    })
    .catch(err => {
      console.error(err)
    })
}
