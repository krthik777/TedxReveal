"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DNA } from "react-loader-spinner";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const formatTime = (milliseconds: number) => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

export default function GameGrid() {
  const [grid, setGrid] = useState<{ value: number; isRevealed: boolean }[][]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cooldown, setCooldown] = useState<number>(0);
  const [canPlay, setCanPlay] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [fetchError, setFetchError] = useState(false); // Error state

  const fetchSelections = async () => {
    try {
      const response = await fetch("/api/gamegrid", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      if (data.selections) {
        setSelectedNumbers(data.selections);
      }
      setFetchError(false); // Reset error state on success
    } catch (error) {
      console.error("Failed to fetch selections:", error);
      setFetchError(true); // Set error state on failure
    } finally {
      setIsLoading(false); // Always stop loading
    }
  };

  useEffect(() => {
    const checkAvailability = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await fetch("/api/gamegrid", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setCanPlay(data.canPlay);
        setCooldown(data.remaining);

        if (data.canPlay) {
          setGrid(data.grid);
          setSelectedNumbers(data.selections);
        } else {
          await fetchSelections();
        }
        setFetchError(false); // Reset error state on success
      } catch (error) {
        console.error("Failed to load grid:", error);
        setFetchError(true); // Set error state on failure
      } finally {
        setIsLoading(false); // Always stop loading
      }
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => Math.max(prev - 1000, 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleCellClick = async (row: number, col: number) => {
    try {
      // Get value from current grid state
      const cellValue = grid[row][col].value;

      const response = await fetch("/api/gamegrid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ row, col, value: cellValue }), // Send actual value
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Wait for your next chance") {
          Swal.fire({
            icon: "error",
            title: "Cooldown Active",
            html: `Next chance available in: <b>${formatTime(data.remaining)}</b>`,
            background: "#1e1e1e",
            color: "#fff",
            iconColor: "#ef4444",
            confirmButtonColor: "#3b82f6",
          });
        }
        return;
      }

      // Highlight the selected cell
      setSelectedCell({ row, col });

      // Wait for 2 seconds to show the selected number
      setTimeout(() => {
        const newGrid = [...grid];
        newGrid[row][col].isRevealed = true;
        setGrid(newGrid);
        setSelectedNumbers((prev) => [...prev, cellValue]);
        setCanPlay(false);
        setCooldown(24 * 60 * 60 * 1000);
      }, 2000);
    } catch (error) {
      console.error("Selection failed:", error);
      setFetchError(true); // Set error state on failure
    }
  };

  // Show loading spinner if data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <DNA
          visible={true}
          height="80"
          width="80"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
        />
      </div>
    );
  }

  // Show error message if fetching fails
  if (fetchError) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white/90">
            Failed to Load Data
          </h2>
          <p className="text-lg text-white/70 justify-center flex">
            Please login again.
          </p>
          <Button
            onClick={() => window.location.href = "/login"}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            GO to login
          </Button>
        </div>
      </div>
    );
  }

  // Show grid or cooldown screen based on canPlay state
  return (
    <Card className="p-4 bg-black/40 border border-white/10 backdrop-blur-sm relative overflow-hidden">
      <div className="space-y-8">
        {canPlay ? (
          <>
            <div className="grid grid-cols-4 gap-3 md:gap-6 mx-auto max-w-md">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`aspect-square text-xl font-bold transition-all duration-300 ease-in-out
                        border border-white/10 shadow-lg flex justify-center items-center
                        ${cell.isRevealed || (selectedCell?.row === rowIndex && selectedCell?.col === colIndex)
                          ? "bg-green-500/20 border-green-500/30"
                          : "bg-white/5 hover:bg-white/10"
                        }`}
                      disabled={cell.isRevealed}
                    >
                      <span className={cell.isRevealed || (selectedCell?.row === rowIndex && selectedCell?.col === colIndex) ? "text-green-400" : "text-red-800"}>
                        {cell.value}
                      </span>
                    </Button>
                  </motion.div>
                ))
              )}
            </div>

            <div className="text-center space-y-4">
              <div className="text-lg text-white/80">
                Selected Numbers:{" "}
                <span className="font-bold text-white">
                  {selectedNumbers.join(", ")}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white/90">
              Next Chance Available In
            </h2>
            <div className="text-3xl font-mono text-red-400">
              {formatTime(cooldown)}
            </div>
            <div className="text-lg text-white/80">
              Your Selected Numbers:{" "}
              <span className="font-bold text-white">
                {selectedNumbers.join(", ")}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}