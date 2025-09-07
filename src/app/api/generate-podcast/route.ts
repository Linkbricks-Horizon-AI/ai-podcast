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
      prompt: `Create a natural, engaging podcast conversation between two speakers about the following content. 

Title: ${title || "Article"}

Content: ${content}

Guidelines:
- Create a natural dialogue between Speaker1 and Speaker2
- Include natural speech patterns and reactions like [laughs], [pauses], [excited], [surprised], [thoughtful], etc.
- Make it conversational and engaging
- Each speaker should contribute meaningfully to the discussion
- Keep individual segments reasonably short (1-3 sentences each)
- Include transitions, questions, and natural flow
- Total conversation should be engaging but not too long (aim for 10-15 exchanges)`,
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
