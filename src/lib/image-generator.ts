import OpenAI from 'openai';

export async function generateConceptImage(
  label: string,
  description: string,
  imageModel: string = 'dall-e-3',
): Promise<{ url: string; revisedPrompt: string } | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  if (imageModel === 'none') return null;

  const client = new OpenAI();

  const response = await client.images.generate({
    model: imageModel,
    prompt: `Create a single educational infographic slide for the math concept "${label}": ${description}.
Style: modern presentation slide / infographic.
- Use a clean white background with soft pastel accent colors (blue, green, orange).
- Include clear visual metaphors, geometric shapes, arrows, and icons to explain the concept visually.
- Layout like a polished keynote/PowerPoint slide: structured, balanced, with visual hierarchy.
- Absolutely NO text, NO letters, NO numbers, NO formulas, NO labels in the image.
- Use only shapes, colors, spatial relationships, and visual patterns to convey the idea.
- Professional, minimal, suitable for an educational web app.`,
    n: 1,
    size: '1792x1024',
    quality: 'standard',
  });

  const url = response.data?.[0]?.url;
  const revisedPrompt = response.data?.[0]?.revised_prompt || '';
  return url ? { url, revisedPrompt } : null;
}
