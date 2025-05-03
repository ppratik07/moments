import { addBusinessDays } from "@/helpers/addBusinessDays";
import { useEffect, useState } from "react";

export function useDeliveryDate(userDateString: string | null) {
    const [calculatedDate, setCalculatedDate] = useState<Date | null>(null);
    const [showHeadsUp, setShowHeadsUp] = useState(false);

    useEffect(() => {
        if (!userDateString) return;
        const userDate = new Date(userDateString);

        // Step 1: Add 3 calendar days
        const afterMemoryDays = new Date(userDate);
        afterMemoryDays.setDate(userDate.getDate() + 3);
        // Step 2: Add 7 business days
        const earliestDeliveryDate = addBusinessDays(afterMemoryDays, 7);
        setCalculatedDate(earliestDeliveryDate);
        // Step 3: Show warning if user-picked date is earlier than we can deliver
        setShowHeadsUp(earliestDeliveryDate > userDate);
    }, [userDateString]);
    return { calculatedDate, showHeadsUp };
}