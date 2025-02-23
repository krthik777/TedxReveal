import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;

let cachedDb: MongoClient;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = await MongoClient.connect(MONGODB_URI);
  cachedDb = client;
  return client;
}

function generateRandomGrid() {
  const numbers = [...Array(9).keys()].map(n => n + 1);
  let shuffledNumbers = [...numbers, ...numbers].sort(() => Math.random() - 0.5);
  return Array(4).fill(null).map(() => 
    Array(4).fill(null).map(() => ({
      value: shuffledNumbers.pop()!,
      isRevealed: false
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get('authorization')?.split(' ')[1];
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = jwt.verify(authToken, JWT_SECRET) as { email: string };
    const { row, col } = await req.json();
    
    const client = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');
    const gameGrids = db.collection('gamegrids');

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Get or create game grid
    let gridData = await gameGrids.findOne<{ _id: ObjectId; email: string; grid: { value: number; isRevealed: boolean; }[][]; hiddenNumbers: number[]; selections: { row: number; col: number; timestamp: Date; }[]; lastSelection: Date | null; }>({ email });

    if (!gridData) {
      // Generate new grid with all numbers from 1-9
      const newGrid = generateRandomGrid();
      gridData = {
        _id: new ObjectId(),
        email,
        grid: newGrid,
        hiddenNumbers: [],
        selections: [],
        lastSelection: null
      };
      await gameGrids.insertOne(gridData);
    }

    // Filter selections made in the last 24 hours
    const todaySelections = gridData.selections.filter(selection => 
      Date.now() - new Date(selection.timestamp).getTime() < 86400000
    );

    if (todaySelections.length >= 3) {
      return NextResponse.json({ 
        error: 'You can only make three selections per day' 
      }, { status: 429 });
    }

    // Update grid
    const updatedGrid = [...gridData.grid];
    const cell = updatedGrid[row][col];
    cell.isRevealed = true;
    
    await gameGrids.updateOne(
      { email },
      { 
        $set: { 
          grid: updatedGrid
        },
        $push: { selections: { row, col, timestamp: new Date() } as any }
      }
    );

    return NextResponse.json({ 
      success: true,
      value: cell.value,
      isCorrect: gridData.hiddenNumbers.includes(cell.value)
    });

  } catch (error) {
    console.error('Game grid error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authToken = req.headers.get('authorization')?.split(' ')[1];
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = jwt.verify(authToken, JWT_SECRET) as { email: string };
    const client = await connectToDatabase();
    const db = client.db();
    const gameGrids = db.collection('gamegrids');

    let gridData = await gameGrids.findOne<{ _id: ObjectId; email: string; grid: { value: number; isRevealed: boolean; }[][]; hiddenNumbers: number[]; selections: { row: number; col: number; timestamp: Date; }[]; lastSelection: Date | null; }>({ email });
    
    if (!gridData) {
      // Generate new grid if not found
      const newGrid = generateRandomGrid();
      gridData = {
        _id: new ObjectId(),
        email,
        grid: newGrid,
        hiddenNumbers: [],
        selections: [],
        lastSelection: null
      };
      await gameGrids.insertOne(gridData);
    }

    return NextResponse.json({
      grid: gridData.grid,
      selections: gridData.selections,
      lastSelection: gridData.lastSelection
    });

  } catch (error) {
    console.error('Game grid error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
