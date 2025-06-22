import { NextResponse } from 'next/server';
import { CompetitionNotifier } from '@/services/competition-notifier';

export async function POST(request: Request) {
  try {
    const { competitionId } = await request.json();
    
    // This runs on the server so we can process large batches
    await CompetitionNotifier.notifyAboutNewCompetition(competitionId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Notifications are being sent'
    });
  } catch (error) {
    console.error('Error sending competition notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}