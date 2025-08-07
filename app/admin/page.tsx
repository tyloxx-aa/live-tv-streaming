'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Edit, Plus, Eye, Home, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  logo_url: string
  embed_link: string
  category_id: string
  category: {
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export default function AdminPanel() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [channelForm, setChannelForm] = useState({
    id: '',
    name: '',
    logo_url: '',
    embed_link: '',
    category_id: ''
  })
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: ''
  })
  
  const [editingChannel, setEditingChannel] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showChannelDialog, setShowChannelDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)

  const { toast } = useToast()
  
  let supabase: any = null

  try {
    supabase = createClient()
  } catch (err) {
    console.error('Supabase initialization error:', err)
  }

  // Simple password authentication
  const ADMIN_PASSWORD = 'admin123' // Change this to your desired password

  useEffect(() => {
    if (isAuthenticated && supabase) {
      fetchData()
    } else if (isAuthenticated && !supabase) {
      setError('Supabase is not configured. Please add your Supabase environment variables.')
      setLoading(false)
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      toast({
        title: "Success",
        description: "Logged in successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      })
    }
  }

  const fetchData = async () => {
    if (!supabase) return
    
    setLoading(true)
    await Promise.all([fetchCategories(), fetchChannels()])
    setLoading(false)
  }

  const fetchCategories = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to fetch categories: " + error.message,
          variant: "destructive",
        })
      } else {
        setCategories(data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to connect to database')
    }
  }

  const fetchChannels = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          category:categories(name)
        `)
        .order('name')

      if (error) {
        console.error('Error fetching channels:', error)
        toast({
          title: "Error",
          description: "Failed to fetch channels: " + error.message,
          variant: "destructive",
        })
      } else {
        setChannels(data || [])
      }
    } catch (err) {
      console.error('Error fetching channels:', err)
      setError('Failed to connect to database')
    }
  }

  const handleChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      toast({
        title: "Error",
        description: "Database not configured",
        variant: "destructive",
      })
      return
    }
    
    if (!channelForm.name || !channelForm.embed_link || !channelForm.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const channelData = {
      name: channelForm.name,
      logo_url: channelForm.logo_url,
      embed_link: channelForm.embed_link,
      category_id: channelForm.category_id
    }

    let error
    if (editingChannel) {
      const { error: updateError } = await supabase
        .from('channels')
        .update(channelData)
        .eq('id', editingChannel)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('channels')
        .insert([channelData])
      error = insertError
    }

    if (error) {
      console.error('Error saving channel:', error)
      toast({
        title: "Error",
        description: "Failed to save channel: " + error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Channel ${editingChannel ? 'updated' : 'created'} successfully`,
      })
      setShowChannelDialog(false)
      resetChannelForm()
      fetchChannels()
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      toast({
        title: "Error",
        description: "Database not configured",
        variant: "destructive",
      })
      return
    }
    
    if (!categoryForm.name) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      })
      return
    }

    const categoryData = { name: categoryForm.name }

    let error
    if (editingCategory) {
      const { error: updateError } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('categories')
        .insert([categoryData])
      error = insertError
    }

    if (error) {
      console.error('Error saving category:', error)
      toast({
        title: "Error",
        description: "Failed to save category: " + error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Category ${editingCategory ? 'updated' : 'created'} successfully`,
      })
      setShowCategoryDialog(false)
      resetCategoryForm()
      fetchCategories()
    }
  }

  const deleteChannel = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this channel?')) return

    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting channel:', error)
      toast({
        title: "Error",
        description: "Failed to delete channel: " + error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Channel deleted successfully",
      })
      fetchChannels()
    }
  }

  const deleteCategory = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this category? All channels in this category will also be deleted.')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category: " + error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
      fetchData()
    }
  }

  const editChannel = (channel: Channel) => {
    setChannelForm({
      id: channel.id,
      name: channel.name,
      logo_url: channel.logo_url,
      embed_link: channel.embed_link,
      category_id: channel.category_id
    })
    setEditingChannel(channel.id)
    setShowChannelDialog(true)
  }

  const editCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name
    })
    setEditingCategory(category.id)
    setShowCategoryDialog(true)
  }

  const resetChannelForm = () => {
    setChannelForm({
      id: '',
      name: '',
      logo_url: '',
      embed_link: '',
      category_id: ''
    })
    setEditingChannel(null)
  }

  const resetCategoryForm = () => {
    setCategoryForm({
      id: '',
      name: ''
    })
    setEditingCategory(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Configuration Error</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <div className="text-sm text-gray-300 text-left">
            <p className="mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Add Supabase integration to your project</li>
              <li>Set up your database using the provided SQL scripts</li>
              <li>Make sure environment variables are configured</li>
            </ol>
          </div>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Live TV Admin Panel</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Manage Channels</h2>
              <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetChannelForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Channel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingChannel ? 'Edit Channel' : 'Add New Channel'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChannelSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="channel-name">Channel Name *</Label>
                      <Input
                        id="channel-name"
                        value={channelForm.name}
                        onChange={(e) => setChannelForm({...channelForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="channel-logo">Logo URL</Label>
                      <Input
                        id="channel-logo"
                        value={channelForm.logo_url}
                        onChange={(e) => setChannelForm({...channelForm, logo_url: e.target.value})}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="channel-embed">Embed Link *</Label>
                      <Input
                        id="channel-embed"
                        value={channelForm.embed_link}
                        onChange={(e) => setChannelForm({...channelForm, embed_link: e.target.value})}
                        placeholder="https://example.com/embed/channel"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="channel-category">Category *</Label>
                      <Select
                        value={channelForm.category_id}
                        onValueChange={(value) => setChannelForm({...channelForm, category_id: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingChannel ? 'Update' : 'Create'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowChannelDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={channel.logo_url || '/placeholder.svg?height=50&width=50&query=TV Logo'}
                            alt={channel.name}
                            className="w-12 h-12 object-contain rounded"
                          />
                          <div>
                            <h3 className="font-semibold">{channel.name}</h3>
                            <p className="text-sm text-gray-600">
                              Category: {channel.category?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(channel.embed_link, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editChannel(channel)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteChannel(channel.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Manage Categories</h2>
              <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetCategoryForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Category Name *</Label>
                      <Input
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingCategory ? 'Update' : 'Create'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCategoryDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-gray-600">
                            {channels.filter(c => c.category_id === category.id).length} channels
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
