import React, { useState } from 'react';

const getOptions = (data) => {
    return Object.entries(data.options).map(([key, value]) => {
        return { option: key, text: value };
    });
};

const MCQ = ({ questionsData, updateScore, onCompletion }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isCorrect, setIsCorrect] = useState(null);

    const currentQuestion = questionsData[currentQuestionIndex];
    const options = getOptions(currentQuestion);

    const handleOptionClick = (option) => {
        if (!selectedOptions[currentQuestionIndex]) {
            setSelectedOptions({
                ...selectedOptions,
                [currentQuestionIndex]: option
            });
            setIsCorrect(option === currentQuestion.correct);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setIsCorrect(null);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questionsData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsCorrect(null);
        }
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        questionsData.forEach((question, index) => {
            if (selectedOptions[index] === question.correct) {
                correctAnswers++;
            }
        });
        const percentage = (correctAnswers / questionsData.length) * 100;
        updateScore(percentage, 5); // 5 points max for MCQ
        onCompletion();
    };

    return (
        <div className="mcq-container">
            <div className="mcq-question">
                <span className="mcq-question-text">{currentQuestion.question}</span>
            </div>
            <div className="mcq-options">
                {options.map((option, key) => (
                    <Option
                        key={key}
                        label={option.option}
                        text={option.text}
                        onClick={() => handleOptionClick(option.option)}
                        isSelected={selectedOptions[currentQuestionIndex] === option.option}
                        isCorrect={isCorrect}
                        correctOption={currentQuestion.correct}
                        disabled={!!selectedOptions[currentQuestionIndex]}
                    />
                ))}
            </div>
            <div className="mcq-navigation">
                <div className="mcq-nav-button-container">
                    <button className="mcq-nav-button" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>{'<'}</button>
                    <button className="mcq-nav-button" onClick={handleNext} disabled={currentQuestionIndex === questionsData.length - 1}>{'>'}</button>
                </div>
            </div>
            {currentQuestionIndex === questionsData.length - 1 && (
                <button className="mcq-submit-button" onClick={handleSubmit}>Жіберу</button>
            )}
        </div>
    );
};

const Option = ({ label, text, onClick, isSelected, isCorrect, correctOption, disabled }) => {
    const className = isSelected
        ? isCorrect
            ? 'mcq-option correct'
            : 'mcq-option incorrect'
        : 'mcq-option';

    return (
        <div className={`${className} ${disabled ? 'disabled' : ''}`} onClick={!disabled ? onClick : null}>
            <div className="mcq-option-label"><span style={{ position: "relative", top: "-1px" }}>{label}</span></div>
            <div className="mcq-option-text">{text}</div>
        </div>
    );
};


export default MCQ;



