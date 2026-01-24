import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import PackageCard from "./PackageCard";

interface Package {
  id: string;
  name: string;
  short_description: string | null;
  price: number | null;
  features: string[];
  sort_order: number;
}

interface ServiceSectionProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  packages: Package[];
  onSelectPackage: (packageId: string, packageName: string) => void;
  isLoading?: boolean;
  loadingPackageId?: string | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const ServiceSection = ({
  id,
  title,
  description,
  icon: Icon,
  packages,
  onSelectPackage,
  isLoading = false,
  loadingPackageId,
}: ServiceSectionProps) => {
  // Determine popular package (middle one if 3 packages)
  const popularIndex = packages.length === 3 ? 1 : -1;

  return (
    <section id={id} className="py-16 scroll-mt-24">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className={`grid gap-6 ${
            packages.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {packages
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((pkg, index) => (
              <motion.div key={pkg.id} variants={item}>
                <PackageCard
                  id={pkg.id}
                  name={pkg.name}
                  price={pkg.price}
                  description={pkg.short_description || ""}
                  features={pkg.features}
                  popular={index === popularIndex}
                  priceLabel={id === "maintenance" ? "/lună" : undefined}
                  onSelect={onSelectPackage}
                  isLoading={isLoading}
                  loadingPackageId={loadingPackageId}
                />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceSection;
