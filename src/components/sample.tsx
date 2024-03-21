import type { isRenderInstruction } from "astro/runtime/server/render/instruction.js";
import wordList from "./wordList"
import { useState, useEffect, useRef } from "react";

import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

function createWordArray() {
    const words = wordList();
    let scrabbleWords = words.split(" ").filter(word => word.length === 5).join("\n");
    //scrabbleWords = words.split(" ").filter(word => word.length === 5 && word.match(/[a-zA-Z]/)).join("\n");
    let wordArray = scrabbleWords.split("\n");
    wordArray = wordArray.filter((word, index) => wordArray.indexOf(word) === index);
    return wordArray;
}

function createWordDictionary(arr: string[]) {
    // create a dictionary with the date as the key starting with Jan 1, 2024 and the wordArray as the value
    let wordDictionary: { [key: string]: string} = {};
    let date = new Date("2024-01-01");
    for (let i = 0; i < arr.length; i++) {
        wordDictionary[date.toDateString()] = arr[i];
        date.setDate(date.getDate() + 1);
    } 
    return wordDictionary;
}

export default function Sample() {
    const { width, height } = useWindowSize()

    const [wordArray, setWordArray] = useState<string[]>(createWordArray());
    const [wordDictionary, setWordDictionary] = useState<{ [key: string]: string}>(createWordDictionary(wordArray));
    
    useEffect(() => {
        setWordArray(createWordArray());
        setWordDictionary(createWordDictionary(wordArray));
    }, []);
    


    const [guessNumber, setGuessNumber] = useState(0);
    const [guess, setGuess] = useState("");
    const [guessArrayBefore, setGuessArrayBefore] = useState<string[]>(["?????", "?????", "?????"]);
    const [guessArrayAfter, setGuessArrayAfter] = useState<string[]>(["[[[[[", "[[[[[", "[[[[["]);
    const [messageAlert, setMessageAlert] = useState("");
    const [round, setRound] = useState(1);
    const [solutionArray, setSolutionArray] = useState<string[]>(wordDictionary[new Date().toDateString()].split(""));
    const [solution, setSolution] = useState(wordDictionary[new Date().toDateString()].toUpperCase());
    const [welcomeMsg, setWelcomeMsg] = useState(true);
    const [cookie, setCookie] = useState(document.cookie);

    return (
        <div className="flex flex-col justify-center place-items-center lg:w-full w-5/6 max-h-screen bg-[#8AA8A1] rounded-lg lg:py-1 pb-1 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#f97316,0_0_15px_#f97316,0_0_30px_#f97316]">
        {welcomeMsg && !cookie ? <div className="flex flex-col justify-center place-items-center p-2 lg:w-1/2 -mt-10 absolute z-10 mx-1 lg:mx-0 bg-slate-500 text-white rounded-md border-solid border-slate-700">
            <h2 className="underline text-bold decoration-6 text-3xl">How to Play</h2>
            <p className="p-5">Using the alphabetical order of your guesses, see if you can determine the missing word in 5 guesses of less!
            <br /><br />
            Use the words before and after to narrow down where the correct word is alphabetically. Letters will turn green when they are correct letters in the solution.
            </p>
            <img src="/sample_game.png" alt="Sample Game" className="w-1/4" />
            <p className="p-5">In this example, the solution is alphabetically between DEATH and ROUND and includes the letters OU and H.</p>

            <button className="bg-blue-400 hover:bg-blue-500 hover:text-bold rounded-md p-2 shadow-inner border-black border-2 border-solid" onClick={()=>{
                setWelcomeMsg(false);
                document.cookie = "introduction=true; max-age=1209600; path=/";
            }}>Ok, I get it. Let me play.</button>
            </div> : null}
        <p className="text-4xl">
            Round #{round}<br />
            {guessNumber === 1 ? '🤦' : 
        guessNumber === 2 ? '🤦 🤦' :
        guessNumber === 3 ? '🤦 🤦 🤦' :
        guessNumber === 4 ? '🤦 🤦 🤦 🤦' : 
        guessNumber === 5 ? '🤦 🤦 🤦 🤦 🤦' : ' '}</p>
        <form onSubmit={(event)=>{
            event.preventDefault();
            if(guessArrayBefore.includes(guess.toUpperCase()) || guessArrayAfter.includes(guess.toUpperCase())) {
                setMessageAlert("Invalid guess. Please enter a 5 letter word that has not been guessed before.")
            }
            else if(guess.length != 5) {
                setMessageAlert("Invalid guess. Please enter a 5 letter word.")
            }
            else if(!wordArray.includes(guess.toUpperCase())){
                setMessageAlert("Invalid guess. Please enter a word that exists in the Scrabble dictionary.")
            }
            else{
                if(solution.localeCompare(guess.toUpperCase()) > 0) {
                    if(guessArrayBefore.indexOf("?????") > -1) {
                        guessArrayBefore.splice(guessArrayBefore.indexOf("?????"), 1);
                    }
                    guessArrayBefore.push(guess.toUpperCase());
                    guessArrayBefore.sort();
                    setGuessArrayBefore(guessArrayBefore.sort())
                    setGuessNumber(guessNumber + 1);
                } else if(solution.localeCompare(guess.toUpperCase()) < 0) {
                    if(guessArrayAfter.indexOf("[[[[[") > -1) {
                        guessArrayAfter.splice(guessArrayBefore.indexOf("[[[[["), 1);
                    }
                    guessArrayAfter.push(guess.toUpperCase());
                    guessArrayAfter.sort();
                    setGuessArrayAfter(guessArrayAfter.sort());
                    setGuessNumber(guessNumber + 1);
                } else if(solution === guess.toUpperCase()) {
                    setMessageAlert("You guessed the word!");
                }
            }   
            setGuess("");
            console.log(guessArrayBefore)
            //setTimeout(() => {setGameStart(false)}, 3000)
        }}>
            <div className="flex flex-col justify-center place-items-center">
            <p>Guesses before the word:</p>
            <ul className="text-4xl">
            {guessArrayBefore.map((guess, index) => <li className="list-none font-mono mb-2" key={index}>{guess.split("").map((char, i) => 
            solutionArray[i] === char ? <span key={i} className="border-black border-2 px-1 mx-0.5 border-solid rounded-sm text-green-900 bg-orange-200 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_3px_#86efac,0_0_10px_#86efac,0_0_20px_#86efac]">{char}</span> :
            char === "?" ? <div className="h-2"></div> :   
            <span key={i} className="border-black border-2 px-1 mx-0.5 border-solid rounded-sm bg-orange-200">{char}</span>)}</li>)}
            </ul>
            <input className="text-black text-5xl w-1/2 text-center lg:w-1/4 font-mono uppercase" type="text" id="guess" name="guess" maxLength={5} value={guess} onChange={(event)=>{
                setGuess(event.target.value);
                //setMessageAlert("");
            }}/>
            <p>Guesses after the word:</p>
            <ul className="text-4xl">
            {guessArrayAfter.map((guess, index) => <li className="list-none font-mono mb-2" key={index}>{guess.split("").map((char, i) => 
            solutionArray[i] === char ? <span key={i} className="border-black border-2 px-1 mx-0.5 border-solid rounded-sm text-green-900 bg-orange-200 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_3px_#86efac,0_0_10px_#86efac,0_0_20px_#86efac]">{char}</span> :
            char === "[" ? <div className="h-2"></div> :   
            <span key={i} className="border-black border-2 px-1 mx-0.5 border-solid rounded-sm bg-orange-200">{char}</span>)}</li>)}
            </ul>
            
            <br />
            {guessNumber < 5 ? <button type="submit" className="bg-blue-400 hover:bg-blue-500 hover:text-bold rounded-md p-2 shadow-inner border-black border-2 border-solid">Submit</button> : null}
            {guessNumber === 5 ? <button type="reset" className="bg-red-400 hover:bg-red-500 hover:text-bold rounded-md p-2 shadow-2xl border-black border-2 border-solid" onClick={()=>{
                setGuessNumber(0);
                setGuessArrayBefore(["?????", "?????", "?????"]);
                setGuessArrayAfter(["[[[[[", "[[[[[", "[[[[["]);
                setRound(round + 1);
            }}>Reset</button> : null}
            {/* {messageAlert ? <p className="p-3">{messageAlert}</p> : null} */}
            {guessNumber === 5 ? <p className="p-3">You are out of guesses! Hit reset to try again!</p> : null}

        {messageAlert === "You guessed the word!" ? <div className="flex flex-col justify-center place-items-center p-2 min-h-48 lg:w-1/2 -mt-10 absolute z-10 mx-1 lg:mx-0 bg-slate-500 text-white rounded-md border-solid border-slate-700">
        {width > 460 ? <Confetti width={width*0.5} height={height*0.7} /> : <Confetti width={width*0.8} height={height*0.8} />}
        
            <h2 className="text-bold text-3xl">Congratulations!</h2>
            <p className="p-5">
            Today's word is: {solution}<br />
            Find out more on Google: <a className="text-orange-500 underline decoration-4" href={`https://www.google.com/search?q=${solution.toLowerCase()}+definition`}>{solution}</a>
            </p>
            <button className="bg-blue-400 hover:bg-blue-500 hover:text-bold rounded-md p-2 shadow-2xl shadow-inner border-black border-2 border-solid" onClick={()=>{
                setMessageAlert("");
            }}>Close</button>
            </div> : null }
        {messageAlert && messageAlert != "You guessed the word!" ? <div className="flex flex-col justify-center place-items-center p-2 lg:w-1/2 min-h-48 -mt-10 absolute z-10 mx-1 lg:mx-0 bg-slate-500 text-white rounded-md border-solid border-slate-700">
                <p>{messageAlert}</p>
                <button className="bg-blue-400 hover:bg-blue-500 hover:text-bold rounded-md p-2 shadow-2xl shadow-inner border-black border-2 border-solid" onClick={()=>{
                setMessageAlert("");
            }}>Close</button>
                </div>: null
        }    

        </div>
        </form>
        <button className="pt-8 decoration-6 underline text-red-700 hover:text-slate-800" onClick={()=>{
            document.cookie = 'introduction=; Max-Age=0; path=/;'
            setCookie(document.cookie);
            setWelcomeMsg(true); 
        }}>Help Me Please</button>
        </div>
    );
}