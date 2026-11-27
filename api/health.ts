export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
}
