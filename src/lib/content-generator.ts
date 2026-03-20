import Anthropic from '@anthropic-ai/sdk';
import { getNode } from './graph';
import type { Term } from '@/types';

export interface GeneratedContent {
  content: string;
  terms: Term[];
  diagrams: { name: string; svg: string }[];
}

const client = new Anthropic();

function getContentLevelInstruction(level: string): string {
  switch (level) {
    case 'beginner':
      return `【説明レベル: 初心者向け】
- 専門用語は最小限にし、使う場合は必ず噛み砕いて説明する
- 数式は本当に必要なものだけ使い、必ず日本語で意味を補足する
- 身近な例え話やイメージを多用する
- 各セクションは1〜2段落で簡潔にまとめる
- 「なぜこれを学ぶと嬉しいのか」を重視する
- 中学〜高校生でもわかる文章で書く`;
    case 'advanced':
      return `【説明レベル: 上級者向け】
- 厳密な定義・定理・証明のスケッチを含める
- 数式を積極的に使用し、形式的な記述を重視する
- 各セクションは3〜5段落の充実した内容にする
- 歴史的背景や発展の経緯にも触れる
- 関連する未解決問題や発展的トピックにも言及する
- 大学数学の教科書レベルの正確さで書く`;
    default:
      return `【説明レベル: 標準】
- わかりやすさと正確さのバランスを重視する
- 各セクションは2〜3段落で適度な分量にする
- 数式は必要に応じて使い、直感的な説明も添える
- 具体例は2つ以上挙げる
- 大学初年度レベルの読者を想定する`;
  }
}

function buildPrompt(nodeLabel: string, nodeId: string, difficulty: number, description: string, area: string, contentLevel: string): string {
  const levelInstruction = getContentLevelInstruction(contentLevel);

  return `あなたは数学教育の専門家です。以下の数学概念について、学習コンテンツを生成してください。

概念: ${nodeLabel}（${nodeId}）
難易度: ${difficulty}/5
概要: ${description}
分野: ${area}

${levelInstruction}

以下の3つのセクションをJSON形式で返してください:

{
  "concept_mdx": "MDX形式の概念説明（以下の構成で）:
    # タイトル
    ## 何か — 直感的な説明
    ## なぜ必要か — 数学における位置づけ
    ## 核となるアイデア — 定義・定理の本質（数式は$...$や$$...$$で）
    ## 具体例 — 身近な例
    ## つながり — 他の概念との関係
    ## 他分野への応用 — 物理・化学・経済学・工学などでこの概念がどう使われるか",

  "terms": [
    { "term": "用語名", "reading": "よみがな", "en": "English Term", "definition": "簡潔な定義" }
  ],

  "diagram_svg": "この概念の核となる構造・関係性を視覚化するSVG図。概念マップ、フロー図、ベン図、座標系上の図示などから最適な形式を選択。条件: viewBox指定、幅600程度、背景透明。テキスト・ラベルには fill=\"currentColor\" を使用（テーマ自動対応）。線・矢印には stroke=\"currentColor\" を使用。強調色が必要な場合のみ固定色（#3b82f6 青, #ef4444 赤, #22c55e 緑）。塗りつぶし領域は fill=\"currentColor\" fill-opacity=\"0.1\"。font-family=\"system-ui, sans-serif\"。図中のラベルは日本語"
}

注意:
- 計算問題は出さない（概念理解に特化）
- 数式はKaTeX形式（$inline$, $$display$$）
- JSONのみを返してください（他の説明テキストは不要）`;
}

export async function generateContent(nodeId: string, options?: { contentLevel?: string; llmModel?: string }): Promise<GeneratedContent> {
  const node = getNode(nodeId);
  if (!node) {
    throw new Error(`Node "${nodeId}" not found in graph data`);
  }

  const model = options?.llmModel || 'claude-sonnet-4-6';
  const level = options?.contentLevel || 'standard';
  const response = await client.messages.create({
    model,
    max_tokens: 12000,
    messages: [
      {
        role: 'user',
        content: buildPrompt(node.label, node.id, node.difficulty, node.description, node.area, level),
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from Claude response');
  }

  const generated = JSON.parse(jsonMatch[0]);

  const diagrams: { name: string; svg: string }[] = generated.diagram_svg
    ? [{ name: 'concept-diagram.svg', svg: generated.diagram_svg }]
    : [];

  const result: GeneratedContent = {
    content: generated.concept_mdx,
    terms: generated.terms || [],
    diagrams,
  };

  console.log(`Content generated for "${node.label}" (${nodeId})`);

  return result;
}

