"use client";
import OnboardingForm from '@/components/OnboardingForm';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.onboardingComplete) {
      redirect('/');
    }
  }, [status, session]);

  if (status === "unauthenticated") {
    redirect('/login');
  }

  if (status === "loading" || !session?.user?.id) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div>Loading user data...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <OnboardingForm userId={session.user.id} />
    </div>
  );
}