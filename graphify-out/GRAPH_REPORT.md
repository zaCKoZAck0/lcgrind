# Graph Report - .  (2026-05-16)

## Corpus Check
- Corpus is ~49,072 words - fits in a single context window. You may not need a graph.

## Summary
- 780 nodes · 1575 edges · 50 communities (37 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Problem Display & Data|Problem Display & Data]]
- [[_COMMUNITY_UI Navigation & Layout|UI Navigation & Layout]]
- [[_COMMUNITY_Problems Page Features|Problems Page Features]]
- [[_COMMUNITY_Page Loading States|Page Loading States]]
- [[_COMMUNITY_Company Search & Display|Company Search & Display]]
- [[_COMMUNITY_Home Page & Data Fetching|Home Page & Data Fetching]]
- [[_COMMUNITY_Sheet Filtering & Settings|Sheet Filtering & Settings]]
- [[_COMMUNITY_Root Layout & Metadata|Root Layout & Metadata]]
- [[_COMMUNITY_UI Dependencies|UI Dependencies]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Component Aliases|Component Aliases]]
- [[_COMMUNITY_App Providers|App Providers]]
- [[_COMMUNITY_External Tools|External Tools]]
- [[_COMMUNITY_Company Listing UI|Company Listing UI]]
- [[_COMMUNITY_Feature Concepts|Feature Concepts]]
- [[_COMMUNITY_CSV Data Seeding|CSV Data Seeding]]
- [[_COMMUNITY_Module 17|Module 17]]
- [[_COMMUNITY_Module 18|Module 18]]
- [[_COMMUNITY_Module 19|Module 19]]
- [[_COMMUNITY_Module 20|Module 20]]
- [[_COMMUNITY_Module 21|Module 21]]
- [[_COMMUNITY_Module 22|Module 22]]
- [[_COMMUNITY_Module 23|Module 23]]
- [[_COMMUNITY_Module 24|Module 24]]
- [[_COMMUNITY_Module 25|Module 25]]
- [[_COMMUNITY_Module 26|Module 26]]
- [[_COMMUNITY_Module 27|Module 27]]
- [[_COMMUNITY_Module 28|Module 28]]
- [[_COMMUNITY_Module 29|Module 29]]
- [[_COMMUNITY_Module 30|Module 30]]
- [[_COMMUNITY_Module 31|Module 31]]
- [[_COMMUNITY_Module 32|Module 32]]
- [[_COMMUNITY_Module 33|Module 33]]
- [[_COMMUNITY_Module 34|Module 34]]
- [[_COMMUNITY_Module 35|Module 35]]
- [[_COMMUNITY_Module 36|Module 36]]
- [[_COMMUNITY_Module 37|Module 37]]
- [[_COMMUNITY_Module 38|Module 38]]
- [[_COMMUNITY_Module 39|Module 39]]
- [[_COMMUNITY_Module 42|Module 42]]
- [[_COMMUNITY_Module 49|Module 49]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 148 edges
2. `dependencies` - 44 edges
3. `Button()` - 17 edges
4. `useAppDispatch()` - 17 edges
5. `compilerOptions` - 16 edges
6. `useTheme()` - 16 edges
7. `buttonVariants` - 14 edges
8. `devDependencies` - 13 edges
9. `Skeleton()` - 13 edges
10. `getDbWhereClause()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Progress Tracking` --semantically_similar_to--> `React Redux with Redux Toolkit`  [INFERRED] [semantically similar]
  README.md → package.json
- `Company-wise LeetCode Problems` --semantically_similar_to--> `TanStack Table 8.21.2`  [INFERRED] [semantically similar]
  README.md → package.json
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `Platform UI Screenshot` --cites--> `Company-wise LeetCode Problems`  [INFERRED]
  public/images/platform-screenshot.png → README.md
- `Platform UI Screenshot` --cites--> `Progress Tracking`  [INFERRED]
  public/images/platform-screenshot.png → README.md

## Hyperedges (group relationships)
- **Frontend UI Component Stack** — shadcn_ui, radix_ui, tailwindcss_4, lucide_icons [EXTRACTED 1.00]
- **State Management and Data Fetching** — react_redux, tanstack_query, redux_persist [INFERRED 0.85]
- **Data Model and ORM** — prisma_orm, postgres_db, problem_table, sheet_table, sheet_problem_table [EXTRACTED 1.00]

## Communities (50 total, 13 thin omitted)

### Community 0 - "Problem Display & Data"
Cohesion: 0.06
Nodes (56): ProblemRow(), getRepoData(), Header(), RepoData, RandomProblemPicker(), RandomProblemPickerProps, TOP_COMPANIES, ExportedData (+48 more)

### Community 1 - "UI Navigation & Layout"
Cohesion: 0.06
Nodes (54): NavLinks(), cn(), TagCount, TagsPieChartProps, Card(), CardAction(), CardContent(), CardDescription() (+46 more)

### Community 2 - "Problems Page Features"
Cohesion: 0.06
Nodes (37): AllProblemsPage(), metadata, ProblemsPage(), ProblemsPageProps, metadata, NotFound(), getCompanyWiseProblemIds(), getCompanyWiseProblems() (+29 more)

### Community 3 - "Page Loading States"
Cohesion: 0.06
Nodes (28): AdBanner(), ProblemRowSkeleton(), CompanyPageProps, Filters(), ProgressTracker(), GlobalPagination(), GlobalPaginationProps, SHEET_OWNER_LOGO_SRC (+20 more)

### Community 4 - "Company Search & Display"
Cohesion: 0.06
Nodes (35): CompanyPage(), ProblemRowProps, CompanyAvatarGroup(), CompanyAvatarGroupProps, OverflowIndicator(), PREFERRED_COMPANIES, sortCompanies(), CompanyLogo() (+27 more)

### Community 5 - "Home Page & Data Fetching"
Cohesion: 0.05
Nodes (38): faqItems, Data, getGithubSponsors(), GraphQLResponse, Sponsor, Sponsors, User, companies (+30 more)

### Community 6 - "Sheet Filtering & Settings"
Cohesion: 0.07
Nodes (43): DIFFICULTIES, SheetFiltersProps, SheetSettingsPanelProps, defaultSettings, GroupingType, initialState, SheetSettings, sheetSettingsSlice (+35 more)

### Community 7 - "Root Layout & Metadata"
Cohesion: 0.06
Nodes (35): dmSans, metadata, viewport, HIGH_PRIORITY_COMPANIES, Image(), size, Image(), size (+27 more)

### Community 8 - "UI Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, class-variance-authority, clsx, cmdk, csv-parse, embla-carousel-autoplay, embla-carousel-react, lucide-react (+33 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.07
Nodes (27): devDependencies, concurrently, dotenv, eslint, eslint-config-next, @eslint/eslintrc, prisma, tailwindcss (+19 more)

### Community 10 - "TypeScript Configuration"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "Component Aliases"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "App Providers"
Cohesion: 0.13
Nodes (14): Providers(), CompletedProblem, completedProblemsSlice, CompletedProblemsState, initialState, AppDispatch, persistConfig, persistedReducer (+6 more)

### Community 13 - "External Tools"
Cohesion: 0.22
Nodes (3): Error(), Main, Scraper

### Community 14 - "Company Listing UI"
Cohesion: 0.23
Nodes (8): AllCompanies(), AllCompaniesProps, AllCompaniesSkeleton(), getCompanies(), CompaniesPage(), metadata, CompanySearch(), Star9()

### Community 15 - "Feature Concepts"
Cohesion: 0.24
Nodes (10): Company-wise LeetCode Problems, DSA Sheets (Grind 75, Neetcode 150, Striver SDE), Free Forever Platform, Interview Preparation, LC Grind, Leetcode Companywise Interview Questions, Local Storage Based Progress Tracking, Platform UI Screenshot (+2 more)

### Community 16 - "CSV Data Seeding"
Cohesion: 0.22
Nodes (9): csvHeaders, csvNames, csvNameToOrderFieldMap, CSVProblem, __dirname, __filename, init(), parseCsv() (+1 more)

### Community 17 - "Module 17"
Cohesion: 0.36
Nodes (5): getAllSheets(), metadata, SheetsPage(), SheetsList(), Star13()

### Community 18 - "Module 18"
Cohesion: 0.29
Nodes (7): dnd-kit Drag and Drop, react-redux, recharts, React 19.0.0, React Redux with Redux Toolkit, Recharts 2.15.2, TanStack Query 5.74.4

### Community 19 - "Module 19"
Cohesion: 0.38
Nodes (6): fetchAndStoreQuestions(), fetchBatch(), processQuestion(), QuestionFromResponse, QuestionListResponse, TopicTagFromResponse

### Community 20 - "Module 20"
Cohesion: 0.33
Nodes (6): radix-ui, Lucide Icons, Radix UI, shadcn/ui Configuration, shadcn/ui Components, Tailwind CSS 4

### Community 21 - "Module 21"
Cohesion: 0.4
Nodes (6): ESLint Configuration, Next.js with Turbopack, Next.js 15.5.9, Security Headers, TypeScript Path Alias, TypeScript 5

### Community 22 - "Module 22"
Cohesion: 0.47
Nodes (6): Contributing Guidelines, CSV Data Import, Database Seeding Scripts, PostgreSQL 16, Prisma ORM 6.5.0, Project Setup Guide

### Community 23 - "Module 23"
Cohesion: 0.33
Nodes (5): CompanyDetails, CompanyParams, SearchParams, TotalCountResult, TSheetProblem

### Community 24 - "Module 24"
Cohesion: 0.4
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 25 - "Module 25"
Cohesion: 0.4
Nodes (5): Problem Entity, SheetProblem Join Entity, Sheet Slug URL Identifier, Sheet Entity, Solution Links Feature

### Community 26 - "Module 26"
Cohesion: 0.5
Nodes (4): getRandomSheetProblem(), RSheetProblem, SanitizedSheetProblem, sanitizeSheetProblem()

### Community 27 - "Module 27"
Cohesion: 0.67
Nodes (3): formatSlugToName(), Image(), size

### Community 28 - "Module 28"
Cohesion: 0.67
Nodes (3): formatSlugToName(), Image(), size

## Knowledge Gaps
- **263 isolated node(s):** `config`, `name`, `version`, `private`, `dev` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Navigation & Layout` to `Problem Display & Data`, `Page Loading States`, `Company Search & Display`, `Home Page & Data Fetching`, `Sheet Filtering & Settings`, `UI Dependencies`, `Company Listing UI`?**
  _High betweenness centrality (0.305) - this node is a cross-community bridge._
- **Why does `dependencies` connect `UI Dependencies` to `Dev Dependencies`, `Module 18`, `Module 20`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `clsx` connect `UI Dependencies` to `UI Navigation & Layout`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `config`, `name`, `version` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Problem Display & Data` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `UI Navigation & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Problems Page Features` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._