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
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the coin image form
  const [coinImageUrl, setCoinImageUrl] = useState('');
  const [coinValue, setCoinValue] = useState(5);
  
  // State for advertisement form
  const [adForm, setAdForm] = useState({
    name: '',
    placement: 'header',
    type: 'image',
    imageUrl: '',
    linkUrl: '',
    altText: '',
    htmlContent: '',
    scriptContent: '',
    isActive: true,
    priority: 0
  });
  
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
  
  // State for task form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'daily',
    icon: 'bx-check-circle',
    iconColor: 'text-primary',
    target: 1,
    reward: 50,
    socialLink: '',
    isActive: true
  });
  
  // State for editing task
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // State for task dialog
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  // State for editing advertisement
  const [editingAdId, setEditingAdId] = useState(null);
  
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
  
  // Get dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/admin/dashboard/stats']
  });
  
  // Get recent users
  const { data: recentUsers } = useQuery({
    queryKey: ['/api/admin/dashboard/recent-users']
  });
  
  // Get recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/admin/dashboard/recent-transactions']
  });
  
  // Get all tasks
  const { data: tasks } = useQuery({
    queryKey: ['/api/admin/tasks']
  });
  
  // Get all advertisements
  const { data: ads } = useQuery({
    queryKey: ['/api/ads/all']
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
  
  // Mutation for creating a task
  const createTaskMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/admin/tasks', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Task Created',
        description: 'The task has been created successfully.'
      });
      
      // Reset form and dialog
      setTaskForm({
        title: '',
        description: '',
        type: 'daily',
        icon: 'bx-check-circle',
        iconColor: 'text-primary',
        target: 1,
        reward: 50,
        socialLink: '',
        isActive: true
      });
      setIsTaskDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for updating a task
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest(`/api/admin/tasks/${id}`, {
      method: 'PUT',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Task Updated',
        description: 'The task has been updated successfully.'
      });
      
      // Reset editing state and dialog
      setEditingTaskId(null);
      setIsTaskDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for creating an advertisement
  const createAdMutation = useMutation({
    mutationFn: (data) => apiRequest('/api/ads', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Advertisement Created',
        description: 'The advertisement has been created successfully.'
      });
      
      // Reset form
      setAdForm({
        name: '',
        placement: 'header',
        type: 'image',
        imageUrl: '',
        linkUrl: '',
        altText: '',
        htmlContent: '',
        scriptContent: '',
        isActive: true,
        priority: 0
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/ads/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create advertisement.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for updating an advertisement
  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest(`/api/ads/${id}`, {
      method: 'PUT',
      data
    }),
    onSuccess: () => {
      toast({
        title: 'Advertisement Updated',
        description: 'The advertisement has been updated successfully.'
      });
      
      // Reset editing state
      setEditingAdId(null);
      
      // Reset form
      setAdForm({
        name: '',
        placement: 'header',
        type: 'image',
        imageUrl: '',
        linkUrl: '',
        altText: '',
        htmlContent: '',
        scriptContent: '',
        isActive: true,
        priority: 0
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/ads/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update advertisement.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for toggling advertisement active status
  const toggleAdStatusMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/ads/${id}/toggle`, {
      method: 'PUT'
    }),
    onSuccess: () => {
      toast({
        title: 'Advertisement Status Updated',
        description: 'The advertisement status has been toggled successfully.'
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/ads/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle advertisement status.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for deleting an advertisement
  const deleteAdMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/ads/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: 'Advertisement Deleted',
        description: 'The advertisement has been deleted successfully.'
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/ads/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete advertisement.',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for deleting a task
  const deleteTaskMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/admin/tasks/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: 'Task Deleted',
        description: 'The task has been deactivated successfully.'
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task.',
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
  
  // Handle task form submission
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    
    if (editingTaskId) {
      updateTaskMutation.mutate({
        id: editingTaskId,
        data: taskForm
      });
    } else {
      createTaskMutation.mutate(taskForm);
    }
  };
  
  // Handle editing a task
  const handleEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description,
      type: task.type,
      icon: task.icon,
      iconColor: task.iconColor || 'text-primary',
      target: task.target,
      reward: task.reward,
      socialLink: task.socialLink || '',
      isActive: task.isActive
    });
    
    setEditingTaskId(task.id);
    setIsTaskDialogOpen(true);
  };
  
  // Handle deleting a task
  const handleDeleteTask = (id) => {
    if (confirm('Are you sure you want to deactivate this task? This will hide it from users.')) {
      deleteTaskMutation.mutate(id);
    }
  };
  
  // Handle opening task dialog for new task
  const handleNewTask = () => {
    setTaskForm({
      title: '',
      description: '',
      type: 'daily',
      icon: 'bx-check-circle',
      iconColor: 'text-primary',
      target: 1,
      reward: 50,
      socialLink: '',
      isActive: true
    });
    setEditingTaskId(null);
    setIsTaskDialogOpen(true);
  };
  
  // Handle editing an advertisement
  const handleEditAd = (ad) => {
    setAdForm({
      name: ad.name,
      placement: ad.placement,
      type: ad.type,
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      altText: ad.altText || '',
      htmlContent: ad.htmlContent || '',
      scriptContent: ad.scriptContent || '',
      isActive: ad.isActive,
      priority: ad.priority || 0
    });
    
    setEditingAdId(ad.id);
  };
  
  // Handle deleting an advertisement
  const handleDeleteAd = (id) => {
    if (confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      deleteAdMutation.mutate(id);
    }
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
  
  // List of task icons
  const taskIcons = [
    { name: 'Check Circle', icon: 'bx-check-circle' },
    { name: 'Trophy', icon: 'bx-trophy' },
    { name: 'Target', icon: 'bx-target-lock' },
    { name: 'Game', icon: 'bx-game' },
    { name: 'Dollar', icon: 'bx-dollar-circle' },
    { name: 'Star', icon: 'bx-star' },
    { name: 'Medal', icon: 'bx-medal' },
    { name: 'Gift', icon: 'bx-gift' },
    { name: 'Rocket', icon: 'bx-rocket' },
    { name: 'Group', icon: 'bx-group' },
    { name: 'Share', icon: 'bx-share-alt' },
    { name: 'Like', icon: 'bx-like' }
  ];
  
  // Task types
  const taskTypes = [
    { name: 'Daily', value: 'daily' },
    { name: 'Weekly', value: 'weekly' },
    { name: 'Social', value: 'social' },
    { name: 'Special', value: 'special' }
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
      
      <Tabs defaultValue="dashboard" className="flex-1">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="coin">Coin Settings</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="ads">Advertisements</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {dashboardStats?.data?.totalUsers || 0}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <i className="bx bx-user text-primary text-2xl"></i>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-500">
                    +{dashboardStats?.data?.newUsers || 0} new
                  </span>{" "}
                  in the last 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Coins</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {dashboardStats?.data?.totalCoins?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <i className="bx bx-coin text-amber-500 text-2xl"></i>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  In circulation across all users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {dashboardStats?.data?.transactions?.count || 0}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <i className="bx bx-transfer text-blue-500 text-2xl"></i>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total volume: {dashboardStats?.data?.transactions?.totalAmount?.toLocaleString() || 0} coins
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {tasks?.data?.filter(t => t.isActive).length || 0}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <i className="bx bx-check-circle text-green-500 text-2xl"></i>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Out of {tasks?.data?.length || 0} total tasks
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Users and Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Latest users who joined the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers?.data ? (
                    recentUsers.data.map((user) => (
                      <div key={user.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.photoUrl} />
                            <AvatarFallback>{user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.username} · {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-amber-500">
                            <i className="bx bx-coin-stack text-amber-500 mr-1"></i>
                            {user.coins}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      Loading recent users...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest transactions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions?.data ? (
                    recentTransactions.data.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'credit' 
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            <i className={`bx ${
                              transaction.type === 'credit' 
                                ? 'bx-plus-circle'
                                : 'bx-minus-circle'
                            } text-xl`}></i>
                          </div>
                          <div>
                            <div className="font-medium">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.firstName} {transaction.lastName}
                              · {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm ${
                          transaction.type === 'credit' 
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {transaction.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      Loading recent transactions...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Tasks Management</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage tasks for users to complete
              </p>
            </div>
            <Button onClick={handleNewTask}>
              <i className="bx bx-plus mr-1"></i> Add Task
            </Button>
          </div>
          
          {/* Tasks List */}
          <div className="space-y-4">
            {tasks?.data ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.data.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${task.iconColor.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                            <i className={`bx ${task.icon} ${task.iconColor}`}></i>
                          </div>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {task.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{task.type}</span>
                      </TableCell>
                      <TableCell>{task.target}</TableCell>
                      <TableCell>
                        <span className="text-amber-500">
                          <i className="bx bx-coin text-amber-500 mr-1"></i>
                          {task.reward}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.isActive 
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {task.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            <i className="bx bx-edit"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <i className="bx bx-trash text-red-500"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="bx bx-check-circle text-primary text-3xl"></i>
                </div>
                <h3 className="text-lg font-medium">No tasks yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tasks will appear here once created
                </p>
                <Button onClick={handleNewTask}>
                  <i className="bx bx-plus mr-1"></i> Add Your First Task
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
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
        
        {/* Advertisements Tab */}
        <TabsContent value="ads" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Advertisements Management</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage ads displayed throughout the app
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <i className="bx bx-plus mr-1"></i> Add Advertisement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Advertisement</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new advertisement.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  // Call the create ad mutation
                  createAdMutation.mutate(adForm);
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="ad-name">Name</Label>
                      <Input 
                        id="ad-name" 
                        placeholder="Name of the advertisement" 
                        value={adForm.name}
                        onChange={(e) => setAdForm({...adForm, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="ad-placement">Placement</Label>
                      <Select 
                        value={adForm.placement}
                        onValueChange={(value) => setAdForm({...adForm, placement: value})}
                      >
                        <SelectTrigger id="ad-placement">
                          <SelectValue placeholder="Select placement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">Header</SelectItem>
                          <SelectItem value="footer">Footer</SelectItem>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="main">Main Content</SelectItem>
                          <SelectItem value="game">Games Page</SelectItem>
                          <SelectItem value="earn">Earn Page</SelectItem>
                          <SelectItem value="profile">Profile Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="ad-type">Ad Type</Label>
                      <Select 
                        value={adForm.type}
                        onValueChange={(value) => setAdForm({...adForm, type: value})}
                      >
                        <SelectTrigger id="ad-type">
                          <SelectValue placeholder="Select ad type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="script">Script</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {adForm.type === 'image' && (
                      <>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="ad-image-url">Image URL</Label>
                          <Input 
                            id="ad-image-url" 
                            placeholder="URL to the image" 
                            value={adForm.imageUrl}
                            onChange={(e) => setAdForm({...adForm, imageUrl: e.target.value})}
                          />
                        </div>
                        
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="ad-link-url">Link URL</Label>
                          <Input 
                            id="ad-link-url" 
                            placeholder="URL when clicked" 
                            value={adForm.linkUrl}
                            onChange={(e) => setAdForm({...adForm, linkUrl: e.target.value})}
                          />
                        </div>
                        
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="ad-alt-text">Alt Text</Label>
                          <Input 
                            id="ad-alt-text" 
                            placeholder="Alternative text for the image" 
                            value={adForm.altText}
                            onChange={(e) => setAdForm({...adForm, altText: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    
                    {adForm.type === 'html' && (
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="ad-html">HTML Content</Label>
                        <Textarea 
                          id="ad-html" 
                          placeholder="Enter HTML content" 
                          value={adForm.htmlContent}
                          onChange={(e) => setAdForm({...adForm, htmlContent: e.target.value})}
                          rows={5}
                        />
                        <small className="text-muted-foreground">
                          Enter valid HTML to be rendered in the ad space.
                        </small>
                      </div>
                    )}
                    
                    {adForm.type === 'script' && (
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="ad-script">Script Content</Label>
                        <Textarea 
                          id="ad-script" 
                          placeholder="Enter script content" 
                          value={adForm.scriptContent}
                          onChange={(e) => setAdForm({...adForm, scriptContent: e.target.value})}
                          rows={5}
                        />
                        <small className="text-muted-foreground">
                          Enter JavaScript code or ad network script tags.
                        </small>
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="ad-priority">Priority</Label>
                      <Input 
                        id="ad-priority" 
                        type="number"
                        placeholder="0" 
                        min="0"
                        max="100"
                        value={adForm.priority}
                        onChange={(e) => setAdForm({...adForm, priority: parseInt(e.target.value)})}
                      />
                      <small className="text-muted-foreground">
                        Higher priority ads will be shown first (0-100)
                      </small>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="ad-active"
                        checked={adForm.isActive}
                        onCheckedChange={(checked) => setAdForm({...adForm, isActive: !!checked})}
                      />
                      <Label htmlFor="ad-active">Active</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Advertisement</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Ads List */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ads?.data ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Placement</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.data.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <div className="font-medium">{ad.name}</div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{ad.placement}</span>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{ad.type}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              ad.isActive 
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}>
                              {ad.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>{ad.priority}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAd(ad)}
                              >
                                <i className="bx bx-edit"></i>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAdStatusMutation.mutate(ad.id)}
                              >
                                <i className={`bx ${ad.isActive ? 'bx-hide' : 'bx-show'}`}></i>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAd(ad.id)}
                              >
                                <i className="bx bx-trash text-red-500"></i>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <i className="bx bx-purchase-tag-alt text-primary text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-medium">No advertisements yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ads will appear here once created
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {editingTaskId ? 'Update task details below.' : 'Fill in the details to create a new task for users.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTaskSubmit} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title"
                placeholder="e.g. Daily Login"
                value={taskForm.title}
                onChange={(e) => setTaskForm({
                  ...taskForm,
                  title: e.target.value
                })}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="e.g. Login to the app every day to earn coins"
                value={taskForm.description}
                onChange={(e) => setTaskForm({
                  ...taskForm,
                  description: e.target.value
                })}
                required
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">Task Type</Label>
                <Select 
                  value={taskForm.type}
                  onValueChange={(value) => setTaskForm({
                    ...taskForm,
                    type: value
                  })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="target">Target Count</Label>
                <Input 
                  id="target"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={taskForm.target}
                  onChange={(e) => setTaskForm({
                    ...taskForm,
                    target: parseInt(e.target.value) || 1
                  })}
                  required
                />
                <small className="text-xs text-muted-foreground">
                  How many times user needs to complete the task
                </small>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reward">Reward (coins)</Label>
                <Input 
                  id="reward"
                  type="number"
                  min="1"
                  placeholder="50"
                  value={taskForm.reward}
                  onChange={(e) => setTaskForm({
                    ...taskForm,
                    reward: parseInt(e.target.value) || 0
                  })}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="socialLink">Social Media Link (Optional)</Label>
                <Input 
                  id="socialLink"
                  placeholder="For social tasks only"
                  value={taskForm.socialLink}
                  onChange={(e) => setTaskForm({
                    ...taskForm,
                    socialLink: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label>Task Icon</Label>
              <ToggleGroup 
                type="single" 
                className="flex flex-wrap justify-start"
                value={taskForm.icon}
                onValueChange={(value) => {
                  if (value) {
                    setTaskForm({
                      ...taskForm,
                      icon: value
                    });
                  }
                }}
              >
                {taskIcons.map((item) => (
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
                value={taskForm.iconColor}
                onValueChange={(value) => {
                  if (value) {
                    setTaskForm({
                      ...taskForm,
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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isActive" 
                checked={taskForm.isActive}
                onCheckedChange={(checked) => setTaskForm({
                  ...taskForm,
                  isActive: checked
                })}
              />
              <label htmlFor="isActive" className="text-sm font-medium leading-none">
                Active and visible to users
              </label>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              >
                {editingTaskId ? (
                  updateTaskMutation.isPending ? (
                    <><i className="bx bx-loader-alt animate-spin mr-1"></i> Updating...</>
                  ) : (
                    <>Update Task</>
                  )
                ) : (
                  createTaskMutation.isPending ? (
                    <><i className="bx bx-loader-alt animate-spin mr-1"></i> Creating...</>
                  ) : (
                    <>Create Task</>
                  )
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;