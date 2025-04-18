export async function uploadFileToR2(file: File): Promise<string> {
    const res = await fetch('/api/get-presign-url', {
      method: 'POST',
      body: JSON.stringify({ fileName: file.name }),
      headers: { 'Content-Type': 'application/json' },
    });
  
    const { url, key } = await res.json();
  
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  
    return key;
  }
  