import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Switch } from 'antd';
import { HomeOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import styles from './style.module.css';

class MazeGenerator {
  private maze: number[][];
  private size: number;
  private directions = [
    [-1, 0],  // 上
    [1, 0],   // 下
    [0, -1],  // 左
    [0, 1]    // 右
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
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  private generateMaze() {
    // 初始化迷宫，所有格子都是墙
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        this.maze[y][x] = 1;
      }
    }

    // 从中心点开始生成
    const startX = Math.floor(this.size / 2);
    const startY = Math.floor(this.size / 2);
    this.maze[startY][startX] = 0;

    // 存储待访问的点
    const stack = [{x: startX, y: startY}];
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      
      // 获取可访问的相邻格子
      const neighbors = [];
      for (const [dy, dx] of this.directions) {
        const newY = current.y + dy * 2;
        const newX = current.x + dx * 2;
        
        if (this.isValid(newX, newY) && this.maze[newY][newX] === 1) {
          neighbors.push({x: newX, y: newY, dx, dy});
        }
      }
      
      if (neighbors.length > 0) {
        // 随机选择一个相邻格子
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        // 打通墙壁
        this.maze[current.y + next.dy][current.x + next.dx] = 0;
        this.maze[next.y][next.x] = 0;
        stack.push({x: next.x, y: next.y});
      } else {
        // 没有可访问的相邻格子，回溯
        stack.pop();
      }
    }
  }

  // 获取所有可能的起点或终点位置
  private getValidEndpoints(): {x: number, y: number}[] {
    const points: {x: number, y: number}[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.maze[y][x] === 0) {
          // 检查周围的墙的数量
          let wallCount = 0;
          for (const [dy, dx] of this.directions) {
            const newY = y + dy;
            const newX = x + dx;
            if (!this.isValid(newX, newY) || this.maze[newY][newX] === 1) {
              wallCount++;
            }
          }
          // 如果三面是墙，一面是路，则是死胡同
          if (wallCount === 3) {
            points.push({x, y});
          }
        }
      }
    }
    return points;
  }

  // 检查两点之间是否有路径，并返回路径长度
  private findPath(start: {x: number, y: number}, end: {x: number, y: number}): number {
    const visited = Array(this.size).fill(0).map(() => Array(this.size).fill(-1));
    const queue = [start];
    visited[start.y][start.x] = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === end.x && current.y === end.y) {
        return visited[current.y][current.x];
      }

      for (const [dy, dx] of this.directions) {
        const newY = current.y + dy;
        const newX = current.x + dx;
        if (this.isValid(newX, newY) && visited[newY][newX] === -1 && this.maze[newY][newX] !== 1) {
          queue.push({x: newX, y: newY});
          visited[newY][newX] = visited[current.y][current.x] + 1;
        }
      }
    }
    return -1;
  }

  generate(): {maze: number[][], start: {x: number, y: number}, end: {x: number, y: number}} {
    // 生成迷宫
    this.generateMaze();

    // 获取所有可能的端点
    const possiblePoints = this.shuffleArray(this.getValidEndpoints());
    
    // 确保有足够的点
    if (possiblePoints.length < 2) {
      // 如果没有足够的点，重新生成迷宫
      return this.generate();
    }

    // 选择距离较远的两个点作为起点和终点
    let maxPathLength = 0;
    let start = possiblePoints[0];
    let end = possiblePoints[1];

    for (let i = 0; i < Math.min(possiblePoints.length, 10); i++) {
      for (let j = i + 1; j < Math.min(possiblePoints.length, 10); j++) {
        const p1 = possiblePoints[i];
        const p2 = possiblePoints[j];
        const pathLength = this.findPath(p1, p2);
        
        if (pathLength > maxPathLength) {
          maxPathLength = pathLength;
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
  const navigate = useNavigate();
  const mazeSize = 15;
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fogEnabled, setFogEnabled] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // 检查移动是否有效
  const isValidMove = (current: {x: number, y: number}, next: {x: number, y: number}): boolean => {
    // 检查是否是相邻格子
    const dx = Math.abs(next.x - current.x);
    const dy = Math.abs(next.y - current.y);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // 检查目标格子是否可通行
      return maze[next.y][next.x] !== 1;
    }
    return false;
  };

  // 检查一个格子是否在玩家的可见范围内
  const isVisible = (cellX: number, cellY: number): 'visible' | '' => {
    if (!fogEnabled) return 'visible';
    
    // 如果是终点，始终可见
    if (maze[cellY][cellX] === 3) {
      return 'visible';
    }
    
    // 计算与玩家的曼哈顿距离
    const dx = Math.abs(cellX - playerPosition.x);
    const dy = Math.abs(cellY - playerPosition.y);
    
    // 5x5 的区域，即上下左右各2格
    if (dx <= 2 && dy <= 2) {
      return 'visible';
    }
    
    return '';
  };

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

      if (isValidMove(playerPosition, newPosition)) {
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

  const getCellClassName = (cell: number, rowIndex: number, colIndex: number) => {
    const baseClassName = (() => {
      if (rowIndex === playerPosition.y && colIndex === playerPosition.x) {
        return styles.player;
      }
      switch (cell) {
        case 1:
          return styles.wall;
        case 2:
          return styles.mazeCell;
        case 3:
          return styles.end;
        default:
          return styles.mazeCell;
      }
    })();

    // 如果迷雾模式开启，只显示玩家周围的区域
    if (fogEnabled) {
      const visibility = isVisible(colIndex, rowIndex);
      if (visibility === '') {
        return styles.wall; // 未探索区域显示为墙
      }
    }

    return baseClassName;
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', padding: '16px 0' }} align="center">
      <Typography.Title level={2} style={{ margin: 0 }}>迷宫游戏</Typography.Title>
      
      <div className={styles.gameStats}>
        <p>移动次数: {moves}</p>
        <p>时间: {formatTime(time)}</p>
      </div>

      <div className={styles.controls}>
        <Button 
          type="primary"
          onClick={generateNewMaze}
          size="large"
        >
          重新开始
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Switch
            checked={fogEnabled}
            onChange={setFogEnabled}
            checkedChildren={<EyeInvisibleOutlined />}
            unCheckedChildren={<EyeOutlined />}
          />
          <span>迷雾模式</span>
        </div>
      </div>

      <p className={styles.instructions}>使用键盘方向键移动</p>
      <div className={styles.maze}>
        {maze.map((row, y) => (
          <div key={y} className={styles.mazeRow}>
            {row.map((cell, x) => {
              const visibility = isVisible(x, y);
              return (
                <div
                  key={`${x}-${y}`}
                  className={getCellClassName(cell, y, x)}
                >
                  {fogEnabled && visibility !== 'visible' && (
                    <div className={styles.fogCell} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {gameWon && (
        <div className={styles.winMessage}>
          <h2>恭喜你完成了迷宫！</h2>
          <p>总用时: {formatTime(time)}</p>
          <p>移动次数: {moves}</p>
        </div>
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

export default MazeGame;
