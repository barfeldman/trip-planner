const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Trips
  getTrips: () => request<any[]>('/trips'),
  getTrip: (id: string) => request<any>(`/trips/${id}`),
  createTrip: (data: any) => request<any>('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id: string, data: any) => request<any>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id: string) => request<void>(`/trips/${id}`, { method: 'DELETE' }),

  // Destinations
  getDestinations: (tripId: string) => request<any[]>(`/destinations/trip/${tripId}`),
  createDestination: (data: any) => request<any>('/destinations', { method: 'POST', body: JSON.stringify(data) }),
  updateDestination: (id: string, data: any) => request<any>(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDestination: (id: string) => request<void>(`/destinations/${id}`, { method: 'DELETE' }),

  // Days
  getDays: (tripId: string) => request<any[]>(`/days/trip/${tripId}`),
  createDay: (data: any) => request<any>('/days', { method: 'POST', body: JSON.stringify(data) }),
  updateDay: (id: string, data: any) => request<any>(`/days/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  reorderDays: (tripId: string, dayIds: string[]) => request<any>(`/days/reorder/${tripId}`, { method: 'PUT', body: JSON.stringify({ dayIds }) }),
  deleteDay: (id: string) => request<void>(`/days/${id}`, { method: 'DELETE' }),

  // Accommodations
  getAccommodations: (tripId: string) => request<any[]>(`/accommodations/trip/${tripId}`),
  createAccommodation: (data: any) => request<any>('/accommodations', { method: 'POST', body: JSON.stringify(data) }),
  updateAccommodation: (id: string, data: any) => request<any>(`/accommodations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccommodation: (id: string) => request<void>(`/accommodations/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: (tripId: string) => request<any[]>(`/activities/trip/${tripId}`),
  createActivity: (data: any) => request<any>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: any) => request<any>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  reorderActivities: (dayId: string, activityIds: string[]) => request<any>(`/activities/reorder/${dayId}`, { method: 'PUT', body: JSON.stringify({ activityIds }) }),
  deleteActivity: (id: string) => request<void>(`/activities/${id}`, { method: 'DELETE' }),

  // Budget
  getBudget: (tripId: string) => request<any[]>(`/budget/trip/${tripId}`),
  getBudgetSummary: (tripId: string) => request<any>(`/budget/summary/${tripId}`),
  createBudgetItem: (data: any) => request<any>('/budget', { method: 'POST', body: JSON.stringify(data) }),
  updateBudgetItem: (id: string, data: any) => request<any>(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBudgetItem: (id: string) => request<void>(`/budget/${id}`, { method: 'DELETE' }),

  // Transports
  getTransports: (tripId: string) => request<any[]>(`/transports/trip/${tripId}`),
  createTransport: (data: any) => request<any>('/transports', { method: 'POST', body: JSON.stringify(data) }),
  updateTransport: (id: string, data: any) => request<any>(`/transports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransport: (id: string) => request<void>(`/transports/${id}`, { method: 'DELETE' }),

  // Packing
  getPacking: (tripId: string) => request<any[]>(`/packing/trip/${tripId}`),
  createPackingItem: (data: any) => request<any>('/packing', { method: 'POST', body: JSON.stringify(data) }),
  createPackingBulk: (items: any[]) => request<any>('/packing/bulk', { method: 'POST', body: JSON.stringify({ items }) }),
  updatePackingItem: (id: string, data: any) => request<any>(`/packing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePackingItem: (id: string) => request<void>(`/packing/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (tripId: string) => request<any[]>(`/documents/trip/${tripId}`),
  uploadDocument: (formData: FormData) =>
    fetch(`${API_BASE}/documents`, { method: 'POST', body: formData }).then((r) => r.json()),
  updateDocument: (id: string, data: any) => request<any>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDocument: (id: string) => request<void>(`/documents/${id}`, { method: 'DELETE' }),

  // Notes
  getNotes: (tripId: string) => request<any[]>(`/notes/trip/${tripId}`),
  createNote: (data: any) => request<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) => request<any>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
};
