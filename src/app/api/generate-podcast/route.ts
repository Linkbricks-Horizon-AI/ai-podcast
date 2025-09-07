import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const podcastSchema = z.object({
  conversation: z
    .array(
      z.object({
        speaker: z.enum(["Speaker1", "Speaker2"]),
        text: z
          .string()
          .describe(
            "The text spoken by this speaker, including natural speech patterns and nuances like [laughs], [pauses], [excited], etc."
          ),
      })
    )
    .describe(
      "A natural podcast conversation between two speakers discussing the content"
    ),
});

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const model = openai("gpt-5-mini");

    const result = streamObject({
      model,
      schema: podcastSchema,
      prompt: `Create a highly dynamic, natural podcast conversation between two speakers about the following content. Make it feel like real people having an authentic conversation with interruptions, overlaps, and organic flow.

Title: ${title || "Article"}

Content: ${content}

CRITICAL: Make this conversation feel REAL and DYNAMIC with these specific patterns:

INTERRUPTION PATTERNS:
- Use "—" (em dash) to show mid-sentence interruptions: "So I was thinking we could—" / "—test our new timing features?"
- Show speakers cutting each other off naturally
- Include overlapping thoughts and competing to speak

EMOTIONAL REACTIONS:
- Frequent emotional annotations: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Show genuine reactions to what the other person says
- Include moments of realization, surprise, disagreement

CONVERSATIONAL FLOW:
- Speakers should interrupt, agree enthusiastically, or disagree
- Include side tangents and references to other topics
- Show speakers building on each other's ideas or challenging them
- Use casual language, contractions, and natural speech patterns
- Include filler words and natural hesitations occasionally

DYNAMIC EXCHANGES:
- Mix very short responses ("Wait, what?", "Exactly!", "Oh my god!") with longer explanations
- Show speakers getting excited and talking over each other
- Include moments where they both try to talk at the same time
- Reference shared knowledge or experiences they might have

EXAMPLE STYLE (based on your examples):
- "So I was thinking we could—"
- "—know what you were thinking? Lucky guess! Sorry, go ahead."
- "Okay, so if we both try to talk at the same time—"
- "—we'll probably crash the system!"
- "[LAUGHS] Come on man, PLEASE! I promise you'll love this one."

Make it feel like two friends who are genuinely engaged, sometimes interrupt each other, and have authentic reactions. 

IMPORTANT: Keep the TOTAL conversation under 2500 characters to fit within API limits. Aim for 8-12 short, punchy exchanges that pack maximum impact. Focus on the most interesting or surprising aspects of the content.`,
    });

    // Create a readable stream to send partial objects to client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const partialObject of result.partialObjectStream) {
            // Send each partial update as JSON
            const chunk = JSON.stringify({ 
              type: 'partial',
              data: partialObject 
            }) + '\n';
            
            controller.enqueue(new TextEncoder().encode(chunk));
          }

          // Send final complete object
          const finalObject = await result.object;
          const finalChunk = JSON.stringify({ 
            type: 'complete',
            data: finalObject 
          }) + '\n';
          
          controller.enqueue(new TextEncoder().encode(finalChunk));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorChunk = JSON.stringify({ 
            type: 'error',
            error: 'Failed to generate podcast conversation' 
          }) + '\n';
          
          controller.enqueue(new TextEncoder().encode(errorChunk));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error("Error generating podcast:", error);
    return NextResponse.json(
      { error: "Failed to generate podcast conversation" },
      { status: 500 }
    );
  }
}
