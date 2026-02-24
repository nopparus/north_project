const API_BASE = '/api/app6/wages';

export const wageService = {
    async getAll(): Promise<Record<string, number>> {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to fetch wages');
        return res.json();
    },

    async save(province: string, wage: number): Promise<void> {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ province, wage })
        });
        if (!res.ok) throw new Error('Failed to save wage');
    },

    async sync(wages: Record<string, number>): Promise<void> {
        const res = await fetch(`${API_BASE}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wages)
        });
        if (!res.ok) throw new Error('Failed to sync wages');
    }
};
