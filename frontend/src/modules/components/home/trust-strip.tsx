import { homeTrustStrip } from "@/config/data";

const TrustStrip = () => {
  return (
    <section className="border-muted bg-background/10 grid gap-4 rounded-md border p-6 sm:grid-cols-2 lg:grid-cols-4">
      {homeTrustStrip.map((item) => {
        const { icon, title, desc } = item;
        const IconCmp = icon;
        return (
          <div key={title} className="flex gap-3">
            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
              <IconCmp className="size-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">{title}</h3>
              <p className="text-foreground/65 mt-0.5 text-sm">{desc}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default TrustStrip;
