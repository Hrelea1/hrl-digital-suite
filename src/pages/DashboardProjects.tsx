import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import FormFlow from "@/components/FormFlow";

interface ProjectRequest {
  id: string;
  project_type: string;
  budget: string;
  timeline: string;
  details: string | null;
  status: string;
  created_at: string;
}

const projectTypeLabels: Record<string, string> = {
  prezentare: "Site de prezentare",
  magazin: "Magazin online",
  aplicatie: "Aplicație web",
  saas: "Platformă SaaS",
  altele: "Altele",
};

const budgetLabels: Record<string, string> = {
  "<300": "< 300€",
  "300-800": "300€ - 800€",
  "800-1700": "800€ - 1700€",
  ">1700": "> 1700€",
};

const timelineLabels: Record<string, string> = {
  "1-2saptamani": "1-2 săptămâni",
  "2-4saptamani": "2-4 săptămâni",
  "1-2luni": "1-2 luni",
  ">2luni": "> 2 luni",
};

const DashboardProjects = () => {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectRequest | null>(null);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("project_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    // Refresh projects after form submission
    fetchProjects();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500";
      case "completed":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "În așteptare";
      case "in_progress":
        return "În lucru";
      case "completed":
        return "Finalizat";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Cererile tale de proiect</h2>
            <p className="text-muted-foreground">
              Gestionează și urmărește proiectele trimise
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cerere nouă
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nicio cerere de proiect</h3>
            <p className="text-muted-foreground mb-6">
              Trimite prima ta cerere de proiect pentru a începe colaborarea.
            </p>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Trimite o cerere
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {projectTypeLabels[project.project_type] || project.project_type}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span>Buget: {budgetLabels[project.budget] || project.budget}</span>
                        <span>Termen: {timelineLabels[project.timeline] || project.timeline}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Trimis pe {format(new Date(project.created_at), "d MMM yyyy", { locale: ro })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusIcon(project.status)}
                      {getStatusLabel(project.status)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detalii
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Flow Modal */}
      <FormFlow isOpen={isFormOpen} onClose={handleFormClose} />

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-lg w-full p-8 border border-border shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Detalii proiect</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tip proiect</p>
                <p className="font-medium">
                  {projectTypeLabels[selectedProject.project_type] || selectedProject.project_type}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Buget estimativ</p>
                <p className="font-medium">
                  {budgetLabels[selectedProject.budget] || selectedProject.budget}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Termen de livrare</p>
                <p className="font-medium">
                  {timelineLabels[selectedProject.timeline] || selectedProject.timeline}
                </p>
              </div>
              {selectedProject.details && (
                <div>
                  <p className="text-sm text-muted-foreground">Detalii</p>
                  <p className="font-medium">{selectedProject.details}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedProject.status
                  )}`}
                >
                  {getStatusIcon(selectedProject.status)}
                  {getStatusLabel(selectedProject.status)}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setSelectedProject(null)}
              className="w-full mt-6"
              variant="outline"
            >
              Închide
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardProjects;
