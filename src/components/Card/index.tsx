import React from 'react';

interface CardProps {
  emoji: string;
  isFlipped: boolean;
  onClick: () => void;
}

function Card({ emoji, isFlipped, onClick }: CardProps) {
  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''}`}
      onClick={onClick}
    >
      {isFlipped ? emoji : '❓'}
    </div>
  );
}

export default Card;
