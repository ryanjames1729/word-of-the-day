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
    

    return (
        <div>
        <h1>Word of the Day</h1>
        <h2>Guess the Word!</h2>
        <p>Number of guesses: {guessNumber}</p>
        <form onSubmit={(event)=>{
            event.preventDefault();
            console.log('submit', guess)
            setGameStart(true);
            if(guess.length != 5 || guessArrayBefore.includes(guess.toUpperCase()) || guessArrayAfter.includes(guess.toUpperCase()) || !wordArray.includes(guess.toUpperCase())) {
                return
            }
            else{
                if(wordDictionary[new Date().toDateString()].localeCompare(guess.toUpperCase()) > 0) {
                    setGuessArrayBefore([...guessArrayBefore, guess.toUpperCase()]);
                    guessArrayBefore.sort();
                } else if(wordDictionary[new Date().toDateString()].localeCompare(guess.toUpperCase()) < 0) {
                    setGuessArrayAfter([...guessArrayAfter, guess.toUpperCase()]);
                    guessArrayAfter.sort();
                }
                setGuessNumber(guessNumber + 1);
            }
            setGuess("");
            //setTimeout(() => {setGameStart(false)}, 3000)
        }}>
            <p>Guesses before the word:</p>
            <ul>
                {guessArrayBefore.map((guess, index) => <li key={index}>{guess}</li>)}
            </ul>
            <label htmlFor="guess">Enter your guess:</label><br />
            <input type="text" id="guess" name="guess" maxLength={5} value={guess} onChange={(event)=>{
                setGuess(event.target.value);
            }}/>
            <p>Guesses after the word:</p>
            <ul>
                {guessArrayAfter.map((guess, index) => <li key={index}>{guess}</li>)}
            </ul>
            <br />
            {guessNumber < 5 ? <button type="submit">Submit</button> : null}
            {guessNumber === 5 ? <button type="reset" onClick={()=>{
                setGuessNumber(0);
                setGuessArrayBefore([]);
                setGuessArrayAfter([]);
            }}>Reset</button> : null}
            {guessNumber === 5 ? <p>You are out of guesses! Hit reset to try again!</p> : null}
            {wordDictionary[new Date().toDateString()] === guess.toUpperCase() && gameStart ? <div>
                <h2>You guessed the word!</h2>
                <p>
            Today's word is: {wordDictionary[new Date().toDateString()]}<br />
            More on Google: <a href={`https://www.google.com/search?q=${wordDictionary[new Date().toDateString()].toLowerCase()}+definition`}>{wordDictionary[new Date().toDateString()]}</a>
        </p></div> : null}
            {/* {guess.length != 5 && gameStart ? <p>Your guess must be 5 letters long!</p> : null}
            {guessArrayBefore.includes(guess.toUpperCase()) || guessArrayAfter.includes(guess.toUpperCase()) ? <p>You already guessed that word!</p> : null}
            {wordArray.includes(guess.toUpperCase()) && gameStart ? null : <p>Your guess is not a word!</p>}
             */}
        </form>
        </div>
    );
}