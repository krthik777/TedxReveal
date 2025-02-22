"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { GridCell } from "@/lib/types";

const GRID_SIZE = 4;
const HIDDEN_NUMBERS = [3, 7, 9]; // Example hidden numbers

export default function GameGrid() {
  const [grid, setGrid] = useState<GridCell[][]>(
    Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        value: null,
        isRevealed: false,
      }))
    )
  );
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const handleCellClick = (row: number, col: number) => {
    if (attemptsLeft <= 0 || grid[row][col].isRevealed) return;

    const newGrid = [...grid];
    const cellValue = Math.floor(Math.random() * 9) + 1; // Simulate random number for demo

    if (HIDDEN_NUMBERS.includes(cellValue)) {
      newGrid[row][col] = {
        value: cellValue,
        isRevealed: true,
      };
    } else {
      newGrid[row][col] = {
        value: null,
        isRevealed: true,
        isIncorrect: true,
      };
    }

    setGrid(newGrid);
    setAttemptsLeft(attemptsLeft - 1);
  };

  return (
    <Card className="p-8 bg-black/40 border border-white/10 backdrop-blur-sm relative overflow-hidden">
      <div className="gradient-line left-1/4" />
      <div className="gradient-line left-2/4" />
      <div className="gradient-line left-3/4" />
      
      <div className="space-y-8">
        <div className="grid grid-cols-4 gap-6 max-w-lg mx-auto">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  aspect-square text-3xl font-bold
                  transition-all duration-300 ease-in-out
                  border border-white/10 shadow-lg
                  ${cell.isRevealed
                    ? cell.isIncorrect
                      ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/30"
                      : "bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
                    : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }
                `}
                disabled={cell.isRevealed || attemptsLeft <= 0}
              >
                {cell.isRevealed ? (
                  cell.isIncorrect ? (
                    <X className="w-8 h-8 text-red-500" />
                  ) : (
                    <span className="text-green-400">{cell.value}</span>
                  )
                ) : (
                  "?"
                )}
              </Button>
            ))
          ))}
        </div>
        
        <div className="text-center text-lg text-white/80">
          Attempts remaining: <span className="font-bold text-white">{attemptsLeft}</span>
        </div>
      </div>
    </Card>
  );
}