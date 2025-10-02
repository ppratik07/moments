'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Sidebar from '@/components/dashboard/SideBar';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Shield, Bell, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(() => router.push('/'));
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = () => {
    toast.info('Account deletion feature coming soon. Please contact support for now.');
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Project ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <Sidebar projectId={projectId} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account and project preferences</p>
            </div>

            {/* Account Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your personal account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <p className="text-gray-900 mt-1">{user?.emailAddresses[0]?.emailAddress || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">{user?.fullName || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">{user?.id || 'Not available'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Manage Profile</h3>
                    <p className="text-sm text-gray-600">Update your personal information and profile settings</p>
                  </div>
                  <Button variant="outline" onClick={() => window.open('/user-profile', '_blank')}>
                    Edit Profile
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Button variant="outline" onClick={() => window.open('/user-profile#security', '_blank')}>
                    Change Password
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" onClick={() => window.open('/user-profile#security', '_blank')}>
                    Configure 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about your projects</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Notification preferences coming soon')}>
                    Manage
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Privacy Settings</h3>
                    <p className="text-sm text-gray-600">Control who can see your information</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info('Privacy settings coming soon')}>
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                  </div>
                  <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Sign Out</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to sign out? You&apos;ll need to sign in again to access your account.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          setShowLogoutDialog(false);
                          handleLogout();
                        }} className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Back to Dashboard */}
            <div className="mt-8">
              <Button variant="outline" onClick={() => router.push(`/project/${projectId}`)}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}