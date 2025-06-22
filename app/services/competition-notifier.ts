// services/competition-notifier.ts
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

// Configuration
const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = `Aspire X <notifications@${process.env.EMAIL_DOMAIN}>`;
const BASE_URL = process.env.BASE_URL;

if (!BASE_URL || !process.env.RESEND_API_KEY || !process.env.EMAIL_DOMAIN) {
  throw new Error('Missing required email configuration');
}

interface CompetitionDetails {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  startDate: Date;
  prize?: string;
  coverImage?: string | null;
}

export class CompetitionNotifier {
  /**
   * Send notification about new competition to a single user
   */
  private static async sendToUser(email: string, competition: CompetitionDetails): Promise<boolean> {
    const competitionLink = `${BASE_URL}/competitions/${competition.id}`;
    
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `🏆 New Competition: ${competition.title}`,
        html: this.buildHtmlTemplate(competition, competitionLink),
        text: this.buildTextTemplate(competition, competitionLink),
      });
      console.log(`✅ Email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send to ${email}:`, error);
      return false;
    }
  }

  /**
   * Notify all eligible users about a new competition
   */
  public static async notifyAboutNewCompetition(competitionId: string): Promise<{
    totalSent: number;
    totalFailed: number;
    failedEmails: string[];
  }> {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        organizer: true,
        prizes: { orderBy: { position: 'asc' }, take: 1 }
      }
    });

    if (!competition) {
      throw new Error(`Competition ${competitionId} not found`);
    }

    const competitionDetails: CompetitionDetails = {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      organizerName: competition.organizer.name,
      startDate: competition.startDate,
      prize: competition.prizes[0]?.name,
      coverImage: competition.coverImage
    };

    // Get all students who should be notified
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        onboardingComplete: true,
      },
      select: { email: true }
    });

    // Tracking variables
    let totalSent = 0;
    let totalFailed = 0;
    const failedEmails: string[] = [];

    // Send in batches to avoid rate limiting
    const BATCH_SIZE = 50; // Resend allows up to 100 per batch
    const DELAY_MS = 1000; // 1 second delay between batches
    
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(
        batch.map(user => this.sendToUser(user.email, competitionDetails))
      );

      // Update tracking
      batchResults.forEach((success, index) => {
        if (success) {
          totalSent++;
        } else {
          totalFailed++;
          failedEmails.push(batch[index].email);
        }
      });

      // Add delay between batches if not last batch
      if (i + BATCH_SIZE < users.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    return {
      totalSent,
      totalFailed,
      failedEmails
    };
  }

  private static buildHtmlTemplate(competition: CompetitionDetails, link: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          padding: 20px; 
          border: 1px solid #ddd; 
          border-radius: 8px; 
          background-color: white;
        }
        .header { 
          background-color: #D84315; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
          margin: -20px -20px 20px -20px;
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #FF5722; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px; 
          margin: 20px 0; 
          font-weight: bold;
        }
        .prize { 
          background-color: #FFF3E0; 
          padding: 15px; 
          border-radius: 4px; 
          margin: 15px 0; 
          border-left: 4px solid #FF9800;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 10px;
            padding: 15px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Competition Alert!</h1>
        </div>
        
        <h2>${competition.title}</h2>
        <p>${competition.description.substring(0, 200)}...</p>
        
        <div class="details">
          <p><strong>Organizer:</strong> ${competition.organizerName}</p>
          <p><strong>Starts:</strong> ${competition.startDate.toLocaleDateString()}</p>
          ${competition.prize ? `
            <div class="prize">
              <strong>🏆 Prize:</strong> ${competition.prize}
            </div>
          ` : ''}
        </div>
        
        <a href="${link}" class="button">View Competition Details</a>
        
        <p style="font-size: 0.9em; color: #777;">
          You're receiving this because you're subscribed to competition alerts from Aspire X.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  private static buildTextTemplate(competition: CompetitionDetails, link: string): string {
    return `
New Competition: ${competition.title}

${competition.description.substring(0, 200)}...

Organizer: ${competition.organizerName}
Starts: ${competition.startDate.toLocaleDateString()}
${competition.prize ? `Prize: ${competition.prize}` : ''}

View competition: ${link}

You're receiving this because you're subscribed to competition alerts from Aspire X.
    `.trim();
  }
}