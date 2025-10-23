// Supabase Configuration
const SUPABASE_URL = 'https://meqisqhoguyzvezqdmbx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcWlzcWhvZ3V5enZlenFkbWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjIwOTksImV4cCI6MjA3Njc5ODA5OX0.c-5dHxOeWDippUYlAvGpU0gLfBQab-Bt1kOACqD9n50';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User Management
class UserManager {
    constructor() {
        this.currentUser = this.loadUser();
    }

    loadUser() {
        return localStorage.getItem('typingGameUsername');
    }

    saveUser(username) {
        localStorage.setItem('typingGameUsername', username);
        this.currentUser = username;
    }

    getUser() {
        return this.currentUser;
    }

    hasUser() {
        return !!this.currentUser;
    }

    clearUser() {
        localStorage.removeItem('typingGameUsername');
        this.currentUser = null;
    }
}

// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.currentSort = 'score';
        this.currentView = 'global'; // 'global' or 'personal'
    }

    // Calculate composite score out of 10
    // Formula: WPM (50%) + Accuracy (40%) + Consistency/Low Mistakes (10%)
    calculateScore(wpm, accuracy, mistakes) {
        // WPM component: 0-5 points (50% weight)
        // 100 WPM = 5 points, scales linearly
        const wpmScore = Math.min((wpm / 100) * 5, 5);

        // Accuracy component: 0-4 points (40% weight)
        // 100% accuracy = 4 points
        const accuracyScore = (accuracy / 100) * 4;

        // Consistency component: 0-1 points (10% weight)
        // 0 mistakes = 1 point, 20+ mistakes = 0 points
        const consistencyScore = Math.max(1 - (mistakes / 20), 0);

        // Total score out of 10
        const totalScore = wpmScore + accuracyScore + consistencyScore;

        // Round to 2 decimal places
        return Math.round(totalScore * 100) / 100;
    }

    // Get score explanation for tooltips
    getScoreBreakdown(wpm, accuracy, mistakes) {
        const wpmScore = Math.min((wpm / 100) * 5, 5);
        const accuracyScore = (accuracy / 100) * 4;
        const consistencyScore = Math.max(1 - (mistakes / 20), 0);
        const totalScore = this.calculateScore(wpm, accuracy, mistakes);

        return {
            total: totalScore,
            wpm: Math.round(wpmScore * 100) / 100,
            accuracy: Math.round(accuracyScore * 100) / 100,
            consistency: Math.round(consistencyScore * 100) / 100
        };
    }

    async saveScore(scoreData) {
        try {
            const { data, error } = await supabase
                .from('scores')
                .insert([scoreData])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving score:', error);
            return { success: false, error };
        }
    }

    async getGlobalLeaderboard(sortBy = 'score', limit = 100) {
        try {
            // Fetch all scores and process client-side to get best attempt per user
            const { data: allScores, error } = await supabase
                .from('scores')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate composite score for each entry
            allScores.forEach(score => {
                score.score = this.calculateScore(score.wpm, score.accuracy, score.mistakes);
            });

            // Group by user and keep only the best score for each user
            const bestScores = {};
            allScores.forEach(score => {
                const existing = bestScores[score.name];
                if (!existing || score.score > existing.score) {
                    bestScores[score.name] = score;
                }
            });

            // Convert to array and sort by composite score
            let data = Object.values(bestScores);
            data.sort((a, b) => b.score - a.score);

            // Limit results
            data = data.slice(0, limit);

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return { success: false, error };
        }
    }

    async getPersonalHistory(username, sortBy = 'created_at', limit = 50) {
        try {
            const { data, error } = await supabase
                .from('scores')
                .select('*')
                .eq('name', username)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Calculate composite score for each entry
            data.forEach(score => {
                score.score = this.calculateScore(score.wpm, score.accuracy, score.mistakes);
            });

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching personal history:', error);
            return { success: false, error };
        }
    }

    async getPersonalStats(username) {
        try {
            const { data, error } = await supabase
                .from('scores')
                .select('wpm')
                .eq('name', username);

            if (error) throw error;

            if (data.length === 0) {
                return {
                    bestWpm: 0,
                    avgWpm: 0,
                    totalTests: 0
                };
            }

            const wpms = data.map(score => score.wpm);
            const bestWpm = Math.max(...wpms);
            const avgWpm = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);
            const totalTests = data.length;

            return { bestWpm, avgWpm, totalTests };
        } catch (error) {
            console.error('Error fetching personal stats:', error);
            return { bestWpm: 0, avgWpm: 0, totalTests: 0 };
        }
    }

    async getUserRank(username, currentScore) {
        try {
            // Fetch all scores to calculate rank based on best composite score per user
            const { data: allScores, error } = await supabase
                .from('scores')
                .select('*');

            if (error) throw error;

            // Calculate composite score for each entry
            allScores.forEach(score => {
                score.score = this.calculateScore(score.wpm, score.accuracy, score.mistakes);
            });

            // Get best composite score for each user
            const bestScores = {};
            allScores.forEach(score => {
                if (!bestScores[score.name] || score.score > bestScores[score.name]) {
                    bestScores[score.name] = score.score;
                }
            });

            // Count how many users have a better composite score
            let betterCount = 0;
            for (const [user, bestScore] of Object.entries(bestScores)) {
                if (bestScore > currentScore) {
                    betterCount++;
                }
            }

            return betterCount + 1; // Rank is count of better users + 1
        } catch (error) {
            console.error('Error getting user rank:', error);
            return null;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    getRankEmoji(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    }
}

// Export for use in script.js
window.UserManager = UserManager;
window.LeaderboardManager = LeaderboardManager;
