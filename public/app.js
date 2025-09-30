(async () => {
  // ★ あなたの LIFF ID に置き換えてください ★
  const LIFF_ID = "2008199749-eQZNE4rg";

  const byId = (id) => document.getElementById(id);
  const liffStatus = byId("liffStatus");
  const contextBox = byId("contextBox");
  const saveBtn = byId("saveBtn");
  const saveStatus = byId("saveStatus");

  try {
    await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login(); // LINE内で未ログインならログインへ
      return;
    }

    const ctx = liff.getContext();
    const sourceType = ctx.type || (ctx.groupId ? "group" : ctx.roomId ? "room" : ctx.userId ? "user" : "unknown");
    const idForSave = ctx.roomId || ctx.groupId || ctx.userId || null;

    liffStatus.innerHTML = `<span class="ok">LIFF 初期化OK</span>`;
    contextBox.textContent = JSON.stringify({
      type: sourceType,
      userId: ctx.userId || null,
      groupId: ctx.groupId || null,
      roomId: ctx.roomId || null
    }, null, 2);

    saveBtn.onclick = async () => {
      saveStatus.textContent = "kintone に送信中...";
      saveStatus.className = "";
      try {
        const sub = byId("ktSubdomain").value.trim();
        const appId = byId("ktAppId").value.trim();
        const token = byId("ktToken").value.trim();

        if (!sub || !appId || !token) throw new Error("サブドメイン / アプリID / APIトークン を入力してください。");
        if (!idForSave) throw new Error("保存できるIDが取得できませんでした。トーク/グループから開いてください。");

        const body = {
          app: Number(appId),
          record: { roomId: { value: idForSave }, sourceType: { value: sourceType } }
        };

        const resp = await fetch(`https://${sub}.cybozu.com/k/v1/record.json`, {
          method: "POST",
          headers: {
            "X-Cybozu-API-Token": token,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: JSON.stringify(body)
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);
        saveStatus.innerHTML = `<span class="ok">登録成功</span>（レコードID: ${data.id}）`;
        saveStatus.className = "ok";
      } catch (e) {
        saveStatus.innerHTML = `<span class="ng">登録失敗:</span> ${e.message}`;
        saveStatus.className = "ng";
        console.error(e);
      }
    };
  } catch (e) {
    liffStatus.innerHTML = `<span class="ng">LIFF 初期化失敗:</span> ${e.message}`;
    contextBox.textContent = "";
    console.error(e);
  }
})();
