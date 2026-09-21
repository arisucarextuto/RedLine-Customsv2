import {
    json,
    body,
    hashPassword
} from '../../_shared.js';

export async function onRequestPost({ request, env }) {
    try {
        if (!env?.DB) {
            return json({
                ok: false,
                error: 'D1のDBバインディングが見つかりません。'
            }, 500);
        }

        // 一時的なリセットキー
        const RESET_KEY = 'RL-RESET-2026-CHANGE-ME';

        const data = await body(request);

        const resetKey = String(
            data?.resetKey ?? ''
        );

        const newPassword = String(
            data?.newPassword ?? ''
        );

        // リセットキー確認
        if (resetKey !== RESET_KEY) {
            return json({
                ok: false,
                error: 'リセットキーが正しくありません。'
            }, 403);
        }

        // パスワード確認
        if (!newPassword) {
            return json({
                ok: false,
                error: '新しいパスワードを入力してください。'
            }, 400);
        }

        if (newPassword.length < 8) {
            return json({
                ok: false,
                error: 'パスワードは8文字以上にしてください。'
            }, 400);
        }

        // adminユーザー取得
        const user = await env.DB.prepare(`
            SELECT
                id,
                username,
                active
            FROM users
            WHERE username = 'admin'
            LIMIT 1
        `).first();

        if (!user) {
            return json({
                ok: false,
                error: 'adminユーザーが見つかりません。'
            }, 404);
        }

        // 新しいパスワードハッシュを生成
        // _shared.jsの100,000回版を使用
        const passwordHash = await hashPassword(
            newPassword
        );

        // パスワード更新
        await env.DB.prepare(`
            UPDATE users
            SET
                password_hash = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `)
            .bind(
                passwordHash,
                user.id
            )
            .run();

        return json({
            ok: true,
            message: 'adminのパスワードを変更しました。',
            username: user.username
        });

    } catch (error) {
        console.error(
            'RESET ADMIN ERROR:',
            error
        );

        return json({
            ok: false,
            error: 'パスワードリセット中にエラーが発生しました。',
            detail: String(
                error?.message || error
            )
        }, 500);
    }
}
