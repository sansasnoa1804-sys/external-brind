import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const input =
      typeof body.input === "string" ? body.input.trim() : "";

    const memory = Array.isArray(body.memory)
      ? body.memory.slice(-5)
      : [];

    if (!input) {
      return NextResponse.json({
        ok: true,
        decision: "Bouge ton corps.",
        why: "",
        now: "Fais 20 squats.",
      });
    }

    const openaiRes = await fetch(
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
Tu es un cerveau externe.
Tu réponds en français.
Réponses TRÈS COURTES et ACTIONNABLES.
JSON strict avec :
- decision
- why
- now
Aucun texte hors JSON.
              `,
            },
            {
              role: "user",
              content: `
Dernières décisions :
${memory.join(" | ")}

Nouvelle demande :
${input}
              `,
            },
          ],
          temperature: 0.45,
        }),
      }
    );

    const raw = await openaiRes.json();
    const content = raw?.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content");

    const parsed =
      typeof content === "string"
        ? JSON.parse(content)
        : content;

    return NextResponse.json({
      ok: true,
      decision: parsed.decision || "Agis.",
      why: parsed.why || "",
      now: parsed.now || "Commence maintenant.",
    });

  } catch (err) {
    console.error("API ERROR", err);
    return NextResponse.json(
      {
        ok: false,
        decision: "Erreur temporaire.",
        why: "",
        now: "Réessaie.",
      },
      { status: 500 }
    );
  }
}
