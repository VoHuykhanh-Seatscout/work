"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setMessage("Password cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password updated successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || "Something went wrong!");
      }
    } catch (error) {
      setMessage("Network error. Try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Reset Your Password</h2>

        {message && <p className="text-red-500 mb-4">{message}</p>}

        <label className="block mb-4">
          <span className="text-gray-700">New Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 p-3 w-full border rounded-lg"
            placeholder="Enter your new password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white p-3 rounded-lg w-full hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function NewPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
}