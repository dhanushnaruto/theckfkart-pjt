
const express = require('express')
const bodyParser = require('body-parser');
const connection = require('./db.js')


const routes = require('./routes.js')

const app = express();
app.use(bodyParser.json());


connection.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("db is connected")
})

app.use('/', routes)





app.listen(3000, ()=>console.log('server is running...'))