import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId, organizerId, competitionId } = req.body;

    // Check if the conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        userId,
        organizerId,
        competitionId,
      },
    });

    if (existingConversation) {
      return res.status(200).json({ message: "Conversation already exists", conversation: existingConversation });
    }

    // Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        organizerId,
        competitionId,
      },
    });

    return res.status(201).json({ message: "Conversation created successfully", conversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
