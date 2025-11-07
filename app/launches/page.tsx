"use client"

import { useState, useEffect } from "react"
import { Launch, LaunchesResponse } from "@/lib/types/launches"
import { LaunchCard } from "@/components/launches/launch-card"
import { LaunchDetailsDialog } from "@/components/launches/launch-details-dialog"
import { LaunchCountdown } from "@/components/launches/launch-countdown"
import { LaunchFilters } from "@/components/launches/launch-filters"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RocketIcon, ArrowLeft } from "lucide-react"

export default function LaunchesPage() {
  const [launches, setLaunches] = useState<Launch[]>([])
  const [upcomingLaunches, setUpcomingLaunches] = useState<Launch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()

  const LIMIT = 12

  useEffect(() => {
    fetchUpcomingLaunches()
  }, [])

  useEffect(() => {
    fetchLaunches(true)
  }, [searchQuery, statusFilter])

  const fetchUpcomingLaunches = async () => {
    try {
      const response = await fetch('/api/launches/upcoming?limit=1')
      const data: LaunchesResponse = await response.json()
      setUpcomingLaunches(data.results)
    } catch (error) {
      console.error('Error fetching upcoming launches:', error)
    }
  }

  const fetchLaunches = async (reset = false) => {
    try {
      setLoading(true)
      const offset = reset ? 0 : page * LIMIT
      let url = `/api/launches?limit=${LIMIT}&offset=${offset}`

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`
      }

      const response = await fetch(url)
      const data: LaunchesResponse = await response.json()

      if (reset) {
        setLaunches(data.results)
        setPage(1)
      } else {
        setLaunches(prev => [...prev, ...data.results])
        setPage(prev => prev + 1)
      }

      setHasMore(data.next !== null)
    } catch (error) {
      console.error('Error fetching launches:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los lanzamientos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLaunchClick = (launch: Launch) => {
    setSelectedLaunch(launch)
    setDialogOpen(true)
  }

  const handleLoadMore = () => {
    fetchLaunches(false)
  }

  const nextLaunch = upcomingLaunches[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/dashboard'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <RocketIcon className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Lanzamientos Espaciales
                </h1>
                <p className="text-sm text-muted-foreground">
                  Explora lanzamientos de cohetes pasados, presentes y futuros
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
      {/* Countdown Card */}
      {nextLaunch && (
        <LaunchCountdown
          launchDate={new Date(nextLaunch.net)}
          launchName={nextLaunch.name}
          rocketName={nextLaunch.rocket.configuration.name}
        />
      )}

      {/* Filters */}
      <LaunchFilters
        searchValue={searchQuery}
        statusValue={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
      />

      {/* Launches Grid */}
      {loading && launches.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {launches.map((launch) => (
              <LaunchCard
                key={launch.id}
                launch={launch}
                onClick={() => handleLaunchClick(launch)}
              />
            ))}
          </div>

          {launches.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No se encontraron lanzamientos
              </p>
            </div>
          )}

          {hasMore && launches.length > 0 && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Cargar Más"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Details Dialog */}
      <LaunchDetailsDialog
        launch={selectedLaunch}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      </main>
    </div>
  )
}
