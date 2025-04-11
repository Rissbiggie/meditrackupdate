import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserSettings, User } from "@/types";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user profile
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });

  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  // Form state
  const [profile, setProfile] = useState<Partial<User>>({
    fullName: "",
    email: "",
    phone: ""
  });

  // Update profile form when data is loaded
  React.useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || ""
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiRequest('PATCH', '/api/users/me', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const response = await apiRequest('PATCH', '/api/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profile);
  };

  // Handle setting toggle
  const handleSettingToggle = (setting: keyof Omit<UserSettings, 'id' | 'userId' | 'updatedAt'>, value: boolean) => {
    if (!settings) return;
    
    updateSettings.mutate({
      [setting]: value
    });
  };

  return (
    <div>
      {/* Profile Settings */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Profile Settings</h2>
          
          {isLoadingUser ? (
            <div className="animate-pulse">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fa-solid fa-user text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user?.fullName || "User"}</h3>
                  <p className="text-gray-500 text-sm">{user?.email || "email@example.com"}</p>
                  <button className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                    Change Profile Photo
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1">Full Name</Label>
                    <Input 
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      className="w-full px-3 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-3 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">Phone</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full px-3 py-2"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Notification Settings</h2>
          
          {isLoadingSettings ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Emergency Alerts</h3>
                  <p className="text-gray-500 text-sm">Receive alerts about emergency situations</p>
                </div>
                <Switch 
                  checked={settings?.emergencyAlerts ?? true} 
                  onCheckedChange={(checked) => handleSettingToggle('emergencyAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-gray-500 text-sm">Receive updates and alerts via email</p>
                </div>
                <Switch 
                  checked={settings?.emailNotifications ?? true} 
                  onCheckedChange={(checked) => handleSettingToggle('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-gray-500 text-sm">Receive important alerts via text message</p>
                </div>
                <Switch 
                  checked={settings?.smsNotifications ?? false} 
                  onCheckedChange={(checked) => handleSettingToggle('smsNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Location Sharing</h3>
                  <p className="text-gray-500 text-sm">Allow tracking of your location during emergencies</p>
                </div>
                <Switch 
                  checked={settings?.locationSharing ?? true} 
                  onCheckedChange={(checked) => handleSettingToggle('locationSharing', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Privacy & Security</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 mb-1">Current Password</Label>
                  <Input 
                    id="currentPassword"
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-1">New Password</Label>
                  <Input 
                    id="newPassword"
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-3 py-2"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-3 py-2"
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Data Privacy</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Checkbox 
                    id="anonymousData" 
                    checked={settings?.anonymousDataCollection ?? false}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        handleSettingToggle('anonymousDataCollection', checked);
                      }
                    }}
                  />
                  <Label 
                    htmlFor="anonymousData" 
                    className="ml-2 text-sm text-gray-700"
                  >
                    Allow anonymous data collection for service improvement
                  </Label>
                </div>
                
                <Button 
                  variant="outline" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Export My Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
