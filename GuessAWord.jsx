"use client";

import { useState } from "react";
import Image from "next/image";

export default function GuessAWord({ lang, word }) {
    const [userGuess, setUserGuess] = useState("");
    

    const handleInputChange = (e) => { 
        const userInput = e.target.value;
        setUserGuess(userInput);
    };

    const hanleButtonClick = (e) => {
        if (
            userGuess.toLowerCase() === word.url.toLowerCase() ||
            userGuess.toLowerCase() === word.cyr.toLowerCase() ||
            userGuess.toLowerCase() === word.lat.toLowerCase()
    ) {
            alert("win");
        } else {
            alert("nope")
        }
    };
    

    return (
        <div className="guessWordMainDiv">
            <div className="photosGuessWordMainDiv">
                <div className="photoGuessWordDiv">
                    <Image src={`/images/${word.url}_${word.id}_1.png`} alt="bala" width={100} height={100} />
                </div>
                <div className="photoGuessWordDiv">
                    <Image src={`/images/${word.url}_${word.id}_1.png`} alt="bala" width={100} height={100} />
                </div>
                <div className="photoGuessWordDiv">
                    <Image src={`/images/${word.url}_${word.id}_1.png`} alt="bala" width={100} height={100} />
                </div>
                <div className="photoGuessWordDiv">
                    <Image src={`/images/${word.url}_${word.id}_1.png`} alt="bala" width={100} height={100} />
                </div>
            </div>
            <div className="guessWordUserDiv">
                <input type="text" value={userGuess}  onChange={handleInputChange} />
                <button type="button" onClick={hanleButtonClick}>Submit</button>
            </div>
        </div>
    );
}


// const SearchButton = () => {
//   const [isActive, setIsActive] = useState(false);

//   const handleMouseEnter = () => {
//     setIsActive(true);
//   };

//   const handleMouseLeave = () => {
//     setIsActive(false);
//   };

//   const handleFocus = () => {
//     setIsActive(true);
//   };

//   const handleBlur = () => {
//     setIsActive(false);
//   };

//   const handleSearchClick = () => {
//     // Handle search click logic here
//   };

//   return (
//     <button className="searchButtons" onClick={handleSearchClick}>
//       <Image
//         src={isActive ? searchIconActive : searchIconInactive}
//         alt={isActive ? "searchActive" : "searchInactive"}
//         className={`searchButton ${
//           isActive ? "searchButtonActive" : "searchButtonInactive"
//         }`}
//         width="20"
//         height="20"
//         sizes="10vh"
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         onFocus={handleFocus}
//         onBlur={handleBlur}
//       />
//     </button>
//   );
// };
