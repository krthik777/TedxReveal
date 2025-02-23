import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();
    const users = db.collection('users');

    // Check existing user
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      // Verify password
      const isValid = await bcrypt.compare(password, existingUser.password);
      if (!isValid) {
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await users.insertOne({
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      if (!result.acknowledged) {
        throw new Error('Failed to create user');
      }
    }

    // Generate JWT token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({
      success: true,
      email,
      token
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}