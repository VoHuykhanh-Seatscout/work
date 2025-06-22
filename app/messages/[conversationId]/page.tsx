import ConversationView from "@/messages/components/ConversationView";

interface PageProps {
  params: {
    conversationId: string;  // Change to 'conversationId'
  };
}

export default function Page({ params }: PageProps) {
  return <ConversationView conversationId={params.conversationId} />;
}