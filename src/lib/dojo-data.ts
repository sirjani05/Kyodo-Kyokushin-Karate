import { requireSupabase } from '@/lib/supabase';
import type { Dojo, Lead, TrainingContent, TrialClass, UserProfile } from '@/types/app';

interface DojoRow {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  trial_capacity: number;
  description: string;
  sensei_name: string;
  specialties: string[] | null;
  image_url: string | null;
}

interface TrialClassRow {
  id: string;
  dojo_id: string;
  title: string;
  starts_at: string;
  format: string;
  level: string;
  seats_left: number;
  dojos: DojoRow | DojoRow[] | null;
}

interface TrainingContentRow {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  thumbnail_url: string | null;
  video_url: string;
}

interface LeadRow {
  id: string;
  candidate_name: string;
  email: string;
  phone: string;
  dojo_id: string;
  status: Lead['status'];
  created_at: string;
  dojos: { name: string } | { name: string }[] | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string;
  role: unknown;
  dojo_name: string | null;
  city: string | null;
}

function toDojo(row: DojoRow): Dojo {
  const latitude = row.latitude;
  const longitude = row.longitude;

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    distanceKm: null,
    rating: row.rating,
    trialCapacity: row.trial_capacity,
    description: row.description,
    sensei: row.sensei_name,
    specialties: row.specialties ?? [],
    image: row.image_url ?? '',
    ...(latitude !== null && longitude !== null
      ? {
          mapRegion: {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
        }
      : {}),
  };
}

export async function fetchDojos(): Promise<Dojo[]> {
  const { data, error } = await requireSupabase()
    .from('dojos')
    .select('id, name, city, address, latitude, longitude, rating, trial_capacity, description, sensei_name, specialties, image_url')
    .eq('is_published', true)
    .order('name');

  if (error) throw error;
  return (data as DojoRow[]).map(toDojo);
}

export async function fetchTrialClasses(): Promise<TrialClass[]> {
  const { data, error } = await requireSupabase()
    .from('trial_classes')
    .select('id, dojo_id, title, starts_at, format, level, seats_left, dojos!inner(id, name, city, address, latitude, longitude, rating, trial_capacity, description, sensei_name, specialties, image_url)')
    .eq('is_published', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at');

  if (error) throw error;

  return (data as TrialClassRow[]).map((row) => {
    const startsAt = new Date(row.starts_at);
    const joinedDojo = Array.isArray(row.dojos) ? row.dojos[0] : row.dojos;

    if (!joinedDojo || Number.isNaN(startsAt.getTime())) {
      throw new Error(`Invalid trial class record: ${row.id}`);
    }

    return {
      id: row.id,
      dojoId: row.dojo_id,
      dojoName: joinedDojo.name,
      title: row.title,
      date: startsAt.toLocaleDateString(),
      time: startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      format: row.format,
      level: row.level,
      seatsLeft: row.seats_left,
      dojo: toDojo(joinedDojo),
    };
  });
}

export async function fetchTrainingContent(): Promise<TrainingContent[]> {
  const { data, error } = await requireSupabase()
    .from('training_content')
    .select('id, title, category, duration, level, description, thumbnail_url, video_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as TrainingContentRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    duration: row.duration,
    level: row.level,
    description: row.description,
    thumbnail: row.thumbnail_url ?? '',
    videoUrl: row.video_url,
  }));
}

export async function createTrialRequest(input: {
  studentId: string;
  candidateName: string;
  email: string;
  phone: string;
  dojoId: string;
  trialClassId?: string;
}): Promise<void> {
  const { error } = await requireSupabase().from('leads').insert({
    student_id: input.studentId,
    candidate_name: input.candidateName,
    email: input.email,
    phone: input.phone,
    dojo_id: input.dojoId,
    trial_class_id: input.trialClassId ?? null,
    status: 'new',
  });

  if (error) throw error;
}

export async function fetchSenseiLeads(): Promise<Lead[]> {
  const { data, error } = await requireSupabase()
    .from('leads')
    .select('id, candidate_name, email, phone, dojo_id, status, created_at, dojos!inner(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as LeadRow[]).map((row) => {
    const dojo = Array.isArray(row.dojos) ? row.dojos[0] : row.dojos;
    if (!dojo || !['new', 'contacted', 'booked'].includes(row.status)) {
      throw new Error(`Invalid trial request record: ${row.id}`);
    }
    return {
      id: row.id,
      candidateName: row.candidate_name,
      email: row.email,
      phone: row.phone,
      dojoId: row.dojo_id,
      dojoName: dojo.name,
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function updateLeadStatus(leadId: string, status: Lead['status']): Promise<void> {
  const { error } = await requireSupabase()
    .from('leads')
    .update({ status })
    .eq('id', leadId);

  if (error) throw error;
}

export async function fetchUserProfile(userId: string, fallbackEmail = ''): Promise<UserProfile | null> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, email, full_name, role, dojo_name, city')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  const profile = data as ProfileRow | null;
  if (!profile || (profile.role !== 'student' && profile.role !== 'sensei')) return null;
  return {
    uid: profile.id,
    email: profile.email ?? fallbackEmail,
    displayName: profile.full_name,
    role: profile.role,
    dojoName: profile.dojo_name ?? undefined,
    city: profile.city ?? undefined,
  };
}
