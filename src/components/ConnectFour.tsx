import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, Users } from 'lucide-react';

type Player = 1 | 2;
type Cell = Player | null;
type Board = Cell[][];

const ROWS = 6;
const COLS = 7;

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | null;
  winningCells: number[][];
  gameOver: boolean;
}

const ConnectFour: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
    currentPlayer: 1,
    winner: null,
    winningCells: [],
    gameOver: false,
  }));

  const [dropAnimation, setDropAnimation] = useState<{col: number, row: number} | null>(null);

  const checkWinner = useCallback((board: Board, row: number, col: number, player: Player): number[][] => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal /
      [1, -1],  // diagonal \
    ];

    for (const [dx, dy] of directions) {
      const cells: number[][] = [[row, col]];
      
      // Check in positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          cells.push([newRow, newCol]);
        } else {
          break;
        }
      }
      
      // Check in negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          cells.unshift([newRow, newCol]);
        } else {
          break;
        }
      }
      
      if (cells.length >= 4) {
        return cells.slice(0, 4); // Return first 4 cells
      }
    }
    
    return [];
  }, []);

  const dropPiece = useCallback((col: number) => {
    if (gameState.gameOver) return;

    const newBoard = gameState.board.map(row => [...row]);
    
    // Find the lowest empty row in the column
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = gameState.currentPlayer;
        
        // Set drop animation
        setDropAnimation({ col, row });
        setTimeout(() => setDropAnimation(null), 600);
        
        // Check for winner
        const winningCells = checkWinner(newBoard, row, col, gameState.currentPlayer);
        const hasWinner = winningCells.length > 0;
        
        // Check for draw
        const isDraw = !hasWinner && newBoard.every(row => row.every(cell => cell !== null));
        
        setGameState({
          board: newBoard,
          currentPlayer: hasWinner || isDraw ? gameState.currentPlayer : (gameState.currentPlayer === 1 ? 2 : 1),
          winner: hasWinner ? gameState.currentPlayer : null,
          winningCells,
          gameOver: hasWinner || isDraw,
        });
        
        return;
      }
    }
  }, [gameState, checkWinner]);

  const resetGame = useCallback(() => {
    setGameState({
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill(null)),
      currentPlayer: 1,
      winner: null,
      winningCells: [],
      gameOver: false,
    });
    setDropAnimation(null);
  }, []);

  const isWinningCell = (row: number, col: number): boolean => {
    return gameState.winningCells.some(([r, c]) => r === row && c === col);
  };

  const canDropInColumn = (col: number): boolean => {
    return !gameState.gameOver && gameState.board[0][col] === null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
            Connect Four
          </h1>
          <p className="text-slate-300 text-lg">Drop your pieces and connect four in a row to win!</p>
        </div>

        {/* Game Status */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-6">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="text-slate-400" size={24} />
              {gameState.winner ? (
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={24} />
                  <span className="text-xl font-semibold text-white">
                    Player {gameState.winner} Wins!
                  </span>
                  <div className={`w-6 h-6 rounded-full ${gameState.winner === 1 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-yellow-400 to-yellow-500'} shadow-lg`} />
                </div>
              ) : gameState.gameOver ? (
                <span className="text-xl font-semibold text-slate-300">It's a Draw!</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold text-white">
                    Player {gameState.currentPlayer}'s Turn
                  </span>
                  <div className={`w-6 h-6 rounded-full ${gameState.currentPlayer === 1 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-yellow-400 to-yellow-500'} shadow-lg animate-pulse`} />
                </div>
              )}
            </div>
            <Button
              onClick={resetGame}
              variant="outline"
              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
            >
              <RotateCcw size={16} className="mr-2" />
              New Game
            </Button>
          </div>
        </Card>

        {/* Game Board */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <div className="p-8">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 shadow-inner">
              {/* Column Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: COLS }, (_, col) => (
                  <button
                    key={col}
                    onClick={() => dropPiece(col)}
                    disabled={!canDropInColumn(col)}
                    className={`h-12 rounded-lg transition-all duration-200 ${
                      canDropInColumn(col)
                        ? 'bg-slate-600/50 hover:bg-slate-500/70 hover:scale-105 cursor-pointer'
                        : 'bg-slate-700/30 cursor-not-allowed opacity-50'
                    } flex items-center justify-center`}
                  >
                    <div className="text-slate-300 font-semibold">{col + 1}</div>
                  </button>
                ))}
              </div>

              {/* Game Grid */}
              <div className="grid grid-cols-7 gap-2">
                {gameState.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isWinner = isWinningCell(rowIndex, colIndex);
                    const isAnimating = dropAnimation?.col === colIndex && dropAnimation?.row === rowIndex;
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="aspect-square bg-slate-600 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden"
                      >
                        {cell && (
                          <div
                            className={`w-[85%] h-[85%] rounded-full shadow-lg transition-all duration-300 ${
                              cell === 1
                                ? 'bg-gradient-to-br from-red-400 to-red-600'
                                : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                            } ${
                              isWinner
                                ? 'ring-4 ring-white ring-opacity-80 animate-pulse shadow-2xl'
                                : ''
                            } ${
                              isAnimating
                                ? 'animate-bounce'
                                : ''
                            }`}
                            style={{
                              boxShadow: isWinner
                                ? '0 0 20px rgba(255, 255, 255, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                                : '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Game Rules */}
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-sm mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
            <div className="grid md:grid-cols-2 gap-4 text-slate-300">
              <div>
                <Badge variant="outline" className="mb-2 border-red-500 text-red-400">Player 1</Badge>
                <p className="text-sm">Red pieces - Click a column to drop your piece</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-yellow-500 text-yellow-400">Player 2</Badge>
                <p className="text-sm">Yellow pieces - Take turns with Player 1</p>
              </div>
              <div className="md:col-span-2">
                <Badge variant="outline" className="mb-2 border-green-500 text-green-400">Objective</Badge>
                <p className="text-sm">Connect four of your pieces in a row (horizontally, vertically, or diagonally) to win!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConnectFour;