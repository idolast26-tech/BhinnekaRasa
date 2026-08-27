import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface Location {
  lat: number;
  lng: number;
}

// Struktur ini dipertahankan sama supaya routes/api.ts tidak perlu diubah
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
  }>;
}

// Bentuk mentah dari Nominatim
interface NominatimResult {
  place_id: number;
  osm_type: 'node' | 'way' | 'relation';
  osm_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
  extratags?: {
    phone?: string;
    'contact:phone'?: string;
    website?: string;
    'contact:website'?: string;
    opening_hours?: string;
  };
}

class GoogleMapsService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: {
        // WAJIB oleh kebijakan Nominatim: identifikasi aplikasi kamu
        'User-Agent': 'KulinerMedanFood/1.0 (kontak: okysihotang10@gmail.com)'
      }
    });
  }

  private toPlaceId(r: NominatimResult): string {
    // gabungkan tipe + id supaya bisa dipakai lagi di lookup (getPlaceDetails)
    const prefix = r.osm_type === 'node' ? 'N' : r.osm_type === 'way' ? 'W' : 'R';
    return `${prefix}${r.osm_id}`;
  }

  private mapResult(r: NominatimResult): GooglePlaceResult {
    return {
      place_id: this.toPlaceId(r),
      name: r.name || r.display_name.split(',')[0],
      formatted_address: r.display_name,
      geometry: {
        location: {
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon)
        }
      },
      formatted_phone_number: r.extratags?.phone || r.extratags?.['contact:phone'],
      website: r.extratags?.website || r.extratags?.['contact:website'],
      rating: 0,
      user_ratings_total: 0,
      price_level: 0,
      opening_hours: r.extratags?.opening_hours
        ? { weekday_text: [r.extratags.opening_hours] }
        : undefined,
      photos: []
    };
  }

  async searchPlaces(query: string, location: Location | null = null): Promise<GooglePlaceResult[]> {
    try {
      const params: Record<string, unknown> = {
        q: `${query} Medan`, // bias ke Medan supaya hasil relevan
        format: 'jsonv2',
        addressdetails: 1,
        extratags: 1,
        limit: 5
      };

      if (location) {
        // Nominatim pakai viewbox, bukan radius+location seperti Google
        const delta = 0.05;
        params.viewbox = `${location.lng - delta},${location.lat + delta},${location.lng + delta},${location.lat - delta}`;
        params.bounded = 1;
      }

      const res = await this.axiosInstance.get(`${this.baseUrl}/search`, { params });
      const results = (res.data as NominatimResult[]) || [];

      console.log(`📦 Hasil pencarian Nominatim untuk "${query}":`, results.length);

      return results.map((r) => this.mapResult(r));
    } catch (error: unknown) {
      console.error('Nominatim Search Error:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    try {
      const osmType = placeId[0]; // N / W / R
      const osmId = placeId.slice(1);
      const typeMap: Record<string, string> = { N: 'N', W: 'W', R: 'R' };
      const osmIdsParam = `${typeMap[osmType]}${osmId}`;

      const params = {
        osm_ids: osmIdsParam,
        format: 'jsonv2',
        addressdetails: 1,
        extratags: 1
      };

      const res = await this.axiosInstance.get(`${this.baseUrl}/lookup`, { params });
      const results = res.data as NominatimResult[];

      if (!results || results.length === 0) return null;

      return this.mapResult(results[0]);
    } catch (error: unknown) {
      console.error('Nominatim Details Error:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  getPhotoUrl(photoReference: string): string {
    // OSM/Nominatim tidak menyediakan foto tempat
    if (photoReference) {
      // no-op, sekadar supaya parameter "terpakai"
    }
    return '';
  }
}

export default new GoogleMapsService();