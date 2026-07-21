export type UserRole = "ADMIN" | "CONSUMER" | "ORGANIZATOR" | "OFFERER";

export interface ApiUser {
  id?: number;
  role: UserRole;
  user: string;
  name: string;
  email?: string;
  verified: boolean;
  image: string | null;
  dni?: string | null;
  address?: string | null;
  cuit?: string | null;
}

export interface EventCategory {
  id: number;
  name: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface ApiEvent {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  initDate: string;
  endingDate: string | null;
  location: string;
  open: boolean;
  ticketPrice: number;
  userFK: number;
  categoryFK: number;
  category: EventCategory;
  owner: ApiUser;
  _count: {
    guestsRel: number;
  };
  guestsRel?: { userFK: number }[];
  rate: number;
}

export interface EventsPagination {
  limit: number;
  hasMore: boolean;
  nextCursor: number | null;
}

export interface EventsResponse {
  data: ApiEvent[];
  pagination: EventsPagination;
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  initDate: string;
  endingDate?: string;
  location: string;
  categoryFK: number;
  ticketPrice: number;
  open?: boolean;
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  initDate?: string;
  endingDate?: string;
  location?: string;
  open?: boolean;
  categoryFK?: number;
  ticketPrice?: number;
}

export interface EventsQueryParams {
  search?: string;
  open?: boolean;
  categoryFK?: number;
  location?: string;
  from?: string;
  to?: string;
  orderBy?: string;
  order?: string;
  cursor?: number;
  limit?: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
