'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import type { Theme } from '@/lib/theme-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AvatarUpload from '@/components/avatar-upload';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings } from 'lucide-react';

interface SettingsModalProps {
  triggerClassName?: string;
  compact?: boolean;
  triggerElement?: React.ReactNode;
}

export default function SettingsModal({ triggerClassName, compact, triggerElement }: SettingsModalProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: '',
    summary: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeySuccess, setApiKeySuccess] = useState('');

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        summary: user.summary || '',
        email: user.email || '',
      }));

      // Fetch API keys when modal opens
      fetchApiKeys();
    }
  }, [isOpen, user]);

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    if (!isOpen) return;

    try {
      const response = await fetch('/api/api-keys');
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setApiKeyError('Failed to load API keys');
    }
  }, [isOpen]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: profileData.displayName,
          summary: profileData.summary,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (profileData.newPassword !== profileData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }

      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload avatar');
      }

      setSuccess('Avatar updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new API key
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingKey(true);
    setApiKeyError('');
    setApiKeySuccess('');

    try {
      if (!newKeyName.trim()) {
        throw new Error('API key name is required');
      }

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create API key');
      }

      const newKey = await response.json();
      setNewKeyValue(newKey.key);
      setApiKeySuccess('API key created successfully');
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      console.error('Error creating API key:', err);
      setApiKeyError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Revoke an API key
  const handleRevokeApiKey = async (keyId: string) => {
    try {
      setApiKeyError('');
      setApiKeySuccess('');

      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke API key');
      }

      setApiKeySuccess('API key revoked successfully');
      fetchApiKeys();
    } catch (err) {
      console.error('Error revoking API key:', err);
      setApiKeyError(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerElement ? (
          triggerElement
        ) : compact ? (
          <Button size="icon" variant="ghost" className={triggerClassName}>
            <Settings className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className={`gap-1 ${triggerClassName}`}>
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="flex flex-col items-center mb-6">
                <AvatarUpload onAvatarChange={handleAvatarChange} />
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Bio</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      value={profileData.summary}
                      onChange={handleProfileChange}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={profileData.currentPassword}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                  <SelectTrigger id="theme" className="w-full">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose how Plork appears to you. System setting will follow your device's theme.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-keys">
            <div className="space-y-6">
              {apiKeyError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {apiKeyError}
                </div>
              )}
              {apiKeySuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {apiKeySuccess}
                </div>
              )}

              {/* Create new API key */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Create New API Key</h3>
                <form onSubmit={handleCreateApiKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Enter a name for your API key"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isCreatingKey}>
                    {isCreatingKey ? 'Creating...' : 'Create API Key'}
                  </Button>
                </form>

                {newKeyValue && (
                  <div className="mt-4 p-4 border rounded-md bg-yellow-50">
                    <p className="font-medium text-yellow-800 mb-2">Your new API key:</p>
                    <div className="bg-white p-2 rounded border overflow-x-auto">
                      <code className="text-sm break-all">{newKeyValue}</code>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      Save this key somewhere safe. You won't be able to see it again!
                    </p>
                  </div>
                )}
              </div>

              {/* Existing API keys */}
              <div>
                <h3 className="text-lg font-medium mb-4">Your API Keys</h3>
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground">You don't have any API keys yet.</p>
                ) : (
                  <div className="border rounded-md divide-y">
                    {apiKeys.map((key: any) => (
                      <div key={key.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                            {key.lastUsed && (
                              <> · Last used: {new Date(key.lastUsed).toLocaleDateString()}</>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeApiKey(key.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
