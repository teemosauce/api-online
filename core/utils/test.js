let methods = ['POST', 'GET']

let _ = []
for (let method of methods) {

  let len =  _.push(method)
  if (method == 'GET') {
    _.unshift('HEAD')
    console.log(111)
  }
}

console.log(_)