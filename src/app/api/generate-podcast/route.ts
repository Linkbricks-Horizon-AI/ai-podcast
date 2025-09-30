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
      prompt: `다음 내용에 대해 두 명의 한국인 스피커가 진행하는 매우 역동적이고 자연스러운 팟캐스트 대화를 한국어로 생성해주세요. 실제 사람들이 나누는 진짜 대화처럼 느껴지도록 중간에 끼어들기, 겹치는 대화, 자연스러운 흐름을 포함하세요. 반드시 한국어로만 대화를 생성하세요.

제목: ${title || "Article"}

내용: ${content}

스피커 성격:
Speaker1 (활발하고 순진한 성격):
- 모든 것에 대해 극도로 열정적이고 낙관적
- 새로운 개념과 아이디어에 쉽게 흥분함
- 가끔 뻔한 질문도 포함해서 많은 질문을 함
- 감탄사를 자주 사용하고 에너지 넘치는 언어 사용
- 모든 것의 밝은 면을 보는 경향
- 때때로 미묘한 뉘앙스나 세부사항을 놓침
- 빨리 흥분함: "우와!", "대박이다!", "진짜요?", "이거 완전 신기해요!"

Speaker2 (비관적이고 거만한 성격):
- 대부분의 주장에 대해 회의적이고 냉소적
- 모든 것을 안다고 생각함
- 자주 Speaker1을 정정하거나 반박함
- 한숨을 자주 쉬고 거들먹거리는 말투 사용
- 결함, 문제점, 단점을 지적함
- 비꼬는 댓글과 눈을 굴리는 표현 사용
- 반대 의견을 자주 제시: "사실은요...", "당연히...", "그건 정확하지 않아요..."

중요: 이 대화를 실제적이고 역동적으로 만들기 위한 특정 패턴:

대화 끊김 패턴:
- "—" (em 대시)를 사용하여 중간에 끊기는 것을 표현: "그래서 제 생각에는—" / "—아 그거 말이에요?"
- 자연스럽게 서로의 말을 끊는 모습 표현
- 겹치는 생각과 말하려고 경쟁하는 모습 포함

감정 반응:
- 자주 감정 표현 추가: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- 상대방 말에 대한 진짜 반응 보여주기
- 깨달음, 놀람, 의견 불일치의 순간 포함

대화 흐름:
- 스피커들이 끼어들거나, 열정적으로 동의하거나, 반대해야 함
- 옆길로 새는 대화나 다른 주제에 대한 언급 포함
- 서로의 아이디어를 발전시키거나 도전하는 모습 표현
- 구어체, 축약형, 자연스러운 말투 사용
- 가끔 추임새나 자연스러운 머뭇거림 포함

역동적인 대화:
- 매우 짧은 반응("잠깐, 뭐라고요?", "맞아요!", "헐!")과 긴 설명을 섞어서 사용
- 스피커들이 흥분해서 서로 말을 겹치는 모습 표현
- 둘 다 동시에 말하려는 순간 포함
- 공유하는 지식이나 경험에 대한 언급

성격 상호작용 예시:
- Speaker1: "우와, 이거 진짜 대박이에요! 그러니까 지금 말씀하시는 게—"
- Speaker2: "—[sighs] 당연히 실제로는 거의 작동 안 한다는 부분은 못 보셨겠죠."
- Speaker1: "잠깐, 그래도 이게 모든 걸 바꿀 수 있지 않을까요?!"
- Speaker2: "그럼요, 명백한 문제들을 다 무시한다면 말이죠. [eye roll]"
- Speaker1: "저 이거 너무 신나는데요! 어떻게 생각하세요?"
- Speaker2: "이미 전에 시도했다가 실패한 걸로 너무 들뜨신 것 같은데요."

Speaker1은 진정으로 열정적이고 때로는 귀엽게 순진하게, Speaker2는 차가운 현실주의와 우월감으로 지속적으로 그 흥분을 꺾도록 만드세요.

중요: 전체 대화를 2500자 이내로 유지하여 API 제한에 맞추세요. 8-12개의 짧고 임팩트 있는 대화로 구성하세요. 내용의 가장 흥미롭거나 놀라운 부분에 집중하세요. 모든 대화는 반드시 한국어로 작성하세요.`,
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
