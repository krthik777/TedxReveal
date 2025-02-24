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
  return Array(4).fill(null).map(() => 
    Array(4).fill(null).map(() => ({
      value: Math.floor(Math.random() * 900) + 100,
      isRevealed: false
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const authToken = req.headers.get('authorization')?.split(' ')[1];
    if (!authToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = jwt.verify(authToken, JWT_SECRET) as { email: string };
    const { row, col, value } = await req.json(); // Get value from request body
    
    const client = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');
    const gameSelections = db.collection('selections');

    const user = await users.findOne({ email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check last selection
    const lastSelection = await gameSelections.findOne(
      { email },
      { sort: { timestamp: -1 } }
    );

    if (lastSelection) {
      const lastSelectionTime = new Date(lastSelection.timestamp).getTime();
      const remainingTime = Date.now() - lastSelectionTime;
      const hoursPassed = Math.floor(remainingTime / (1000 * 60 * 60));

      if (hoursPassed < 24) {
        const remainingHours = 24 - hoursPassed;
        return NextResponse.json({ 
          error: 'Wait for your next chance',
          remaining: remainingHours * 60 * 60 * 1000 - remainingTime
        }, { status: 429 });
      }
    }

    // Generate and save new grid
    const newGrid = generateRandomGrid();
    const selectedCell = newGrid[row][col];
    selectedCell.isRevealed = true;

    await gameSelections.insertOne({
      email,
      value: value, // Use value from request
      timestamp: new Date()
    });

    return NextResponse.json({ 
      success: true,
      value: value // Return the received value
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
    const gameSelections = db.collection('selections');

    // Get all selections for the user
    const allSelections = await gameSelections.find({ email }).sort({ timestamp: -1 }).toArray();

    let canPlay = true;
    let remaining = 0;
    
    if (allSelections.length > 0) {
      const lastSelection = allSelections[0];
      const lastSelectionTime = new Date(lastSelection.timestamp).getTime();
      remaining = Date.now() - lastSelectionTime;
      const hoursPassed = Math.floor(remaining / (1000 * 60 * 60));
      canPlay = hoursPassed >= 24;
      remaining = 24 * 60 * 60 * 1000 - remaining;
    }

    return NextResponse.json({
      canPlay,
      remaining: remaining > 0 ? remaining : 0,
      grid: canPlay ? generateRandomGrid() : null,
      selections: allSelections.map(s => s.value) // Return all values
    });

  } catch (error) {
    console.error('Game grid error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}