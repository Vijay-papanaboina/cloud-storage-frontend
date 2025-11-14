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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Key,
  Trash2,
  Copy,
  Check,
  Plus,
  Shield,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

export function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState<30 | 60 | 90>(30);
  const [newKeyPermissions, setNewKeyPermissions] = useState<
    "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS"
  >("READ_ONLY");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
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
        expiresInDays: 30 | 60 | 90;
        permissions?: "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS";
      } = {
        name: newKeyName,
        expiresInDays: newKeyExpiryDays,
        permissions: newKeyPermissions,
      };

      const newKey = await authApi.createApiKey(data);
      setNewlyCreatedKey(newKey.key || null);
      setNewKeyName("");
      setNewKeyExpiryDays(30);
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

  const handleRevokeKey = (id: string) => {
    setKeyToRevoke(id);
  };

  const confirmRevoke = async () => {
    if (!keyToRevoke) return;

    try {
      await authApi.revokeApiKey(keyToRevoke);
      showToast("API key revoked", "success");
      await loadApiKeys();
      setKeyToRevoke(null);
    } catch {
      showToast("Failed to revoke API key", "error");
      setKeyToRevoke(null);
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Key className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">API Keys</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Manage your API keys for CLI and programmatic access to your cloud
            storage
          </p>
        </div>

        <div className="space-y-6">
          {/* Create New API Key */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Create New API Key</CardTitle>
              </div>
              <CardDescription>
                Generate a new API key for CLI access. The key will only be
                shown once, so make sure to copy it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="keyName" className="text-base font-medium">
                    Key Name
                  </Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., My CLI Key, Production Server, etc."
                    required
                    disabled={isCreating}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="keyExpiry"
                      className="text-base font-medium flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Expires In
                    </Label>
                    <select
                      id="keyExpiry"
                      value={newKeyExpiryDays}
                      onChange={(e) =>
                        setNewKeyExpiryDays(
                          Number(e.target.value) as 30 | 60 | 90
                        )
                      }
                      disabled={isCreating}
                      required
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="keyPermissions"
                      className="text-base font-medium flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Permissions
                    </Label>
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
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="FULL_ACCESS">Full Access</option>
                      <option value="READ_ONLY">Read Only</option>
                      <option value="READ_WRITE">Read & Write</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
              </form>

              {newlyCreatedKey && (
                <div className="mt-6 p-5 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
                        Your new API key (copy this now - it won't be shown
                        again!):
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-background rounded-md text-sm font-mono break-all border border-yellow-200 dark:border-yellow-800">
                          {newlyCreatedKey}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(newlyCreatedKey, "new")
                          }
                          className="shrink-0"
                        >
                          {copiedKey === "new" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Your API Keys</CardTitle>
              </div>
              <CardDescription>
                View and manage your existing API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    No API keys found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first API key above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => {
                    const expired = isExpired(key.expiresAt);
                    return (
                      <div
                        key={key.id}
                        className={`flex flex-col md:flex-row md:items-center md:justify-between p-5 border-2 rounded-lg transition-colors ${
                          expired
                            ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                            : key.active
                            ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10"
                        }`}
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold text-lg">
                              {key.name}
                            </h3>
                            {key.active ? (
                              expired ? (
                                <span className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                                  Expired
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                  Active
                                </span>
                              )
                            ) : (
                              <span className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                                Revoked
                              </span>
                            )}
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              {key.permissions === "FULL_ACCESS"
                                ? "Full Access"
                                : key.permissions === "READ_ONLY"
                                ? "Read Only"
                                : "Read & Write"}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Created:{" "}
                                {format(new Date(key.createdAt), "PPp")}
                              </span>
                            </div>
                            {key.expiresAt && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span
                                  className={
                                    expired
                                      ? "text-red-600 dark:text-red-400 font-medium"
                                      : ""
                                  }
                                >
                                  Expires:{" "}
                                  {format(new Date(key.expiresAt), "PPp")}
                                </span>
                              </div>
                            )}
                            {key.lastUsedAt && (
                              <div className="flex items-center gap-2">
                                <span>
                                  Last used:{" "}
                                  {format(new Date(key.lastUsedAt), "PPp")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {key.active && (
                          <div className="mt-4 md:mt-0 md:ml-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeKey(key.id)}
                              className="w-full md:w-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={keyToRevoke !== null}
        onOpenChange={(open: boolean) => !open && setKeyToRevoke(null)}
      >
        <DialogContent
          aria-labelledby="revoke-dialog-title"
          aria-describedby="revoke-dialog-description"
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle id="revoke-dialog-title">Revoke API Key</DialogTitle>
            </div>
            <DialogDescription id="revoke-dialog-description" className="pt-2">
              Are you sure you want to revoke this API key? This action cannot
              be undone. The key will immediately stop working and any
              applications using it will lose access.
              {keyToRevoke && (
                <span className="block mt-2 font-medium text-foreground">
                  Key:{" "}
                  {apiKeys.find((k) => k.id === keyToRevoke)?.name || "Unknown"}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setKeyToRevoke(null)}
              aria-label="Cancel revoking API key"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevoke}
              aria-label="Confirm revoke API key"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
