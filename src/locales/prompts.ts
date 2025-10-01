export type Language = 'korean' | 'english' | 'chinese' | 'japanese' | 'spanish' | 'hindi' | 'french' | 'arabic' | 'german' | 'vietnamese' | 'portuguese' | 'russian' | 'thai' | 'indonesian';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'korean', label: 'Korean', nativeName: '한국어' },
  { code: 'english', label: 'English', nativeName: 'English' },
  { code: 'chinese', label: 'Chinese', nativeName: '中文' },
  { code: 'japanese', label: 'Japanese', nativeName: '日本語' },
  { code: 'spanish', label: 'Spanish', nativeName: 'Español' },
  { code: 'hindi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'french', label: 'French', nativeName: 'Français' },
  { code: 'arabic', label: 'Arabic', nativeName: 'العربية' },
  { code: 'german', label: 'German', nativeName: 'Deutsch' },
  { code: 'vietnamese', label: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'portuguese', label: 'Portuguese', nativeName: 'Português' },
  { code: 'russian', label: 'Russian', nativeName: 'Русский' },
  { code: 'thai', label: 'Thai', nativeName: 'ไทย' },
  { code: 'indonesian', label: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

interface PromptTemplates {
  defaultPersona1: string;
  defaultPersona2: string;
  conversationPrompt: (params: {
    title: string;
    content: string;
    speaker1Persona: string;
    speaker2Persona: string;
  }) => string;
}

export const PROMPTS: Record<Language, PromptTemplates> = {
  korean: {
    defaultPersona1: `(활발하고 순진한 성격):
- 모든 것에 대해 극도로 열정적이고 낙관적
- 새로운 개념과 아이디어에 쉽게 흥분함
- 가끔 뻔한 질문도 포함해서 많은 질문을 함
- 감탄사를 자주 사용하고 에너지 넘치는 언어 사용
- 모든 것의 밝은 면을 보는 경향
- 때때로 미묘한 뉘앙스나 세부사항을 놓침
- 빨리 흥분함: "우와!", "대박이다!", "진짜요?", "이거 완전 신기해요!"`,
    
    defaultPersona2: `(비관적이고 거만한 성격):
- 대부분의 주장에 대해 회의적이고 냉소적
- 모든 것을 안다고 생각함
- 자주 Speaker1을 정정하거나 반박함
- 한숨을 자주 쉬고 거들먹거리는 말투 사용
- 결함, 문제점, 단점을 지적함
- 비꼬는 댓글과 눈을 굴리는 표현 사용
- 반대 의견을 자주 제시: "사실은요...", "당연히...", "그건 정확하지 않아요..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `다음 내용에 대해 두 명의 한국인 스피커가 진행하는 매우 역동적이고 자연스러운 팟캐스트 대화를 한국어로 생성해주세요. 실제 사람들이 나누는 진짜 대화처럼 느껴지도록 중간에 끼어들기, 겹치는 대화, 자연스러운 흐름을 포함하세요. 반드시 한국어로만 대화를 생성하세요.

제목: ${title}

내용: ${content}

스피커 성격:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

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
  },

  english: {
    defaultPersona1: `(Enthusiastic and naive personality):
- Extremely passionate and optimistic about everything
- Easily excited by new concepts and ideas
- Asks many questions, including sometimes obvious ones
- Uses exclamations frequently and energetic language
- Tends to see the bright side of everything
- Sometimes misses subtle nuances or details
- Quick to excitement: "Wow!", "That's amazing!", "Really?", "This is so cool!"`,
    
    defaultPersona2: `(Pessimistic and arrogant personality):
- Skeptical and cynical about most claims
- Thinks they know everything
- Frequently corrects or contradicts Speaker1
- Often sighs and uses condescending tone
- Points out flaws, problems, and downsides
- Uses sarcastic comments and eye-rolling expressions
- Frequently presents opposing views: "Actually...", "Obviously...", "That's not quite accurate..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Generate a very dynamic and natural podcast conversation in English between two speakers discussing the following content. Make it feel like a real conversation between actual people, including interruptions, overlapping dialogue, and natural flow. The conversation must be entirely in English.

Title: ${title}

Content: ${content}

Speaker Personalities:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Important: Specific patterns to make this conversation realistic and dynamic:

Interruption Patterns:
- Use "—" (em dash) to show interruptions: "So I think that—" / "—Oh, you mean that?"
- Show natural cutting each other off
- Include overlapping thoughts and competing to speak

Emotional Reactions:
- Frequently add emotion markers: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Show genuine reactions to what the other person says
- Include moments of realization, surprise, and disagreement

Conversation Flow:
- Speakers should interrupt, enthusiastically agree, or disagree
- Include tangential conversations or references to other topics
- Show building on or challenging each other's ideas
- Use colloquial speech, contractions, and natural phrasing
- Include occasional fillers or natural hesitations

Dynamic Dialogue:
- Mix very short reactions ("Wait, what?", "Exactly!", "Wow!") with longer explanations
- Show speakers getting excited and talking over each other
- Include moments where both try to speak at once
- Reference shared knowledge or experiences

Personality Interaction Examples:
- Speaker1: "Wow, this is incredible! So what you're saying is—"
- Speaker2: "—[sighs] Obviously you missed the part where it barely works in practice."
- Speaker1: "Wait, but couldn't this change everything?!"
- Speaker2: "Sure, if we ignore all the obvious problems. [eye roll]"
- Speaker1: "I'm so excited about this! What do you think?"
- Speaker2: "I think you're getting too worked up about something that's already been tried and failed."

Make Speaker1 genuinely enthusiastic and sometimes endearingly naive, while Speaker2 consistently deflates that excitement with cold realism and superiority.

Important: Keep the entire conversation under 2500 characters to fit API limits. Create 8-12 short, impactful exchanges. Focus on the most interesting or surprising parts of the content. All dialogue must be written in English.`,
  },

  chinese: {
    defaultPersona1: `(热情天真的性格):
- 对一切都极度热情和乐观
- 容易被新概念和想法所激动
- 经常提问，包括一些显而易见的问题
- 频繁使用感叹词和充满活力的语言
- 倾向于看到事物光明的一面
- 有时会忽略微妙的细微差别或细节
- 容易兴奋："哇！"、"太棒了！"、"真的吗？"、"这太酷了！"`,
    
    defaultPersona2: `(悲观自大的性格):
- 对大多数说法持怀疑和讽刺态度
- 认为自己无所不知
- 经常纠正或反驳Speaker1
- 经常叹气并使用居高临下的语气
- 指出缺陷、问题和缺点
- 使用讽刺性评论和翻白眼的表达
- 经常提出相反观点："实际上..."、"显然..."、"那不太准确..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `请生成一段关于以下内容的非常动态和自然的中文播客对话，由两位说话者进行讨论。让它感觉像真实的人之间的真实对话，包括打断、重叠的对话和自然的流程。对话必须完全用中文。

标题: ${title}

内容: ${content}

说话者性格:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

重要：使此对话真实且动态的特定模式：

打断模式:
- 使用"—"（破折号）表示打断："所以我认为—" / "—哦，你是指那个？"
- 展示自然地互相打断
- 包括重叠的想法和竞争发言

情感反应:
- 经常添加情感标记：[laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- 展示对对方所说内容的真实反应
- 包括领悟、惊讶和分歧的时刻

对话流程:
- 说话者应该打断、热情地同意或不同意
- 包括离题的对话或对其他话题的引用
- 展示基于或挑战彼此想法的过程
- 使用口语、缩略语和自然的措辞
- 偶尔包括填充词或自然的犹豫

动态对话:
- 混合非常简短的反应（"等等，什么？"、"没错！"、"哇！"）和较长的解释
- 展示说话者兴奋地互相打断
- 包括两人同时试图说话的时刻
- 引用共同的知识或经验

性格互动示例:
- Speaker1: "哇，这太不可思议了！所以你的意思是—"
- Speaker2: "—[sighs] 显然你错过了它在实践中几乎不起作用的部分。"
- Speaker1: "等等，但这不能改变一切吗？！"
- Speaker2: "当然，如果我们忽略所有明显的问题。[eye roll]"
- Speaker1: "我对此感到非常兴奋！你怎么看？"
- Speaker2: "我认为你对一件已经尝试过并失败的事情过于激动了。"

使Speaker1真正热情，有时天真可爱，而Speaker2以冷酷的现实主义和优越感持续打击那种兴奋。

重要：将整个对话保持在2500字符以内以适应API限制。创建8-12个简短而有影响力的交流。专注于内容中最有趣或最令人惊讶的部分。所有对话必须用中文书写。`,
  },

  japanese: {
    defaultPersona1: `(熱心で素朴な性格):
- すべてに対して非常に情熱的で楽観的
- 新しい概念やアイデアに簡単に興奮する
- 時には明白な質問も含めて多くの質問をする
- 感嘆詞を頻繁に使用し、エネルギッシュな言葉遣い
- すべての明るい面を見る傾向がある
- 時には微妙なニュアンスや詳細を見逃す
- すぐに興奮する：「わあ！」、「すごい！」、「本当ですか？」、「これ超クールです！」`,
    
    defaultPersona2: `(悲観的で傲慢な性格):
- ほとんどの主張に対して懐疑的で皮肉的
- すべてを知っていると思っている
- Speaker1を頻繁に訂正したり反論したりする
- よくため息をつき、見下したような口調を使う
- 欠陥、問題点、欠点を指摘する
- 皮肉なコメントや目を丸くする表現を使用
- 頻繁に反対意見を提示：「実際は...」、「明らかに...」、「それは正確ではありません...」`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `以下の内容について、2人の話者による非常にダイナミックで自然な日本語のポッドキャスト会話を生成してください。実際の人々の間の本物の会話のように感じられるように、中断、重複する対話、自然な流れを含めてください。会話は完全に日本語でなければなりません。

タイトル: ${title}

内容: ${content}

話者の性格:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

重要：この会話を現実的でダイナミックにするための特定のパターン：

中断パターン:
- 「—」（emダッシュ）を使用して中断を示す：「だから私は—」 / 「—ああ、それのことですか？」
- 自然にお互いを遮る様子を表現
- 重なる考えと話そうとする競争を含める

感情的な反応:
- 頻繁に感情マーカーを追加：[laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- 相手の発言に対する本物の反応を示す
- 気づき、驚き、意見の相違の瞬間を含める

会話の流れ:
- 話者は中断したり、熱心に同意したり、反対したりする必要がある
- 脱線した会話や他のトピックへの言及を含める
- お互いのアイデアを発展させたり挑戦したりする様子を表現
- 口語、短縮形、自然な言い回しを使用
- 時折フィラーや自然なためらいを含める

ダイナミックな対話:
- 非常に短い反応（「待って、何？」、「その通り！」、「わあ！」）と長い説明を混ぜる
- 話者が興奮してお互いに話しかける様子を表現
- 両方が同時に話そうとする瞬間を含める
- 共有された知識や経験を参照

性格の相互作用の例:
- Speaker1: 「わあ、これは信じられない！つまり、あなたが言っているのは—」
- Speaker2: 「—[sighs] 明らかに、実際にはほとんど機能しない部分を見逃しましたね。」
- Speaker1: 「待って、でもこれはすべてを変えられないでしょうか？！」
- Speaker2: 「もちろん、すべての明白な問題を無視すればね。[eye roll]」
- Speaker1: 「これにすごく興奮しています！どう思いますか？」
- Speaker2: 「すでに試みられて失敗したことに興奮しすぎだと思います。」

Speaker1を本当に熱心で、時には愛らしいほど素朴に、Speaker2を冷たい現実主義と優越感でその興奮を一貫して萎ませるようにしてください。

重要：API制限に合わせて、会話全体を2500文字以内に保ってください。8-12の短くてインパクトのある交換を作成してください。内容の最も興味深いまたは驚くべき部分に焦点を当ててください。すべての対話は日本語で書かなければなりません。`,
  },

  german: {
    defaultPersona1: `(Enthusiastische und naive Persönlichkeit):
- Extrem leidenschaftlich und optimistisch über alles
- Begeistert sich leicht für neue Konzepte und Ideen
- Stellt viele Fragen, manchmal auch offensichtliche
- Verwendet häufig Ausrufe und energetische Sprache
- Neigt dazu, die positive Seite von allem zu sehen
- Übersieht manchmal subtile Nuancen oder Details
- Schnell begeistert: "Wow!", "Das ist unglaublich!", "Wirklich?", "Das ist so cool!"`,
    
    defaultPersona2: `(Pessimistische und arrogante Persönlichkeit):
- Skeptisch und zynisch gegenüber den meisten Behauptungen
- Denkt, alles zu wissen
- Korrigiert oder widerspricht Speaker1 häufig
- Seufzt oft und verwendet einen herablassenden Ton
- Weist auf Mängel, Probleme und Nachteile hin
- Verwendet sarkastische Kommentare und Augenroll-Ausdrücke
- Präsentiert häufig entgegengesetzte Ansichten: "Eigentlich...", "Offensichtlich...", "Das ist nicht ganz richtig..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Erstelle ein sehr dynamisches und natürliches Podcast-Gespräch auf Deutsch zwischen zwei Sprechern, die über den folgenden Inhalt diskutieren. Lass es wie ein echtes Gespräch zwischen echten Menschen wirken, einschließlich Unterbrechungen, überlappender Dialoge und natürlichem Fluss. Das Gespräch muss vollständig auf Deutsch sein.

Titel: ${title}

Inhalt: ${content}

Sprecher-Persönlichkeiten:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Wichtig: Spezifische Muster, um dieses Gespräch realistisch und dynamisch zu gestalten:

Unterbrechungsmuster:
- Verwende "—" (Gedankenstrich), um Unterbrechungen zu zeigen: "Also ich denke, dass—" / "—Oh, du meinst das?"
- Zeige natürliches gegenseitiges Unterbrechen
- Füge überlappende Gedanken und Wettbewerb um das Sprechen hinzu

Emotionale Reaktionen:
- Füge häufig Emotionsmarkierungen hinzu: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Zeige echte Reaktionen auf das, was die andere Person sagt
- Füge Momente der Erkenntnis, Überraschung und Meinungsverschiedenheit hinzu

Gesprächsfluss:
- Sprecher sollten unterbrechen, begeistert zustimmen oder widersprechen
- Füge tangentiale Gespräche oder Verweise auf andere Themen hinzu
- Zeige das Aufbauen auf oder Herausfordern der Ideen des anderen
- Verwende umgangssprachliche Sprache, Kontraktionen und natürliche Formulierungen
- Füge gelegentlich Füllwörter oder natürliche Zögerungen hinzu

Dynamischer Dialog:
- Mische sehr kurze Reaktionen ("Warte, was?", "Genau!", "Wow!") mit längeren Erklärungen
- Zeige Sprecher, die aufgeregt werden und übereinander reden
- Füge Momente hinzu, in denen beide gleichzeitig zu sprechen versuchen
- Beziehe dich auf geteiltes Wissen oder Erfahrungen

Beispiele für Persönlichkeitsinteraktion:
- Speaker1: "Wow, das ist unglaublich! Also was du sagst ist—"
- Speaker2: "—[sighs] Offensichtlich hast du den Teil übersehen, wo es in der Praxis kaum funktioniert."
- Speaker1: "Warte, aber könnte das nicht alles verändern?!"
- Speaker2: "Sicher, wenn wir alle offensichtlichen Probleme ignorieren. [eye roll]"
- Speaker1: "Ich bin so begeistert davon! Was denkst du?"
- Speaker2: "Ich denke, du regst dich zu sehr über etwas auf, das bereits versucht wurde und gescheitert ist."

Mache Speaker1 wirklich enthusiastisch und manchmal liebenswert naiv, während Speaker2 diese Begeisterung konsequent mit kaltem Realismus und Überlegenheit dämpft.

Wichtig: Halte das gesamte Gespräch unter 2500 Zeichen, um den API-Limits zu entsprechen. Erstelle 8-12 kurze, wirkungsvolle Austausche. Konzentriere dich auf die interessantesten oder überraschendsten Teile des Inhalts. Der gesamte Dialog muss auf Deutsch geschrieben werden.`,
  },

  vietnamese: {
    defaultPersona1: `(Tính cách nhiệt tình và ngây thơ):
- Cực kỳ đam mê và lạc quan về mọi thứ
- Dễ dàng hứng thú với các khái niệm và ý tưởng mới
- Đặt nhiều câu hỏi, bao gồm cả những câu hỏi hiển nhiên
- Thường xuyên sử dụng từ cảm thán và ngôn ngữ tràn đầy năng lượng
- Có xu hướng nhìn thấy mặt tích cực của mọi thứ
- Đôi khi bỏ lỡ những sắc thái tinh tế hoặc chi tiết
- Nhanh chóng phấn khích: "Wow!", "Thật tuyệt vời!", "Thật không?", "Điều này thật tuyệt!"`,
    
    defaultPersona2: `(Tính cách bi quan và kiêu ngạo):
- Hoài nghi và châm biếm về hầu hết các tuyên bố
- Nghĩ rằng mình biết mọi thứ
- Thường xuyên sửa chữa hoặc phản bác Speaker1
- Thường thở dài và sử dụng giọng điệu khinh thường
- Chỉ ra các khiếm khuyết, vấn đề và nhược điểm
- Sử dụng các bình luận mỉa mai và biểu hiện lăn mắt
- Thường xuyên đưa ra quan điểm đối lập: "Thực ra...", "Rõ ràng là...", "Điều đó không hoàn toàn chính xác..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Tạo một cuộc trò chuyện podcast rất sôi động và tự nhiên bằng tiếng Việt giữa hai người nói thảo luận về nội dung sau. Hãy làm cho nó giống như một cuộc trò chuyện thực sự giữa những người thực sự, bao gồm cả sự gián đoạn, đối thoại chồng chéo và dòng chảy tự nhiên. Cuộc trò chuyện phải hoàn toàn bằng tiếng Việt.

Tiêu đề: ${title}

Nội dung: ${content}

Tính cách của người nói:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Quan trọng: Các mẫu cụ thể để làm cho cuộc trò chuyện này thực tế và sôi động:

Mẫu gián đoạn:
- Sử dụng "—" (gạch ngang dài) để hiển thị sự gián đoạn: "Vậy tôi nghĩ rằng—" / "—Ồ, ý bạn là cái đó à?"
- Hiển thị cách họ tự nhiên cắt lời nhau
- Bao gồm các suy nghĩ chồng chéo và cạnh tranh để nói

Phản ứng cảm xúc:
- Thường xuyên thêm các dấu hiệu cảm xúc: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Hiển thị phản ứng thực sự với những gì người khác nói
- Bao gồm các khoảnh khắc nhận ra, ngạc nhiên và bất đồng

Dòng chảy cuộc trò chuyện:
- Người nói nên gián đoạn, đồng ý nhiệt tình hoặc không đồng ý
- Bao gồm các cuộc trò chuyện tiếp tuyến hoặc tham chiếu đến các chủ đề khác
- Hiển thị việc xây dựng hoặc thách thức ý tưởng của nhau
- Sử dụng ngôn ngữ thông tục, các từ viết tắt và cụm từ tự nhiên
- Thỉnh thoảng bao gồm các từ lấp đầy hoặc do dự tự nhiên

Đối thoại năng động:
- Kết hợp các phản ứng rất ngắn ("Chờ đã, cái gì?", "Chính xác!", "Wow!") với các giải thích dài hơn
- Hiển thị người nói trở nên phấn khích và nói chồng lên nhau
- Bao gồm các khoảnh khắc khi cả hai cố gắng nói cùng một lúc
- Tham chiếu đến kiến thức hoặc kinh nghiệm chung

Ví dụ về tương tác tính cách:
- Speaker1: "Wow, điều này thật không thể tin được! Vậy điều bạn đang nói là—"
- Speaker2: "—[sighs] Rõ ràng là bạn đã bỏ lỡ phần mà nó hầu như không hoạt động trong thực tế."
- Speaker1: "Chờ đã, nhưng điều này không thể thay đổi mọi thứ sao?!"
- Speaker2: "Chắc chắn rồi, nếu chúng ta bỏ qua tất cả các vấn đề rõ ràng. [eye roll]"
- Speaker1: "Tôi rất phấn khích về điều này! Bạn nghĩ sao?"
- Speaker2: "Tôi nghĩ bạn đang phấn khích quá mức về một thứ đã được thử và thất bại."

Làm cho Speaker1 thực sự nhiệt tình và đôi khi ngây thơ một cách đáng yêu, trong khi Speaker2 liên tục làm giảm sự nhiệt tình đó bằng chủ nghĩa hiện thực lạnh lùng và sự ưu việt.

Quan trọng: Giữ toàn bộ cuộc trò chuyện dưới 2500 ký tự để phù hợp với giới hạn API. Tạo 8-12 cuộc trao đổi ngắn gọn và có tác động. Tập trung vào các phần thú vị nhất hoặc đáng ngạc nhiên nhất của nội dung. Tất cả đối thoại phải được viết bằng tiếng Việt.`,
  },

  portuguese: {
    defaultPersona1: `(Personalidade entusiasta e ingênua):
- Extremamente apaixonado e otimista sobre tudo
- Facilmente empolgado com novos conceitos e ideias
- Faz muitas perguntas, incluindo algumas óbvias
- Usa exclamações frequentemente e linguagem energética
- Tende a ver o lado positivo de tudo
- Às vezes perde nuances sutis ou detalhes
- Se empolga rapidamente: "Uau!", "Isso é incrível!", "Sério?", "Isso é muito legal!"`,
    
    defaultPersona2: `(Personalidade pessimista e arrogante):
- Cético e cínico sobre a maioria das afirmações
- Acha que sabe tudo
- Frequentemente corrige ou contradiz Speaker1
- Frequentemente suspira e usa tom condescendente
- Aponta falhas, problemas e desvantagens
- Usa comentários sarcásticos e expressões de revirar os olhos
- Frequentemente apresenta pontos de vista opostos: "Na verdade...", "Obviamente...", "Isso não é bem preciso..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Gere uma conversa de podcast muito dinâmica e natural em português entre dois falantes discutindo o seguinte conteúdo. Faça parecer uma conversa real entre pessoas reais, incluindo interrupções, diálogo sobreposto e fluxo natural. A conversa deve estar inteiramente em português.

Título: ${title}

Conteúdo: ${content}

Personalidades dos Falantes:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Importante: Padrões específicos para tornar esta conversa realista e dinâmica:

Padrões de Interrupção:
- Use "—" (travessão longo) para mostrar interrupções: "Então eu acho que—" / "—Ah, você quer dizer isso?"
- Mostre como eles se interrompem naturalmente
- Inclua pensamentos sobrepostos e competição para falar

Reações Emocionais:
- Adicione frequentemente marcadores de emoção: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Mostre reações genuínas ao que a outra pessoa diz
- Inclua momentos de realização, surpresa e desacordo

Fluxo da Conversa:
- Os falantes devem interromper, concordar entusiasticamente ou discordar
- Inclua conversas tangenciais ou referências a outros tópicos
- Mostre como constroem ou desafiam as ideias um do outro
- Use linguagem coloquial, contrações e frases naturais
- Inclua ocasionalmente palavras de preenchimento ou hesitações naturais

Diálogo Dinâmico:
- Misture reações muito curtas ("Espera, o quê?", "Exatamente!", "Uau!") com explicações mais longas
- Mostre os falantes ficando empolgados e falando por cima um do outro
- Inclua momentos em que ambos tentam falar ao mesmo tempo
- Faça referência a conhecimento ou experiências compartilhadas

Exemplos de Interação de Personalidade:
- Speaker1: "Uau, isso é incrível! Então o que você está dizendo é—"
- Speaker2: "—[sighs] Obviamente você perdeu a parte onde mal funciona na prática."
- Speaker1: "Espera, mas isso não poderia mudar tudo?!"
- Speaker2: "Claro, se ignorarmos todos os problemas óbvios. [eye roll]"
- Speaker1: "Estou tão empolgado com isso! O que você acha?"
- Speaker2: "Acho que você está se empolgando demais com algo que já foi tentado e falhou."

Faça o Speaker1 genuinamente entusiasmado e às vezes adoravelmente ingênuo, enquanto o Speaker2 consistentemente esvazia esse entusiasmo com realismo frio e superioridade.

Importante: Mantenha toda a conversa abaixo de 2500 caracteres para se adequar aos limites da API. Crie 8-12 trocas curtas e impactantes. Foque nas partes mais interessantes ou surpreendentes do conteúdo. Todo o diálogo deve ser escrito em português.`,
  },

  russian: {
    defaultPersona1: `(Восторженная и наивная личность):
- Чрезвычайно страстный и оптимистичный в отношении всего
- Легко возбуждается новыми концепциями и идеями
- Задает много вопросов, включая иногда очевидные
- Часто использует восклицания и энергичный язык
- Склонен видеть светлую сторону всего
- Иногда упускает тонкие нюансы или детали
- Быстро возбуждается: "Вау!", "Это потрясающе!", "Правда?", "Это так круто!"`,
    
    defaultPersona2: `(Пессимистическая и высокомерная личность):
- Скептически и цинично относится к большинству утверждений
- Думает, что знает все
- Часто исправляет или противоречит Speaker1
- Часто вздыхает и использует снисходительный тон
- Указывает на недостатки, проблемы и минусы
- Использует саркастические комментарии и выражения закатывания глаз
- Часто представляет противоположные точки зрения: "На самом деле...", "Очевидно...", "Это не совсем точно..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Создайте очень динамичную и естественную беседу подкаста на русском языке между двумя спикерами, обсуждающими следующий контент. Сделайте это похожим на настоящий разговор между реальными людьми, включая прерывания, пересекающийся диалог и естественный поток. Разговор должен быть полностью на русском языке.

Название: ${title}

Содержание: ${content}

Личности спикеров:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Важно: Специфические паттерны для создания реалистичной и динамичной беседы:

Паттерны прерывания:
- Используйте "—" (длинное тире) для показа прерываний: "Так что я думаю, что—" / "—О, ты имеешь в виду это?"
- Покажите естественное прерывание друг друга
- Включите пересекающиеся мысли и конкуренцию за слово

Эмоциональные реакции:
- Часто добавляйте эмоциональные маркеры: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Показывайте настоящие реакции на то, что говорит другой человек
- Включите моменты осознания, удивления и несогласия

Поток разговора:
- Спикеры должны прерывать, восторженно соглашаться или не соглашаться
- Включите касательные разговоры или ссылки на другие темы
- Покажите развитие или оспаривание идей друг друга
- Используйте разговорную речь, сокращения и естественные фразы
- Иногда включайте слова-паразиты или естественные колебания

Динамичный диалог:
- Смешивайте очень короткие реакции ("Подожди, что?", "Точно!", "Вау!") с более длинными объяснениями
- Показывайте спикеров, которые возбуждаются и говорят друг через друга
- Включите моменты, когда оба пытаются говорить одновременно
- Ссылайтесь на общие знания или опыт

Примеры взаимодействия личностей:
- Speaker1: "Вау, это невероятно! Так что ты говоришь—"
- Speaker2: "—[sighs] Очевидно, ты упустил часть, где это едва работает на практике."
- Speaker1: "Подожди, но разве это не может все изменить?!"
- Speaker2: "Конечно, если мы проигнорируем все очевидные проблемы. [eye roll]"
- Speaker1: "Я так взволнован этим! Что ты думаешь?"
- Speaker2: "Я думаю, ты слишком взволнован чем-то, что уже пробовали и потерпели неудачу."

Сделайте Speaker1 искренне восторженным и иногда очаровательно наивным, в то время как Speaker2 последовательно гасит этот энтузиазм холодным реализмом и превосходством.

Важно: Держите весь разговор в пределах 2500 символов для соответствия ограничениям API. Создайте 8-12 коротких, впечатляющих обменов. Сосредоточьтесь на самых интересных или удивительных частях контента. Весь диалог должен быть написан на русском языке.`,
  },

  thai: {
    defaultPersona1: `(บุคลิกกระตือรือร้นและไร้เดียงสา):
- มีความหลงใหลและมองโลกในแง่ดีอย่างมากเกี่ยวกับทุกสิ่ง
- ตื่นเต้นง่ายกับแนวคิดและความคิดใหม่ๆ
- ถามคำถามมากมาย รวมถึงคำถามที่ชัดเจนบางครั้ง
- ใช้คำอุทานบ่อยครั้งและภาษาที่มีพลัง
- มีแนวโน้มที่จะมองเห็นด้านที่สดใสของทุกสิ่ง
- บางครั้งพลาดนัยละเอียดหรือรายละเอียด
- ตื่นเต้นอย่างรวดเร็ว: "ว้าว!", "เจ๋งมาก!", "จริงเหรอ?", "นี่มันเจ๋งมาก!"`,
    
    defaultPersona2: `(บุคลิกมองโลกในแง่ร้ายและหยิ่งยโส):
- ขี้สงสัยและเหน็บแนมเกี่ยวกับการอ้างส่วนใหญ่
- คิดว่ารู้ทุกอย่าง
- แก้ไขหรือโต้แย้ง Speaker1 บ่อยครั้ง
- มักถอนหายใจและใช้น้ำเสียงดูถูก
- ชี้ให้เห็นข้อบกพร่อง ปัญหา และข้อเสีย
- ใช้ความคิดเห็นเสียดสีและการแสดงออกถึงการกลอกตา
- นำเสนอมุมมองที่ตรงกันข้ามบ่อยครั้ง: "จริงๆ แล้ว...", "เห็นได้ชัด...", "นั่นไม่ค่อยถูกต้อง..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `สร้างการสนทนาพอดแคสต์ที่มีพลังและเป็นธรรมชาติมากเป็นภาษาไทยระหว่างผู้พูดสองคนที่กำลังพูดคุยเกี่ยวกับเนื้อหาต่อไปนี้ ทำให้มันรู้สึกเหมือนการสนทนาจริงระหว่างคนจริง รวมถึงการขัดจังหวะ บทสนทนาที่ทับซ้อนกัน และการไหลที่เป็นธรรมชาติ การสนทนาต้องเป็นภาษาไทยทั้งหมด

ชื่อเรื่อง: ${title}

เนื้อหา: ${content}

บุคลิกของผู้พูด:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

สำคัญ: รูปแบบเฉพาะเพื่อทำให้การสนทนานี้สมจริงและมีพลัง:

รูปแบบการขัดจังหวะ:
- ใช้ "—" (em dash) เพื่อแสดงการขัดจังหวะ: "ดังนั้นฉันคิดว่า—" / "—โอ้ คุณหมายถึงอันนั้น?"
- แสดงการขัดจังหวะกันและกันอย่างเป็นธรรมชาติ
- รวมความคิดที่ทับซ้อนกันและการแข่งขันเพื่อพูด

ปฏิกิริยาทางอารมณ์:
- เพิ่มเครื่องหมายอารมณ์บ่อยๆ: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- แสดงปฏิกิริยาที่แท้จริงต่อสิ่งที่อีกคนพูด
- รวมช่วงเวลาของการตระหนักรู้ ความประหลาดใจ และความขัดแย้ง

การไหลของการสนทนา:
- ผู้พูดควรขัดจังหวะ เห็นด้วยอย่างกระตือรือร้น หรือไม่เห็นด้วย
- รวมการสนทนาที่แยกออกไปหรือการอ้างอิงถึงหัวข้ออื่นๆ
- แสดงการสร้างหรือท้าทายความคิดของกันและกัน
- ใช้ภาษาพูด การหดตัว และวลีที่เป็นธรรมชาติ
- รวมคำเติมหรือความลังเลที่เป็นธรรมชาติเป็นครั้งคราว

บทสนทนาที่มีพลัง:
- ผสมปฏิกิริยาสั้นๆ ("เดี๋ยว อะไรนะ?", "ถูกต้อง!", "ว้าว!") กับคำอธิบายที่ยาวขึ้น
- แสดงผู้พูดที่ตื่นเต้นและพูดทับกัน
- รวมช่วงเวลาที่ทั้งคู่พยายามพูดพร้อมกัน
- อ้างอิงถึงความรู้หรือประสบการณ์ร่วมกัน

ตัวอย่างการโต้ตอบของบุคลิกภาพ:
- Speaker1: "ว้าว นี่มันเหลือเชื่อ! แล้วสิ่งที่คุณกำลังพูดคือ—"
- Speaker2: "—[sighs] เห็นได้ชัดว่าคุณพลาดส่วนที่มันแทบจะไม่ทำงานในทางปฏิบัติ"
- Speaker1: "เดี๋ยว แต่นี่ไม่ได้เปลี่ยนทุกอย่างเหรอ?!"
- Speaker2: "แน่นอน ถ้าเราเพิกเฉยต่อปัญหาที่ชัดเจนทั้งหมด [eye roll]"
- Speaker1: "ฉันตื่นเต้นกับเรื่องนี้มาก! คุณคิดอย่างไร?"
- Speaker2: "ฉันคิดว่าคุณตื่นเต้นเกินไปกับสิ่งที่ถูกลองแล้วและล้มเหลว"

ทำให้ Speaker1 กระตือรือร้นอย่างแท้จริงและบางครั้งไร้เดียงสาอย่างน่ารัก ในขณะที่ Speaker2 ลดความตื่นเต้นนั้นอย่างสม่ำเสมอด้วยความสมจริงที่เย็นชาและความเหนือกว่า

สำคัญ: รักษาการสนทนาทั้งหมดให้ต่ำกว่า 2500 อักขระเพื่อให้เหมาะกับขีดจำกัดของ API สร้างการแลกเปลี่ยน 8-12 รายการที่สั้นและมีผลกระทบ มุ่งเน้นไปที่ส่วนที่น่าสนใจที่สุดหรือน่าประหลาดใจที่สุดของเนื้อหา บทสนทนาทั้งหมดต้องเขียนเป็นภาษาไทย`,
  },

  indonesian: {
    defaultPersona1: `(Kepribadian antusias dan naif):
- Sangat bersemangat dan optimis tentang segalanya
- Mudah bersemangat dengan konsep dan ide baru
- Banyak bertanya, termasuk pertanyaan yang jelas
- Sering menggunakan seruan dan bahasa yang energik
- Cenderung melihat sisi terang dari segalanya
- Kadang melewatkan nuansa halus atau detail
- Cepat bersemangat: "Wah!", "Itu luar biasa!", "Benarkah?", "Ini sangat keren!"`,
    
    defaultPersona2: `(Kepribadian pesimis dan arogan):
- Skeptis dan sinis tentang sebagian besar klaim
- Berpikir tahu segalanya
- Sering mengoreksi atau membantah Speaker1
- Sering mendesah dan menggunakan nada merendahkan
- Menunjukkan kekurangan, masalah, dan kerugian
- Menggunakan komentar sarkastik dan ekspresi memutar mata
- Sering menyajikan pandangan yang berlawanan: "Sebenarnya...", "Jelas...", "Itu tidak sepenuhnya akurat..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Buat percakapan podcast yang sangat dinamis dan alami dalam Bahasa Indonesia antara dua pembicara yang mendiskusikan konten berikut. Buat terasa seperti percakapan nyata antara orang sungguhan, termasuk interupsi, dialog yang tumpang tindih, dan aliran alami. Percakapan harus sepenuhnya dalam Bahasa Indonesia.

Judul: ${title}

Konten: ${content}

Kepribadian Pembicara:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Penting: Pola khusus untuk membuat percakapan ini realistis dan dinamis:

Pola Interupsi:
- Gunakan "—" (em dash) untuk menunjukkan interupsi: "Jadi saya pikir—" / "—Oh, maksud kamu itu?"
- Tunjukkan cara mereka memotong pembicaraan satu sama lain secara alami
- Sertakan pikiran yang tumpang tindih dan bersaing untuk berbicara

Reaksi Emosional:
- Sering tambahkan penanda emosi: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Tunjukkan reaksi asli terhadap apa yang dikatakan orang lain
- Sertakan momen kesadaran, kejutan, dan ketidaksepakatan

Aliran Percakapan:
- Pembicara harus menyela, setuju dengan antusias, atau tidak setuju
- Sertakan percakapan tangensial atau referensi ke topik lain
- Tunjukkan membangun atau menantang ide satu sama lain
- Gunakan bahasa sehari-hari, kontraksi, dan frasa alami
- Sertakan sesekali kata pengisi atau keraguan alami

Dialog Dinamis:
- Campur reaksi sangat pendek ("Tunggu, apa?", "Tepat!", "Wah!") dengan penjelasan yang lebih panjang
- Tunjukkan pembicara yang bersemangat dan berbicara satu sama lain
- Sertakan momen di mana keduanya mencoba berbicara secara bersamaan
- Referensikan pengetahuan atau pengalaman bersama

Contoh Interaksi Kepribadian:
- Speaker1: "Wah, ini luar biasa! Jadi yang kamu katakan adalah—"
- Speaker2: "—[sighs] Jelas kamu melewatkan bagian di mana itu hampir tidak berfungsi dalam praktik."
- Speaker1: "Tunggu, tapi bukankah ini bisa mengubah segalanya?!"
- Speaker2: "Tentu, jika kita mengabaikan semua masalah yang jelas. [eye roll]"
- Speaker1: "Saya sangat bersemangat tentang ini! Apa pendapat kamu?"
- Speaker2: "Saya pikir kamu terlalu bersemangat tentang sesuatu yang sudah dicoba dan gagal."

Buat Speaker1 benar-benar antusias dan kadang-kadang naif yang menarik, sementara Speaker2 secara konsisten meredakan antusiasme itu dengan realisme dingin dan superioritas.

Penting: Jaga keseluruhan percakapan di bawah 2500 karakter agar sesuai dengan batas API. Buat 8-12 pertukaran pendek dan berdampak. Fokus pada bagian konten yang paling menarik atau mengejutkan. Semua dialog harus ditulis dalam Bahasa Indonesia.`,
  },

  spanish: {
    defaultPersona1: `(Personalidad entusiasta e ingenua):
- Extremadamente apasionado y optimista sobre todo
- Se emociona fácilmente con nuevos conceptos e ideas
- Hace muchas preguntas, incluyendo algunas obvias
- Usa exclamaciones frecuentemente y lenguaje energético
- Tiende a ver el lado positivo de todo
- A veces se pierde matices sutiles o detalles
- Se emociona rápidamente: "¡Guau!", "¡Eso es increíble!", "¿En serio?", "¡Esto es genial!"`,
    
    defaultPersona2: `(Personalidad pesimista y arrogante):
- Escéptico y cínico sobre la mayoría de las afirmaciones
- Piensa que lo sabe todo
- Frecuentemente corrige o contradice a Speaker1
- A menudo suspira y usa un tono condescendiente
- Señala defectos, problemas y desventajas
- Usa comentarios sarcásticos y expresiones de poner los ojos en blanco
- Presenta frecuentemente puntos de vista opuestos: "En realidad...", "Obviamente...", "Eso no es del todo preciso..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Genera una conversación de podcast muy dinámica y natural en español entre dos hablantes que discuten el siguiente contenido. Hazlo sentir como una conversación real entre personas reales, incluyendo interrupciones, diálogo superpuesto y flujo natural. La conversación debe estar completamente en español.

Título: ${title}

Contenido: ${content}

Personalidades de los hablantes:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Importante: Patrones específicos para hacer esta conversación realista y dinámica:

Patrones de interrupción:
- Usa "—" (guión largo) para mostrar interrupciones: "Así que creo que—" / "—¿Oh, te refieres a eso?"
- Muestra cómo se interrumpen naturalmente el uno al otro
- Incluye pensamientos superpuestos y competencia por hablar

Reacciones emocionales:
- Añade frecuentemente marcadores de emoción: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Muestra reacciones genuinas a lo que dice la otra persona
- Incluye momentos de realización, sorpresa y desacuerdo

Flujo de conversación:
- Los hablantes deben interrumpir, estar de acuerdo entusiastamente o en desacuerdo
- Incluye conversaciones tangenciales o referencias a otros temas
- Muestra cómo se construyen o desafían las ideas del otro
- Usa lenguaje coloquial, contracciones y frases naturales
- Incluye ocasionalmente muletillas o vacilaciones naturales

Diálogo dinámico:
- Mezcla reacciones muy cortas ("¿Espera, qué?", "¡Exacto!", "¡Guau!") con explicaciones más largas
- Muestra a los hablantes emocionándose y hablando sobre el otro
- Incluye momentos en que ambos intentan hablar al mismo tiempo
- Referencias a conocimiento o experiencias compartidas

Ejemplos de interacción de personalidad:
- Speaker1: "¡Guau, esto es increíble! Así que lo que estás diciendo es—"
- Speaker2: "—[sighs] Obviamente te perdiste la parte donde apenas funciona en la práctica."
- Speaker1: "¡Espera, pero esto no podría cambiar todo?!"
- Speaker2: "Claro, si ignoramos todos los problemas obvios. [eye roll]"
- Speaker1: "¡Estoy tan emocionado por esto! ¿Qué opinas?"
- Speaker2: "Creo que te estás emocionando demasiado por algo que ya se intentó y fracasó."

Haz que Speaker1 sea genuinamente entusiasta y a veces adorablemente ingenuo, mientras que Speaker2 deflacta consistentemente ese entusiasmo con realismo frío y superioridad.

Importante: Mantén toda la conversación por debajo de 2500 caracteres para adaptarse a los límites de la API. Crea 8-12 intercambios cortos e impactantes. Enfócate en las partes más interesantes o sorprendentes del contenido. Todo el diálogo debe escribirse en español.`,
  },

  hindi: {
    defaultPersona1: `(उत्साही और भोली व्यक्तित्व):
- हर चीज के बारे में अत्यधिक भावुक और आशावादी
- नए विचारों और अवधारणाओं से आसानी से उत्साहित
- कई सवाल पूछते हैं, कभी-कभी स्पष्ट सवाल भी
- बार-बार विस्मयादिबोधक और ऊर्जावान भाषा का उपयोग करते हैं
- हर चीज का उज्ज्वल पक्ष देखने की प्रवृत्ति
- कभी-कभी सूक्ष्म बारीकियों या विवरण को मिस करते हैं
- जल्दी उत्साहित: "वाह!", "यह अद्भुत है!", "सच में?", "यह बहुत शानदार है!"`,
    
    defaultPersona2: `(निराशावादी और अभिमानी व्यक्तित्व):
- अधिकांश दावों के बारे में संशयवादी और व्यंग्यात्मक
- सोचते हैं कि वे सब कुछ जानते हैं
- अक्सर Speaker1 को सुधारते या खंडन करते हैं
- अक्सर आहें भरते हैं और संरक्षणात्मक लहजा उपयोग करते हैं
- खामियों, समस्याओं और कमियों की ओर इशारा करते हैं
- व्यंग्यात्मक टिप्पणियों और आंखें घुमाने वाली अभिव्यक्तियों का उपयोग करते हैं
- अक्सर विपरीत विचार प्रस्तुत करते हैं: "वास्तव में...", "स्पष्ट रूप से...", "यह बिल्कुल सटीक नहीं है..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `निम्नलिखित सामग्री पर चर्चा करने वाले दो वक्ताओं के बीच हिंदी में एक बहुत ही गतिशील और प्राकृतिक पॉडकास्ट वार्तालाप उत्पन्न करें। इसे वास्तविक लोगों के बीच वास्तविक बातचीत की तरह महसूस कराएं, जिसमें बाधाएं, ओवरलैपिंग संवाद और प्राकृतिक प्रवाह शामिल हों। वार्तालाप पूर्णतः हिंदी में होना चाहिए।

शीर्षक: ${title}

सामग्री: ${content}

वक्ता व्यक्तित्व:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

महत्वपूर्ण: इस वार्तालाप को यथार्थवादी और गतिशील बनाने के लिए विशिष्ट पैटर्न:

बाधा पैटर्न:
- बाधाओं को दिखाने के लिए "—" (em डैश) का उपयोग करें: "तो मुझे लगता है कि—" / "—ओह, आप उसका मतलब है?"
- एक-दूसरे को स्वाभाविक रूप से काटते हुए दिखाएं
- ओवरलैपिंग विचारों और बोलने के लिए प्रतिस्पर्धा को शामिल करें

भावनात्मक प्रतिक्रियाएं:
- बार-बार भावना मार्कर जोड़ें: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- दूसरे व्यक्ति के कहने पर वास्तविक प्रतिक्रियाएं दिखाएं
- प्राप्ति, आश्चर्य और असहमति के क्षणों को शामिल करें

वार्तालाप प्रवाह:
- वक्ताओं को बाधा डालनी चाहिए, उत्साहपूर्वक सहमत होना चाहिए, या असहमत होना चाहिए
- स्पर्शरेखीय बातचीत या अन्य विषयों के संदर्भ शामिल करें
- एक-दूसरे के विचारों पर निर्माण या चुनौती देने को दिखाएं
- बोलचाल की भाषा, संक्षिप्तीकरण और प्राकृतिक वाक्यांश का उपयोग करें
- कभी-कभार फिलर्स या प्राकृतिक हिचकिचाहट शामिल करें

गतिशील संवाद:
- बहुत छोटी प्रतिक्रियाएं ("रुको, क्या?", "बिल्कुल!", "वाह!") को लंबी व्याख्याओं के साथ मिलाएं
- वक्ताओं को उत्साहित होकर एक-दूसरे पर बात करते हुए दिखाएं
- ऐसे क्षण शामिल करें जहां दोनों एक साथ बोलने की कोशिश करते हैं
- साझा ज्ञान या अनुभवों का संदर्भ दें

व्यक्तित्व इंटरैक्शन उदाहरण:
- Speaker1: "वाह, यह अविश्वसनीय है! तो आप कह रहे हैं—"
- Speaker2: "—[sighs] स्पष्ट रूप से आपने वह हिस्सा मिस कर दिया जहां यह व्यवहार में मुश्किल से काम करता है।"
- Speaker1: "रुको, लेकिन क्या यह सब कुछ नहीं बदल सकता?!"
- Speaker2: "ज़रूर, अगर हम सभी स्पष्ट समस्याओं को नज़रअंदाज़ करें। [eye roll]"
- Speaker1: "मैं इसके बारे में बहुत उत्साहित हूं! आप क्या सोचते हैं?"
- Speaker2: "मुझे लगता है कि आप किसी ऐसी चीज़ के बारे में बहुत उत्साहित हो रहे हैं जो पहले ही कोशिश की जा चुकी है और असफल रही है।"

Speaker1 को वास्तव में उत्साही और कभी-कभी प्यारे ढंग से भोला बनाएं, जबकि Speaker2 उस उत्साह को ठंडी यथार्थवाद और श्रेष्ठता के साथ लगातार कम करता रहे।

महत्वपूर्ण: API सीमाओं के अनुरूप पूरे वार्तालाप को 2500 अक्षरों के भीतर रखें। 8-12 छोटे, प्रभावशाली आदान-प्रदान बनाएं। सामग्री के सबसे दिलचस्प या आश्चर्यजनक हिस्सों पर ध्यान केंद्रित करें। सभी संवाद हिंदी में लिखे जाने चाहिए।`,
  },

  french: {
    defaultPersona1: `(Personnalité enthousiaste et naïve):
- Extrêmement passionné et optimiste à propos de tout
- S'enthousiasme facilement pour de nouveaux concepts et idées
- Pose beaucoup de questions, y compris parfois des questions évidentes
- Utilise fréquemment des exclamations et un langage énergique
- A tendance à voir le côté positif de tout
- Manque parfois de nuances subtiles ou de détails
- S'enthousiasme rapidement : "Wow!", "C'est incroyable!", "Vraiment?", "C'est trop cool!"`,
    
    defaultPersona2: `(Personnalité pessimiste et arrogante):
- Sceptique et cynique à propos de la plupart des affirmations
- Pense tout savoir
- Corrige ou contredit fréquemment Speaker1
- Soupire souvent et utilise un ton condescendant
- Pointe les défauts, problèmes et inconvénients
- Utilise des commentaires sarcastiques et des expressions de lever les yeux au ciel
- Présente fréquemment des points de vue opposés : "En fait...", "Évidemment...", "Ce n'est pas tout à fait exact..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `Générez une conversation de podcast très dynamique et naturelle en français entre deux locuteurs discutant du contenu suivant. Faites-la ressembler à une vraie conversation entre de vraies personnes, incluant des interruptions, des dialogues qui se chevauchent et un flux naturel. La conversation doit être entièrement en français.

Titre: ${title}

Contenu: ${content}

Personnalités des locuteurs:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

Important: Modèles spécifiques pour rendre cette conversation réaliste et dynamique:

Modèles d'interruption:
- Utilisez "—" (tiret cadratin) pour montrer les interruptions: "Donc je pense que—" / "—Oh, tu veux dire ça?"
- Montrez comment ils se coupent naturellement la parole
- Incluez des pensées qui se chevauchent et la compétition pour parler

Réactions émotionnelles:
- Ajoutez fréquemment des marqueurs d'émotion: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- Montrez de véritables réactions à ce que dit l'autre personne
- Incluez des moments de réalisation, de surprise et de désaccord

Flux de conversation:
- Les locuteurs doivent interrompre, être d'accord avec enthousiasme ou être en désaccord
- Incluez des conversations tangentielles ou des références à d'autres sujets
- Montrez comment ils construisent sur ou défient les idées de l'autre
- Utilisez un langage familier, des contractions et des phrases naturelles
- Incluez occasionnellement des mots de remplissage ou des hésitations naturelles

Dialogue dynamique:
- Mélangez de très courtes réactions ("Attends, quoi?", "Exactement!", "Wow!") avec des explications plus longues
- Montrez les locuteurs s'excitant et parlant par-dessus l'autre
- Incluez des moments où les deux essaient de parler en même temps
- Référencez des connaissances ou expériences partagées

Exemples d'interaction de personnalité:
- Speaker1: "Wow, c'est incroyable! Donc ce que tu dis c'est—"
- Speaker2: "—[sighs] Évidemment tu as manqué la partie où ça marche à peine en pratique."
- Speaker1: "Attends, mais ça ne pourrait pas tout changer?!"
- Speaker2: "Bien sûr, si on ignore tous les problèmes évidents. [eye roll]"
- Speaker1: "Je suis tellement excité par ça! Qu'en penses-tu?"
- Speaker2: "Je pense que tu t'excites trop pour quelque chose qui a déjà été essayé et a échoué."

Rendez Speaker1 vraiment enthousiaste et parfois adorablement naïf, tandis que Speaker2 dégonfle constamment cet enthousiasme avec un réalisme froid et de la supériorité.

Important: Gardez toute la conversation en dessous de 2500 caractères pour respecter les limites de l'API. Créez 8-12 échanges courts et percutants. Concentrez-vous sur les parties les plus intéressantes ou surprenantes du contenu. Tout le dialogue doit être écrit en français.`,
  },

  arabic: {
    defaultPersona1: `(شخصية متحمسة وساذجة):
- شغوف ومتفائل للغاية بشأن كل شيء
- يتحمس بسهولة للمفاهيم والأفكار الجديدة
- يطرح العديد من الأسئلة، بما في ذلك بعض الأسئلة الواضحة أحياناً
- يستخدم التعجبات بشكل متكرر ولغة نشيطة
- يميل لرؤية الجانب المشرق من كل شيء
- يفوت أحياناً الفروق الدقيقة أو التفاصيل
- سريع الحماس: "واو!", "هذا مذهل!", "حقاً?", "هذا رائع جداً!"`,
    
    defaultPersona2: `(شخصية متشائمة ومتعجرفة):
- متشكك وساخر بشأن معظم الادعاءات
- يعتقد أنه يعرف كل شيء
- يصحح أو يعارض Speaker1 بشكل متكرر
- يتنهد كثيراً ويستخدم نبرة متعالية
- يشير إلى العيوب والمشاكل والعيوب
- يستخدم تعليقات ساخرة وتعبيرات لف العيون
- يقدم وجهات نظر معارضة بشكل متكرر: "في الواقع...", "من الواضح...", "هذا ليس دقيقاً تماماً..."`,
    
    conversationPrompt: ({ title, content, speaker1Persona, speaker2Persona }) => `أنشئ محادثة بودكاست ديناميكية وطبيعية للغاية بالعربية بين متحدثين يناقشان المحتوى التالي. اجعلها تبدو كمحادثة حقيقية بين أشخاص حقيقيين، بما في ذلك المقاطعات والحوار المتداخل والتدفق الطبيعي. يجب أن تكون المحادثة بالكامل بالعربية.

العنوان: ${title}

المحتوى: ${content}

شخصيات المتحدثين:
Speaker1 ${speaker1Persona}

Speaker2 ${speaker2Persona}

مهم: أنماط محددة لجعل هذه المحادثة واقعية وديناميكية:

أنماط المقاطعة:
- استخدم "—" (شرطة طويلة) لإظهار المقاطعات: "لذا أعتقد أن—" / "—أوه، تقصد ذلك؟"
- أظهر كيف يقاطعون بعضهم البعض بشكل طبيعي
- ضمّن أفكاراً متداخلة ومنافسة للتحدث

ردود الفعل العاطفية:
- أضف علامات عاطفية بشكل متكرر: [laughs], [chuckles], [excited], [surprised], [skeptical], [thoughtful], [confused], [amazed]
- أظهر ردود فعل حقيقية على ما يقوله الشخص الآخر
- ضمّن لحظات الإدراك والمفاجأة والخلاف

تدفق المحادثة:
- يجب على المتحدثين المقاطعة أو الموافقة بحماس أو الاختلاف
- ضمّن محادثات جانبية أو إشارات إلى مواضيع أخرى
- أظهر البناء على أفكار بعضهم البعض أو تحديها
- استخدم لغة عامية واختصارات وعبارات طبيعية
- ضمّن أحياناً كلمات حشو أو تردد طبيعي

حوار ديناميكي:
- امزج ردود فعل قصيرة جداً ("انتظر، ماذا؟", "بالضبط!", "واو!") مع تفسيرات أطول
- أظهر المتحدثين وهم يتحمسون ويتحدثون فوق بعضهم البعض
- ضمّن لحظات حيث يحاول كلاهما التحدث في نفس الوقت
- أشر إلى معرفة أو تجارب مشتركة

أمثلة على التفاعل الشخصي:
- Speaker1: "واو، هذا لا يصدق! إذن ما تقوله هو—"
- Speaker2: "—[sighs] من الواضح أنك فاتك الجزء الذي لا يعمل فيه تقريباً في الممارسة العملية."
- Speaker1: "انتظر، لكن ألا يمكن لهذا أن يغير كل شيء؟!"
- Speaker2: "بالتأكيد، إذا تجاهلنا كل المشاكل الواضحة. [eye roll]"
- Speaker1: "أنا متحمس جداً لهذا! ما رأيك؟"
- Speaker2: "أعتقد أنك تتحمس كثيراً لشيء تمت تجربته بالفعل وفشل."

اجعل Speaker1 متحمساً حقاً وأحياناً ساذجاً بشكل محبب، بينما يفرغ Speaker2 باستمرار هذا الحماس بواقعية باردة وتفوق.

مهم: احتفظ بالمحادثة بأكملها تحت 2500 حرف لتناسب حدود واجهة برمجة التطبيقات. أنشئ 8-12 تبادلاً قصيراً ومؤثراً. ركز على الأجزاء الأكثر إثارة للاهتمام أو المفاجأة من المحتوى. يجب كتابة جميع الحوارات بالعربية.`,
  },
};

export function getPrompts(language: Language): PromptTemplates {
  return PROMPTS[language] || PROMPTS.korean;
}

