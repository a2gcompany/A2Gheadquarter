export const dynamic = "force-dynamic"

import { getProjectByName } from "@/src/actions/projects"
import { getReleasesByProject } from "@/src/actions/releases"
import { getBookingsByProject } from "@/src/actions/bookings"
import { Music, CalendarDays, MapPin, CheckCircle2 } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  shopping: "Shopping",
  accepted: "Accepted",
  released: "Released",
}

const BOOKING_STATUS_LABELS: Record<string, string> = {
  negotiating: "Negotiating",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-700 text-slate-300",
  shopping: "bg-blue-500/20 text-blue-400",
  accepted: "bg-emerald-500/20 text-emerald-400",
  released: "bg-purple-500/20 text-purple-400",
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  negotiating: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  contracted: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-slate-700 text-slate-400",
  cancelled: "bg-red-500/20 text-red-400",
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD"
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default async function BabelPortalPage() {
  const project = await getProjectByName("BABEL Music")

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-lg">Project not found.</p>
      </div>
    )
  }

  const [releases, bookings] = await Promise.all([
    getReleasesByProject(project.id),
    getBookingsByProject(project.id),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingShows = bookings
    .filter(
      (b) =>
        b.show_date &&
        new Date(b.show_date) >= today &&
        ["confirmed", "contracted"].includes(b.status)
    )
    .sort((a, b) => new Date(a.show_date!).getTime() - new Date(b.show_date!).getTime())

  const activeReleases = releases.filter((r) =>
    ["shopping", "accepted"].includes(r.status)
  )

  const completedShows = bookings.filter((b) => b.status === "completed").length

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-1">
              A2G Talents
            </p>
            <h1 className="text-2xl font-bold text-white">BABEL Music</h1>
          </div>
          <div className="text-xs text-slate-600">headquarters.a2g.company</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CalendarDays className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Upcoming Shows</span>
            </div>
            <p className="text-3xl font-bold">{upcomingShows.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Music className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Active Releases</span>
            </div>
            <p className="text-3xl font-bold">{activeReleases.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Shows Done</span>
            </div>
            <p className="text-3xl font-bold">{completedShows}</p>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Upcoming Shows
          </h2>
          {upcomingShows.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <CalendarDays className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No confirmed shows scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingShows.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {booking.event_name || booking.venue}
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.city}, {booking.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        BOOKING_STATUS_COLORS[booking.status] ?? "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                    <p className="text-sm text-slate-400 w-28 text-right">
                      {formatDate(booking.show_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Releases Pipeline
          </h2>
          {activeReleases.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <Music className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No active releases</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeReleases.map((release) => (
                <div
                  key={release.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Music className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{release.track_name}</p>
                      {release.release_date && (
                        <p className="text-sm text-slate-500">
                          Release: {formatDate(release.release_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      STATUS_COLORS[release.status] ?? "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {STATUS_LABELS[release.status] ?? release.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {releases.filter((r) => !["shopping", "accepted"].includes(r.status)).length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              All Releases
            </h2>
            <div className="space-y-2">
              {releases
                .filter((r) => !["shopping", "accepted"].includes(r.status))
                .map((release) => (
                  <div
                    key={release.id}
                    className="bg-slate-900/50 border border-slate-800/50 rounded-xl px-6 py-3 flex items-center justify-between"
                  >
                    <p className="text-sm text-slate-400">{release.track_name}</p>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_COLORS[release.status] ?? "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {STATUS_LABELS[release.status] ?? release.status}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-900 mt-16 py-6">
        <p className="text-center text-xs text-slate-700">
          A2G Talents · Powered by A2G Headquarters
        </p>
      </footer>
    </div>
  )
}
