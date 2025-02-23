"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GridCell } from "@/lib/types";
import { DNA } from "react-loader-spinner";

const GRID_SIZE = 4;

export default function GameGrid() {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [cooldown, setCooldown] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const response = await fetch("/api/gamegrid", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await response.json();
        if (data.grid) {
          setGrid(data.grid);
          setAttemptsLeft(3 - data.selections.length);

          if (data.lastSelection) {
            const nextSelection = new Date(data.lastSelection);
            nextSelection.setDate(nextSelection.getDate() + 1);
            setCooldown(nextSelection.toLocaleString());
          }
        }
      } catch (error) {
        console.error("Failed to load grid:", error);
      }
    };

    fetchGrid();
  }, []);

  const handleCellClick = async (row: number, col: number) => {
    try {
      const response = await fetch("/api/gamegrid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ row, col }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setGrid((prevGrid) => {
        const updatedGrid = prevGrid.map((r, rIndex) =>
          r.map((cell, cIndex) =>
            rIndex === row && cIndex === col
              ? {
                  ...cell,
                  isRevealed: true,
                  value: data.value,
                }
              : cell
          )
        );
        return updatedGrid;
      });

      setAttemptsLeft((prev) => prev - 1);

      if (data.lastSelection) {
        const nextSelection = new Date(data.lastSelection);
        nextSelection.setDate(nextSelection.getDate() + 1);
        setCooldown(nextSelection.toLocaleString());
      }
    } catch (error) {
      console.error("Selection failed:", error);
    }
  };

  if (!grid.length) return <div className="flex justify-center"><DNA/></div>;

  return (
    <Card className="p-8 bg-black/40 border border-white/10 backdrop-blur-sm relative overflow-hidden">
      <div className="space-y-8">
        <div className="grid grid-cols-4 gap-6 max-w-lg mx-auto">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  aspect-square text-3xl font-bold
                  transition-all duration-300 ease-in-out
                  border border-white/10 shadow-lg
                  ${
                    cell.isRevealed
                      ? "bg-green-500/20 hover:bg-green-500/30 border-green-500/30"
                      : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }
                `}
                disabled={cell.isRevealed || attemptsLeft <= 0}
              >
                {cell.isRevealed ? (
                  <span className="text-green-400">{cell.value}</span>
                ) : (
                  "?"
                )}
              </Button>
            ))
          )}
        </div>

        <div className="text-center space-y-4">
          <div className="text-lg text-white/80">
            Attempts remaining: <span className="font-bold text-white">{attemptsLeft}</span>
          </div>
          {cooldown && (
            <div className="text-sm text-yellow-400">
              Next selection available: {cooldown}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
