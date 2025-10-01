Contributing to Moments

First off, thanks for your interest in contributing to Moments! 🎉
We love contributions — whether it’s fixing bugs, adding features, improving documentation, or suggesting ideas. This guide will help you get started and ensure consistency across contributions.

Table of Contents

How to Contribute

Project Setup

Branch Naming Conventions

Commit Guidelines

Pull Requests

Reporting Issues

Code Style & Testing

Communication

How to Contribute

Fork the repository
Click the “Fork” button at the top of the repository page.

Clone your fork locally

git clone https://github.com/YOUR_USERNAME/moments.git
cd moments


Create a new branch
Follow our branch naming conventions (see below).

Make your changes
Follow the code style and testing guidelines.

Commit your changes
Use our commit message format (see below).

Push your branch

git push origin your-branch-name


Open a Pull Request
Include a short description of your changes and attach a working video showing your feature/bug fix in action.

Project Setup
Prerequisites

Node.js (v18 or later)

npm or yarn

PostgreSQL

Backend Setup
cd server
npm install
# Set environment variables in .env
npx prisma migrate dev
npx prisma db seed # optional
npm run start


Backend runs at: http://localhost:8080

Frontend Setup
cd moments
npm install --force
# Set environment variables in .env.local
npm run dev


Frontend runs at: http://localhost:3000

Branch Naming Conventions

Use descriptive branch names for clarity:

feature/<feature-name> – for new features

fix/<bug-name> – for bug fixes

docs/<documentation-update> – for documentation updates

test/<test-description> – for adding or updating tests

Commit Guidelines

Use imperative tense in your commit messages:

Add image upload progress bar
Fix dashboard layout bug
Update README with setup instructions


Optional: Include a short issue reference:

Fix user login bug #42

Pull Requests

Ensure your branch is up-to-date with main before raising a PR.

Add a working video showing your feature or bug fix. This helps maintainers quickly verify your changes.

Use a descriptive PR title and include context in the description.

Label your PR appropriately (feature, bug, docs, etc.).

Reporting Issues

Check the issues
 to avoid duplicates.

Provide a clear description of the problem.

Include screenshots, logs, or steps to reproduce the issue.

Code Style & Testing
Frontend

Use TypeScript with Next.js

Styling with Tailwind CSS

Components follow shadcn/ui conventions

State management: Zustand

Backend

Node.js + Express

Prisma ORM for PostgreSQL

General Guidelines

Keep functions and components small and focused

Write descriptive comments for complex logic

Include tests for new features or bug fixes

Run linter before committing (if available)

Communication

Ask questions or discuss changes via GitHub issues first.

Be respectful and patient — contributors may have different experience levels.

For urgent support during development, use Tawk.to chat if applicable.

Thank You! 🎉

Your contributions make Moments better for everyone.
Whether it’s fixing bugs, improving documentation, or adding exciting new features, we appreciate your help!