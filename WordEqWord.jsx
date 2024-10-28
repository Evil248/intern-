import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop, useDrag } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';

// DraggableItem Component
const DraggableItem = ({ id, word, currentPosition, onDropItem, isCorrect, submitted }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'ITEM',
        item: { id, word, currentPosition },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (!monitor.didDrop()) {
                onDropItem(item.id, null);
            }
        }
    }), [id, word, currentPosition]);

    const handleContextMenu = (event) => {
        event.preventDefault();
        resetPosition(id);
    };

    return (
        <div
            ref={drag}
            className={`WordEqWord-draggableBox ${isDragging ? 'dragging' : ''} ${submitted && isCorrect === true ? 'correct' : submitted && isCorrect === false ? 'incorrect' : ''}`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            onContextMenu={handleContextMenu}
        >
            {word}
        </div>
    );
};

// DroppableContainer Component
const DroppableContainer = ({ targetWord, onDrop, currentItem, submitted }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'ITEM',
        drop: (item) => onDrop(item, targetWord),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), []);

    return (
        <div
            ref={drop}
            className={`WordEqWord-wordBox ${isOver ? 'WordEqWord-dragOver' : ''}`}
        >
            <div className={`WordEqWord-dashedBox`}>
                {currentItem && (
                    <DraggableItem
                        id={currentItem.id}
                        word={currentItem.word}
                        currentPosition={targetWord}
                        onDropItem={onDrop}
                        isCorrect={currentItem.isCorrect}
                        submitted={submitted}
                        resetPosition={onDrop}
                    />
                )}
            </div>
            <span>{targetWord}</span>
        </div>
    );
};

// Main Component
const WordEqWord = ({ wordMap, updateScore, onCompletion }) => {
    const [draggableItems, setDraggableItems] = useState(
        Object.entries(wordMap).map(([targetWord, draggableWord], index) => ({
            id: `box-${index}`,
            word: draggableWord,
            targetWord,
            currentPosition: null,
            isCorrect: null
        }))
    );
    const [targetStates, setTargetStates] = useState(
        Object.keys(wordMap).map((word) => ({ word, currentItem: null }))
    );
    const [submitted, setSubmitted] = useState(false);

    const handleDrop = (droppedItem, targetWord) => {
        setDraggableItems((prev) =>
            prev.map((item) =>
                item.id === droppedItem.id
                    ? { ...item, currentPosition: targetWord }
                    : item
            )
        );

        setTargetStates((prev) =>
            prev.map((target) =>
                target.word === targetWord
                    ? { ...target, currentItem: { ...droppedItem, isCorrect: wordMap[targetWord] === droppedItem.word } }
                    : target.currentItem?.id === droppedItem.id
                        ? { ...target, currentItem: null }
                        : target
            )
        );
    };

    const handleSubmit = () => {
        let correctCount = 0;
        targetStates.forEach((target) => {
            if (target.currentItem?.word === wordMap[target.word]) {
                correctCount++;
            }
        });

        const percentage = (correctCount / Object.keys(wordMap).length) * 100;
        updateScore(percentage, 7); // 7 points max for WordEqWord
        onCompletion();
    };

    const Composition = () => (
        <div className="WordEqWord-container">
            <div className="WordEqWord-topContainer">
                {targetStates.map((target, index) => (
                    <DroppableContainer
                        key={index}
                        targetWord={target.word}
                        onDrop={handleDrop}
                        currentItem={target.currentItem}
                        submitted={submitted}
                    />
                ))}
            </div>
            <div className="WordEqWord-bottomContainer">
                {draggableItems.filter(item => item.currentPosition === null).map((item) => (
                    <DraggableItem
                        key={item.id}
                        id={item.id}
                        word={item.word}
                        currentPosition={null}
                        onDropItem={handleDrop}
                        isCorrect={item.isCorrect}
                        submitted={submitted}
                        resetPosition={handleDrop}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="desktop">
                <DndProvider backend={HTML5Backend}>
                    <Composition />
                </DndProvider>
            </div>
            <div className="mobile">
                <DndProvider backend={TouchBackend}>
                    <Composition />
                </DndProvider>
            </div>
            <button onClick={handleSubmit} className="mcq-submit-button">
                Жіберу
            </button>
        </div>
    );
};

export default WordEqWord;