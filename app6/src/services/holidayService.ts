export interface ThaiHolidayApi {
    date: string;
    name: string;
}

const API_BASE = '/api/app6/holidays';

export const holidayService = {
    async getAll(): Promise<ThaiHolidayApi[]> {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Failed to fetch holidays');
        return res.json();
    },

    async save(date: string, name: string): Promise<void> {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, name }),
        });
        if (!res.ok) throw new Error('Failed to save holiday');
    },

    async delete(date: string): Promise<void> {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(date)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete holiday');
    },

    async sync(holidays: ThaiHolidayApi[]): Promise<void> {
        const res = await fetch(`${API_BASE}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(holidays),
        });
        if (!res.ok) throw new Error('Failed to sync holidays');
    },
};
