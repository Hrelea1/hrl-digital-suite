import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Package, Calendar, CheckCircle2, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface PurchasedPackage {
  id: string;
  package_name: string;
  package_type: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string | null;
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
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-amber-500/10 text-amber-500";
      case "completed":
        return "bg-blue-500/10 text-blue-500";
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
            <a
              href="/#preturi"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
            >
              Vezi pachetele disponibile
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{pkg.package_name}</h3>
                      <p className="text-sm text-muted-foreground">{pkg.package_type}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold">{pkg.price}€</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(
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
      </div>
    </DashboardLayout>
  );
};

export default DashboardPackages;
