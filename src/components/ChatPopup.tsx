/**
 * ChatPopup.tsx — replaces the old "coming soon" stub.
 * Renders the full ChatDashboard when the Chat tab button is clicked.
 */
import ChatDashboard from "./chat/ChatDashboard";

interface Props {
  onClose: () => void;
}

export default function ChatPopup({ onClose }: Props) {
  return <ChatDashboard onClose={onClose} />;
}