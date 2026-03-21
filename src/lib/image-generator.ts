import { GoogleGenAI } from '@google/genai';

export async function generateConceptImage(
  label: string,
  description: string,
  contentSummary?: string,
  imageModel: string = 'gemini-2.5-flash-image',
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!process.env.GOOGLE_API_KEY) return null;
  if (imageModel === 'none') return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

  const contextHint = contentSummary
    ? `\n\nKey ideas from the lesson:\n${contentSummary}`
    : '';

  const prompt = `Create a clear, educational diagram that explains the math concept "${label}": ${description}.${contextHint}

This image will be used as a visual explanation in an educational math app. The goal is for a student to look at this image and immediately understand the core idea.

What to draw:
- A SPECIFIC, CONCRETE diagram that illustrates this concept — not abstract art
- For example: if the concept is "counting", draw objects being counted (apples, dots) with numbers 1, 2, 3 next to them and arrows showing the counting process
- If the concept is "sets", draw Venn diagrams with labeled groups
- If the concept is "functions", draw input-output machines or mapping arrows
- Use a real, concrete scenario that makes the concept click

Style:
- Clean whiteboard/textbook illustration style with a white background
- Hand-drawn feel but neat and organized, like a good teacher's whiteboard drawing
- Use color purposefully: blue for main concepts, red for emphasis, green for examples
- Numbers, simple labels (in Japanese where helpful), and basic math symbols ARE encouraged
- Large, clear elements — readable at a glance

Important:
- This must TEACH the concept, not just look pretty
- One clear main diagram, not a collage of random shapes
- Keep it simple: fewer elements, clearly arranged, with obvious visual logic
- Professional quality suitable for an educational web app`;

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: prompt,
    config: {
      responseModalities: ['image', 'text'],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      return { buffer, mimeType: part.inlineData.mimeType || 'image/png' };
    }
  }

  return null;
}
