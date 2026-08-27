import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import {
  Search,
  X,
  Star,
  Clock,
  MapPin,
  BookOpen,
  Navigation,
  LocateFixed,
  Home,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  List
} from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

import API_BASE_URL from '../../config/api'

interface Restaurant {
  id: number
  google_place_id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone: string | null
  website: string | null
  rating: number
  total_reviews: number
  price_level: string
  opening_hours: Record<string, unknown>
  photos: string[]
  dish_id: number | null
  dish_name: string | null
  dish_history: string | null
  dish_ingredients: string | null
  dish_nutrition: string | null
}

interface UserLocation {
  lat: number
  lng: number
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

const createPinIcon = (active: boolean) =>
  L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        width: ${active ? 38 : 30}px;
        height: ${active ? 38 : 30}px;
        background: ${active ? '#d97706' : '#ea580c'};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [active ? 38 : 30, active ? 38 : 30],
    iconAnchor: [active ? 19 : 15, active ? 38 : 30]
  })

const userLocationIcon = L.divIcon({
  className: 'user-location-pin',
  html: `
    <div style="position: relative; width: 22px; height: 22px;">
      <div style="
        position: absolute; inset: 0;
        background: #2563eb;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(37,99,235,0.6);
      "></div>
      <div style="
        position: absolute; inset: -8px;
        border: 2px solid #2563eb;
        border-radius: 50%;
        opacity: 0.3;
      "></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
})

function FlyToRestaurant({ restaurant }: { restaurant: Restaurant | null }) {
  const map = useMap()
  useEffect(() => {
    if (restaurant) {
      map.invalidateSize()
      map.flyTo([restaurant.latitude, restaurant.longitude], 15, { duration: 0.8 })
    }
  }, [restaurant, map])
  return null
}

function InvalidateOnShow({ trigger }: { trigger: unknown }) {
  const map = useMap()
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 50)
    return () => window.clearTimeout(id)
  }, [trigger, map])
  return null
}

function RoutingMachine({
  userLocation,
  selected
}: {
  userLocation: UserLocation | null
  selected: Restaurant | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || !userLocation || !selected) return
    if (!L.Routing || typeof L.Routing.control !== 'function') return

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(selected.latitude, selected.longitude)
      ],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 1
      },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null
    }).addTo(map)

    return () => {
      try {
        map.removeControl(routingControl)
      } catch {
        /* control sudah tidak ada */
      }
    }
  }, [map, userLocation, selected])

  return null
}

type MobileView = 'list' | 'map'

export default function FoodMap() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')
  const [sortByDistance, setSortByDistance] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const [isDetailExpanded, setIsDetailExpanded] = useState(false)
  const [isListCollapsed, setIsListCollapsed] = useState(false)

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants`)
        const result = await response.json()
        if (result.success) {
          setRestaurants(result.data)
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('denied')
      return
    }
    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationStatus('granted')
        setSortByDistance(true)
      },
      () => {
        setLocationStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function goHome() {
    window.location.href = '/'
  }

  function handleSelectRestaurant(restaurant: Restaurant) {
    setSelected(restaurant)
    setIsDetailExpanded(true)
    setMobileView('map')
  }

  const restaurantsWithDistance = useMemo(() => {
    if (!userLocation) return restaurants.map((r) => ({ ...r, distance: null as number | null }))
    return restaurants.map((r) => ({
      ...r,
      distance: calculateDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
    }))
  }, [restaurants, userLocation])

  const filtered = useMemo(() => {
    let list = restaurantsWithDistance
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)
      )
    }
    if (sortByDistance && userLocation) {
      list = [...list].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    }
    return list
  }, [restaurantsWithDistance, searchQuery, sortByDistance, userLocation])

  const medanCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [3.5952, 98.6722]

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-300 border-t-amber-700 rounded-full animate-spin" />
          <p className="text-amber-800 font-medium text-sm">Memuat data kuliner...</p>
        </div>
      </div>
    )
  }

  const mapPane = (
    <MapContainer center={medanCenter} zoom={13} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FlyToRestaurant restaurant={selected} />
      <InvalidateOnShow trigger={mobileView} />

      {userLocation && selected && (
        <RoutingMachine userLocation={userLocation} selected={selected} />
      )}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>Lokasi Anda</Popup>
        </Marker>
      )}

      {filtered.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={createPinIcon(selected?.id === restaurant.id)}
          eventHandlers={{ click: () => handleSelectRestaurant(restaurant) }}
        >
          <Popup>
            <strong>{restaurant.name}</strong>
            <br />
            <span className="text-xs text-gray-600">{restaurant.address}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )

  return (
    <div className="h-screen flex flex-col md:flex-row bg-amber-50 overflow-hidden">
      {/* SIDEBAR / PANEL LIST - COLLAPSIBLE */}
      <div
        className={`flex-col border-r border-amber-200 bg-white shadow-lg z-10 transition-all duration-300 ease-in-out
          ${mobileView === 'list' ? 'flex' : 'hidden'} md:flex
          ${isListCollapsed ? 'md:w-16' : 'md:w-96'}
          ${isListCollapsed ? 'w-full' : 'w-full'}
          h-full min-h-0`}
      >
        {/* Toggle Button - Desktop */}
        <button
          onClick={() => setIsListCollapsed(!isListCollapsed)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 bg-white border border-amber-200 rounded-full items-center justify-center shadow-lg hover:bg-amber-50 transition"
          style={{ right: isListCollapsed ? '0' : '-20px' }}
        >
          {isListCollapsed ? (
            <ChevronDown className="w-5 h-5 text-amber-700 rotate-90" />
          ) : (
            <ChevronUp className="w-5 h-5 text-amber-700 -rotate-90" />
          )}
        </button>

        {!isListCollapsed && (
          <>
            <div className="px-4 pt-4 pb-3 border-b border-amber-200 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={goHome}
                  aria-label="Kembali ke beranda"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 active:scale-95 transition flex-shrink-0"
                >
                  <Home className="w-4 h-4" />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-amber-900 leading-tight truncate">
                  Peta Kuliner Medan
                </h1>
              </div>

              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau alamat..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={requestLocation}
                disabled={locationStatus === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition disabled:opacity-60"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {locationStatus === 'loading' && 'Mencari lokasi...'}
                {locationStatus === 'idle' && 'Aktifkan lokasi & urutkan terdekat'}
                {locationStatus === 'granted' && 'Lokasi aktif — diurutkan dari terdekat'}
                {locationStatus === 'denied' && 'Gagal ambil lokasi, coba lagi'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {filtered.length === 0 ? (
                <div className="text-center text-gray-500 p-8">
                  <p>
                    {restaurants.length === 0
                      ? 'Belum ada data restoran.'
                      : 'Tidak ada hasil untuk pencarian ini.'}
                  </p>
                </div>
              ) : (
                filtered.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleSelectRestaurant(restaurant)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-amber-50 active:bg-amber-100 transition ${
                      selected?.id === restaurant.id
                        ? 'bg-amber-100 border-l-4 border-l-amber-600'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                      {restaurant.dish_name && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                          {restaurant.dish_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{restaurant.address}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      {restaurant.rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {restaurant.rating.toFixed(1)}
                        </span>
                      )}
                      <span className="text-orange-600">{restaurant.price_level}</span>
                      {restaurant.distance !== null && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium ml-auto">
                          <Navigation className="w-3 h-3" />
                          {formatDistance(restaurant.distance)}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* Collapsed State - Icon Only */}
        {isListCollapsed && (
          <div className="hidden md:flex flex-col items-center py-4 gap-4">
            <button
              onClick={goHome}
              className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center justify-center"
              title="Beranda"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsListCollapsed(false)}
              className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center justify-center"
              title="Lihat Daftar"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* PANEL DETAIL + PETA */}
      <div
        className={`flex-1 flex-col relative min-h-0
          ${mobileView === 'map' ? 'flex' : 'hidden'} md:flex`}
      >
        {/* Header mobile */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2.5 bg-white border-b border-amber-200 flex-shrink-0">
          <button
            onClick={() => setMobileView('list')}
            className="flex items-center gap-1 text-amber-800 font-medium text-sm px-2 py-1.5 rounded-full hover:bg-amber-50 active:scale-95 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Daftar
          </button>
          <span className="text-sm font-semibold text-gray-800 truncate">
            {selected ? selected.name : 'Peta'}
          </span>
          <button
            onClick={goHome}
            aria-label="Kembali ke beranda"
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 active:scale-95 transition flex-shrink-0"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 relative min-h-0">
          {mapPane}

          {/* Hint Overlay */}
          {userLocation && selected && (
            <div className="absolute top-3 right-3 left-3 sm:left-auto bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-200 z-[1000] sm:max-w-xs">
              <p className="text-xs text-blue-800 font-semibold flex items-center gap-2">
                <Navigation className="w-4 h-4 flex-shrink-0" />
                Rute mengemudi ditampilkan
              </p>
            </div>
          )}

          {/* COLLAPSIBLE DETAIL PANEL - MOBILE */}
          {selected && (
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-[1000] transition-all duration-300 ease-in-out"
              style={{ 
                maxHeight: isDetailExpanded ? '85vh' : '120px',
                overflow: 'hidden'
              }}
            >
              {/* Toggle Button */}
              <button
                onClick={() => setIsDetailExpanded(!isDetailExpanded)}
                className="w-full flex items-center justify-center py-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white active:bg-gray-100 transition"
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  {isDetailExpanded ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Tutup Detail</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Lihat Detail Lengkap</span>
                    </>
                  )}
                </div>
              </button>

              {/* Detail Content */}
              <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                <RestaurantDetail
                  restaurant={selected}
                  userLocation={userLocation}
                  onClose={() => {
                    setSelected(null)
                    setIsDetailExpanded(false)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel detail desktop */}
      {selected && (
        <div className="hidden md:block md:w-96 flex-shrink-0 border-l border-amber-200 bg-amber-50 overflow-y-auto h-full">
          <div className="p-4">
            <RestaurantDetail
              restaurant={selected}
              userLocation={userLocation}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function RestaurantDetail({
  restaurant,
  userLocation,
  onClose
}: {
  restaurant: Restaurant
  userLocation: UserLocation | null
  onClose: () => void
}) {
  return (
    <>
      <button
        onClick={onClose}
        className="text-xs text-amber-700 mb-3 hover:underline flex items-center gap-1"
      >
        ← Tutup detail
      </button>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h2>
      
      {restaurant.dish_name && (
        <span className="inline-block mb-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
          {restaurant.dish_name}
        </span>
      )}
      
      <div className="flex items-center gap-2 mb-3 text-sm flex-wrap">
        {restaurant.rating > 0 && (
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            {restaurant.rating.toFixed(1)}
          </span>
        )}
        <span className="text-orange-600 font-medium">{restaurant.price_level}</span>
        {userLocation && (
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <Navigation className="w-3.5 h-3.5" />
            {formatDistance(
              calculateDistance(
                userLocation.lat,
                userLocation.lng,
                restaurant.latitude,
                restaurant.longitude
              )
            )}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 text-sm">
        <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
        <span className="text-gray-700">{restaurant.address}</span>
      </div>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition shadow-lg"
      >
        <Navigation className="w-4 h-4" />
        Buka Rute di Google Maps
      </a>

      {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-sm mb-2">
            <Clock className="w-4 h-4" />
            Jam Buka
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-xs">
            {Object.entries(restaurant.opening_hours as Record<string, string>).map(
              ([day, hours]) => (
                <div
                  key={day}
                  className="flex justify-between px-3 py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-600">{day}</span>
                  <span
                    className={`font-medium ${
                      hours === 'Tutup' ? 'text-red-500' : 'text-gray-800'
                    }`}
                  >
                    {hours}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {restaurant.dish_history && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-sm mb-2">
            <BookOpen className="w-4 h-4" />
            Sejarah
          </div>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
            {restaurant.dish_history}
          </p>
        </div>
      )}
    </>
  )
}