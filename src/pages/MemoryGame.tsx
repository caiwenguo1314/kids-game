import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Card from '../components/Card';

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const allEmojis = [...emojis, ...emojis];
const PREVIEW_TIME = 5000; // 5 seconds in milliseconds

function MemoryGame() {
  const [cards, setCards] = useState(shuffleCards());
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isPreview, setIsPreview] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  function shuffleCards() {
    return allEmojis
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
  }

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 }
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 }
    });
  };

  useEffect(() => {
    if (gameStarted && isPreview) {
      const timer = setTimeout(() => {
        setIsPreview(false);
      }, PREVIEW_TIME);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, isPreview]);

  useEffect(() => {
    if (flippedIndexes.length === 2) {
      const timer = setTimeout(() => {
        const [firstIndex, secondIndex] = flippedIndexes;
        if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
          setMatchedPairs([...matchedPairs, firstIndex, secondIndex]);
        }
        setFlippedIndexes([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [flippedIndexes, cards, matchedPairs]);

  useEffect(() => {
    if (matchedPairs.length === cards.length && matchedPairs.length > 0) {
      fireConfetti();
    }
  }, [matchedPairs.length, cards.length]);

  const handleCardClick = (index: number) => {
    if (
      !gameStarted ||
      isPreview ||
      flippedIndexes.length === 2 ||
      flippedIndexes.includes(index) ||
      matchedPairs.includes(index)
    ) {
      return;
    }

    setFlippedIndexes([...flippedIndexes, index]);
    setMoves(moves + 1);
  };

  const startNewGame = () => {
    setCards(shuffleCards());
    setFlippedIndexes([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsPreview(true);
    setGameStarted(true);
  };

  return (
    <div className="memory-game">
      <h1>记忆配对游戏</h1>
      <p>移动次数: {moves}</p>
      {!gameStarted ? (
        <button className="game-button" onClick={startNewGame}>
          开始游戏
        </button>
      ) : (
        <button className="game-button" onClick={startNewGame}>
          重新开始
        </button>
      )}
      <div className="card-grid">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            emoji={card.emoji}
            isFlipped={
              isPreview || flippedIndexes.includes(index) || matchedPairs.includes(index)
            }
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
      {matchedPairs.length === cards.length && matchedPairs.length > 0 && (
        <h2 className="success-message">恭喜你完成了游戏！</h2>
      )}
    </div>
  );
}

export default MemoryGame;
