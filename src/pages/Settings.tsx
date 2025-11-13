import { useState, useEffect, useCallback } from "react";
import { authApi, type ApiKey } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Key, Trash2, Copy, Check } from "lucide-react";
import { format } from "date-fns";

export function Settings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState<
    30 | 60 | 90 | undefined
  >(undefined);
  const [newKeyPermissions, setNewKeyPermissions] = useState<
    "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS"
  >("FULL_ACCESS");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadApiKeys = useCallback(async () => {
    try {
      const keys = await authApi.listApiKeys();
      setApiKeys(keys);
    } catch {
      showToast("Failed to load API keys", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const data: {
        name: string;
        expiresInDays?: 30 | 60 | 90;
        permissions?: "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS";
      } = {
        name: newKeyName,
        permissions: newKeyPermissions,
      };
      if (newKeyExpiryDays) {
        data.expiresInDays = newKeyExpiryDays;
      }

      const newKey = await authApi.createApiKey(data);
      setNewlyCreatedKey(newKey.key || null);
      setNewKeyName("");
      setNewKeyExpiryDays(undefined);
      setNewKeyPermissions("FULL_ACCESS");
      showToast(
        "API key created successfully! Copy it now - it won't be shown again.",
        "success"
      );
      await loadApiKeys();
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      showToast(message || "Failed to create API key", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) {
      return;
    }

    try {
      await authApi.revokeApiKey(id);
      showToast("API key revoked", "success");
      await loadApiKeys();
    } catch {
      showToast("Failed to revoke API key", "error");
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    showToast("Copied to clipboard", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your API keys</p>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Create New API Key */}
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>
                Generate a new API key for CLI access. The key will only be
                shown once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., My CLI Key"
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyExpiry">Expires In (Optional)</Label>
                  <select
                    id="keyExpiry"
                    value={newKeyExpiryDays || ""}
                    onChange={(e) =>
                      setNewKeyExpiryDays(
                        e.target.value
                          ? (Number(e.target.value) as 30 | 60 | 90)
                          : undefined
                      )
                    }
                    disabled={isCreating}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Never expires</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyPermissions">Permissions</Label>
                  <select
                    id="keyPermissions"
                    value={newKeyPermissions}
                    onChange={(e) =>
                      setNewKeyPermissions(
                        e.target.value as
                          | "READ_ONLY"
                          | "READ_WRITE"
                          | "FULL_ACCESS"
                      )
                    }
                    disabled={isCreating}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="FULL_ACCESS">Full Access</option>
                    <option value="READ_ONLY">Read Only</option>
                    <option value="READ_WRITE">Read & Write</option>
                  </select>
                </div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
              </form>

              {newlyCreatedKey && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm font-medium mb-2">
                    Your new API key (copy this now!):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-background rounded text-sm font-mono break-all">
                      {newlyCreatedKey}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreatedKey, "new")}
                    >
                      {copiedKey === "new" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>Manage your existing API keys</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : apiKeys.length === 0 ? (
                <p className="text-muted-foreground">
                  No API keys found. Create one above.
                </p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{key.name}</h3>
                          {key.active ? (
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                              Revoked
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {key.permissions === "FULL_ACCESS"
                              ? "Full Access"
                              : key.permissions === "READ_ONLY"
                              ? "Read Only"
                              : "Read & Write"}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            Created: {format(new Date(key.createdAt), "PPp")}
                          </p>
                          {key.expiresAt && (
                            <p>
                              Expires: {format(new Date(key.expiresAt), "PPp")}
                            </p>
                          )}
                          {key.lastUsedAt && (
                            <p>
                              Last used:{" "}
                              {format(new Date(key.lastUsedAt), "PPp")}
                            </p>
                          )}
                        </div>
                      </div>
                      {key.active && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
