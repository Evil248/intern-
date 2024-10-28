import React, { useState, useEffect, useMemo, useCallback } from 'react';

const WordGrid = ({ words, updateScore, onCompletion }) => {
    const size = 7; // Fixed size to 7x7
    const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

    // Generate and memoize the board
    const board = useMemo(() => {
        const newBoard = Array(size).fill().map(() => Array(size).fill(''));

        const placeWord = (word, row, col, isHorizontal) => {
            for (let i = 0; i < word.length; i++) {
                if (isHorizontal) {
                    newBoard[row][col + i] = word[i];
                } else {
                    newBoard[row + i][col] = word[i];
                }
            }
        };

        const canPlaceWord = (word, row, col, isHorizontal) => {
            if (isHorizontal && col + word.length > size) return false;
            if (!isHorizontal && row + word.length > size) return false;

            for (let i = 0; i < word.length; i++) {
                if (isHorizontal) {
                    if (newBoard[row][col + i] !== '' && newBoard[row][col + i] !== word[i]) return false;
                } else {
                    if (newBoard[row + i][col] !== '' && newBoard[row + i][col] !== word[i]) return false;
                }
            }
            return true;
        };

        words.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                const isHorizontal = Math.random() > 0.5;
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);

                if (canPlaceWord(word, row, col, isHorizontal)) {
                    placeWord(word, row, col, isHorizontal);
                    placed = true;
                }
                attempts++;
            }
            if (!placed) {
                console.error(`Could not place word: ${word}`);
            }
        });

        // Fill remaining cells with random letters
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (newBoard[i][j] === '') {
                    newBoard[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }

        return newBoard;
    }, [words, size, alphabet]);

    const [foundWords, setFoundWords] = useState([]);
    const [currentWord, setCurrentWord] = useState('');
    const [score, setScore] = useState(0);

    const handleSubmit = useCallback(() => {
        const wordUpperCase = currentWord.toUpperCase();
        if (words.includes(wordUpperCase) && !foundWords.includes(wordUpperCase)) {
            setFoundWords(prev => [...prev, wordUpperCase]);
            setScore(prev => prev + wordUpperCase.length);
            updateScore(100, wordUpperCase.length); // Update the score in the parent component
        }
        setCurrentWord('');

        if (foundWords.length + 1 === words.length) {
            onCompletion(); // Call onCompletion when all words are found
        }
    }, [currentWord, foundWords, words, updateScore, onCompletion]);

    return (
        <div className="WordGrid-app">
            <h1 className="WordGrid-title">Найди слово</h1>
            <div className="WordGrid-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="WordGrid-row">
                        {row.map((cell, colIndex) => (
                            <div key={colIndex} className="WordGrid-cell">{cell}</div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="WordGrid-inputArea">
                <input
                    type="text"
                    value={currentWord}
                    onChange={(e) => setCurrentWord(e.target.value)}

                    className="WordGrid-input"
                    placeholder="Введите найденное слово"
                />
                <button onClick={handleSubmit} className="WordGrid-submitButton">Отправить</button>
            </div>
            {score != 0 ? <>
                <div className="WordGrid-score">Счет: {score}</div>
                <div className="WordGrid-foundWords">
                    Найденные слова: {foundWords.join(', ')}
                </div></> : <></>}

        </div>
    );
};

export default WordGrid;