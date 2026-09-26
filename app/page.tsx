// app/page.tsx
import { HeroSection } from '@/components/sections/HeroSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { TechSupportSection } from '@/components/sections/TechSupportSection';
import { FlagshipShowcase } from '@/components/sections/FlagshipShowcase';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <ServicesSection />
      <TechSupportSection />
      <FlagshipShowcase />
    </div>
  );
}
