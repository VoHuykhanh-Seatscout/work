import ConversationView from "@/messages/components/ConversationView";

interface PageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { conversationId } = await params;
  return <ConversationView conversationId={conversationId} />;
}