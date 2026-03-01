import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { GAME_TYPES } from '@/game-logic/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameType } = body;

    if (!gameType || !(GAME_TYPES as readonly string[]).includes(gameType)) {
      return NextResponse.json(
        { error: 'Invalid game type' },
        { status: 400 }
      );
    }

    const roomId = nanoid(8);

    return NextResponse.json({ roomId, gameType });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
