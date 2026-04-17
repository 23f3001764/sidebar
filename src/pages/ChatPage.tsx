import { SteamiLayout } from "@/components/SteamiLayout";
import ChatDashboard from "@/components/chat/ChatDashboard";

export default function ChatPage() {
  return (
    <SteamiLayout>
      <div className="space-y-5">
        <div>
          <div className="steami-section-label mb-2">CHAT API</div>
          <h1 className="steami-heading text-2xl md:text-3xl">Messages</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Send messages, poll conversations, and mark received messages as seen.
          </p>
        </div>
      </div>
      <ChatDashboard onClose={() => history.back()} />
    </SteamiLayout>
  );
}
