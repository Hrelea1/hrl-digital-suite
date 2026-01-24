import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Package, Calendar, CheckCircle2, Clock, ExternalLink, CalendarPlus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PurchasedPackage {
  id: string;
  package_name: string;
  package_type: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string | null;
  consultation_scheduled: boolean;
  consultation_date: string | null;
  package_id: string | null;
}

const DashboardPackages = () => {
  const { user, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<PurchasedPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("purchased_packages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setPackages(data || []);
      } catch (error) {
        console.error("Error fetching packages");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activ";
      case "pending":
        return "În așteptare";
      case "completed":
        return "Finalizat";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "website":
        return "Site web";
      case "seo":
        return "SEO";
      case "graphic_design":
        return "Grafic Design";
      case "maintenance":
        return "Mentenanță";
      default:
        return category;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pachetele tale</h2>
            <p className="text-muted-foreground">
              Vizualizează serviciile și pachetele achiziționate
            </p>
          </div>
          <Link to="/servicii">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Vezi toate pachetele
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nu ai pachete încă</h3>
            <p className="text-muted-foreground mb-6">
              Când vei achiziționa un pachet, va apărea aici.
            </p>
            <Link to="/servicii">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Package className="w-4 h-4" />
                Vezi pachetele disponibile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-card rounded-xl p-6 border border-border hover:border-accent/30 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{pkg.package_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(pkg.package_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(pkg.start_date), "d MMM yyyy", { locale: ro })}
                        </span>
                        {pkg.end_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            până la {format(new Date(pkg.end_date), "d MMM yyyy", { locale: ro })}
                          </span>
                        )}
                      </div>
                      
                      {/* Consultation Status */}
                      {pkg.consultation_scheduled && pkg.consultation_date ? (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">
                            Consultație programată: {format(new Date(pkg.consultation_date), "d MMM yyyy, HH:mm", { locale: ro })}
                          </span>
                        </div>
                      ) : pkg.status === "active" ? (
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 text-accent border-accent/30 hover:bg-accent/10"
                            onClick={() => {
                              // TODO: Integrate with Calendly or similar
                              window.open("mailto:contact@hrlwebdesign.ro?subject=Programare consultație - " + pkg.package_name, "_blank");
                            }}
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Programează consultația
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    <span className="text-xl font-bold">{pkg.price}€</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 border ${getStatusColor(
                        pkg.status
                      )}`}
                    >
                      {pkg.status === "active" && <CheckCircle2 className="w-4 h-4" />}
                      {getStatusLabel(pkg.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {packages.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-6 border border-border">
            <h3 className="font-semibold mb-4">Acțiuni rapide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link to="/dashboard/messages">
                  <ExternalLink className="w-4 h-4" />
                  Mesaje
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link to="/dashboard/projects">
                  <ExternalLink className="w-4 h-4" />
                  Proiecte
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <a href="mailto:contact@hrlwebdesign.ro">
                  <ExternalLink className="w-4 h-4" />
                  Contactează-ne
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPackages;
