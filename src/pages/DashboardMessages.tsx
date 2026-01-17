import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MessageSquare, Send, Check, CheckCheck } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface Message {
  id: string;
  subject: string;
  content: string;
  is_read: boolean;
  is_from_admin: boolean;
  created_at: string;
}

const DashboardMessages = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: "", content: "" });

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.subject.trim() || !newMessage.content.trim()) {
      toast.error("Completează subiectul și mesajul");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        user_id: user.id,
        subject: newMessage.subject.trim(),
        content: newMessage.content.trim(),
        is_from_admin: false,
      });

      if (error) throw error;

      toast.success("Mesajul a fost trimis!");
      setNewMessage({ subject: "", content: "" });

      // Refresh messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setMessages(data || []);
    } catch (error) {
      toast.error("Eroare la trimiterea mesajului");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m))
      );
    } catch (error) {
      console.error("Error marking message as read");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Message Form */}
        <div className="bg-card rounded-2xl p-6 border border-border h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-accent" />
            Trimite un mesaj
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subiect</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder="Cu ce te putem ajuta?"
                className="mt-1.5 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="content">Mesaj</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Descrie detaliat problema sau întrebarea ta..."
                rows={6}
                className="mt-1.5 bg-background resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={sending}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Se trimite...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Trimite mesajul
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            Mesajele tale
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Nu ai mesaje încă. Trimite primul mesaj!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => !message.is_read && markAsRead(message.id)}
                  className={`bg-card rounded-xl p-5 border transition-colors cursor-pointer ${
                    message.is_read
                      ? "border-border"
                      : "border-accent/50 bg-accent/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {message.is_from_admin && (
                          <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent">
                            Echipa HRL
                          </span>
                        )}
                        <h3 className="font-medium">{message.subject}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {message.is_read ? (
                        <CheckCheck className="w-4 h-4 text-accent" />
                      ) : (
                        <Check className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {message.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), "d MMM yyyy, HH:mm", {
                      locale: ro,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMessages;
