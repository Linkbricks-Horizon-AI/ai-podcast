import { NextRequest, NextResponse } from "next/server";
import { createDialogue } from "@/actions/dialogue";
import { CreateDialogueRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: CreateDialogueRequest = await request.json();

    if (!body.inputs || body.inputs.length === 0) {
      return NextResponse.json(
        { error: "Dialogue inputs are required" },
        { status: 400 }
      );
    }

    console.log("body", body.inputs);

    // Validate each dialogue input
    for (const input of body.inputs) {
      if (!input.text || !input.voiceId) {
        return NextResponse.json(
          { error: "Each dialogue input must have text and voiceId" },
          { status: 400 }
        );
      }
    }

    const result = await createDialogue(body);

    if (!result.ok) {
      console.error("Error generating dialogue:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      audioBase64: result.value.audioBase64,
      processingTimeMs: result.value.processingTimeMs,
    });
  } catch (error) {
    console.error("Error processing dialogue request:", error);
    return NextResponse.json(
      { error: "Failed to process dialogue request" },
      { status: 500 }
    );
  }
}
