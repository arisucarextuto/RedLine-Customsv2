# RedLine Customs Cloudflare版

Cloudflare Pages + Pages Functions + D1 で動作する料金計算・作業履歴システムです。

## 主な機能
- 一般 / PD / EMS の料金計算
- PD / EMS は「修理」「Duct Tape」「Exterior & Paint」以外を50%引き
- Duct Tapeは1人10個まで
- 請求内容・お礼文のコピー
- ログインとスタッフ名の自動記録
- 管理者のみ料金表・スタッフ管理
- スタッフは自分自身のパスワードのみ変更
- 作業履歴をD1へ保存
- 作業履歴 / 料金表 / スタッフ一覧のCSV出力（パスワードは出力しません）
- 商品削除・スタッフ削除は履歴保全のため無効化方式

## 初期管理者
- ユーザー名: `admin`
- 初期パスワード: `change-me-now`

初回ログイン後、必ずパスワードを変更してください。

## Cloudflare導入
1. GitHubにこのフォルダをRepositoryとしてアップロード。
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Git連携。
3. D1 Databaseで `redline-customs-db` を作成。
4. D1のSQLコンソールで `schema.sql` → `seed.sql` の順に実行。
5. Pagesプロジェクト → Settings → Bindings → D1 database bindings → Variable nameを `DB` にしてD1を選択。
6. 再デプロイ。

Pages Functionsを含むため、Git連携またはWranglerでのデプロイを使用してください。DashboardからFunctions付きPagesを単純なDirect Uploadで公開する方式には対応していません。

## 注意
- `schema.sql` と `seed.sql` は初回セットアップ用です。運用中のD1に繰り返し投入しないでください。
- D1が実データの本体です。CSVはバックアップ・確認用のエクスポートです。
- HTTPS環境で利用してください。Cloudflare Pagesの標準URLはHTTPSです。
