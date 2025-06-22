import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, organizerId } = req.query;

    if (!userId && !organizerId) {
      return res.status(400).json({ message: "User ID or Organizer ID is required" });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userId: userId || undefined },
          { organizerId: organizerId || undefined },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
