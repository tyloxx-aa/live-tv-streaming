'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Play, Layers, AlertCircle } from 'lucide-react'
import Image from 'next/image'

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

export default function HomePage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  let supabase: any = null

  try {
    supabase = createClient()
  } catch (err) {
    console.error('Supabase initialization error:', err)
  }

  useEffect(() => {
    if (supabase) {
      fetchCategories()
      fetchChannels()
    } else {
      setError('Supabase is not configured. Please add your Supabase environment variables.')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    filterChannels()
  }, [channels, selectedCategory, searchQuery])

  const fetchCategories = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to fetch categories: ' + error.message)
      } else {
        setCategories(data || [])
        if (data && data.length > 0) {
          setSelectedCategory(data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to connect to database')
    }
  }

  const fetchChannels = async () => {
    if (!supabase) return

    setLoading(true)
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
        setError('Failed to fetch channels: ' + error.message)
      } else {
        setChannels(data || [])
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching channels:', err)
      setError('Failed to connect to database')
    }
    setLoading(false)
  }

  const filterChannels = () => {
    let filtered = channels

    if (selectedCategory) {
      filtered = filtered.filter(channel => channel.category_id === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredChannels(filtered)
  }

  const playChannel = (channel: Channel) => {
    setSelectedChannel(channel)
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?q=80&w=2071&auto=format&fit=crop')" }}>
      
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[20px] -z-10" />

      {/* Header */}
      <header className="bg-black/45 backdrop-blur-[15px] p-3 flex items-center justify-between sticky top-0 z-50 border-b border-white/15">
        <div className="flex items-center">
          <Image
            src="/live-tv-logo.png"
            alt="Live TV Logo"
            width={120}
            height={42}
            className="h-10 w-auto"
          />
        </div>
        <a 
          href="/admin" 
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors border border-white/15"
        >
          Admin Panel
        </a>
      </header>

      {/* Main Content */}
      <main className="flex gap-5 p-5 items-start max-lg:flex-col">
        {/* Left Column - Video Player */}
        <div className="flex-[3] min-w-0">
          <h2 className="text-xl font-semibold mb-4 text-white/90 flex items-center gap-3">
            <Play className="w-5 h-5" />
            {selectedChannel ? `Now Playing: ${selectedChannel.name}` : 'Select a Channel'}
          </h2>
          
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/15 shadow-2xl">
            {selectedChannel ? (
              <iframe
                src={selectedChannel.embed_link}
                className="w-full h-full border-none"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a channel to start watching</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Channel List */}
        <div className="flex-1 min-w-[340px] max-lg:w-full h-[calc(100vh-110px)] max-h-[850px] max-lg:h-[50vh] max-lg:max-h-[450px] bg-black/45 backdrop-blur-[15px] border border-white/15 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          
          {/* Search and Filter */}
          <div className="p-4 flex items-center gap-3 border-b border-white/15 flex-shrink-0">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 bg-black/30 text-white/90 border border-white/15 rounded-lg cursor-pointer transition-colors hover:bg-white/10 font-medium appearance-none pr-8"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Layers className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/15 rounded-lg text-white/90 placeholder-white/40 focus:outline-none focus:border-white focus:bg-black/50 transition-all"
              />
            </div>
          </div>

          {/* Channel Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => playChannel(channel)}
                    className={`bg-black/20 rounded-xl text-center transition-all duration-300 cursor-pointer border hover:transform hover:-translate-y-1 hover:bg-white/10 ${
                      selectedChannel?.id === channel.id 
                        ? 'border-white bg-white/10' 
                        : 'border-white/15'
                    }`}
                  >
                    <div className="bg-black/20 rounded-t-xl">
                      <Image
                        src={channel.logo_url || '/placeholder.svg?height=100&width=130&query=TV Channel Logo'}
                        alt={channel.name}
                        width={130}
                        height={100}
                        className="w-full h-[100px] object-contain p-2.5"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/generic-tv-logo.png'
                        }}
                      />
                    </div>
                    <div className="px-2 py-3 text-sm font-medium text-white/90 truncate">
                      {channel.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && filteredChannels.length === 0 && !error && (
              <div className="text-center py-16 text-white/60">
                <p>No channels found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
