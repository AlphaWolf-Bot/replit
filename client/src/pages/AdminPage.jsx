import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';

const AdminPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the coin image form
  const [coinImageUrl, setCoinImageUrl] = useState('');
  const [coinValue, setCoinValue] = useState(5);
  
  // State for social media form
  const [socialMediaForm, setSocialMediaForm] = useState({
    platform: '',
    name: '',
    url: '',
    icon: '',
    iconColor: 'text-primary',
    reward: 100,
    isActive: true
  });
  
  // State for editing social media
  const [editingSocialId, setEditingSocialId] = useState(null);
  
  // Get coin settings
  const { data: coinSettings } = useQuery({
    queryKey: ['/api/admin/coin-settings'],
    onSuccess: (data) => {
      if (data?.data) {
        setCoinImageUrl(data.data.imageUrl);
        setCoinValue(data.data.coinValue);
      }
    }
  });
  
  // Get all social media links
  const { data: socialMediaLinks } = useQuery({
    queryKey: ['/api/admin/social-media']
  });
  
  // Mutation for updating coin settings
  const updateCoinSettingsMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/admin/coin-settings', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Coin Settings Updated',
        description: 'The coin image and value have been updated successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coin/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update coin settings.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for creating social media
  const createSocialMediaMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/admin/social-media', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Social Media Added',
        description: 'The social media link has been added successfully.'
      });
      
      // Reset form
      setSocialMediaForm({
        platform: '',
        name: '',
        url: '',
        icon: '',
        iconColor: 'text-primary',
        reward: 100,
        isActive: true
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add social media link.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for updating social media
  const updateSocialMediaMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest(`/api/admin/social-media/${id}`, {
      method: 'PUT',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Social Media Updated',
        description: 'The social media link has been updated successfully.'
      });
      
      // Reset editing state
      setEditingSocialId(null);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/social-media'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update social media link.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle coin settings form submission
  const handleCoinSettingsSubmit = (e) => {
    e.preventDefault();
    updateCoinSettingsMutation.mutate({
      imageUrl: coinImageUrl,
      coinValue: parseInt(coinValue)
    });
  };
  
  // Handle social media form submission
  const handleSocialMediaSubmit = (e) => {
    e.preventDefault();
    
    if (editingSocialId) {
      updateSocialMediaMutation.mutate({
        id: editingSocialId,
        data: socialMediaForm
      });
    } else {
      createSocialMediaMutation.mutate(socialMediaForm);
    }
  };
  
  // Handle editing a social media link
  const handleEditSocialMedia = (social) => {
    setSocialMediaForm({
      platform: social.platform,
      name: social.name,
      url: social.url,
      icon: social.icon,
      iconColor: social.iconColor || 'text-primary',
      reward: social.reward,
      isActive: social.isActive
    });
    
    setEditingSocialId(social.id);
  };
  
  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingSocialId(null);
    setSocialMediaForm({
      platform: '',
      name: '',
      url: '',
      icon: '',
      iconColor: 'text-primary',
      reward: 100,
      isActive: true
    });
  };
  
  // List of common social media icons
  const socialIcons = [
    { name: 'Twitter', icon: 'bxl-twitter' },
    { name: 'Instagram', icon: 'bxl-instagram' },
    { name: 'Facebook', icon: 'bxl-facebook' },
    { name: 'YouTube', icon: 'bxl-youtube' },
    { name: 'TikTok', icon: 'bxl-tiktok' },
    { name: 'Telegram', icon: 'bxl-telegram' },
    { name: 'Discord', icon: 'bxl-discord' },
    { name: 'WhatsApp', icon: 'bxl-whatsapp' }
  ];
  
  // Colors for social media
  const iconColors = [
    { name: 'Primary', color: 'text-primary' },
    { name: 'Secondary', color: 'text-secondary' },
    { name: 'Red', color: 'text-red-500' },
    { name: 'Blue', color: 'text-blue-500' },
    { name: 'Green', color: 'text-green-500' },
    { name: 'Yellow', color: 'text-yellow-500' },
    { name: 'Purple', color: 'text-purple-500' },
    { name: 'Teal', color: 'text-teal-500' }
  ];

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation('/')}
        >
          <i className="bx bx-arrow-back mr-1"></i>
          Back to App
        </Button>
      </div>
      
      <Tabs defaultValue="coin" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coin">Coin Settings</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        {/* Coin Settings Tab */}
        <TabsContent value="coin" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wolf Coin Settings</CardTitle>
              <CardDescription>
                Customize the coin image and value for each tap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCoinSettingsSubmit}>
                <div className="grid gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="imageUrl">Coin Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      placeholder="Enter image URL for the coin" 
                      value={coinImageUrl}
                      onChange={(e) => setCoinImageUrl(e.target.value)}
                    />
                    <small className="text-muted-foreground">
                      Enter a URL to an image (SVG recommended for best quality)
                    </small>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="coinValue">Coins Per Tap</Label>
                    <Input 
                      id="coinValue" 
                      type="number"
                      placeholder="5" 
                      min="1"
                      max="100"
                      value={coinValue}
                      onChange={(e) => setCoinValue(e.target.value)}
                    />
                    <small className="text-muted-foreground">
                      How many coins users earn with each tap (1-100)
                    </small>
                  </div>
                  
                  {coinImageUrl && (
                    <div className="flex flex-col items-center space-y-2">
                      <Label>Preview</Label>
                      <div className="w-24 h-24 border border-dashed border-border rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={coinImageUrl} 
                          alt="Coin Preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.src = '/coin-default.svg';
                            toast({
                              title: "Image Error",
                              description: "Couldn't load the image from the provided URL.",
                              variant: "destructive"
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCoinImageUrl(coinSettings?.data?.imageUrl || '');
                setCoinValue(coinSettings?.data?.coinValue || 5);
              }}>
                Reset
              </Button>
              <Button 
                onClick={handleCoinSettingsSubmit}
                disabled={updateCoinSettingsMutation.isPending}
              >
                {updateCoinSettingsMutation.isPending ? (
                  <><i className="bx bx-loader-alt animate-spin mr-1"></i> Saving...</>
                ) : (
                  <>Save Settings</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSocialId ? 'Edit Social Media Link' : 'Add Social Media Link'}
              </CardTitle>
              <CardDescription>
                Add or update social media links for users to follow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSocialMediaSubmit} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="platform">Platform</Label>
                    <Input 
                      id="platform" 
                      placeholder="e.g. Twitter, Instagram" 
                      value={socialMediaForm.platform}
                      onChange={(e) => setSocialMediaForm({
                        ...socialMediaForm,
                        platform: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Follow us on Twitter" 
                      value={socialMediaForm.name}
                      onChange={(e) => setSocialMediaForm({
                        ...socialMediaForm,
                        name: e.target.value
                      })}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="url">Link URL</Label>
                  <Input 
                    id="url" 
                    placeholder="e.g. https://twitter.com/username" 
                    value={socialMediaForm.url}
                    onChange={(e) => setSocialMediaForm({
                      ...socialMediaForm,
                      url: e.target.value
                    })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="reward">Reward (coins)</Label>
                    <Input 
                      id="reward" 
                      type="number"
                      min="1"
                      placeholder="100" 
                      value={socialMediaForm.reward}
                      onChange={(e) => setSocialMediaForm({
                        ...socialMediaForm,
                        reward: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label>Active Status</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="isActive" 
                        checked={socialMediaForm.isActive}
                        onCheckedChange={(checked) => setSocialMediaForm({
                          ...socialMediaForm,
                          isActive: checked
                        })}
                      />
                      <label 
                        htmlFor="isActive" 
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Active and visible to users
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label>Icon</Label>
                  <ToggleGroup 
                    type="single" 
                    className="flex flex-wrap justify-start"
                    value={socialMediaForm.icon}
                    onValueChange={(value) => {
                      if (value) {
                        setSocialMediaForm({
                          ...socialMediaForm,
                          icon: value
                        });
                      }
                    }}
                  >
                    {socialIcons.map((item) => (
                      <ToggleGroupItem 
                        key={item.icon} 
                        value={item.icon}
                        aria-label={item.name}
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        <i className={`bx ${item.icon} text-xl`}></i>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                
                <div className="space-y-1.5">
                  <Label>Icon Color</Label>
                  <ToggleGroup 
                    type="single" 
                    className="flex flex-wrap justify-start"
                    value={socialMediaForm.iconColor}
                    onValueChange={(value) => {
                      if (value) {
                        setSocialMediaForm({
                          ...socialMediaForm,
                          iconColor: value
                        });
                      }
                    }}
                  >
                    {iconColors.map((item) => (
                      <ToggleGroupItem 
                        key={item.color} 
                        value={item.color}
                        aria-label={item.name}
                        className="data-[state=on]:bg-background"
                      >
                        <i className={`bx bxs-circle ${item.color} text-xl`}></i>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                
                <div className="flex justify-between pt-2">
                  {editingSocialId ? (
                    <>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={
                          createSocialMediaMutation.isPending || 
                          updateSocialMediaMutation.isPending
                        }
                      >
                        {updateSocialMediaMutation.isPending ? (
                          <><i className="bx bx-loader-alt animate-spin mr-1"></i> Updating...</>
                        ) : (
                          <>Update Link</>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setSocialMediaForm({
                          platform: '',
                          name: '',
                          url: '',
                          icon: '',
                          iconColor: 'text-primary',
                          reward: 100,
                          isActive: true
                        })}
                      >
                        Reset
                      </Button>
                      <Button 
                        type="submit"
                        disabled={
                          createSocialMediaMutation.isPending || 
                          updateSocialMediaMutation.isPending
                        }
                      >
                        {createSocialMediaMutation.isPending ? (
                          <><i className="bx bx-loader-alt animate-spin mr-1"></i> Adding...</>
                        ) : (
                          <>Add Link</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Social Media Links List */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Manage existing social media links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {socialMediaLinks?.data?.length ? (
                  socialMediaLinks.data.map((social) => (
                    <div 
                      key={social.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${social.isActive ? '' : 'opacity-50'}`}>
                          <i className={`bx ${social.icon} ${social.iconColor} text-xl`}></i>
                        </div>
                        <div>
                          <h3 className={`font-medium ${social.isActive ? '' : 'text-muted-foreground'}`}>
                            {social.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">{social.platform}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          <i className="bx bx-coin text-primary text-xs"></i> {social.reward}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSocialMedia(social)}
                        >
                          <i className="bx bx-pencil"></i>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No social media links added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;