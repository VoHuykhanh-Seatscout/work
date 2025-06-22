"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { SubmissionStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface SubmissionsSectionProps {
  competitionId: string;
  roundId?: string;
  userId?: string;
}

interface SubmissionWithRelations {
  id: string;
  userId: string;
  roundId: string;
  competitionId: string;
  content: any;
  submittedAt: Date;
  status: SubmissionStatus;
  feedback: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  advanced: boolean;
  nextRoundId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
  };
  round: {
    id: string;
    name: string;
  };
  competition: {
    id: string;
    title: string;
  };
  nextRound: {
    id: string;
    name: string;
  } | null;
}

export default function SubmissionsSection({
  competitionId,
  roundId,
  userId
}: SubmissionsSectionProps) {
  const [submissions, setSubmissions] = useState<SubmissionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('competitionId', competitionId);
        if (roundId) params.append('roundId', roundId);
        if (userId) params.append('userId', userId);

        const response = await fetch(`/api/submissions?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (competitionId) {
      fetchSubmissions();
    }
  }, [competitionId, roundId, userId]);

  const getStatusBadge = (status: SubmissionStatus, advanced: boolean) => {
    const statusMap = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        label: 'Pending Review' 
      },
      approved: { 
        color: advanced ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800', 
        label: advanced ? 'Advanced' : 'Approved' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        label: 'Rejected' 
      }
    }
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status]?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusMap[status]?.label || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Submissions</h2>
        {session?.user && (
          <div className="space-x-2">
            <Button variant="outline">Filter</Button>
            <Button>Download All</Button>
          </div>
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted By</TableHead>
              <TableHead>Current Round</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Advancement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="flex items-center gap-2">
                    {submission.user.profileImage && (
                      <img 
                        src={submission.user.profileImage} 
                        alt={submission.user.name || ''}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{submission.user.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{submission.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{submission.round.name}</TableCell>
                  <TableCell>{submission.competition.title}</TableCell>
                  <TableCell>
                    {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.status, submission.advanced)}
                  </TableCell>
                  <TableCell>
                    {submission.advanced && submission.nextRound ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">Advanced to:</span>
                        <span className="text-sm text-gray-600">
                          {submission.nextRound.name}
                        </span>
                      </div>
                    ) : submission.status === 'approved' ? (
                      <span className="text-sm text-gray-500">Not advanced</span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/submissions/${submission.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No submissions found for this competition
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}