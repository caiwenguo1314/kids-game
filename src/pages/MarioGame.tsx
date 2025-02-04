import React, { useState, useEffect, useCallback } from 'react';
import './MarioGame.css';

// 游戏常量 - 调整物理参数
const GRAVITY = 0.4;           // 减小重力
const JUMP_FORCE = -12;        // 增加跳跃力
const MOVE_SPEED = 6;          // 增加移动速度
const PLATFORM_HEIGHT = 20;    // 减小平台高度
const MARIO_SIZE = 30;         // 减小角色大小
const MAX_VELOCITY = 15;       // 最大下落速度

// 定义平台类型
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 定义硬币类型
interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

function MarioGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [mario, setMario] = useState({
    x: 50,
    y: 300,
    velocityY: 0,
    isJumping: false,
    facingRight: true
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // 生成随机平台
  const generatePlatforms = useCallback(() => {
    const newPlatforms: Platform[] = [
      // 起始平台 - 更宽更容易站立
      { x: 0, y: 400, width: 250, height: PLATFORM_HEIGHT },
    ];

    // 生成有规律的平台，确保可以跳跃到达
    for (let i = 1; i < 12; i++) {
      const prevPlatform = newPlatforms[i-1];
      const minX = prevPlatform.x + 100;  // 最小水平距离
      const maxX = prevPlatform.x + 200;  // 最大水平距离
      const minY = prevPlatform.y - 120;  // 最小垂直距离
      const maxY = prevPlatform.y + 120;  // 最大垂直距离

      const x = Math.min(700, Math.max(0, minX + Math.random() * (maxX - minX)));
      const y = Math.min(500, Math.max(100, minY + Math.random() * (maxY - minY)));
      
      newPlatforms.push({
        x,
        y,
        width: 120 + Math.random() * 80, // 平台宽度在120-200之间
        height: PLATFORM_HEIGHT
      });
    }

    setPlatforms(newPlatforms);

    // 生成硬币
    const newCoins: Coin[] = [];
    newPlatforms.forEach(platform => {
      if (Math.random() > 0.3) {
        newCoins.push({
          x: platform.x + platform.width / 2,
          y: platform.y - 40,
          collected: false
        });
      }
    });
    setCoins(newCoins);
  }, []);

  // 检查碰撞
  const checkCollision = (mario: any, platform: Platform) => {
    return (
      mario.x < platform.x + platform.width &&
      mario.x + MARIO_SIZE > platform.x &&
      mario.y < platform.y + platform.height &&
      mario.y + MARIO_SIZE > platform.y
    );
  };

  // 检查硬币收集
  const checkCoinCollection = useCallback(() => {
    setCoins(prevCoins => 
      prevCoins.map(coin => {
        if (!coin.collected &&
            Math.abs(mario.x + MARIO_SIZE/2 - coin.x) < MARIO_SIZE &&
            Math.abs(mario.y + MARIO_SIZE/2 - coin.y) < MARIO_SIZE) {
          setScore(prev => prev + 10);
          return { ...coin, collected: true };
        }
        return coin;
      })
    );
  }, [mario.x, mario.y]);

  // 游戏循环
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setMario(prevMario => {
        let newMario = { ...prevMario };
        
        // 应用重力，但限制最大下落速度
        newMario.velocityY = Math.min(newMario.velocityY + GRAVITY, MAX_VELOCITY);
        newMario.y += newMario.velocityY;

        // 检查平台碰撞
        let onPlatform = false;
        platforms.forEach(platform => {
          if (checkCollision(newMario, platform)) {
            // 从上方碰撞
            if (prevMario.y + MARIO_SIZE <= platform.y + 10) {
              newMario.y = platform.y - MARIO_SIZE;
              newMario.velocityY = 0;
              newMario.isJumping = false;
              onPlatform = true;
            }
            // 从下方碰撞
            else if (prevMario.y >= platform.y + platform.height - 10) {
              newMario.y = platform.y + platform.height;
              newMario.velocityY = 0;
            }
          }
        });

        // 检查游戏结束
        if (newMario.y > 600) {
          setGameOver(true);
        }

        return newMario;
      });

      checkCoinCollection();
    }, 1000/60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, platforms, checkCoinCollection]);

  // 键盘控制
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const keys = new Set();

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key);

      if ((e.key === 'ArrowUp' || e.key === ' ') && !mario.isJumping) {
        setMario(prev => ({
          ...prev,
          velocityY: JUMP_FORCE,
          isJumping: true
        }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key);
    };

    // 持续移动处理
    const moveInterval = setInterval(() => {
      if (keys.has('ArrowLeft')) {
        setMario(prev => ({
          ...prev,
          x: Math.max(0, prev.x - MOVE_SPEED),
          facingRight: false
        }));
      }
      if (keys.has('ArrowRight')) {
        setMario(prev => ({
          ...prev,
          x: Math.min(800 - MARIO_SIZE, prev.x + MOVE_SPEED),
          facingRight: true
        }));
      }
    }, 1000/60);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
  }, [gameStarted, gameOver, mario.isJumping]);

  // 开始新游戏
  const startNewGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setMario({
      x: 50,
      y: 300,
      velocityY: 0,
      isJumping: false,
      facingRight: true
    });
    generatePlatforms();
  };

  return (
    <div className="mario-game">
      <div className="game-stats">
        <p>分数: {score}</p>
      </div>
      {!gameStarted ? (
        <div className="start-screen">
          <h1>超级马里奥</h1>
          <button className="game-button" onClick={startNewGame}>开始游戏</button>
          <p className="instructions">
            使用方向键移动，空格键跳跃<br/>
            收集金币来获得分数！
          </p>
        </div>
      ) : (
        <div className="game-container">
          {/* 马里奥 */}
          <div 
            className={`mario ${mario.facingRight ? 'facing-right' : 'facing-left'}`}
            style={{
              left: `${mario.x}px`,
              top: `${mario.y}px`,
              width: `${MARIO_SIZE}px`,
              height: `${MARIO_SIZE}px`
            }}
          />
          
          {/* 平台 */}
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="platform"
              style={{
                left: `${platform.x}px`,
                top: `${platform.y}px`,
                width: `${platform.width}px`,
                height: `${platform.height}px`
              }}
            />
          ))}

          {/* 硬币 */}
          {coins.map((coin, index) => (
            !coin.collected && (
              <div
                key={index}
                className="coin"
                style={{
                  left: `${coin.x}px`,
                  top: `${coin.y}px`
                }}
              />
            )
          ))}

          {/* 游戏结束提示 */}
          {gameOver && (
            <div className="game-over">
              <h2>游戏结束</h2>
              <p>最终得分: {score}</p>
              <button className="game-button" onClick={startNewGame}>
                重新开始
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MarioGame;
