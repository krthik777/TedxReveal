export interface GridCell {
  value: number | null;
  isRevealed: boolean;
  isIncorrect?: boolean;
}