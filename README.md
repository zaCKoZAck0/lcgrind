# LCGrind - LeetCode Interview Preparation Tracker


LCGrind is a comprehensive interview preparation platform that helps you track and optimize your LeetCode practice with company-specific problem sets, analytics, and personalized preparation guides.

## Features

- 🏢 **Company-specific problem sets** - Practice problems frequently asked at top tech companies
- 📊 **Progress tracking** - Track your solved problems and completion rates
- 📈 **Analytics dashboard** - Visualize your progress with interactive charts
- 🗂️ **Topic-based categorization** - Filter problems by data structures and algorithms
- 🔍 **Advanced search** - Find problems by difficulty, company, or topic
- 🌙 **Dark/Light mode** - Choose your preferred theme

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with Redux Persist
- **Charts**: [Recharts](https://recharts.org/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL database
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lcgrind.git
   cd lcgrind
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your database connection details:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/lcgrind"
   DIRECT_URL="postgresql://username:password@localhost:5432/lcgrind"
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Seed the database:
   ```bash
   pnpm seed:all
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lcgrind/
├── prisma/               # Database schema and seed scripts
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── config/           # Configuration files
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and libraries
│   ├── store/            # Redux store configuration
│   └── types/            # TypeScript type definitions
├── .env                  # Environment variables (git-ignored)
├── next.config.ts        # Next.js configuration
└── package.json          # Project dependencies
```

## Database Schema

```mermaid
erDiagram
    Problem {
        string id PK
        string title
        string url
        string difficulty
        int likes
        int dislikes
    }
    Sheet {
        string id PK
        string name
        string slug
    }
    SheetProblem {
        string id PK
        string sheetId FK
        string problemId FK
        int frequency
    }
    TopicTag {
        string id PK
        string name
        string slug
    }
    ProblemTopicTag {
        string id PK
        string problemId FK
        string topicTagId FK
    }
    
    Problem ||--o{ SheetProblem : "appears in"
    Sheet ||--o{ SheetProblem : "contains"
    Problem ||--o{ ProblemTopicTag : "has"
    TopicTag ||--o{ ProblemTopicTag : "categorizes"
```

## Development Workflow

1. **Feature branches**: Create a new branch for each feature or bugfix
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Commit changes**: Make small, focused commits
   ```bash
   git add .
   git commit -m "Add new feature: description"
   ```

3. **Push changes**: Push your branch to GitHub
   ```bash
   git push origin feature/new-feature
   ```

4. **Create a pull request**: Open a PR on GitHub for review

## Deployment

The application is automatically deployed to Vercel when changes are pushed to the main branch.

For manual deployment:

```bash
pnpm build
vercel deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [LeetCode](https://leetcode.com/) for providing the problem data
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- All contributors who have helped improve this project
