import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceCategory = "website" | "seo" | "graphic_design" | "maintenance";

export interface ServicePackage {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  features: string[];
  category: ServiceCategory;
  sort_order: number;
  is_active: boolean;
}

export const useServicePackages = (category?: ServiceCategory) => {
  return useQuery({
    queryKey: ["service-packages", category],
    queryFn: async () => {
      let query = supabase
        .from("service_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map((pkg) => ({
        ...pkg,
        features: Array.isArray(pkg.features) 
          ? pkg.features as string[]
          : typeof pkg.features === 'string' 
            ? JSON.parse(pkg.features) 
            : [],
        category: (pkg.category || 'website') as ServiceCategory,
      })) as ServicePackage[];
    },
  });
};

export const useAllServicePackages = () => {
  return useQuery({
    queryKey: ["service-packages-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_packages")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map((pkg) => ({
        ...pkg,
        features: Array.isArray(pkg.features) 
          ? pkg.features as string[]
          : typeof pkg.features === 'string' 
            ? JSON.parse(pkg.features) 
            : [],
        category: (pkg.category || 'website') as ServiceCategory,
      })) as ServicePackage[];
    },
  });
};
