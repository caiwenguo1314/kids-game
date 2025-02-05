import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Card as AntCard } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import styles from './style.module.css';

const { Title } = Typography;

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const allEmojis = [...emojis, ...emojis];
const PREVIEW_TIME = 5000;

interface GameCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryGame() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<GameCard[]>(shuffleCards());
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isPreview, setIsPreview] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  function shuffleCards(): GameCard[] {
    return allEmojis
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
  }

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
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
    <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }} align="center">
      <Title level={2} style={{ margin: 0 }}>记忆配对游戏</Title>
      <Title level={4} style={{ margin: 0 }}>移动次数: {moves}</Title>
      
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        onClick={startNewGame}
        size="large"
      >
        {!gameStarted ? '开始游戏' : '重新开始'}
      </Button>

      <div className={styles.cardGrid}>
        {cards.map((card, index) => (
          <AntCard
            key={card.id}
            className={`${styles.memoryCard} ${
              isPreview || flippedIndexes.includes(index) || matchedPairs.includes(index)
                ? styles.flipped
                : ''
            } ${matchedPairs.includes(index) ? styles.matched : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className={styles.cardContent}>
              {isPreview || flippedIndexes.includes(index) || matchedPairs.includes(index)
                ? card.emoji
                : '❓'}
            </div>
          </AntCard>
        ))}
      </div>

      {matchedPairs.length === cards.length && matchedPairs.length > 0 && (
        <Title level={3} type="success">
          恭喜你完成了游戏！
        </Title>
      )}

      <Button 
        icon={<HomeOutlined />} 
        onClick={() => navigate('/')}
        size="large"
      >
        返回首页
      </Button>
    </Space>
  );
}

export default MemoryGame;
