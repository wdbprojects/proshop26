import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileResponse } from "@/config/type-schemas";

const Row = ({
  label,
  detail,
  active,
}: {
  label: string;
  detail: string;
  active: boolean;
}) => {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{detail}</p>
      </div>
      <Badge variant={active ? "default" : "secondary"}>
        {active ? "Connected" : "Not connected"}
      </Badge>
    </li>
  );
};

const ConnectedAccounts = ({ profile, providers }: ProfileResponse) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in methods</CardTitle>
        <CardDescription>
          Email {profile.emailVerified ? "verified" : "not verified"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          <Row
            label="Email and password"
            detail={profile.email}
            active={providers.includes("credential")}
          />
        </ul>
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
