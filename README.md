# Typing Speed Test

A modern, feature-rich typing speed test with global leaderboards, user profiles, and composite scoring system.

## Features

- **Real-time Typing Test**: Test your typing speed with live WPM, CPM, accuracy, and mistake tracking
- **Composite Scoring**: Industry-standard scoring system (0-10) based on speed (50%), accuracy (40%), and consistency (10%)
- **Global Leaderboard**: Compete with users worldwide - only your best score is shown
- **Personal History**: Track all your attempts and see your progress over time
- **User Profiles**: Unique color-coded avatars for each user
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Score Transparency**: Interactive modal explaining how scores are calculated

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Version Control**: Git

## Getting Started

### Prerequisites

- A modern web browser
- Supabase account (free tier)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Omkar-Nene/typing-speed-analyzer.git
cd typing-speed-analyzer
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Open `src/index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve src
```

5. Visit `http://localhost:8000`

## Deployment to Vercel

### Option 1: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: `./`
   - **Output Directory**: `src`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Database Schema

### Scores Table

```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  cpm INTEGER NOT NULL,
  mistakes INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scores_name ON scores(name);
CREATE INDEX idx_scores_created_at ON scores(created_at DESC);
```

## Project Structure

```
typing-speed-analyzer/
├── src/
│   ├── css/
│   │   └── style.css          # Custom styles for typing indicators
│   ├── js/
│   │   ├── config.js          # Configuration loader
│   │   ├── supabase-config.js # Supabase setup and managers
│   │   └── script.js          # Main application logic
│   └── index.html             # Main HTML file
├── .env                       # Environment variables (not in git)
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore rules
├── vercel.json               # Vercel configuration
└── README.md                 # This file
```

## Key Features Explained

### Composite Scoring System

The scoring algorithm uses industry-standard weights:
- **Speed (50%)**: `(WPM / 100) × 5` - Max 5 points
- **Accuracy (40%)**: `(Accuracy / 100) × 4` - Max 4 points
- **Consistency (10%)**: `max(1 - (Mistakes / 20), 0)` - Max 1 point

### Leaderboard Logic

- **Global Leaderboard**: Shows only the best attempt per user
- **Personal History**: Shows all attempts for the logged-in user
- **Rankings**: Based on composite score, consistent across the app

### Security Best Practices

- Environment variables for API credentials
- `.gitignore` prevents committing sensitive data
- Supabase Row Level Security (RLS) for data protection

## Future Enhancements

- [ ] Monthly/weekly leaderboard seasons
- [ ] Data archival for older scores
- [ ] Progress tracking and analytics
- [ ] Database indexes and materialized views
- [ ] Rate limiting for API calls
- [ ] Client-side caching for better performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**Omkar Nene**
- GitHub: [@Omkar-Nene](https://github.com/Omkar-Nene)

---

Built with ❤️ using vanilla JavaScript and modern web technologies
