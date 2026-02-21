import { ShiftProfile } from '../constants';

const API_BASE = '/api/app6/profiles';

export const profileService = {
    async getAll(): Promise<ShiftProfile[]> {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to fetch profiles');
        return res.json();
    },

    async save(profile: ShiftProfile): Promise<void> {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        if (!res.ok) throw new Error('Failed to save profile');
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete profile');
    },

    async sync(profiles: ShiftProfile[]): Promise<void> {
        const res = await fetch(`${API_BASE}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profiles)
        });
        if (!res.ok) throw new Error('Failed to sync profiles');
    }
};
