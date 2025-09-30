// 例: const API_BASE = 'https://<your-project>.vercel.app';
const API_BASE = ''; // 同一ドメイン配信なら空でOK（相対パスで /api/kintone を叩ける）
const PROXY_URL = `${API_BASE}/api/kintone`;

saveBtn.onclick = async () => {
  // ... LIFF の context 取得はそのまま ...
  const payload = { userId: idForSave, sourceType };

  const resp = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await resp.text();
  let data = text; try { data = JSON.parse(text); } catch {}
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);

  // 成功表示
  saveStatus.innerHTML = `<span class="ok">登録成功</span>（${JSON.stringify(data)}）`;
  saveStatus.className = "ok";
};
