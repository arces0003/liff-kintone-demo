(async () => {
  // ★ あなたの LIFF ID を必ず設定 ★
  const LIFF_ID = "2008199749-eQZNE4rg";

  const byId = (id) => document.getElementById(id);
  const liffStatus = byId("liffStatus");
  const contextBox = byId("contextBox");
  const saveBtn = byId("saveBtn");
  const saveStatus = byId("saveStatus");

  try {
    // --- 1) LIFF 初期化 ---
    await liff.init({ liffId: LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    // --- 2) LIFFコンテキスト取得 ---
    const ctx = liff.getContext();
    const sourceType =
      ctx.type ||
      (ctx.groupId ? "group" : ctx.roomId ? "room" : ctx.userId ? "utou" : "unknown");

    const idForSave = ctx.roomId || ctx.groupId || ctx.userId || null;

    liffStatus.innerHTML = `<span class="ok">LIFF 初期化OK</span>`;
    contextBox.textContent = JSON.stringify(
      {
        type: sourceType,
        userId: ctx.userId || null,
        groupId: ctx.groupId || null,
        roomId: ctx.roomId || null,
      },
      null,
      2
    );

    // --- 3) kintone 登録ボタン ---
    saveBtn.onclick = async () => {
      saveStatus.textContent = "kintone に送信中...";
      saveStatus.className = "";

      try {
        if (!idForSave) {
          throw new Error("保存できる ID が取得できません。トーク/グループから開いてください。");
        }

        const payload = { userId: idForSave, sourceType };

        // Vercel サーバーレス関数を呼ぶ
        const resp = await fetch("/api/kintone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await resp.text();
        let data = text;
        try {
          data = JSON.parse(text);
        } catch (_) {}

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);
        }

        saveStatus.innerHTML = `<span class="ok">登録成功</span>（${JSON.stringify(
          data
        )}）`;
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
