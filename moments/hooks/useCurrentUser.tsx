// hooks/useCurrentUser.ts
'use client';

import { useUser } from '@clerk/nextjs';

export const useCurrentUser = () => {
    const { isSignedIn, user, isLoaded } = useUser();

    return {
        isSignedIn,
        user,
        isLoaded,
    };
};
