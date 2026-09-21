// functions/_shared.js

export async function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            ...headers
        }
    });
}

export async function body(req) {
    try {
        return await req.json();
    } catch {
        return {};
    }
}

const enc = new TextEncoder();

function b64u(buf) {
    return btoa(
        String.fromCharCode(...new Uint8Array(buf))
    )
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function unb64u(s) {
    s = s
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    while (s.length % 4) {
        s += '=';
    }

    return Uint8Array.from(
        atob(s),
        c => c.charCodeAt(0)
    );
}

// SHA-256
export async function sha256(s) {
    return b64u(
        await crypto.subtle.digest(
            'SHA-256',
            enc.encode(s)
        )
    );
}

// ランダムトークン
export function randomToken(n = 32) {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return b64u(a);
}

// =====================================================
// パスワードハッシュ
// Cloudflare Workersで利用可能な100,000回に設定
// =====================================================

export async function hashPassword(password) {
    const salt = new Uint8Array(16);

    crypto.getRandomValues(salt);

    const iterations = 100000;

    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256'
        },
        key,
        256
    );

    return `pbkdf2$${iterations}$${b64u(salt)}$${b64u(bits)}`;
}

// =====================================================
// パスワード検証
// =====================================================

export async function verifyPassword(password, stored) {
    if (!stored) {
        return false;
    }

    const p = stored.split('$');

    if (
        p.length !== 4 ||
        p[0] !== 'pbkdf2'
    ) {
        return false;
    }

    const iterations = Number(p[1]);

    if (
        !Number.isInteger(iterations) ||
        iterations <= 0 ||
        iterations > 100000
    ) {
        return false;
    }

    const salt = unb64u(p[2]);
    const expected = unb64u(p[3]);

    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const bits = new Uint8Array(
        await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt,
                iterations,
                hash: 'SHA-256'
            },
            key,
            256
        )
    );

    if (bits.length !== expected.length) {
        return false;
    }

    // タイミング攻撃対策用の比較
    let x = 0;

    for (let i = 0; i < bits.length; i++) {
        x |= bits[i] ^ expected[i];
    }

    return x === 0;
}

// =====================================================
// セッションCookie
// =====================================================

export function cookieToken(req) {
    const cookie = req.headers.get('Cookie') || '';

    const match = cookie.match(
        /(?:^|;\s*)rl_session=([^;]+)/
    );

    return match?.[1] || null;
}

// =====================================================
// 認証
// =====================================================

export async function auth(req, env) {
    const raw = cookieToken(req);

    if (!raw) {
        return null;
    }

    const tokenHash = await sha256(raw);

    const row = await env.DB.prepare(`
        SELECT
            s.user_id,
            s.csrf_token,
            s.expires_at,
            u.username,
            u.display_name,
            u.role,
            u.active
        FROM sessions s
        JOIN users u
            ON u.id = s.user_id
        WHERE s.token_hash = ?
    `)
        .bind(tokenHash)
        .first();

    if (
        !row ||
        !row.active ||
        new Date(row.expires_at) <= new Date()
    ) {
        if (row) {
            await env.DB.prepare(
                'DELETE FROM sessions WHERE token_hash = ?'
            )
                .bind(tokenHash)
                .run();
        }

        return null;
    }

    return row;
}

// =====================================================
// HTTP Method
// =====================================================

export function requireMethod(req, method) {
    return req.method === method
        ? null
        : json(
            {
                error: 'Method not allowed'
            },
            405
        );
}

// =====================================================
// Originチェック
// =====================================================

export function isSameOrigin(req) {
    const origin = req.headers.get('Origin');

    if (!origin) {
        return true;
    }

    const url = new URL(req.url);

    return origin === url.origin;
}

// =====================================================
// 認証必須
// =====================================================

export async function requireAuth(
    req,
    env,
    roles = []
) {
    if (!isSameOrigin(req)) {
        return {
            response: json(
                {
                    error: 'Bad origin'
                },
                403
            )
        };
    }

    const user = await auth(req, env);

    if (!user) {
        return {
            response: json(
                {
                    error: 'ログインが必要です'
                },
                401
            )
        };
    }

    if (
        roles.length &&
        !roles.includes(user.role)
    ) {
        return {
            response: json(
                {
                    error: '権限がありません'
                },
                403
            )
        };
    }

    return {
        user
    };
}

// =====================================================
// CSV出力
// =====================================================

export function csv(rows, filename) {
    const esc = value =>
        `"${String(value ?? '').replaceAll('"', '""')}"`;

    const text =
        '\ufeff' +
        rows
            .map(row =>
                row.map(esc).join(',')
            )
            .join('\r\n') +
        '\r\n';

    return new Response(text, {
        headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition':
                `attachment; filename="${filename}"`
        }
    });
}
