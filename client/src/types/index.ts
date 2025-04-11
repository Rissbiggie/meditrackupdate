export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  userType: 'user' | 'admin' | 'response_team';
  profilePhoto?: string;
}

export interface EmergencyRequest {
  id: number;
  userId: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled' | 'critical';
  latitude: string;
  longitude: string;
  description?: string;
  responseTeamId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseTeam {
  id: number;
  name: string;
  status: 'available' | 'busy' | 'offline';
  latitude?: string;
  longitude?: string;
  createdAt: Date;
}

export interface MedicalService {
  id: number;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  rating?: string;
  reviewCount?: number;
  phone?: string;
  openingHours?: string;
  distance?: string;
  createdAt: Date;
}

export interface SystemStatus {
  id: number;
  name: string;
  status: 'operational' | 'partial' | 'offline';
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  iconBg?: string;
  timestamp: Date;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface UserSettings {
  id: number;
  userId: number;
  emergencyAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  locationSharing: boolean;
  anonymousDataCollection: boolean;
  updatedAt: Date;
}

export interface Stats {
  id: number;
  responseTeams: number;
  resolvedCases: number;
  pendingCases: number;
  criticalCases: number;
  updatedAt: Date;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface EmergencyButtonProps {
  onRequest: (coordinates: LocationCoordinates, description?: string) => void;
  isLoading?: boolean;
}

export interface StatusCardItem {
  name: string;
  status: 'operational' | 'partial' | 'offline';
  icon: string;
}

export interface DashboardStatItem {
  title: string;
  value: number;
  icon: string;
  iconBgColor: string;
}

export interface ServiceCardProps {
  service: MedicalService;
  onClick?: (service: MedicalService) => void;
}
