import React, { useState, useEffect } from 'react';

const LetterTile = ({ letter, onClick }) => {
    return (
        <div className="draggable-item" onClick={onClick}>
            {letter}
        </div>
    );
};

const WordBuilder = ({ words, updateScore, onCompletion }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [shuffledLetters, setShuffledLetters] = useState([]);
    const [userWord, setUserWord] = useState([]);
    const [isCorrect, setIsCorrect] = useState(null);

    useEffect(() => {
        if (currentWordIndex < words.length) {
            const letters = words[currentWordIndex].word.split('');
            setShuffledLetters(shuffleArray([...letters]));
            setUserWord(Array(letters.length).fill(null));
        }
    }, [currentWordIndex, words]);

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleLetterClick = (letter, index) => {
        const firstEmptyIndex = userWord.indexOf(null);
        if (firstEmptyIndex !== -1) {
            const updatedUserWord = [...userWord];
            updatedUserWord[firstEmptyIndex] = { letter, index };
            setUserWord(updatedUserWord);
            setShuffledLetters(
                shuffledLetters.map((l, i) => (i === index ? null : l))
            );
        }
    };

    const handleUserLetterClick = (index) => {
        const letterObj = userWord[index];
        if (letterObj !== null) {
            const updatedShuffledLetters = [...shuffledLetters];
            updatedShuffledLetters[letterObj.index] = letterObj.letter;
            setShuffledLetters(updatedShuffledLetters);

            const updatedUserWord = [...userWord];
            updatedUserWord[index] = null;
            setUserWord(updatedUserWord);
        }
    };

    const handleCheck = () => {
        const currentWord = words[currentWordIndex].word;
        const userWordString = userWord.map(obj => obj?.letter || '').join('');
        const correct = currentWord === userWordString;
        setIsCorrect(correct);

        if (correct) {
            updateScore(100, 1); // 1 point for each correct word
            if (currentWordIndex < words.length - 1) {
                setTimeout(() => {
                    setCurrentWordIndex(prevIndex => prevIndex + 1);
                    setIsCorrect(null);
                }, 1000);
            } else {
                onCompletion();
            }
        }
    };

    const handleReset = () => {
        const letters = words[currentWordIndex].word.split('');
        setShuffledLetters(shuffleArray([...letters]));
        setUserWord(Array(letters.length).fill(null));
        setIsCorrect(null);
    };

    if (currentWordIndex >= words.length) {
        return <div className="completion-message">All words completed!</div>;
    }

    return (
        <div className="word-builder-game">
            <div className="word-prompt">{words[currentWordIndex].prompt}</div>
            <div className="user-word-container">
                {userWord.map((obj, index) => (
                    <div
                        key={index}
                        className="letter-box"
                        onClick={() => handleUserLetterClick(index)}
                    >
                        {obj?.letter || ''}
                    </div>
                ))}
            </div>
            <div className="shuffled-letters-container">
                {shuffledLetters.map((letter, index) =>
                    letter ? (
                        <LetterTile
                            key={index}
                            letter={letter}
                            onClick={() => handleLetterClick(letter, index)}
                        />
                    ) : (
                        <div key={index} className="empty-space"></div>
                    )
                )}
            </div>
            <div className="button-container">
                <button className="reset-button" onClick={handleReset}>Reset</button>
                <button className="submit-button" onClick={handleCheck}>Check</button>
            </div>
            {isCorrect !== null && (
                <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? 'Correct!' : 'Try again'}
                </div>
            )}
        </div>
    );
};

export default WordBuilder;
