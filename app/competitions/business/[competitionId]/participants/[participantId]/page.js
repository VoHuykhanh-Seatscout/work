"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ParticipantProfile() {
  const { competitionId, participantId } = useParams();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchParticipant() {
      try {
        const res = await fetch(`/api/participants/${participantId}`);
        if (!res.ok) throw new Error("Participant not found");

        const data = await res.json();
        setParticipant(data.participant);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipant();
  }, [participantId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-10 px-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-teal-700">{participant.name}</h1>
        <p className="text-gray-600">{participant.email}</p>
        <p className="text-gray-500">🎓 {participant.university}</p>
        <p className="text-gray-500">📍 {participant.location}</p>

        <img
          src={participant.profileImage || "/default-avatar.png"}
          alt={participant.name}
          className="mt-4 rounded-lg shadow-lg w-40 h-40 object-cover"
        />

        {/* Additional Details */}
        <div className="mt-6">
          <h2 className="text-xl font-bold">📖 About</h2>
          <p className="text-gray-700 mt-2">{participant.bio || "No bio available"}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold">🎯 Skills</h2>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {participant.skills?.length > 0
              ? participant.skills.map((skill, index) => <li key={index}>{skill}</li>)
              : "No skills listed"}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold">📜 Certifications</h2>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {participant.certifications?.length > 0
              ? participant.certifications.map((cert, index) => <li key={index}>{cert}</li>)
              : "No certifications listed"}
          </ul>
        </div>
      </div>
    </div>
  );
}
