import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PackageCardProps {
  id: string;
  name: string;
  price: number | null;
  description: string;
  features: string[];
  popular?: boolean;
  priceLabel?: string;
  onSelect: (id: string, name: string) => void;
  isLoading?: boolean;
  loadingPackageId?: string | null;
}

const PackageCard = ({
  id,
  name,
  price,
  description,
  features,
  popular = false,
  priceLabel,
  onSelect,
  isLoading = false,
  loadingPackageId,
}: PackageCardProps) => {
  const isThisLoading = isLoading && loadingPackageId === id;
  return (
    <Card
      className={`relative p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
        popular
          ? "border-accent bg-accent/5 ring-1 ring-accent/20"
          : "border-border bg-card"
      }`}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
          Popular
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="mb-6">
        {price !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{price}€</span>
            {priceLabel && (
              <span className="text-sm text-muted-foreground">{priceLabel}</span>
            )}
          </div>
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">
            La cerere
          </span>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="flex items-start gap-2 text-sm"
          >
            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </motion.li>
        ))}
      </ul>

      <Button
        onClick={() => onSelect(id, name)}
        disabled={isLoading}
        className={`w-full group ${
          popular
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        {isThisLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Se procesează...
          </>
        ) : price !== null ? (
          <>
            Cumpără acum
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        ) : (
          <>
            Solicită ofertă
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </Card>
  );
};

export default PackageCard;
