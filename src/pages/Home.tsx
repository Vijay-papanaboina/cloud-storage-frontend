import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key, User, Settings } from "lucide-react";

export function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and API keys
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <User className="h-8 w-8 mb-2" />
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                View and update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Key className="h-8 w-8 mb-2" />
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for CLI access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button variant="outline" className="w-full">
                  Manage API Keys
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Settings className="h-8 w-8 mb-2" />
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button variant="outline" className="w-full">
                  Open Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
