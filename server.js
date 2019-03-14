const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');

app.use(cors());

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

app.listen(8080, () =>{
    console.log('server on port 8080');
});