# Moments - A Collaborative Photo Book Creator

Moments is a web application that allows users to create beautiful, collaborative photo books for special occasions. Invite friends and family to contribute their photos and messages to create a unique and personalized gift.

## ✨ Features

- **User Authentication**: Secure sign-up and login functionality using Clerk.
- **Project Creation**: Easily start a new photo book project for any occasion.
- **Collaborative Contributions**: Invite others to add their personal touch with photos and messages.
- **Image Uploads**: A simple interface for uploading and managing photos.
- **Customizable Layouts**: Choose from a variety of page layouts to best showcase your memories.
- **Live Book Preview**: See how your book will look in real-time as you and others contribute.
- **PDF for dowload and Printing**: A seamless and secure process for download your pdf photo book and later print it.
- **User Dashboard**: Manage your projects and contributions all in one place.
- **Tawk.to Chat Support**: Integrated chat support for immediate assistance.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Authentication**: [Clerk](https://clerk.com/)

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)

## 🚀 Getting Started

To get the project up and running locally, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/download/)

### Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `server` directory and add the following:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
    Replace the values with your PostgreSQL connection details.

4.  **Run database migrations:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Seed the database (optional):**
    ```bash
    npx prisma db seed
    ```

6.  **Start the backend server:**
    ```bash
    npm run start
    ```
    The backend server will be running on `http://localhost:8080` according to the PORT specified in environment values.
7.  **For Upload Images**
     ```bash
     NEXT_PUBLIC_R2_ACCESS_KEY_ID=''
     NEXT_PUBLIC_R2_SECRET_ACCESS_KEY=''
     NEXT_PUBLIC_R2_BUCKET_NAME=''
     NEXT_PUBLIC_AWS_REGION=''
     NEXT_PUBLIC_R2_ACCOUNT_ID=''
     NEXT_PUBLIC_UPLOAD_ENDPOINT=''
     NEXT_PULIC_IMAGE_R2_URL=''
     ```
### Frontend Setup

1.  **Navigate to the moments (frontend) directory:**
    ```bash
    cd moments
    ```

2.  **Install dependencies:**
    ```bash
    npm install --force
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the `moments` directory and add the necessary Clerk environment variables. You can find these in your Clerk dashboard.
    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key

    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
    ```

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The application will be running on `http://localhost:3000`.


## 📁 Project Structure

The project is organized into two main parts:

-   `moments/`: The Next.js frontend application.
    -   `app/`: Contains all the routes and pages.
    -   `components/`: Shared React components.
    -   `hooks/`: Custom React hooks.
    -   `lib/`: Utility functions.
    -   `store/`: Zustand store for state management.
-   `server/`: The Node.js/Express backend server.
    -   `prisma/`: Database schema and migrations.
    -   `src/`: Source code for the server.
        -   `routes/`: API routes.
        -   `services/`: Business logic.

## 📄 License

This project is licensed under the terms of the LICENSE file.
