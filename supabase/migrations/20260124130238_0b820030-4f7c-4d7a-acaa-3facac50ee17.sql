-- Add category column to service_packages
ALTER TABLE public.service_packages 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'website';

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_service_packages_category ON public.service_packages(category);

-- Insert website packages
INSERT INTO public.service_packages (slug, name, short_description, description, price, features, category, sort_order, is_active) VALUES
('website-start', 'Start', 'Ideal pentru afaceri mici care au nevoie de prezență online', 'Pachet perfect pentru a-ți lansa prezența online cu un site profesional și funcțional.', 299, '["Landing page sau site one-page", "Design responsive", "Formular de contact", "Optimizare SEO de bază", "Hosting primul an inclus"]'::jsonb, 'website', 1, true),
('website-business', 'Business', 'Pentru afaceri în creștere cu nevoi complexe', 'Soluția completă pentru afaceri care vor să se diferențieze și să crească online.', 799, '["Până la 5 pagini", "Design custom premium", "Integrare CMS", "SEO avansat", "Analytics setup", "Support 3 luni"]'::jsonb, 'website', 2, true),
('website-premium', 'Premium', 'Soluție completă pentru proiecte ambițioase', 'Dezvoltare la cheie pentru proiecte complexe cu funcționalități avansate.', 1699, '["Pagini nelimitate", "Funcționalități custom", "E-commerce ready", "Integrări API", "Performance optimization", "Support 6 luni", "Training echipă"]'::jsonb, 'website', 3, true),

-- Insert SEO packages
('seo-basic', 'SEO Basic', 'Optimizare esențială pentru vizibilitate', 'Audit și optimizare de bază pentru a-ți îmbunătăți poziția în Google.', 199, '["Audit SEO complet", "Optimizare meta tags", "Keyword research", "Google Search Console setup", "Raport lunar"]'::jsonb, 'seo', 1, true),
('seo-pro', 'SEO Pro', 'Strategie SEO completă și monitorizare', 'Strategie SEO pe termen lung cu monitorizare și optimizare continuă.', 499, '["Tot din Basic", "Content optimization", "Link building", "Local SEO", "Competitor analysis", "Rapoarte săptămânale"]'::jsonb, 'seo', 2, true),
('seo-enterprise', 'SEO Enterprise', 'SEO la nivel enterprise cu rezultate garantate', 'Soluție SEO completă pentru afaceri mari cu obiective ambițioase.', 999, '["Tot din Pro", "Technical SEO audit", "Core Web Vitals", "Schema markup", "International SEO", "Dedicated manager"]'::jsonb, 'seo', 3, true),

-- Insert Graphic Design packages
('design-logo', 'Logo Design', 'Identitate vizuală memorabilă', 'Logo profesional care reflectă valorile brandului tău.', 149, '["3 concepte inițiale", "Revizuiri nelimitate", "Fișiere vector (AI, SVG)", "Fișiere web (PNG, JPG)", "Ghid de utilizare"]'::jsonb, 'graphic_design', 1, true),
('design-branding', 'Branding Complet', 'Identitate de brand profesională', 'Pachet complet de branding pentru o identitate vizuală coerentă.', 599, '["Logo + variante", "Paletă de culori", "Tipografie", "Business cards", "Letterhead", "Social media kit", "Brand guidelines"]'::jsonb, 'graphic_design', 2, true),
('design-social', 'Kit Social Media', 'Prezență vizuală pe rețele sociale', 'Template-uri profesionale pentru toate platformele sociale.', 299, '["Cover photos", "Profile pictures", "Post templates (10+)", "Story templates", "Highlight covers", "Fișiere editabile"]'::jsonb, 'graphic_design', 3, true),

-- Insert Maintenance packages
('maintenance-standard', 'Standard', 'Mentenanță esențială pentru funcționare optimă', 'Pachet de mentenanță lunară pentru site-uri mici și medii.', 90, '["Update-uri CMS/plugins", "Backup săptămânal", "Monitorizare uptime", "Security patches", "Support email", "1 oră modificări/lună"]'::jsonb, 'maintenance', 1, true),
('maintenance-premium', 'Premium', 'Suport dedicat și mentenanță proactivă', 'Mentenanță completă cu suport prioritar pentru afaceri care depind de prezența online.', 200, '["Tot din Standard", "Backup zilnic", "Monitorizare 24/7", "CDN & caching", "Support telefonic", "4 ore modificări/lună", "Rapoarte lunare"]'::jsonb, 'maintenance', 2, true)
ON CONFLICT (slug) DO NOTHING;