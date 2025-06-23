import ConversationView from "@/business-dashboard/message/components/ConversationView";

// Solution 1: Use type assertion (most reliable)
export default function Page(props: any) {
  const { params } = props as {
    params: { conversationId: string }
  };
  return <ConversationView conversationId={params.conversationId} />;
}