import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Package, MessageSquare, FileText, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  packages: number;
  messages: number;
  projects: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats>({ packages: 0, messages: 0, projects: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const [packagesRes, messagesRes, projectsRes] = await Promise.all([
          supabase.from("purchased_packages").select("id", { count: "exact" }).eq("user_id", user.id),
          supabase.from("messages").select("id", { count: "exact" }).eq("user_id", user.id).eq("is_read", false),
          supabase.from("project_requests").select("id", { count: "exact" }).eq("user_id", user.id),
        ]);

        setStats({
          packages: packagesRes.count || 0,
          messages: messagesRes.count || 0,
          projects: projectsRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const statCards = [
    {
      icon: Package,
      label: "Pachete active",
      value: stats.packages,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: MessageSquare,
      label: "Mesaje necitite",
      value: stats.messages,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: FileText,
      label: "Proiecte trimise",
      value: stats.projects,
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: TrendingUp,
      label: "Total activitate",
      value: stats.packages + stats.projects,
      color: "bg-accent/10 text-accent",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
          <h2 className="text-2xl font-bold mb-2">
            Bine ai venit, {user.user_metadata?.full_name || "Utilizator"}! 👋
          </h2>
          <p className="text-primary-foreground/80">
            Aici poți vizualiza statusul proiectelor tale și comunica cu echipa noastră.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold mb-1">
                {loadingStats ? "-" : stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Acțiuni rapide</h3>
            <div className="space-y-3">
              <a
                href="/dashboard/projects"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <FileText className="w-5 h-5 text-accent" />
                <span>Trimite o cerere de proiect</span>
              </a>
              <a
                href="/dashboard/messages"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-accent" />
                <span>Trimite un mesaj echipei</span>
              </a>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Suport</h3>
            <p className="text-muted-foreground mb-4">
              Ai nevoie de ajutor? Echipa noastră îți stă la dispoziție!
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Online acum</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
