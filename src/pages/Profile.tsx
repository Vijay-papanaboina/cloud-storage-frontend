import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function Profile() {
  const user = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      showToast("Profile updated", "success");
    } catch {
      showToast("Failed to refresh profile", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">Your account information</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>View your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-lg font-mono">{user?.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              <p className="text-lg">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-lg">{user?.email}</p>
            </div>
            {user?.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-lg">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            <div className="pt-4">
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? "Refreshing..." : "Refresh Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
