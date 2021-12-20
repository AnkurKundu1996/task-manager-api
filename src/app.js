const express = require('express')
require('./db/mongoose')
const userRouter = require('./router/userRouter')
const taskRouter = require('./router/taskRouter')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server started on port '+port+'.')
})