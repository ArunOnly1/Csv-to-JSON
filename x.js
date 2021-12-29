const obj = {
  name: 'arun',
  age: '',
  sex: '',
}

console.log(Object.values(obj).length)

const geolocation = ''
const [lat, long] = geolocation.split(',')
console.log('lat', lat == null)
console.log('long', long == null)
