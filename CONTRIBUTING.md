# Contributing to LC Grind

Thank you for your interest in contributing to **LC Grind**!  
We welcome contributions from everyone. Please take a moment to review this guide to make the process smooth for everyone.

## How to Contribute

1. **Fork** the repository.
2. **Clone** your fork (`git clone https://github.com/your-username/lcgrind.git`).
3. **Project Setup** using [Project Setup](#project-setup) 
4. **Create a branch** for your feature or bugfix (`git checkout -b feature/your-feature`).
5. **Make your changes**.
6. **Test** your changes.
7. **Commit** and **push** to your fork.
8. **Open a Pull Request**.

---

## Project Setup

1. **Clone the Repository**  
   Clone the following repository into your project root:
   ```
   https://github.com/liquidslr/leetcode-company-wise-problems
   ```

2. **Rename the Data Folder**  
   Rename the `leetcode-company-wise-problems` folder to `.data`:
   ```bash
   mv leetcode-company-wise-problems .data
   ```

3. **Start the Database**  
   Launch your local Postgres database using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. **Create the Environment File**  
   Copy `.env.example` to `.env` to set up your environment variables:
   ```bash
   cp .env.example .env
   ```

5. **Install Dependencies**  
   Install project dependencies (preferably with `pnpm`):
   ```bash
   pnpm install
   ```
   > Or use `npm install` or `yarn install` if you prefer.

6. **Apply Database Migrations**  
   Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

7. **Seed the Database**  
   Import CSV data into the database:
   ```bash
   pnpm run seed:all
   ```

8. **Start the Development Server**  
   Launch the development server:
   ```bash
   pnpm run dev
   ```

---

## Reporting Issues

- Search [existing issues](https://github.com/zaCKoZAck0/lcgrind/issues) before opening a new one.
- Include as much detail as possible: steps to reproduce, expected behavior, screenshots, etc.
- Use clear and descriptive titles.

---

## Submitting Changes

- Follow the [Coding Guidelines](#coding-guidelines).
- Write clear, concise commit messages.
- Reference related issues in your PR (e.g., `Fixes #123`).

---

## Coding Guidelines

- Follow the style used in the project.
- Document your code and public APIs.
- Use [Prettier](https://prettier.io/) or [ESLint](https://eslint.org/) if applicable.

---

## Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Submit your pull request.
3. Fill out the PR template.
4. Wait for review and respond to feedback.
5. Once approved, your PR will be merged.

---


> *Thank you for helping make LC Grind better! ❤️*
