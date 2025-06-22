// lib/notification.ts
import prisma from "@/lib/prisma";

// Existing function
export async function notifyCompetitionPublished(competition: {
  id: string;
  title: string;
  organizerName: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: null, // Broadcast to all users
        type: "competition_published",
        title: "New Competition Published!",
        message: `${competition.title} by ${competition.organizerName} is now available`,
        link: `/competitions/${competition.id}`,
        metadata: { competitionId: competition.id },
        readBy: [] // No one has read it yet
      }
    });
  } catch (error) {
    console.error("Failed to create competition published notification:", error);
  }
}

// New function to mark notifications as read
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data: {
        read: true
      }
    });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    throw error;
  }
}