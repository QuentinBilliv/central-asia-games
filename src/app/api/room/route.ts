import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { GAME_TYPES } from '@/game-logic/types';

// Note: The actual room creation happens via Socket.IO.
// This API route creates the room ID and returns it.
// The client then connects via Socket.IO to join.

// We use a simple in-memory set to track created room IDs.
// The actual room state is managed by the RoomManager in the Socket.IO server.
const createdRooms = new Set<string>();

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
    createdRooms.add(roomId);

    return NextResponse.json({ roomId, gameType });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
