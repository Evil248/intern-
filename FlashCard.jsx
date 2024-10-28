"use client";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

export default function FlashCard({ flashcards, updateScore, onCompletion }) {
    const [hoverState, setHoverState] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState("");
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    const currentFlashcard = flashcards[flashcardIndex];
    const { text, correct } = currentFlashcard;

    const handleButtonClick = (direction) => {
        setIsAnswered(true);
        const isCorrect = direction === correct;
        setResult(isCorrect ? "Дұрыс" : "Бұрыс");
        setShowResult(true);

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
        }

        if (flashcardIndex === flashcards.length - 1) {
            const percentage = (correctAnswers / flashcards.length) * 100;
            updateScore(percentage, 5); // 5 points max for flashcards
            setTimeout(() => {
                onCompletion();
            }, 300);
        } else {
            setTimeout(() => {
                setFlashcardIndex(flashcardIndex + 1);
                setIsAnswered(false);
                setShowResult(false);
                resetMotionValues();
            }, 500);
        }
    };

    useEffect(() => {
        if (isAnswered) {
            const timer = setTimeout(() => {
                if (flashcardIndex < flashcards.length - 1) {
                    setFlashcardIndex(flashcardIndex + 1);
                    setIsAnswered(false);
                    setShowResult(false);
                    resetMotionValues();
                } else {
                    if (onCompletion) {
                        onCompletion();
                    }
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isAnswered]);

    const motionValue = useMotionValue(0);
    const rotateValue = useTransform(motionValue, [-200, 200], [-10, 10]);
    const opacityValue = useTransform(
        motionValue,
        [-300, -200, 0, 200, 300],
        [0, 1, 1, 1, 0]
    );

    const animControls = useAnimation();

    const handleDragEnd = (event, info) => {
        if (Math.abs(info.offset.x) < 100) {
            animControls.start({ x: 0 });
        } else {
            const direction = info.offset.x > 0 ? 'correct' : 'incorrect';
            animControls.start({
                x: info.offset.x < 0 ? -300 : 300,
                opacity: 0,
                transition: { duration: 0.3 }
            });
            setTimeout(() => {
                handleButtonClick(direction);
            }, 300);
        }
    };

    const resetMotionValues = () => {
        motionValue.set(0);
        animControls.set({ x: 0, opacity: 1 });
    };

    return (
        <>
            <div className="desktop">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "12dvh" }}>
                    <div className={`flashcard-card ${isAnswered ? (result === "Дұрыс" ? 'flashcard-correct' : 'flashcard-incorrect') : ''}`}>
                        <div className="flashcard-word-content">
                            <div className="flashcard-word-container">
                                <h2 className="flashcard-word">
                                    {text}
                                    {isAnswered && result === "Дұрыс" && (
                                        <span className="accepted-sign">✓</span>
                                    )}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="flashcard-button-container">
                        <WordButton text="Дұрыс" color="#4CAF50" onHover={() => setHoverState('correct')} onLeave={() => setHoverState(null)} onClick={() => handleButtonClick('correct')} />
                        <WordButton text="Бұрыс" color="#FF0000" onHover={() => setHoverState('incorrect')} onLeave={() => setHoverState(null)} onClick={() => handleButtonClick('incorrect')} />
                    </div>
                </div>
            </div>
            <motion.div className="mobile" style={{ width: "100dvw" }}>
                <div className="ongasongadiv">
                    <span style={{ padding: "2px", color: '#f00' }}>Онга</span>
                    <span style={{ padding: "2px", color: '#888' }}>немесе</span>
                    <span style={{ padding: "2px", color: '#0f0' }}>cонға</span>
                    <span style={{ padding: "2px", color: '#fff' }}>сырғытыңыз</span>
                </div>

                <motion.div
                    className="mobile-flashcard-container"
                    style={{
                        width: '100%',
                        height: '70dvh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {!showResult && (
                        <motion.div
                            className={`mobile-flashcard ${isAnswered ? (result === "Дұрыс" ? 'flashcard-correct' : 'flashcard-incorrect') : ''}`}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={handleDragEnd}
                            animate={animControls}
                            style={{
                                x: motionValue,
                                rotate: rotateValue,
                                opacity: opacityValue,
                                width: '80vw',
                                padding: '20px',
                                borderRadius: '20px',
                                backgroundColor: '#0D3642',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0px 4px 4px 0px #00000040',
                            }}
                        >
                            <div className="flashcard-word-content">
                                <div className="flashcard-word-container">
                                    <h2 className="flashcard-word">
                                        {text}
                                        {isAnswered && result === "Дұрыс" && (
                                            <span className="accepted-sign">✓</span>
                                        )}
                                    </h2>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: result === "Дұрыс" ? "#4CAF50" : "#FF0000"
                            }}
                        >
                            {result}
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </>
    );
}

function WordButton({ text, color, onHover, onLeave, onClick }) {
    return (
        <div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            className="flashcard-word-button"
            style={{ color }}
        >
            {text}
        </div>
    );
}
