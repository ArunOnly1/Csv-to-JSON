const express = require('express')
const csv = require('csvtojson')
const app = express()
const multer = require('multer')
const port = 5000

app.use(express.json())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/upload/')
  },
  fileName: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
  },
})
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (file.mimetype.includes('csv')) {
      cb(null, true)
    } else {
      cb('Please upload an csv  file')
    }
  },
})

// *Guide
// While trying this route through postman
// the filename must be "csv_file"
app.get('/csvtojson', upload.single('csv_file'), (req, res) => {
  const csvFilePath = __dirname + '/upload/' + req.file.filename
  try {
    csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        const data = jsonObj
        // To convert geolocation into latitude and longitude
        const formattedToLatAndLong = data.map((d) => {
          if (d.id !== '') {
            let [latitude, longitude] =
              d.geopoint !== '' ? d.geopoint.split(',') : [-200, 200]
            if (+latitude >= -90 && +latitude <= 90) {
              d.latitude = +latitude
            }
            if (+longitude >= -180 && +longitude <= 180) {
              d.longitude = +longitude
            }
            delete d.geopoint
            return d
          }
        })

        // To remove {}=>empty Objects
        // blank row generates empty Objects
        const nullFiltered = formattedToLatAndLong.filter((data) => data)

        //  To remove empty fields or fields corresponding to null
        nullFiltered.forEach((d) => {
          const arrKeys = Object.keys(d)
          for (let i = 0; i <= arrKeys.length; i++) {
            if (d[arrKeys[i]] === '' || d[arrKeys[i]] === null) {
              delete d[arrKeys[i]]
            }
          }
        })

        res.status(200).send({ data: nullFiltered })
      })
  } catch (error) {
    // TODO:Ask pradeep dai to handle error gracefully
    res.status(500).send({ error: error.message })
  }
})
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
