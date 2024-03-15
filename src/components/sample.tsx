import type { isRenderInstruction } from "astro/runtime/server/render/instruction.js";
import wordList from "./wordList"
import { useState } from "react";



export default function Sample() {
    const words = wordList();
    let scrabbleWords = words.split(" ").filter(word => word.length === 5).join("\n");
    // remove words that dont have letters
    scrabbleWords = words.split(" ").filter(word => word.length === 5 && word.match(/[a-zA-Z]/)).join("\n");
    // build array from scrabbleWords
    let wordArray = scrabbleWords.split("\n");
    // remove words that dont contain only letters from the array
    wordArray = wordArray.filter(word => word.match(/^[a-zA-Z]+$/));
    // shift all to uppercase and remove duplicates
    wordArray = wordArray.map(word => word.toUpperCase());
    wordArray = wordArray.filter((word, index) => wordArray.indexOf(word) === index);

    // create a dictionary with the date as the key starting with Jan 1, 2024 and the wordArray as the value
    let wordDictionary: { [key: string]: string} = {};
    let date = new Date("2024-01-01");
    for (let i = 0; i < wordArray.length; i++) {
        wordDictionary[date.toDateString()] = wordArray[i];
        date.setDate(date.getDate() + 1);
    }

    const [guessNumber, setGuessNumber] = useState(0);
    const [guess, setGuess] = useState("");
    const [guessArrayBefore, setGuessArrayBefore] = useState<string[]>([]);
    const [guessArrayAfter, setGuessArrayAfter] = useState<string[]>([]);
    const [gameStart, setGameStart] = useState(false);
    const [messageAlert, setMessageAlert] = useState("");
    

    return (
        <div className="flex flex-col justify-center place-items-center bg-[#8AA8A1] rounded-lg lg:py-4 py-2 shadow-lg shadow-orange-500">
        <p className="text-4xl">{guessNumber === 1 ? '🤦' : 
        guessNumber === 2 ? '🤦 🤦' :
        guessNumber === 3 ? '🤦 🤦 🤦' :
        guessNumber === 4 ? '🤦 🤦 🤦 🤦' : 
        guessNumber === 5 ? '🤦 🤦 🤦 🤦 🤦' : ' '}</p>
        <form onSubmit={(event)=>{
            event.preventDefault();
            console.log('submit', guess)
            setGameStart(true);
            if(guess.length != 5 || guessArrayBefore.includes(guess.toUpperCase()) || guessArrayAfter.includes(guess.toUpperCase()) || !wordArray.includes(guess.toUpperCase())) {
                setMessageAlert("Invalid guess. Please enter a 5 letter word that has not been guessed before.");
            }
            else{
                if(wordDictionary[new Date().toDateString()].localeCompare(guess.toUpperCase()) > 0) {
                    guessArrayBefore.push(guess.toUpperCase());
                    guessArrayBefore.sort();
                    // setGuessArrayBefore([...guessArrayBefore.sort(), guess.toUpperCase()]);
                    setGuessArrayBefore(guessArrayBefore.sort())
                } else if(wordDictionary[new Date().toDateString()].localeCompare(guess.toUpperCase()) < 0) {
                    guessArrayAfter.push(guess.toUpperCase());
                    guessArrayAfter.sort();
                    //setGuessArrayAfter([...guessArrayAfter, guess.toUpperCase()]);
                    setGuessArrayAfter(guessArrayAfter.sort());
                } else if(wordDictionary[new Date().toDateString()] === guess.toUpperCase()) {
                    setMessageAlert("You guessed the word!");
                }
                setGuessNumber(guessNumber + 1);
            }   
            setGuess("");
            console.log(guessArrayBefore)
            //setTimeout(() => {setGameStart(false)}, 3000)
        }}>
            <div className="flex flex-col justify-center place-items-center">
            <p>Guesses before the word:</p>
            <ul className="text-4xl">
                {guessArrayBefore.map((guess, index) => <li className="list-none font-mono" key={index}>{guess}</li>)}
            </ul>
            <input className="text-black text-5xl w-1/3 lg:w-1/4 font-mono uppercase" type="text" id="guess" name="guess" maxLength={5} value={guess} onChange={(event)=>{
                setGuess(event.target.value);
            }}/>
            <p>Guesses after the word:</p>
            <ul className="text-4xl">
                {guessArrayAfter.map((guess, index) => <li className="list-none font-mono" key={index}>{guess}</li>)}
            </ul>
            
            <br />
            {guessNumber < 5 ? <button type="submit" className="bg-blue-400 rounded-md p-2[[]]]]]]]]]]]]][][] shadow-2xl">Submit</button> : null}
            {guessNumber === 5 ? <button type="reset" className="bg-red-400 rounded-md p-2 shadow-2xl" onClick={()=>{
                setGuessNumber(0);
                setGuessArrayBefore([]);
                setGuessArrayAfter([]);
            }}>Reset</button> : null}
            {messageAlert ? <p>{messageAlert}</p> : null}
            {guessNumber === 5 ? <p>You are out of guesses! Hit reset to try again!</p> : null}
            {messageAlert === "You guessed the word!" ? <div className="text-center">
                <p>
            Today's word is: {wordDictionary[new Date().toDateString()]}<br />
            Find out more on Google: <a className="text-orange-500 underline decoration-4" href={`https://www.google.com/search?q=${wordDictionary[new Date().toDateString()].toLowerCase()}+definition`}>{wordDictionary[new Date().toDateString()]}</a>
        </p></div> : null}
        </div>
        </form>
        </div>
    );
}