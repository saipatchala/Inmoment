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
            "showChildren": false
        }

        this.searchItem = this.searchItem.bind(this);
        this.callApiOnce = this.callApiOnce.bind(this);
        this.iterateTillCondition = this.iterateTillCondition.bind(this);

        axios.get(apiUrl+"status", {}).then(response => {
            if (response.status === 200){
                this.setState({
                    state: response.data
                });
            }else{
                throw Error("Failed API response");
            }  
        })
        
        axios.get(apiUrl+"jump-to-first-page", {}).then(response => {
            if (response.status === 200){
                this.setState({
                    state: response.data
                });
            }else{
                throw Error("Failed API response");
            }  
        })
        
    }

    searchItem(e) {
        // Prevent button click from submitting form
        e.preventDefault();
    
        //TODO: Sanitize input
        const searchTerm = document.getElementById("addInput").value.toString().toLowerCase();

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
        if (result.minIndex == 0) {
            axios.get(apiUrl+"jump-to-first-page", {}).then(response => {
                axios.get(apiUrl+"jump-to-first-term", {}).then(response => {
                    this.setState({
                        state: response.data
                    });
                    console.log("Jumped to first term");
                    //TODO: These need to happen in order:
                    this.iterateTillCondition("move-to-next-page",searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == -1",{},"currentPageIndex"); 
                    axios.get(apiUrl+"move-to-last-page", {}).then(response => {
                        this.iterateTillCondition("move-to-next-term",searchTerm,"response.data.currentTerm.localeCompare(searchTerm) == -1",{},"currentTermIndex"); 
            })})})
        } else if (result.minIndex == 2) {
            axios.get(apiUrl+"jump-to-last-term", {}).then(response => {
                if (response.status === 200){
                    this.setState({
                        state: response.data
                    });
                }else{
                    throw Error("Failed API response");
                }  
            })
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
        axios.get(apiUrl+apiPhrase, {

        }).then(response => {
            this.setState({
                state: response.data
            });
            
            //Check if we are in a loop
            if (alreadyVisited[response.data[loopVariable]] !== undefined){
                return;
            } else {
                alreadyVisited[response.data[loopVariable]] = true;
            }

            if (eval(evalPhrase)){
                this.iterateTillCondition(apiPhrase, searchTerm, evalPhrase);
            } else {
                return;
            }

        });
    }

    //Function for calling api once
    callApiOnce(apiPhrase){
        return new Promise(function (resolve, reject) {
            axios.get(apiUrl+"status", {

            }).then(response => {
                if (response.status === 200){
                    this.setState({
                        state: response.data
                    });
                    resolve();
                }else{
                    reject(response.status);
                }  
            })
        })
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