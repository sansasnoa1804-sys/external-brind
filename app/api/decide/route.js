import { NextResponse } from "next/server";

/* ===== PROMPTS PAR MODE ===== */
const PROMPTS = {
  normal: `
Tu es un cerveau externe.
Tu prends des décisions utiles et immédiates.
`,
  fatigue: `
Tu es un cerveau externe.
L'utilisateur est fatigué.
Tu proposes des actions très simples.
`,
  urgence: `
Tu es un cerveau externe.
La situation est urgente.
Tu agis sans hésitation.
`
};

/* ===== RÈGLES CENTRALES ===== */
const CORE_RULES = `
Règles ABSOLUES :

- Tu ne poses JAMAIS de question.
- Tu ne demandes JAMAIS de précision.
- Tu fais toujours une hypothèse utile.

Intention progressive :
- Un message court est un complément.
- Tu intègres immédiatement le contexte implicite.

Anti-répétition :
- Tu ne proposes jamais deux fois la même action.
- Tu varies le type d’action (physique, mental, organisation, détente).

Longueur STRICTE :
- decision : 1 phrase courte.
- why : 3 à 5 mots max.
- now : action impérative courte.

Format :
- JSON valide uniquement
- Champs :
  - decision (obligatoire)
  - why (optionnel)
  - now (obligatoire)
  - hints (optionnel, array de strings)
- Aucun texte hors JSON

Suggestions (facultatif) :
- Tu peux ajouter un champ "hints" (array de 2 à 3 mots max).
- Les hints ne sont PAS des choix alternatifs.
- Elles servent uniquement à affiner l’exécution.
- Exemples valides : ["5 min", "10 min"], ["rapide", "focus"], ["léger", "calme"]

`;

/* ===== MODE ===== */
function detectMode(input) {
  const t = input.toLowerCase();

  if (t.includes("fatigu") || t.includes("crevé") || t.includes("épuis"))
    return "fatigue";

  if (t.includes("urgent") || t.includes("vite") || t.includes("maintenant"))
    return "urgence";

  return "normal";
}

export async function POST(req) {
  try {
    const { input, memory = [] } = await req.json();
    const mode = detectMode(input);

    const userMemoryContext = memory.length
      ? `Décisions récentes à NE PAS répéter :
${memory.map(d => `- ${d}`).join("\n")}`
      : "";

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
${PROMPTS[mode]}
${CORE_RULES}
${userMemoryContext}
`,
            },
            {
              role: "user",
              content: input,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    const parsed =
      typeof data.choices[0].message.content === "string"
        ? JSON.parse(data.choices[0].message.content)
        : data.choices[0].message.content;

    return NextResponse.json({
      ok: true,
      decision: parsed.decision || "Fais une action simple.",
      why: parsed.why || "Utile maintenant.",
      now: parsed.now || "Commence tout de suite.",
    });
  } catch (e) {
return NextResponse.json({
  ok: true,
  decision: parsed.decision,
  why: parsed.why || "",
  now: parsed.now,
  hints: parsed.hints || []
    });
  }
}
