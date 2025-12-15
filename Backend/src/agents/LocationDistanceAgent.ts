// Location & Distance Agent - Calculates distance and provides navigation
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceResult {
  distance: string;
  distanceValue: number; // in meters
  duration: string;
  durationValue: number; // in seconds
  navigationUrl: string;
  clinicAddress: string;
}

export class LocationDistanceAgent {
  private googleMapsApiKey: string;

  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    
    if (!this.googleMapsApiKey) {
      console.warn('⚠️ Google Maps API Key not configured');
    }
  }

  /**
   * Calculate distance between patient and doctor using Google Maps Distance Matrix API
   */
  async calculateDistance(
    patientLocation: LocationCoordinates,
    doctorLocation: LocationCoordinates,
    clinicAddress: string
  ): Promise<DistanceResult> {
    try {
      // Validate coordinates
      if (!this.isValidCoordinates(patientLocation) || !this.isValidCoordinates(doctorLocation)) {
        throw new Error('Invalid coordinates provided');
      }

      // Call Google Maps Distance Matrix API
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        {
          params: {
            origins: `${patientLocation.latitude},${patientLocation.longitude}`,
            destinations: `${doctorLocation.latitude},${doctorLocation.longitude}`,
            mode: 'driving',
            units: 'metric',
            key: this.googleMapsApiKey,
          },
        }
      );

      // Parse response
      if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
        const element = response.data.rows[0].elements[0];
        
        const distanceResult: DistanceResult = {
          distance: element.distance.text,
          distanceValue: element.distance.value,
          duration: element.duration.text,
          durationValue: element.duration.value,
          navigationUrl: this.generateNavigationUrl(patientLocation, doctorLocation),
          clinicAddress,
        };

        console.log(`📍 Distance calculated: ${distanceResult.distance}, ETA: ${distanceResult.duration}`);
        return distanceResult;
      } else {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }
    } catch (error: any) {
      console.error('LocationDistanceAgent Error:', error.message);
      
      // Return fallback result
      return this.getFallbackDistanceResult(patientLocation, doctorLocation, clinicAddress);
    }
  }

  /**
   * Generate Google Maps navigation URL
   */
  private generateNavigationUrl(
    origin: LocationCoordinates,
    destination: LocationCoordinates
  ): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
  }

  /**
   * Validate coordinates
   */
  private isValidCoordinates(location: LocationCoordinates): boolean {
    return (
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }

  /**
   * Calculate straight-line distance (Haversine formula) as fallback
   */
  private calculateStraightLineDistance(
    loc1: LocationCoordinates,
    loc2: LocationCoordinates
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) *
        Math.cos(this.toRadians(loc2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Fallback distance result if API fails
   */
  private getFallbackDistanceResult(
    patientLocation: LocationCoordinates,
    doctorLocation: LocationCoordinates,
    clinicAddress: string
  ): DistanceResult {
    const distanceKm = this.calculateStraightLineDistance(patientLocation, doctorLocation);
    const distanceMeters = Math.round(distanceKm * 1000);
    const estimatedDurationMinutes = Math.round((distanceKm / 40) * 60); // Assuming 40 km/h average

    return {
      distance: `${distanceKm.toFixed(1)} km`,
      distanceValue: distanceMeters,
      duration: `${estimatedDurationMinutes} min`,
      durationValue: estimatedDurationMinutes * 60,
      navigationUrl: this.generateNavigationUrl(patientLocation, doctorLocation),
      clinicAddress,
    };
  }

  /**
   * Get formatted location summary
   */
  getLocationSummary(distanceResult: DistanceResult): string {
    return `📍 **Clinic Location**
    
**Address**: ${distanceResult.clinicAddress}

**Distance from your location**: ${distanceResult.distance}
**Estimated travel time**: ${distanceResult.duration}

🗺️ **[Click here to open navigation in Google Maps](${distanceResult.navigationUrl})**

💡 *Tip*: Save this link to easily navigate to the clinic on your appointment day.`;
  }

  /**
   * Check if Google Maps API is configured
   */
  isConfigured(): boolean {
    return !!this.googleMapsApiKey && this.googleMapsApiKey.length > 0;
  }
}
