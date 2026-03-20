# plactice_math

数学の概念を一歩ずつ学べる個人用Webアプリ。FFXのスフィア盤のようなスキルマップで学習進捗を可視化し、基礎から大学数学までカバーします。

## 機能

- **スキルマップ** — 18の数学概念をインタラクティブなグラフで表示。前提関係に沿って学習を進める
- **概念学習** — MDX + KaTeX数式 + SVG図解による学習コンテンツ
- **進捗管理** — ノードの完了/学習中ステータスをS3で永続化。前提ノード完了で次のノードが解放
- **AI コンテンツ生成** — Claude APIで学習コンテンツを自動生成

## 技術スタック

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript 5
- Tailwind CSS 4
- @xyflow/react (React Flow) — グラフ可視化
- KaTeX — 数式レンダリング
- AWS S3 — 進捗データ保存
- Claude API — コンテンツ生成

## セットアップ

```bash
npm install
cp .env.sample .env.local
```

`.env.local` を編集して環境変数を設定:

| 変数名 | 説明 |
|--------|------|
| `PASSWORD_HASH` | ログインパスワードのSHA-256ハッシュ |
| `SESSION_SECRET` | セッショントークン生成用のランダム文字列 |
| `AWS_ACCESS_KEY_ID` | AWS認証情報 |
| `AWS_SECRET_ACCESS_KEY` | AWS認証情報 |
| `AWS_REGION` | S3リージョン（デフォルト: `ap-northeast-1`）|
| `S3_BUCKET` | S3バケット名（デフォルト: `plactice-math`）|
| `ANTHROPIC_API_KEY` | Claude APIキー（コンテンツ生成用）|

## 開発

```bash
npm run dev
```

http://localhost:3000 でアプリが起動します。

## コンテンツ生成

```bash
npm run generate-content -- --node counting
```

指定ノードの学習コンテンツ（MDX, 用語集, SVG図解）をClaude AIで生成します。

## ビルド・Lint

```bash
npm run lint
npm run build
```

## デプロイ

Vercelにデプロイ済み。環境変数はVercelダッシュボードで設定。
