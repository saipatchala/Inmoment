const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const path = require('path');

app.use(cors());

app.use('/',express.static(path.join(__dirname,'dist')));

app.get('/status', (req, res) => {
    axios.get("https://oke5yaeave.execute-api.us-west-2.amazonaws.com/prod/status", {
            crossDomain: true,
            headers: {
                "x-api-key": "XKCySm9mvc9aHQI3limEu96L9xNFr8gPhjxqfNpe"
            }
        }).then(response => {
            return res.json(response.data);
        });
})

//Taking care of calling the api and returning the data
app.get('/*/', (req, res) => {
    var acceptablePaths = [
        "/move-to-next-page",
        "/move-to-previous-page",
        "/jump-to-first-page",
        "/jump-to-last-page",
        "/move-to-next-term",
        "/move-to-previous-term",
        "/jump-to-first-term",
        "/jump-to-last-term"];
    
    if (acceptablePaths.includes(req.path)){
        //TODO: returning forbidden error
        axios.post("https://oke5yaeave.execute-api.us-west-2.amazonaws.com/prod"+req.path,{}, {
            crossDomain: true,
            headers: {
                "x-api-key": "XKCySm9mvc9aHQI3limEu96L9xNFr8gPhjxqfNpe"
            }
        }).then(response => {
            return res.json(response.data);
        }).catch(error => {
            console.log(error.response);
        });
    } else {
        res.json("Path not accounted for");
    }

});

app.listen(8080, () =>{
    console.log('server on port 8080');
});