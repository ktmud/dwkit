var express = require('express')
var serveStatic = require('serve-static')
var env = process.env
var app = express()
var static = serveStatic('static')

app.use(static)

app.listen(env.PORT || 3000)




