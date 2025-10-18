// Optional: Add this to your React app ONLY if you want to use Spring Boot features
// Your existing website works 100% without this file

// src/services/backendApi.ts (NEW FILE - OPTIONAL)
const BACKEND_API_URL = 'http://localhost:8081/api';

export const backendApi = {
    // Optional advanced analytics (in addition to existing Supabase data)
    getAdvancedAnalytics: async (userId: string) => {
        try {
            const response = await fetch(`${BACKEND_API_URL}/analytics/portfolio/${userId}`);
            if (response.ok) {
                return await response.json();
            }
            return null; // Fail gracefully - existing site still works
        } catch (error) {
            console.log('Backend API not available - using existing features only');
            return null;
        }
    },

    // Check if backend is running
    checkHealth: async () => {
        try {
            const response = await fetch(`${BACKEND_API_URL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

// Usage in your components (OPTIONAL):
// const advancedData = await backendApi.getAdvancedAnalytics(userId);
// if (advancedData) {
//   // Show additional insights
// }
// Your existing functionality continues to work regardless
