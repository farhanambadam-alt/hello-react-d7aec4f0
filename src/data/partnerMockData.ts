export type BarberState = 'FREE' | 'BUSY';

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  state: BarberState;
}

export interface PartnerBooking {
  id: string;
  customerName: string;
  time: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  service: string;
  barberId: string;
}

export interface PartnerService {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface PartnerStats {
  totalEarnings: number;
  monthEarnings: number;
  totalClients: number;
  servicesDone: number;
  nextPayoutDays: number;
}

export const barbers: Barber[] = [
  { id: 'b1', name: 'Vikram', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', specialty: 'Hair Stylist', state: 'FREE' },
  { id: 'b2', name: 'Rahul', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', specialty: 'Colorist', state: 'BUSY' },
  { id: 'b3', name: 'Karan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', specialty: 'Barber', state: 'FREE' },
  { id: 'b4', name: 'Arjun', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', specialty: 'Beard Specialist', state: 'FREE' },
];

export const partnerBookings: PartnerBooking[] = [
  { id: 'pb1', customerName: 'Amit Sharma', time: '10:30 AM', status: 'in-progress', service: 'Haircut & Styling', barberId: 'b2' },
  { id: 'pb2', customerName: 'Sneha Patel', time: '11:15 AM', status: 'upcoming', service: 'Hair Color', barberId: 'b1' },
  { id: 'pb3', customerName: 'Rohan Gupta', time: '12:00 PM', status: 'upcoming', service: 'Beard Trim', barberId: 'b3' },
  { id: 'pb4', customerName: 'Priya Nair', time: '1:30 PM', status: 'upcoming', service: 'Hair Spa', barberId: 'b1' },
  { id: 'pb5', customerName: 'Kavya Reddy', time: '9:00 AM', status: 'completed', service: 'Facial', barberId: 'b4' },
  { id: 'pb6', customerName: 'Meera Joshi', time: '9:45 AM', status: 'completed', service: 'Threading', barberId: 'b2' },
];

export const partnerServices: PartnerService[] = [
  { id: 'ps1', name: 'Haircut & Styling', price: 499, duration: '45 min', category: 'Hair' },
  { id: 'ps2', name: 'Beard Trim', price: 199, duration: '20 min', category: 'Hair' },
  { id: 'ps3', name: 'Hair Color', price: 1499, duration: '90 min', category: 'Hair' },
  { id: 'ps4', name: 'Hair Spa', price: 799, duration: '45 min', category: 'Hair' },
  { id: 'ps5', name: 'Facial', price: 899, duration: '60 min', category: 'Skin' },
  { id: 'ps6', name: 'Clean Shave', price: 149, duration: '15 min', category: 'Hair' },
  { id: 'ps7', name: 'Head Massage', price: 299, duration: '30 min', category: 'Wellness' },
  { id: 'ps8', name: 'Groom Package', price: 2999, duration: '180 min', category: 'Packages' },
];

export const partnerStats: PartnerStats = {
  totalEarnings: 287500,
  monthEarnings: 48200,
  totalClients: 1243,
  servicesDone: 3891,
  nextPayoutDays: 3,
};
