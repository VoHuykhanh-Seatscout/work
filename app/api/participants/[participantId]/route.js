import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET(req, { params }) {
  try {
    console.log("🔹 Received params:", params); 

    const { participantId } = params; 

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 });
    }

    // Fetch user and studentProfile together
    const participant = await prisma.user.findUnique({
      where: { id: participantId }, 
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,

        // Fetch student profile
        studentProfile: {
          select: {
            university: true,
            degree: true,
            graduationYear: true,
            skills: true,
            linkedin: true,
            github: true,
            resume: true,
          },
        },
      },
    });

    if (!participant) {
      console.error("❌ Participant not found:", participantId);
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    // Extract student profile details
    const studentProfile = participant.studentProfile || {};

    console.log("✅ Found participant:", participant);

    return NextResponse.json({
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        profileImage: participant.profileImage,
        role: participant.role,
        
        // Ensure studentProfile data exists
        university: studentProfile.university || "Not provided",
        degree: studentProfile.degree || "Not provided",
        graduationYear: studentProfile.graduationYear || "Not provided",
        skills: studentProfile.skills?.length > 0 ? studentProfile.skills : ["No skills listed"],
        linkedin: studentProfile.linkedin || "Not provided",
        github: studentProfile.github || "Not provided",
        resume: studentProfile.resume || "Not uploaded",
      },
    }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
