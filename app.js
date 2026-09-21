let user;
let products = [];
let type = 'general';
let qty = {};

const money = n =>
'$' + Number(n).toLocaleString('ja-JP');

// =====================================================
// API
// =====================================================

async function api(url, opt) {
const r = await fetch(url, opt);


if (r.status === 401) {
    location.href = '/login.html';
    throw Error('login');
}

const d = await r.json();

if (!r.ok) {
    throw Error(d.error || 'エラー');
}

return d;


}

// =====================================================
// 初期読み込み
// =====================================================

async function init() {
const me = await api('/api/me');


user = me.user;

staffName.textContent =
    `${user.display_name}（${user.username}）`;

roleBadge.textContent =
    user.role === 'admin'
        ? '管理者'
        : 'スタッフ';

if (user.role === 'admin') {
    adminLink.classList.remove('hidden');
}

const d = await api('/api/products');

products = d.products;

render();


}

// =====================================================
// 商品表示
// =====================================================

function render() {
const groups = {};


for (const p of products) {
    (groups[p.category] ??= []).push(p);
}

document.querySelector('#products').innerHTML =
    Object.entries(groups)
        .map(([cat, ps]) => `
            <section class="card product-group">

                <h3>${esc(cat)}</h3>

                ${ps.map(p => {

                    const q = qty[p.id] || 0;

                    const unit =
                        type !== 'general' && p.pd_ems_half
                            ? Math.floor(p.price / 2)
                            : p.price;

                    return `
                        <div class="product">

                            <div>
                                <strong>
                                    ${esc(p.name)}
                                </strong>

                                ${
                                    type !== 'general' &&
                                    p.pd_ems_half
                                        ? '<div class="discount">PD/EMS 50%対象</div>'
                                        : ''
                                }
                            </div>

                            <span class="price">
                                ${money(unit)}
                            </span>

                            <div class="qty">

                                <button
                                    data-minus="${p.id}"
                                >
                                    −
                                </button>

                                <input
                                    data-input="${p.id}"
                                    value="${q}"
                                    inputmode="numeric"
                                >

                                <button
                                    data-plus="${p.id}"
                                >
                                    ＋
                                </button>

                            </div>

                            <span>
                                ${money(unit * q)}
                            </span>

                        </div>
                    `;

                }).join('')}

            </section>
        `)
        .join('');

// マイナス
document
    .querySelectorAll('[data-minus]')
    .forEach(b => {
        b.onclick = () =>
            setQ(
                +b.dataset.minus,
                (qty[b.dataset.minus] || 0) - 1
            );
    });

// プラス
document
    .querySelectorAll('[data-plus]')
    .forEach(b => {
        b.onclick = () =>
            setQ(
                +b.dataset.plus,
                (qty[b.dataset.plus] || 0) + 1
            );
    });

// 数量直接入力
document
    .querySelectorAll('[data-input]')
    .forEach(i => {
        i.onchange = () =>
            setQ(
                +i.dataset.input,
                +i.value
            );
    });

updateTotal();


}

// =====================================================
// 数量変更
// =====================================================

function setQ(id, q) {
const p = products.find(x => x.id === id);


q = Math.max(
    0,
    Math.floor(Number(q) || 0)
);

if (p.max_qty !== null) {
    q = Math.min(
        p.max_qty,
        q
    );
}

qty[id] = q;

render();


}

// =====================================================
// 合計金額計算
// =====================================================

function updateTotal() {
let t = 0;


for (const p of products) {

    const q = qty[p.id] || 0;

    const u =
        type !== 'general' && p.pd_ems_half
            ? Math.floor(p.price / 2)
            : p.price;

    t += u * q;
}

total.textContent = money(t);

return t;


}

// =====================================================
// HTMLエスケープ
// =====================================================

function esc(s) {
return String(s).replace(
/[&<>"]/g,
c => ({
'&': '&',
'<': '<',
'>': '>',
'"': '"'
}[c])
);
}

// =====================================================
// 選択中の商品
// =====================================================

function selected() {
return products
.filter(
p => (qty[p.id] || 0) > 0
)
.map(p => {


        const q = qty[p.id];

        const u =
            type !== 'general' && p.pd_ems_half
                ? Math.floor(p.price / 2)
                : p.price;

        return {
            product_id: p.id,
            name: p.name,
            quantity: q,
            unit: u,
            subtotal: u * q
        };
    });


}

// =====================================================
// 一般 / PD / EMS 切り替え
// =====================================================

for (
const b of document.querySelectorAll('.tab')
) {
b.onclick = () => {


    document
        .querySelectorAll('.tab')
        .forEach(x =>
            x.classList.remove('active')
        );

    b.classList.add('active');

    type = b.dataset.type;

    render();
};


}

// =====================================================
// 合計金額をコピー
// =====================================================

copyBill.onclick = async () => {


const t = updateTotal();

// 0円の場合
if (t <= 0) {
    alert('金額を1つ以上選択してください。');
    return;
}

// 数字だけをコピー
const text = String(t);

output.value = text;

await navigator.clipboard.writeText(text);


};

// =====================================================
// お礼文をコピー
// =====================================================

copyThanks.onclick = async () => {


const text =
    'この度はRedLine Customsをご利用いただき、ありがとうございました。';

output.value = text;

await navigator.clipboard.writeText(text);


};

// =====================================================
// 作業履歴保存
// =====================================================

saveLog.onclick = async () => {


try {

    const items = selected();

    if (!items.length) {
        alert(
            '商品を1つ以上選択してください'
        );
        return;
    }

    const d = await api(
        '/api/worklogs',
        {
            method: 'POST',
            headers: {
                'content-type':
                    'application/json'
            },
            body: JSON.stringify({
                customer_type: type,
                items: items.map(x => ({
                    product_id:
                        x.product_id,
                    quantity:
                        x.quantity
                }))
            })
        }
    );

    alert(
        `作業履歴を保存しました。\n合計：${money(d.total)}`
    );

} catch (e) {

    alert(e.message);

}


};

// =====================================================
// ログアウト
// =====================================================

logoutBtn.onclick = async () => {


await fetch(
    '/api/logout',
    {
        method: 'POST'
    }
);

location.href = '/login.html';


};

// =====================================================
// 起動
// =====================================================

init()
.catch(() =>
location.href = '/login.html'
);
