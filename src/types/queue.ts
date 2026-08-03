export type TicketStatus = 'WAITING' | 'CALLED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';

export interface ServiceCategory {
  code: string;
  name: string;
  description: string;
  color: string;
  avgTimeMin: number;
  icon: string;
  badge?: string;
  isPriority?: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  serviceCode: string;
  serviceName: string;
  priority: boolean;
  customerPhone?: string | null;
  customerEmail?: string | null;
  status: TicketStatus;
  counterNumber?: number | null;
  agentId?: string | null;
  agentName?: string | null;
  createdAt: string;
  calledAt?: string | null;
  completedAt?: string | null;
  satisfactionScore?: number;
}

export interface Agent {
  id: string;
  name: string;
  defaultCounter: number;
  avatar: string;
  title: string;
}

export interface Agency {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface QueueState {
  currentAgencyId: string;
  agencyName: string;
  dailyCounter: Record<string, number>;
  lastCalledTicket: Ticket | null;
  tickets: Ticket[];
  lastDate?: string;
}
