const form = document.querySelector('#loginForm');
const err = document.querySelector('#error');

const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

// すでにログイン済みならトップページへ
fetch('/api/me', {
    cache: 'no-store'
})
    .then(async (r) => {
        if (r.ok) {
            location.href = '/';
        }
    })
    .catch(() => {
        // 未ログインの場合はそのままログイン画面を表示
    });

// ログイン処理
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    err.textContent = '';

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        err.textContent = 'ユーザー名とパスワードを入力してください。';
        return;
    }

    try {
        const r = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        // JSONではなくHTMLなどが返ってきても
        // JSON.parseエラーで画面が止まらないようにする
        const text = await r.text();

        console.log('Login HTTP Status:', r.status);
        console.log('Login Content-Type:', r.headers.get('content-type'));
        console.log('Login Response:', text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (jsonError) {
            console.error('ログインAPIからJSON以外のレスポンスが返されました。');
            console.error(text);

            err.textContent = `サーバーエラーが発生しました。(${r.status})`;
            return;
        }

        // ログイン失敗
        if (!r.ok) {
            err.textContent = data.error || 'ユーザー名またはパスワードが正しくありません。';
            return;
        }

        // ログイン成功
        if (data.ok) {
            location.href = '/';
            return;
        }

        err.textContent = 'ログインに失敗しました。';

    } catch (error) {
        console.error('Login Error:', error);
        err.textContent = '通信エラーが発生しました。';
    }
});
