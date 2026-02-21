export const authService = {
    async login(username: string, password: string): Promise<boolean> {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('nexus_token', data.token);
            localStorage.setItem('nexus_user', JSON.stringify(data.user));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
    },

    getToken(): string | null {
        return localStorage.getItem('nexus_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    getCurrentUser(): any {
        const user = localStorage.getItem('nexus_user');
        return user ? JSON.parse(user) : null;
    }
};
