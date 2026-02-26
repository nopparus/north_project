
export interface App1Configs {
    rd03_rules_v2?: any[];
    rd05_rules_v2?: any[];
    rd_profiles?: any[];
    [key: string]: any;
}

const API_BASE = '/api/app1';

export const configService = {
    async getConfigs(): Promise<App1Configs> {
        try {
            const response = await fetch(`${API_BASE}/configs`);
            if (!response.ok) throw new Error('Failed to fetch configs');
            return await response.ok ? response.json() : {};
        } catch (error) {
            console.error('Error fetching configs:', error);
            return {};
        }
    },

    async saveConfig(key: string, value: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE}/configs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value }),
            });
            return response.ok;
        } catch (error) {
            console.error(`Error saving config ${key}:`, error);
            return false;
        }
    }
};
