import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useDrop, useDrag } from 'react-dnd';

const DraggableItem = ({ id, word, onDropItem }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'ITEM',
        item: { id, word },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [id, word]);

    return (
        <div
            ref={drag}
            className={`sentenceDND-draggable-item ${isDragging ? 'sentenceDND-dragging' : ''}`}
        >
            {word}
        </div>
    );
};

const DroppableContainer = ({ index, onDrop, currentItem }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'ITEM',
        drop: (item) => onDrop(item, index),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [onDrop, index]);

    return (
        <div
            ref={drop}
            className={`sentenceDND-droppable-container ${isOver ? 'sentenceDND-drag-over' : ''}`}
        >
            {currentItem ? currentItem.word : ''}
        </div>
    );
};

const SentenceDND = ({ sentences, updateScore, onCompletion }) => {
    const [droppedItems, setDroppedItems] = useState(Array(sentences.length).fill(null));
    const [isCorrect, setIsCorrect] = useState(Array(sentences.length).fill(null));
    const [allOptions, setAllOptions] = useState([]);

    useEffect(() => {
        const options = sentences.flatMap(sentence => sentence.options);
        const uniqueOptions = [...new Set(options)];
        setAllOptions(uniqueOptions.map((word, index) => ({ id: index, word })));
    }, [sentences]);

    const handleDrop = (item, index) => {
        setDroppedItems(prev => {
            const newItems = [...prev];
            newItems[index] = item;
            return newItems;
        });
    };

    const handleSubmit = () => {
        const newIsCorrect = sentences.map((sentence, index) =>
            droppedItems[index]?.word === sentence.correctWord
        );
        setIsCorrect(newIsCorrect);

        const correctCount = newIsCorrect.filter(Boolean).length;
        const percentage = (correctCount / sentences.length) * 100;
        updateScore(percentage, sentences.length);

        if (newIsCorrect.every(Boolean)) {
            onCompletion();
        }
    };

    const Composition = () => (
        <div className="sentenceDND-container">
            <div className="sentenceDND-sentences-section">
                {sentences.map((sentence, index) => {
                    const [before, after] = sentence.sentence.split('[EMPTY]');
                    return (
                        <div key={index} className="sentenceDND-sentence">
                            <span className="sentenceDND-sentence-number">{index + 1}.</span>
                            <span>{before}</span>
                            <DroppableContainer index={index} onDrop={handleDrop} currentItem={droppedItems[index]} />
                            <span>{after}</span>
                        </div>
                    );
                })}
            </div>
            <div className="sentenceDND-options-section">
                <div className="sentenceDND-options-container">
                    {allOptions.map((item) => (
                        <DraggableItem key={item.id} id={item.id} word={item.word} onDropItem={handleDrop} />
                    ))}
                </div>
            </div>
            <button onClick={handleSubmit} className="sentenceDND-submit-button">
                Submit
            </button>
        </div>
    );

    return (
        <div className="sentenceDND-game">
            <DndProvider backend={window.innerWidth > 768 ? HTML5Backend : TouchBackend}>
                <Composition />
            </DndProvider>
        </div>
    );
};

export default SentenceDND;