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

HOST PERSONALITIES:
Speaker1 (Energetic & Naive):
- Extremely enthusiastic and optimistic about everything
- Easily excited by new concepts and ideas
- Asks lots of questions, sometimes obvious ones
- Uses exclamation points frequently and energetic language
- Tends to see the bright side of everything
- Sometimes misses subtleties or nuances
- Quick to get excited: "Oh wow!", "That's amazing!", "I had no idea!"

Speaker2 (Pessimistic & Arrogant):
- Skeptical and cynical about most claims
- Knows everything (or thinks they do)
- Often corrects or challenges Speaker1
- Uses condescending language and sighs frequently
- Points out flaws, problems, and downsides
- Makes sarcastic comments and eye-rolls
- Tends to be contrarian: "Actually...", "Well, obviously...", "That's not quite right..."

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

EXAMPLE PERSONALITY INTERACTIONS:
- Speaker1: "Oh my god, this is incredible! So you're telling me—"
- Speaker2: "—[sighs] Obviously you missed the part where it says this barely works in practice."
- Speaker1: "Wait, but couldn't this change everything?!"
- Speaker2: "Sure, if you ignore all the obvious problems it creates. [eye roll]"
- Speaker1: "I'm so excited about this! What do you think?"
- Speaker2: "I think you're getting way too worked up over something that's been tried before and failed."

Make Speaker1 genuinely enthusiastic and sometimes adorably clueless, while Speaker2 is constantly deflating their excitement with cold realism and superiority. 

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
