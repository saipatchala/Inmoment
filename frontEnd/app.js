import React, { Component } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import 'bulma/bulma'; //CSS framework 
import ReduxPromise from 'redux-promise';

const apiUrl = "http://localhost:8080/";
const firstTerm = "A";
const lastTerm = "ZYTHEPSARY";


class App extends Component {
    constructor(props) {
        super(props);

        //Default state
        this.state = {"state": {"status": "READY","timeUsed": 90885, "timeRemaining": 513914, "currentPageIndex": 0, "currentTermIndex": 0, "currentTerm": "A", "currentTermDefinition": "The first letter of the English and of many other alphabets.The capital A of the alphabets of Middle and Western Europe, as alsothe small letter (a), besides the forms in Italic, black letter,etc., are all descended from the old Latin A, which was borrowed fromthe Greek Alpha, of the same form; and this was made from the firstletter (Aleph, and itself from the Egyptian origin. The Aleph was aconsonant letter, with a guttural breath sound that was not anelement of Greek articulation; and the Greeks took it to representtheir vowel Alpha with the ä sound, the Phoenician alphabet having novowel symbols. This letter, in English, is used for several differentvowel sounds. See Guide to pronunciation, §§ 43-74. The regular longa, as in fate, etc., is a comparatively modern sound, and has takenthe place of what, till about the early part of the 17th century, wasa sound of the quality of ä (as in far).", "hasNextPage": true, "hasNextTerm": true, "hasPreviousPage": false, "hasPreviousTerm": false},
            "searchTerm": "Basic",
            "showChildren": false
        }

        this.searchItem = this.searchItem.bind(this);
        this.iterateTillCondition = this.iterateTillCondition.bind(this);
        this.goForward = this.goForward.bind(this);
        this.goBackward = this.goBackward.bind(this);
        this.callApiOnce = this.callApiOnce.bind(this);
        this.findTermOnRightPage = this.findTermOnRightPage.bind(this);
        
        //Get current robot location on page load
        this.callApiOnce("status").then(() =>{}) 
    }

    searchItem(e) {
        // Prevent button click from submitting form
        e.preventDefault();

        //TODO: Sanitize input
        const searchTerm = document.getElementById("addInput").value.toString().toLowerCase();

        this.setState({
            searchTerm: searchTerm
        });

        /*
        this.findTermOnRightPage().then(() => {
            console.log("order6");
        });
        return;
        */

        //Find the closest to the current term to decide starting point for robot
        var result = findClosestMatch([firstTerm,this.state.state.currentTerm,lastTerm],searchTerm);
        console.log(result);

        //If the current term is what we are looking for
        if (result.forward === 0){
            this.setState({
                showChildren: true
            });
            return;
        } 

        //Edge conditions of items is before the dictionary and item is after dictionary
        if (result.minIndex === 0 && result.forward === -1){
            searchItem.classList.add("is-danger");
            return;
        } else if (result.minIndex === 2 && result.forward === 1){
            searchItem.classList.add("is-danger");
            return;
        }
        
        //Get to the right page
        if (result.minIndex == 0) { //closest to the first page

            this.callApiOnce("jump-to-first-page").then(() => {
                this.callApiOnce("jump-to-first-term").then(() => {
                    this.goForward();
                })
            })
        } else if (result.minIndex == 2) { //closest to the last page
            this.callApiOnce("jump-to-last-page").then(() => {
                this.callApiOnce("jump-to-last-term").then(() => {
                    this.goBackward();
                })
            })
        } else { //Closest to the current position

            if (result.forward === 1){
                this.callApiOnce("jump-to-last-term").then(() => {
                    if (this.state.state.currentTerm.localeCompare(searchTerm) == 0){
                        //TODO: Call function to set definition
                    } else if (this.state.state.currentTerm.localeCompare(searchTerm) === -1){ //inbetween current & last
                        this.iterateTillCondition("move-to-previous-term",searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == 1",{},"currentTermIndex"); 
                    } else { //repeat front logic
                        this.goForward();
                    }
                })
            } else if (result.forward === -1){
                this.callApiOnce("jump-to-first-term").then(() => {
                    if (this.state.state.currentTerm.localeCompare(searchTerm) == 0){
                        //TODO: Call function to show definition
                    } else if (this.state.state.currentTerm.localeCompare(searchTerm) === 1){ //inbetween current & first
                        this.iterateTillCondition("move-to-next-term",searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == -1",{},"currentTermIndex"); 
                    } else { //repeat back logic
                        this.goBackward();
                    }
                })
            }
        }

        console.log("Got to the End");
        //form.reset();
    }

    /**
     * Recursively call api till evalPhrase is met.
     * @param {name of the api to be called} apiPhrase 
     * @param {the term we are looking for} searchTerm 
     * @param {the phrase till this loop iteration stops} evalPhrase 
     * @param {hashmap to keep track of places visited} alreadyVisited 
     * @param {variable to keep track of for the hashmap} loopVariable 
     */
    iterateTillCondition(apiPhrase, searchTerm, evalPhrase, alreadyVisited, loopVariable) {
        return (axios.get(apiUrl+apiPhrase, {}).then(response => {

            this.setState({
                state: response.data
            });
            
            //Check if we are in a loop
            if (alreadyVisited[response.data[loopVariable]] !== undefined){
                return;
            } else {
                alreadyVisited[response.data[loopVariable]] = true;
            }

            response.data.currentTerm = response.data.currentTerm.toLowerCase();
            //console.log("CurrentTerm: "+response.data.currentTerm+" SearchTerm: "+searchTerm+" eval(): "+eval(evalPhrase));
            if (eval(evalPhrase)){
                return this.iterateTillCondition(apiPhrase, searchTerm, evalPhrase, alreadyVisited, loopVariable)
            } else {
                return Promise.resolve("FinalResolution");
            }
        }));
    }

    //Function for calling api once
    callApiOnce(apiPhrase){
        return (axios.get(apiUrl+apiPhrase, {}).then(response => {
            if (response.status === 200){
                this.setState({
                    state: response.data
                });
                return Promise.resolve(response.data);
            }else{
                return Promise.reject(response);
            }  
        }))
    }

    goForward(){
        this.iterateTillCondition("move-to-next-page",this.state.searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == -1",{},"currentPageIndex").then(()=>{
            this.callApiOnce("move-to-previous-page").then(() => {
                return this.findTermOnRightPage(); 
            })
        })
    }

    goBackward(){
        this.iterateTillCondition("move-to-previous-page",this.state.searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == 1",{},"currentPageIndex").then(()=>{
            this.callApiOnce("move-to-next-page").then(() => {
                return this.findTermOnRightPage(); 
            })
        })
    }

    /*
     * After finding the right page call this funciton to find the term efficiently
     */
    findTermOnRightPage(){
        var firstTerm;
        var lastTerm;

        //Promise that would set the correct first and last term
        return(new Promise((resolve,reject) => {
            //currently on first term
            if (this.state.state.hasNextTerm == true && this.state.state.hasPreviousTerm == false){
                firstTerm = this.state.state.currentTerm;
                resolve(this.callApiOnce("jump-to-last-term").then(() => {
                    lastTerm = this.state.state.currentTerm;
                }));
            //Currently on last term
            } else if (this.state.state.hasNextTerm == false && this.state.state.hasPreviousTerm == true){
                lastTerm = this.state.state.currentTerm;
                resolve(this.callApiOnce("jump-to-first-term").then(() => {
                    firstTerm = this.state.state.currentTerm;
                }))
            } else{
                throw new Error("Reached a place in findTermRightPage that shouldn't exist");
            }
        }).then(() => {
            var compare = findClosestMatch([firstTerm,lastTerm],this.state.searchTerm);

            if (compare.minIndex === 0 && compare.forward === 1){
                return this.iterateTillCondition("move-to-next-term",this.state.searchTerm,"response.data.currentTerm.toLo.localeCompare(searchTerm) == -1",{},"currentTermIndex"); 
            } else if (compare.minIndex === 1 && compare.forward === -1) {
                return this.iterateTillCondition("move-to-previous-term",this.state.searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == 1",{},"currentTermIndex"); 
            } else{
                throw new Error("Reach a state that shouldn't exist");
            }
        }))
    }

    render() {
        return (
            <div className="content">
                <div className="container">
                    <section className="section">
                    <form className="form" id="searchItemForm" position="absolute" top="311px">
                        <input type="text" className="input" id="addInput" placeholder="Type your input here" />
                        <button className="button is-info" onClick={this.searchItem}>
                        Search
                        </button>
                    </form>
                    </section>
                    <section className = "CurrentRobot">
                    <p> Robot is currently looking at: {this.state.state.currentTerm}</p>
                    <p> Robot is at the page number: {this.state.state.currentPageIndex}</p>
                    { this.state.showChildren ? <p>Got Results</p> : null }
                    </section>
                </div>
            </div>
          )
      }
  }

ReactDOM.render(<App />, document.getElementById('app'));


/*
 * Given multiple strings find the closest string to query
 */
function findClosestMatch(inputs, query){
    var forward = [];

    var temp = 0;
    var tempChar = 0;
    var min = 0;
    var minIndex = 0;

    query = query.toString().toLowerCase();


    //Sum up differences between the characters with the starting character being the highest priority
    for (var i = 0; i < inputs.length; i++){
        temp = 0;
        inputs[i] = inputs[i].toString().toLowerCase();
        for (var j = 0; j < query.length; j++){
            if (isNaN(inputs[i].charCodeAt(j))){
                //Character a
                tempChar = 97;
            }else{
                tempChar = inputs[i].charCodeAt(j);
            }
            temp += Math.abs(Math.pow(10,query.length-j)*(query.charCodeAt(j)-tempChar));
        }

        if (i === 0) {
            min = temp;
        }

        if (temp < min){
            min = temp;
            minIndex = i;
        }
    }

    return {"minIndex": minIndex, "forward": query.toString().localeCompare(inputs[minIndex])}

}

/*
var Q = require("q");

// `condition` is a function that returns a boolean
// `body` is a function that returns a promise
// returns a promise for the completion of the loop
function promiseWhile(condition, body) {
    var done = Q.defer();

    function loop() {
        // When the result of calling `condition` is no longer true, we are
        // done.
        if (!condition()) return done.resolve();
        // Use `when`, in case `body` does not return a promise.
        // When it completes loop again otherwise, if it fails, reject the
        // done promise
        Q.when(body(), loop, done.reject);
    }

    // Start running the loop in the next tick so that this function is
    // completely async. It would be unexpected if `body` was called
    // synchronously the first time.
    Q.nextTick(loop);

    // The promise
    return done.promise;
}


// Usage
var index = 1;
promiseWhile(function () { return index <= 11; }, function () {
    console.log(index);
    index++;
    return Q.delay(500); // arbitrary async
}).then(function () {
    console.log("done");
}).done();
*/