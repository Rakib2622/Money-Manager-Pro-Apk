
export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await fetch('/api/profile');
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (profile: UserProfile): Promise<{ success: boolean }> => {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  getSummaryReport: async (): Promise<MonthlySummary[]> => {
    const response = await fetch('/api/report/summary');
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  }
};
