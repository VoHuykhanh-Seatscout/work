"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BusinessCompetitionDetails() {
  const { competitionId } = useParams(); // ✅ Ensure consistent slug naming
  const { data: session, status } = useSession();
  const [competition, setCompetition] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCompetition() {
      console.log("🔹 Fetching competition:", competitionId);
      try {
        const res = await fetch(`/api/competitions/business/${competitionId}`);
        console.log("🔹 API Response status:", res.status);

        if (!res.ok) {
          throw new Error("Competition not found or access denied");
        }

        const data = await res.json();
        console.log("✅ Fetched competition:", data);
        
        setCompetition(data.competition);
        setParticipants(data.competition?.registrations || []); // ✅ Prevent undefined issues
      } catch (err) {
        console.error("❌ Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (competitionId && status === "authenticated") {
      if (session?.user?.role === "BUSINESS") {
        fetchCompetition();
      } else {
        router.push("/");
      }      
    }
  }, [competitionId, session, status]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-teal-700">{competition.title}</h1>
        <p className="text-gray-700 mt-4">{competition.description}</p>
        <p className="text-gray-500 mt-2">📍 {competition.location}</p>
        <p className="text-gray-500">🕒 Deadline: {new Date(competition.deadline).toLocaleDateString()}</p>
        <img src={competition.imageUrl || "/placeholder.jpg"} alt={competition.title} className="mt-4 rounded-lg shadow-lg" />

        {/* Participants List */}
        <div className="mt-10 bg-white shadow-md p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">📋 Registered Participants</h2>
          {participants.length === 0 ? (
            <p className="text-gray-500">No participants yet.</p>
          ) : (
            <ul>
              {participants.map((p, index) => (
                <li 
                  key={index} 
                  className="flex items-center gap-4 border-b py-3 cursor-pointer"
                  onClick={() => router.push(`/competitions/business/${competitionId}/participants/${p.user.id}`)} // ✅ Fixed URL
                >
                  <img src={p.user.profileImage || "/default-avatar.png"} alt={p.user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-lg font-medium">{p.user.name}</p>
                    <p className="text-gray-500 text-sm">{p.user.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
