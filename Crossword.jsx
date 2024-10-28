import React, { useState, useEffect, useRef } from 'react';

const Crossword = ({ words, updateScore, onCompletion }) => {
    const [userAnswers, setUserAnswers] = useState({});
    const [currentClueIndex, setCurrentClueIndex] = useState(0);
    const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
    const [cellMap, setCellMap] = useState({});
    const [numberMap, setNumberMap] = useState({});
    const inputRefs = useRef({});

    useEffect(() => {
        const initialAnswers = Object.fromEntries(
            words.map(w => [w.id, Array(w.answer.length).fill('')])
        );
        setUserAnswers(initialAnswers);

        const maxRow = Math.max(...words.map(w => w.row + (w.direction === 'down' ? w.answer.length - 1 : 0)));
        const maxCol = Math.max(...words.map(w => w.col + (w.direction === 'across' ? w.answer.length - 1 : 0)));
        setGridSize({ rows: maxRow + 1, cols: maxCol + 1 });

        const newCellMap = {};
        const newNumberMap = {};
        let currentNumber = 1;

        words.sort((a, b) => a.row - b.row || a.col - b.col).forEach(word => {
            const key = `${word.row},${word.col}`;
            if (!newNumberMap[key]) {
                newNumberMap[key] = currentNumber++;
            }

            word.answer.split('').forEach((_, index) => {
                const row = word.row + (word.direction === 'down' ? index : 0);
                const col = word.col + (word.direction === 'across' ? index : 0);
                const cellKey = `${row},${col}`;
                if (!newCellMap[cellKey]) {
                    newCellMap[cellKey] = [];
                }
                newCellMap[cellKey].push({ wordId: word.id, index, direction: word.direction });
            });
        });

        setCellMap(newCellMap);
        setNumberMap(newNumberMap);
    }, [words]);

    const handleInputChange = (row, col, value, direction) => {
        const key = `${row},${col}`;
        const intersectingWords = cellMap[key] || [];

        setUserAnswers(prev => {
            const newAnswers = { ...prev };
            intersectingWords.forEach(({ wordId, index }) => {
                newAnswers[wordId] = newAnswers[wordId].map((char, i) =>
                    i === index ? value.toUpperCase() : char
                );
            });
            return newAnswers;
        });

        // Move to next/previous cell
        if (value) {
            const nextKey = direction === 'across' ? `${row},${col + 1}` : `${row + 1},${col}`;
            if (cellMap[nextKey]) {
                inputRefs.current[nextKey]?.focus();
            }
        }
    };

    const handleKeyDown = (e, row, col, direction) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const key = `${row},${col}`;
            const intersectingWords = cellMap[key] || [];

            setUserAnswers(prev => {
                const newAnswers = { ...prev };
                intersectingWords.forEach(({ wordId, index }) => {
                    newAnswers[wordId] = newAnswers[wordId].map((char, i) =>
                        i === index ? '' : char
                    );
                });
                return newAnswers;
            });

            const prevKey = direction === 'across' ? `${row},${col - 1}` : `${row - 1},${col}`;
            if (cellMap[prevKey]) {
                inputRefs.current[prevKey]?.focus();
            }
        }
    };

    const navigateClue = (direction) => {
        setCurrentClueIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            if (newIndex < 0) return words.length - 1;
            if (newIndex >= words.length) return 0;
            return newIndex;
        });
    };

    const handleSubmit = () => {
        let correctCount = 0;
        words.forEach(word => {
            const userAnswer = userAnswers[word.id]?.join('') || '';
            if (userAnswer === word.answer) {
                correctCount++;
            }
        });

        const percentage = (correctCount / words.length) * 100;
        updateScore(percentage, 10); // 10 points max for Crossword
        onCompletion();
    };

    const renderCell = (row, col) => {
        const key = `${row},${col}`;
        const intersectingWords = cellMap[key] || [];
        const wordId = intersectingWords[0]?.wordId;
        const index = intersectingWords[0]?.index;
        const direction = intersectingWords[0]?.direction;
        const number = numberMap[key];
        const isWordStart = intersectingWords.some(({ index }) => index === 0);

        return intersectingWords.length > 0 ? (
            <div key={key} className={`crossword-cell ${isWordStart ? 'word-start' : ''}`}
                style={{
                    gridRow: row + 1,
                    gridColumn: col + 1,
                    position: 'relative'
                }}>
                {isWordStart && number && <span className="cell-number">{number}</span>}
                <input
                    ref={el => inputRefs.current[key] = el}
                    type="text"
                    maxLength={1}
                    value={userAnswers[wordId]?.[index] || ''}
                    onChange={(e) => handleInputChange(row, col, e.target.value, direction)}
                    onKeyDown={(e) => handleKeyDown(e, row, col, direction)}
                    className="crossword-input"
                />
                {isWordStart && intersectingWords.map(({ direction, wordId }, idx) => {
                    const isStartingWord = intersectingWords.some(word => word.wordId === wordId && word.index === 0);
                    return isStartingWord && (
                        <div key={idx} className={`direction-arrow direction-arrow-${direction}`}></div>
                    );
                })}
            </div>
        ) : null;
    };

    const currentWord = words[currentClueIndex];

    if (Object.keys(userAnswers).length === 0) {
        return <div>Жүктеу...</div>;
    }

    return (
        <div className="crossword-container">
            <div className="crossword-grid" style={{
                gridTemplateRows: `repeat(${gridSize.rows}, auto)`,
                gridTemplateColumns: `repeat(${gridSize.cols}, auto)`,
            }}>
                {Array.from({ length: gridSize.rows }).map((_, row) =>
                    Array.from({ length: gridSize.cols }).map((_, col) => renderCell(row, col))
                )}
            </div>
            <div className="clue-section">
                <button onClick={() => navigateClue(-1)} className="clue-button clue-button-left">&lt;</button>
                <div className="clue-content">
                    <div className="clue-number">{numberMap[`${currentWord.row},${currentWord.col}`]}</div>
                    <div className="clue-text">{currentWord.clue}</div>
                    <input
                        type="text"
                        value={userAnswers[currentWord.id].join('')}
                        onChange={(e) => {
                            const newValue = e.target.value.toUpperCase().padEnd(currentWord.answer.length, '').split('');
                            currentWord.answer.split('').forEach((_, index) => {
                                const row = currentWord.row + (currentWord.direction === 'down' ? index : 0);
                                const col = currentWord.col + (currentWord.direction === 'across' ? index : 0);
                                handleInputChange(row, col, newValue[index] || '', currentWord.direction);
                            });
                        }}
                        className="clue-input"
                        maxLength={currentWord.answer.length}
                    />
                </div>
                <button onClick={() => navigateClue(1)} className="clue-button clue-button-right">&gt;</button>
            </div>
            <button onClick={handleSubmit} className="mcq-submit-button">Жіберу</button>
        </div>
    );
};

export default Crossword;
