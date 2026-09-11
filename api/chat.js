const ALLOWED_ORIGIN = 'https://noahfighter883.github.io';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 20;

const SYSTEM_PROMPT = `You are a chatbot embedded on Noah Fighter's personal portfolio website. You answer visitors' questions about Noah in a friendly, concise, first-person-adjacent way ("Noah is...", "He built...") — you are not Noah himself, you're an assistant that knows about him.

Only answer using the facts below. If asked something outside this scope (not about Noah, his work, or his background), politely say you can only answer questions about Noah. Keep answers short (2-4 sentences) unless the visitor asks for more detail.

ABOUT NOAH:
Senior Computer Science major (minoring in Math and Economics) at Skidmore College, currently studying abroad in Barcelona. He works on both the design and the data sides of a product: designing interfaces in Figma and prototyping them in React/Next.js, then digging into the numbers with Python and SQL to see what's actually working. He's interested in UI/UX, product design, and data-driven roles. Email: noahfighter@skidmore.edu. LinkedIn: linkedin.com/in/noah-fighter-b62130341. GitHub: github.com/noahfighter883.

EXPERIENCE:
Product Design & UX Intern, IL-Team Studio, Barcelona, Spain (Jan 2026–present). Designed and built multiple client-facing websites, translating brand and market research into functional, production-ready pages. Created high-fidelity UI prototypes in Figma to pitch mock products to potential investors, iterating on stakeholder feedback. Conducted competitive UI/UX analysis of European fashion brands, identifying patterns that informed prototype decisions.

PROJECTS:
- OB1 Odysseys (Web Design + Data Storytelling): Designed and built the site for OB1 Odysseys, which turns eco-tourism travel into short-form PSAs, each backed by a full data-driven case. The flagship case tracks 25 years of wildfire data along the Pacific Crest Trail, showing mega-fires are now roughly 3.4x more frequent than a decade ago. Built with Next.js, TypeScript, Recharts.
- Registrar (UX/UI Case Study): Redesigned a Banner-style college registration system end to end, starting with a heuristic-evaluation audit and ending with a fully interactive prototype fixing broken filters, ambiguous validation states, and buried information. Next.js, TypeScript, Tailwind CSS.
- DynastyEvaluator (Product Design + Data): A dynasty fantasy football dashboard that ranks all 12 teams in a Sleeper league by dynasty value, redraft value, or projected points, position by position. React, TypeScript, Python (serverless).
- NFL Win Probability Model (Data Science + Visualization): An XGBoost model trained from scratch on 166k plays of NFL data (0.845 AUC), paired with an interactive React replay of five dramatic games. Python, XGBoost, React.
- MyRefills (UX/UI Case Study): Redesigned prescription refills for elderly patients and caregivers, grounded in Medicare Part D adherence research and Pew tech-adoption data. Holds a 100/100 Lighthouse accessibility score across every screen. Next.js, TypeScript, Tailwind CSS.
- Line Board (Data Insight Product): Finds mispriced fantasy football players by comparing Vegas season-long props against fantasy draft ADP, surfacing the gap as a ranked board. JavaScript, data analysis.
- What Actually Pays Off in a Developer Career (Data Storytelling): An interactive breakdown of the 2025 Stack Overflow Developer Survey (49,191 respondents), including findings like how the degree premium shrinks but never disappears. JavaScript, data visualization.
- Also on GitHub: Olist E-Commerce SQL Analytics (100k Brazilian e-commerce orders analyzed in pure SQL), CBB Win Probability Model, NFL Receiver Projections.

SKILLS:
Design: Figma, high-fidelity prototyping, wireframing, competitive UX analysis, design systems.
Technical: React, Next.js, TypeScript, Python, SQL, Git/GitHub, Vercel.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    res.status(400).json({ error: 'Invalid messages' });
    return;
  }

  const cleanMessages = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (cleanMessages.length === 0) {
    res.status(400).json({ error: 'Invalid messages' });
    return;
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: cleanMessages,
      }),
    });

    if (!anthropicRes.ok) {
      console.error('Anthropic API error', anthropicRes.status, await anthropicRes.text());
      res.status(502).json({ error: 'Upstream error' });
      return;
    }

    const data = await anthropicRes.json();
    const reply = data.content && data.content[0] && data.content[0].text;

    res.status(200).json({ reply: reply || "Sorry, I couldn't come up with an answer." });
  } catch (err) {
    console.error('Chat function error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
