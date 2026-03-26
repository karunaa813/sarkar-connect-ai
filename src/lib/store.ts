import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { toast } from 'sonner';

// Types
export type UserRole = 'citizen' | 'admin';
export type ComplaintStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved';
export type Department = 'water' | 'electricity' | 'roads' | 'garbage' | 'safety' | 'health' | 'education' | 'other';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: Department;
  language: string;
  civic_points?: number;
}

export interface BNSSection {
  section: string;
  title: string;
  explanation: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  status: ComplaintStatus;
  note: string;
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Department;
  location: string;
  coordinates?: { lat: number; lng: number }; // Optional for now
  status: ComplaintStatus;
  priority: Priority;
  department: Department;
  createdAt: string;
  updatedAt: string;
  images: string[];
  votes: number;
  votedBy: string[];
  bnsSection: BNSSection | null;
  timeline: TimelineEvent[];
  assignedTo?: string;
  resolutionProof?: string;
}

// Global Auth Store using Zustand
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

// Export the hook signature expected by components
export function useAuth() {
  const { user, setUser, isLoading } = useAuthStore();
  
  const login = (userData: User) => {
    setUser(userData);
  };
  
  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
  };
  
  return { user, login, logout, isAuthenticated: !!user, isLoading };
}

// BNS 2023 mapping (Mocked locally for now, real AI logic moves to Edge Functions later)
const BNS_MAP: Record<string, BNSSection> = {
  water: { section: '270', title: 'Public Nuisance (Water Contamination)', explanation: 'Covers contamination of public water supply causing harm or disease to the community.' },
  electricity: { section: '285', title: 'Negligent Conduct with Electricity', explanation: 'Deals with rash or negligent conduct related to electricity infrastructure endangering lives.' },
  roads: { section: '125(b)', title: 'Endangering Public Safety on Roads', explanation: 'Covers negligent maintenance of roads, potholes, and infrastructure causing danger to public.' },
  garbage: { section: '271', title: 'Public Nuisance (Environmental)', explanation: 'Addresses illegal dumping and failure to maintain clean environment affecting public health.' },
  safety: { section: '351', title: 'Criminal Intimidation & Public Safety', explanation: 'Covers threats to public safety, criminal intimidation, and endangering community security.' },
  health: { section: '270', title: 'Public Health Negligence', explanation: 'Relates to acts causing spread of disease or endangering public health through negligence.' },
  education: { section: '', title: '', explanation: '' },
  other: { section: '', title: '', explanation: '' },
};

// Category detection keywords
const CATEGORY_KEYWORDS: Record<Department, string[]> = {
  water: ['water', 'pipe', 'leak', 'drainage', 'flood', 'sewage', 'tap', 'supply', 'contaminated', 'pani', 'paani', 'nala'],
  electricity: ['electric', 'power', 'light', 'transformer', 'wire', 'outage', 'bijli', 'current', 'voltage', 'pole'],
  roads: ['road', 'pothole', 'footpath', 'bridge', 'crack', 'rasta', 'sadak', 'path', 'highway', 'pavement'],
  garbage: ['garbage', 'waste', 'trash', 'dump', 'kachra', 'dustbin', 'litter', 'debris', 'sanitation', 'clean'],
  safety: ['crime', 'theft', 'danger', 'unsafe', 'police', 'security', 'fight', 'violence', 'threat', 'robbery'],
  health: ['hospital', 'health', 'disease', 'clinic', 'medicine', 'doctor', 'swasthya', 'illness', 'epidemic'],
  education: ['school', 'college', 'education', 'teacher', 'shiksha', 'vidyalaya', 'library'],
  other: [],
};

export function detectCategory(text: string): Department {
  const lower = text.toLowerCase();
  let bestMatch: Department = 'other';
  let maxScore = 0;
  for (const [dept, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > maxScore) { maxScore = score; bestMatch = dept as Department; }
  }
  return bestMatch;
}

export function getBNSSection(category: Department): BNSSection | null {
  const s = BNS_MAP[category];
  if (!s || !s.section) return null;
  return s;
}

export function detectPriority(text: string, votes: number): Priority {
  const urgent = ['urgent', 'emergency', 'danger', 'death', 'critical', 'severe', 'immediately', 'life-threatening'];
  const lower = text.toLowerCase();
  if (urgent.some(w => lower.includes(w)) || votes > 50) return 'critical';
  if (votes > 20) return 'high';
  if (votes > 5) return 'medium';
  return 'low';
}

// Real Supabase Hook
export function useComplaints() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: complaints = [], refetch: refresh, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          timeline_events (
            id,
            date,
            status,
            note
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Map database format to frontend format
      return data.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        description: c.description,
        category: c.category as Department,
        location: c.location,
        coordinates: { lat: c.lat, lng: c.lng },
        status: c.status as ComplaintStatus,
        priority: c.priority as Priority,
        department: c.department as Department,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        images: c.images || [],
        votes: c.votes || 0,
        votedBy: c.voted_by || [],
        bnsSection: c.bns_section ? {
          section: c.bns_section,
          title: c.bns_title,
          explanation: c.bns_explanation
        } : null,
        timeline: c.timeline_events || [],
        assignedTo: c.assigned_to,
        resolutionProof: c.resolution_proof
      })) as Complaint[];
    }
  });

  const addComplaintMutation = useMutation({
    mutationFn: async (newComplaint: any) => {
      if (!user) throw new Error("Must be logged in to create a complaint.");
      
      let finalCategory = newComplaint.category || 'other';
      let finalPriority = newComplaint.priority || 'low';
      let bnsInfo = newComplaint.bnsSection;

      try {
         // Ask Gemini directly via our secure Edge Function
         const { data, error } = await supabase.functions.invoke('analyze-grievance', {
           body: { text: newComplaint.title + " \n " + newComplaint.description }
         });
         
         if (!error && data) {
           finalCategory = data.category || finalCategory;
           finalPriority = data.priority || finalPriority;
           bnsInfo = data.bns || bnsInfo;
         }
      } catch (e) {
         console.warn("AI Analysis skipped or failed, falling back to manual detection", e);
         finalCategory = detectCategory(newComplaint.title + " " + newComplaint.description);
         finalPriority = detectPriority(newComplaint.description, 0);
      }

      const { error } = await supabase.from('complaints').insert([{
        user_id: user.id,
        title: newComplaint.title,
        description: newComplaint.description,
        category: finalCategory,
        location: newComplaint.location,
        lat: newComplaint.coordinates?.lat || 0,
        lng: newComplaint.coordinates?.lng || 0,
        priority: finalPriority,
        department: finalCategory, // Department mapped 1-1 to category
        images: newComplaint.images || [], // Added evidence photos mapping
        bns_section: bnsInfo?.section,
        bns_title: bnsInfo?.title,
        bns_explanation: bnsInfo?.explanation
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Complaint submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit complaint.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string, status: ComplaintStatus, note: string }) => {
      // 1. Update Complaint Status
      const { error: complaintError } = await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);
        
      if (complaintError) throw complaintError;
      
      // 2. Add to Timeline
      const { error: timelineError } = await supabase
        .from('timeline_events')
        .insert([{
           complaint_id: id,
           status: status,
           note: note
        }]);
        
      if (timelineError) throw timelineError;
    },
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status.");
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, userId }: { id: string, userId: string }) => {
      // Find the complaint
      const { data: complaint, error: fetchError } = await supabase
        .from('complaints')
        .select('votes, voted_by')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      if (complaint.voted_by && complaint.voted_by.includes(userId)) return; // Already voted

      const newVotes = (complaint.votes || 0) + 1;
      const newVotedBy = [...(complaint.voted_by || []), userId];
      
      const { error: updateError } = await supabase
        .from('complaints')
        .update({ votes: newVotes, voted_by: newVotedBy })
        .eq('id', id);
        
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Action failed.");
    }
  });

  return {
    complaints,
    isLoading,
    addComplaint: (c: any) => addComplaintMutation.mutate(c),
    updateStatus: (id: string, status: ComplaintStatus, note: string) => updateStatusMutation.mutate({ id, status, note }),
    voteComplaint: (id: string, userId: string) => voteMutation.mutate({ id, userId }),
    refresh
  };
}

export function useRewards() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const { data: redemptions = [], isLoading } = useQuery({
    queryKey: ['rewards_redemptions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards_redemptions')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    }
  });

  const redeemMutation = useMutation({
    mutationFn: async ({ title, cost }: { title: string, cost: number }) => {
      if (!user) throw new Error("Must be logged in to redeem");
      const { error } = await supabase
        .from('rewards_redemptions')
        .insert([{ user_id: user.id, reward_title: title, cost }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards_redemptions'] });
      toast.success("Reward redeemed successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to redeem reward.");
    }
  });

  return { redemptions, redeem: redeemMutation.mutate, isLoading };
}

export function useCivicPoints() {
  const { user } = useAuthStore();
  const { complaints } = useComplaints();
  const { redemptions } = useRewards();

  if (!user) return { currentPoints: 0, statusLevel: 'Citizen', progress: 0, nextTierPoints: 1000 };

  const myComplaints = complaints.filter(c => c.userId === user.id);
  const myAlerts = myComplaints.filter(c => c.priority === 'high' || c.priority === 'critical');

  const pointsFromReports = myComplaints.filter(c => c.status === 'resolved').length * 150 
                          + myComplaints.filter(c => c.status !== 'resolved').length * 50;
  const pointsFromEvidence = myComplaints.reduce((acc, c) => acc + (c.images?.length || 0) * 100, 0);
  const pointsFromAlerts = myAlerts.length * 50;
  const pointsFromVotes = myComplaints.reduce((acc, c) => acc + (c.votes || 0) * 10, 0);

  const totalEarnedPoints = pointsFromReports + pointsFromEvidence + pointsFromAlerts + pointsFromVotes;
  const spentPoints = redemptions.reduce((acc: number, r: any) => acc + (r.cost || 0), 0);
  const currentPoints = totalEarnedPoints - spentPoints + (user.civic_points || 0);

  let nextTierPoints = 2000;
  let statusLevel = "Silver Citizen";
  if (currentPoints < 1000) { nextTierPoints = 1000; statusLevel = "Bronze Citizen"; }
  else if (currentPoints >= 2000 && currentPoints < 5000) { nextTierPoints = 5000; statusLevel = "Gold Citizen"; }
  else if (currentPoints >= 5000) { nextTierPoints = 10000; statusLevel = "Platinum Citizen"; }

  const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);

  return { currentPoints, statusLevel, progress, nextTierPoints };
}

export function useRTIs() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: rtis = [], isLoading } = useQuery({
    queryKey: ['rtis', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rtis')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data;
    }
  });

  const fileRTIMutation = useMutation({
    mutationFn: async ({ complaintId, title, department, content }: { complaintId: string, title: string, department: string, content: string }) => {
      if (!user) throw new Error("Must be logged in to file RTI");
      const rti_number = `RTI-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const { error } = await supabase
        .from('rtis')
        .insert([{ user_id: user.id, complaint_id: complaintId, title, department, content, rti_number }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rtis'] });
      toast.success("RTI Filed successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to file RTI.");
    }
  });

  return { rtis, fileRTI: fileRTIMutation.mutate, isLoading };
}

export const DEPARTMENTS: { value: Department; label: string; icon: string }[] = [
  { value: 'water', label: 'Water Supply', icon: '💧' },
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'roads', label: 'Roads & Transport', icon: '🛣️' },
  { value: 'garbage', label: 'Sanitation', icon: '♻️' },
  { value: 'safety', label: 'Public Safety', icon: '🛡️' },
  { value: 'health', label: 'Health Services', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-warning text-warning-foreground' },
  assigned: { label: 'Assigned', color: 'bg-info text-info-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-primary text-primary-foreground' },
  resolved: { label: 'Resolved', color: 'bg-success text-success-foreground' },
};
