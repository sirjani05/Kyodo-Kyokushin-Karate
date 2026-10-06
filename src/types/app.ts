export type UserRole = 'student' | 'sensei';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  dojoId?: string;
  dojoName?: string;
  phone?: string;
  city?: string;
  isDemo: boolean;
}

export interface Dojo {
  id: string;
  name: string;
  city: string;
  address: string;
  distanceKm: number | null;
  rating: number;
  trialCapacity: number;
  description: string;
  sensei: string;
  specialties: string[];
  image: string;
  mapRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export interface TrialClass {
  id: string;
  dojoId: string;
  dojoName: string;
  title: string;
  date: string;
  time: string;
  format: string;
  level: string;
  seatsLeft: number;
  dojo: Dojo;
}

export interface TrainingContent {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
}

export interface Lead {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  dojoId: string;
  dojoName: string;
  status: 'new' | 'contacted' | 'booked';
  createdAt: string;
}
