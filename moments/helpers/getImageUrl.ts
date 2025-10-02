export function getImageUrl(imageKey: string | null): string | null {
    if (!imageKey) return null;
    
    // Use environment variable if available, otherwise fall back to default
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_R2_URL || 
                    'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
    
    // Handle case where imageKey might already include the base URL
    if (imageKey.startsWith('http')) {
        return imageKey;
    }
    
    // Handle case where imageKey might already include 'memorylane/'
    if (imageKey.startsWith('memorylane/')) {
        return `https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/${imageKey}`;
    }
    
    return `${baseUrl}/${imageKey}`;
}