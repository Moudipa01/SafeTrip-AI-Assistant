import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;

    if (!audioFile) {
      return Response.json({ error: 'No audio provided' }, { status: 400 });
    }

    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) {
      return Response.json({ error: 'HF Token missing' }, { status: 500 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();

    // Set a timeout for the fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/openai/whisper-base',
        {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'X-Wait-For-Model': 'true',
          },
          method: 'POST',
          body: arrayBuffer,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return Response.json({ text: result.text || '' });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch {
    return Response.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
