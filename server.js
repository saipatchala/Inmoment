const express = require('express')
const app = express()
const port = 3000

app.get('/', (req,res) => {
    res.sendfile(__dirname+"/"+"index.html");
})

/*
app.get('/definition', (req, res) => {
    res.send('Word Sent is: '+req.query.word);
})
*/

app.listen(port, () => console.log(`Example app listening on port ${port}!`))