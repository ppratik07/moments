export function getImageUrl(imageKey: string | null){
    if(imageKey === null) return null;

    const baseUrl = 'https://pub-7e95bf502cc34aea8d683b14cb66fc8d.r2.dev/memorylane';
    return `${baseUrl}/${imageKey}`;
}