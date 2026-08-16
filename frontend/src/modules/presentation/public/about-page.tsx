import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import Link from "next/link";

const AboutPage = () => {
  return (
    <div className="p-4">
      <h1>About Page</h1>
      <Button>Testing ShadCN</Button>
      <Button variant="outline" size="sm">
        <Link href={routes.home}>Home</Link>
      </Button>
      <Button variant="outline" size="sm">
        <Link href={routes.dashboard}>Dashboard</Link>
      </Button>
    </div>
  );
};

export default AboutPage;
