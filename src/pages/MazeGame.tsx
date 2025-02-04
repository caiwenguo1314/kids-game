import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// 迷宫生成器
class MazeGenerator {
  private maze: number[][];
  private size: number;
  private directions = [
    [-2, 0],  // 上
    [2, 0],   // 下
    [0, -2],  // 左
    [0, 2]    // 右
  ];

  constructor(size: number) {
    this.size = size;
    this.maze = Array(size).fill(0).map(() => Array(size).fill(1));
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private isValid(x: number, y: number): boolean {
    return x > 0 && x < this.size - 1 && y > 0 && y < this.size - 1;
  }

  private carve(x: number, y: number) {
    this.maze[y][x] = 0;
    
    let directions = this.shuffleArray([...this.directions]);
    
    for (let [dy, dx] of directions) {
      let newY = y + dy;
      let newX = x + dx;
      
      if (this.isValid(newX, newY) && this.maze[newY][newX] === 1) {
        this.maze[y + dy/2][x + dx/2] = 0;
        this.carve(newX, newY);
      }
    }
  }

  // 获取所有可能的起点或终点位置
  private getValidEndpoints(): {x: number, y: number}[] {
    const points: {x: number, y: number}[] = [];
    for (let y = 1; y < this.size - 1; y++) {
      for (let x = 1; x < this.size - 1; x++) {
        if (this.maze[y][x] === 0) {
          // 检查周围是否有足够的空间
          let emptyNeighbors = 0;
          for (let [dy, dx] of [[-1,0], [1,0], [0,-1], [0,1]]) {
            if (this.maze[y+dy][x+dx] === 0) {
              emptyNeighbors++;
            }
          }
          // 只选择有多个出口的点作为可能的起点或终点
          if (emptyNeighbors >= 2) {
            points.push({x, y});
          }
        }
      }
    }
    return points;
  }

  // 检查两点之间是否有路径
  private hasPath(start: {x: number, y: number}, end: {x: number, y: number}): boolean {
    const visited = Array(this.size).fill(0).map(() => Array(this.size).fill(false));
    const queue = [start];
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === end.x && current.y === end.y) {
        return true;
      }

      for (let [dy, dx] of [[-1,0], [1,0], [0,-1], [0,1]]) {
        const newY = current.y + dy;
        const newX = current.x + dx;
        if (this.isValid(newX, newY) && !visited[newY][newX] && this.maze[newY][newX] !== 1) {
          queue.push({x: newX, y: newY});
          visited[newY][newX] = true;
        }
      }
    }
    return false;
  }

  generate(): {maze: number[][], start: {x: number, y: number}, end: {x: number, y: number}} {
    // 从随机点开始生成迷宫
    const startGenX = 1 + 2 * Math.floor(Math.random() * ((this.size-1)/2));
    const startGenY = 1 + 2 * Math.floor(Math.random() * ((this.size-1)/2));
    this.carve(startGenX, startGenY);

    // 获取所有可能的端点
    const possiblePoints = this.shuffleArray(this.getValidEndpoints());
    
    // 确保有足够的点
    if (possiblePoints.length < 2) {
      // 如果没有足够的点，重新生成迷宫
      return this.generate();
    }

    // 选择距离较远的两个点作为起点和终点
    let maxDistance = 0;
    let start = possiblePoints[0];
    let end = possiblePoints[1];

    for (let i = 0; i < possiblePoints.length; i++) {
      for (let j = i + 1; j < possiblePoints.length; j++) {
        const p1 = possiblePoints[i];
        const p2 = possiblePoints[j];
        const distance = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
        
        if (distance > maxDistance && this.hasPath(p1, p2)) {
          maxDistance = distance;
          start = p1;
          end = p2;
        }
      }
    }

    // 设置起点和终点
    this.maze[start.y][start.x] = 2;
    this.maze[end.y][end.x] = 3;

    return {
      maze: this.maze,
      start: start,
      end: end
    };
  }
}

function MazeGame() {
  const mazeSize = 17;
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateNewMaze = () => {
    const generator = new MazeGenerator(mazeSize);
    const { maze: newMaze, start } = generator.generate();
    setMaze(newMaze);
    setPlayerPosition({ x: start.x, y: start.y });
    setGameWon(false);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    generateNewMaze();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !gameWon) {
      timer = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameWon]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameWon || maze.length === 0) return;

      const newPosition = { ...playerPosition };
      
      switch (e.key) {
        case 'ArrowUp':
          newPosition.y = Math.max(0, playerPosition.y - 1);
          break;
        case 'ArrowDown':
          newPosition.y = Math.min(mazeSize - 1, playerPosition.y + 1);
          break;
        case 'ArrowLeft':
          newPosition.x = Math.max(0, playerPosition.x - 1);
          break;
        case 'ArrowRight':
          newPosition.x = Math.min(mazeSize - 1, playerPosition.x + 1);
          break;
        default:
          return;
      }

      if (maze[newPosition.y][newPosition.x] !== 1) {
        setIsPlaying(true);
        setPlayerPosition(newPosition);
        setMoves(prev => prev + 1);
        
        if (maze[newPosition.y][newPosition.x] === 3) {
          setGameWon(true);
          setIsPlaying(false);
          confetti({
            particleCount: 200,
            spread: 70,
            origin: { x: 0.5, y: 0.5 }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPosition, gameWon, maze]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellClassName = (cell: number, rowIndex: number, colIndex: number) => {
    if (rowIndex === playerPosition.y && colIndex === playerPosition.x) {
      return 'maze-cell player';
    }
    switch (cell) {
      case 1:
        return 'maze-cell wall';
      case 2:
        return 'maze-cell start';
      case 3:
        return 'maze-cell end';
      default:
        return 'maze-cell';
    }
  };

  return (
    <div className="maze-game">
      <h1>迷宫游戏</h1>
      <div className="game-stats">
        <p>移动次数: {moves}</p>
        <p>时间: {formatTime(time)}</p>
      </div>
      <button className="game-button" onClick={generateNewMaze}>
        重新开始
      </button>
      <p className="instructions">使用键盘方向键移动</p>
      <div className="maze-container">
        {maze.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(cell, rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      {gameWon && (
        <div className="success-message">
          <h2>恭喜你完成了迷宫！</h2>
          <p>总用时: {formatTime(time)}</p>
          <p>移动次数: {moves}</p>
        </div>
      )}
    </div>
  );
}

export default MazeGame;
