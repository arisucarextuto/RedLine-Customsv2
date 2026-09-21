import {
    json,
    body,
    verifyPassword,
    randomToken,
    sha256
} from '../_shared.js';

export async function onRequestPost({ request, env }) {
    try {
        // D1接続確認
        if (!env?.DB) {
            return json({
                ok: false,
                error: 'D1のDBバインディングが見つかりません。'
            }, 500);
        }

        // リクエスト取得
        const data = await body(request);

        const username = String(data?.username ?? '').trim();
        const password = String(data?.password ?? '');

        if (!username || !password) {
            return json({
                ok: false,
                error: 'ユーザー名とパスワードを入力してください。'
            }, 400);
        }

        // ユーザー検索
        const user = await env.DB.prepare(`
            SELECT
                id,
                username,
                display_name,
                role,
                active,
                password_hash
            FROM users
            WHERE username = ?
            LIMIT 1
        `)
            .bind(username)
            .first();

        // ユーザーが存在しない
        if (!user || !user.active) {
            return json({
                ok: false,
                error: 'ユーザー名またはパスワードが正しくありません。'
            }, 401);
        }

        // パスワード確認
        const valid = await verifyPassword(
            password,
            user.password_hash
        );

        if (!valid) {
            return json({
                ok: false,
                error: 'ユーザー名またはパスワードが正しくありません。'
            }, 401);
        }

        // セッション用トークン作成
        const sessionToken = randomToken(32);

        // DBにはトークンそのものではなくSHA-256を保存
        const tokenHash = await sha256(sessionToken);

        // CSRFトークン
        const csrfToken = randomToken(32);

        // セッション有効期限
        const expiresAt = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7
        ).toISOString();

        // セッション保存
        await env.DB.prepare(`
            INSERT INTO sessions (
                token_hash,
                user_id,
                csrf_token,
                expires_at
            )
            VALUES (?, ?, ?, ?)
        `)
            .bind(
                tokenHash,
                user.id,
                csrfToken,
                expiresAt
            )
            .run();

        // Cookie
        const cookie = [
            `rl_session=${sessionToken}`,
            'Path=/',
            'HttpOnly',
            'Secure',
            'SameSite=Lax',
            `Max-Age=${60 * 60 * 24 * 7}`
        ].join('; ');

        return json(
            {
                ok: true,
                user: {
                    id: user.id,
                    username: user.username,
                    display_name: user.display_name,
                    role: user.role
                }
            },
            200,
            {
                'Set-Cookie': cookie
            }
        );

    } catch (error) {
        console.error('LOGIN ERROR:', error);

        return json({
            ok: false,
            error: 'ログイン処理中にサーバーエラーが発生しました。',
            detail: String(error?.message || error)
        }, 500);
    }
}
