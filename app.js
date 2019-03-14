import React, { Component } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import 'bulma/bulma'; //CSS framework 
import ReduxPromise from 'redux-promise';

var options = {
    host: "https://oke5yaeave.execute-api.us-west-2.amazonaws.com/prod",
    path: "/status",
    method: "GET",
    headers: {
        "x-api-key": "XKCySm9mvc9aHQI3limEu96L9xNFr8gPhjxqfNpe",
    }
};


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {"something": "result"}

        //TODO: Get this response
        axios.get("http://localhost:8080/status", {

        }).then(response => {
            console.log(response)
        });
        
        

        /*
        const https = require('https');

        https.get('https://oke5yaeave.execute-api.us-west-2.amazonaws.com/prod/status',{headers: {"x-api-key": "XKCySm9mvc9aHQI3limEu96L9xNFr8gPhjxqfNpe"}} ,(resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data).explanation);
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
        });
        */

        this.addItem = this.addItem.bind(this);
    }

    addItem(e) {
        // Prevent button click from submitting form
        e.preventDefault();
    
        // Create variables for our list, the item to add, and our form
        let list = this.state.list;
        const newItem = document.getElementById("addInput");
        const form = document.getElementById("addItemForm");
    
        // If our input has a value
        if (newItem.value != "") {
          // Add the new item to the end of our list array
          list.push(newItem.value);
          // Then we use that to set the state for list
          this.setState({
            list: list
          });
          // Finally, we need to reset the form
          newItem.classList.remove("is-danger");
          form.reset();
        } else {
          // If the input doesn't have a value, make the border red since it's required
          newItem.classList.add("is-danger");
        }
    }
    
    

    render() {
        return (
            <div className="content">
                <div className="container">
                    <section className="section">
                    <p>{JSON.stringify(this.state)}</p>
                    </section>
                    <hr />
                    <section className="section">
                    <form className="form" id="addItemForm">
                        <input
                        type="text"
                        className="input"
                        id="addInput"
                        placeholder="Something that needs ot be done..."
                        />
                        <button className="button is-info" onClick={this.addItem}>
                        Add Item
                        </button>
                    </form>
                    </section>
                    <p id="currentPage"></p>
                </div>
            </div>
          )
      }
  }

ReactDOM.render(<App />, document.getElementById('app'));

/*
 * Finds the definition of the word sent
 */
function findDefinition(word){
    
    //Start by getting the current status of the robot
    

    
}

function currentStatus(){
    const https = require('https');
    https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        console.log(JSON.parse(data).explanation);
    });

    }).on("error", (err) => {
    console.log("Error: " + err.message);
    });
}

function moveToCorrectPage(){

}

/*
 * Given first and last string find the closest string to query
 */
function findClosestMatch(first, last, query){

}