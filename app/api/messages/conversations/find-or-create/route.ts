import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { participantId } = await req.json();
  
  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: session.user.id, user2Id: participantId },
        { user1Id: participantId, user2Id: session.user.id }
      ]
    },
    include: {
      user1: true,
      user2: true
    }
  });

  if (existingConversation) {
    return NextResponse.json({ conversation: existingConversation });
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      user1Id: session.user.id,
      user2Id: participantId
    },
    include: {
      user1: true,
      user2: true
    }
  });

  return NextResponse.json({ conversation }, { status: 201 });
}