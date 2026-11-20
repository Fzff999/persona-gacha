/* ==========================================================
   人格抽卡机 · 交互
   纯前端：所有计算在浏览器完成，不上传任何数据。
   ========================================================== */
(function () {
  "use strict";

  var DATA = window.GACHA_DATA;
  var TYPES = DATA.types;
  var QS = DATA.questions;
  var BY_ID = {};
  TYPES.forEach(function (t) { BY_ID[t.id] = t; });

  /* -------------------- 可配置项 -------------------- */
  var CONFIG = {
    // 收款 / 商品页链接（面包多、爱发电、闲鱼、微店都可以）。留空则只显示卡密输入。
    payUrl: "",
    // 可用的卡密（正式运营时改成你自己发出的一批码）
    codes: ["GACHA-2026", "COU-2026", "DEEP-9.9", "FZF-9527"],
    // 可选：接一个大模型接口来改写文案。留空则用内置文案引擎。
    aiEndpoint: ""
  };

  /* -------------------- 小工具 -------------------- */
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key);
      else localStorage.setItem(key, val);
    } catch (e) { /* 隐私模式忽略 */ }
    return null;
  }
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 2200);
  }
  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function seedOf(answers) {
    var s = 0;
    for (var i = 0; i < answers.length; i++) s += answers[i] * [7, 13, 17][i % 3];
    return s;
  }
  function rotate(arr, k) {
    k = ((k % arr.length) + arr.length) % arr.length;
    return arr.slice(k).concat(arr.slice(0, k));
  }

  /* -------------------- 本地数据（只存在浏览器里） -------------------- */
  function loadLog() {
    try {
      var v = JSON.parse(store("gacha_log") || "[]");
      return Object.prototype.toString.call(v) === "[object Array]" ? v : [];
    } catch (e) { return []; }
  }
  function saveLog(arr) {
    store("gacha_log", JSON.stringify(arr.slice(-500)));
  }

  /* -------------------- 状态 -------------------- */
  var state = {
    answers: [],
    idx: 0,
    result: null,
    unlocked: store("gacha_unlocked") === "1",
    logIndex: -1,
    rated: false
  };

  /* -------------------- 视图切换 -------------------- */
  var SCREENS = ["home", "quiz", "reading", "result"];
  function show(name) {
    SCREENS.forEach(function (n) {
      var node = $("#screen-" + n);
      if (!node) return;
      var on = n === name;
      node.hidden = !on;
      node.classList.toggle("is-active", on);
    });
    window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
  }

  /* -------------------- 首页 -------------------- */
  function renderFriendNote() {
    var p = new URLSearchParams(location.search);
    var t = parseInt(p.get("t"), 10);
    var box = $("#friend-note");
    if (!t || !BY_ID[t]) { box.hidden = true; return; }
    var ty = BY_ID[t];
    box.innerHTML =
      '你的朋友抽到了 <b>' + ty.code + " 号 · " + ty.nick + "</b>（" + ty.name + "）。<br />" +
      "同一台机器，不会吐出两张一样的卡——你是几号？";
    box.hidden = false;
  }

  /* -------------------- 答题 -------------------- */
  function startQuiz() {
    state.answers = [];
    state.idx = 0;
    state.result = null;
    state.locking = false;
    state.rated = false;
    state.logIndex = -1;
    navigate("#/q1");
  }

  function renderQuiz(i) {
    var q = QS[i];
    if (!q) return navigate("#/");
    state.idx = i;
    $("#q-index").textContent = "0" + (i + 1) + " / 0" + QS.length;
    $("#q-bar").style.width = ((i + 1) / QS.length) * 100 + "%";
    $("#q-text").textContent = q.q;
    $("#q-hint").textContent = q.hint;

    var box = $("#q-options");
    box.innerHTML = "";
    q.options.forEach(function (opt, k) {
      var b = el("button", "opt");
      b.type = "button";
      b.innerHTML =
        '<span class="opt__key">' + "ABCDE"[k] + "</span>" +
        '<span class="opt__text">' + opt.label + "</span>";
      b.addEventListener("click", function () { pick(opt, b); });
      box.appendChild(b);
    });

    if (!reduced()) {
      // 重播入场动画
      box.querySelectorAll(".opt").forEach(function (n) {
        n.style.animation = "none";
        void n.offsetWidth;
        n.style.animation = "";
      });
    }
    show("quiz");
  }

  function pick(opt, btn) {
    if (state.locking || btn.classList.contains("is-picked")) return;
    state.locking = true;
    btn.classList.add("is-picked");
    state.answers[state.idx] = { primary: opt.primary, secondary: opt.secondary, label: opt.label };
    var next = state.idx + 1;
    setTimeout(function () {
      state.locking = false;
      if (next < QS.length) navigate("#/q" + (next + 1));
      else beginReading();
    }, reduced() ? 60 : 260);
  }

  /* -------------------- 读卡 -------------------- */
  function beginReading() {
    show("reading");
    var lines = ["正在读取你的卡面…", "在 9 张卡里，比对你的答案…", "快好了，最后一张…"];
    var k = 0;
    var timer = setInterval(function () {
      k++;
      if (k < lines.length) $("#reading-text").textContent = lines[k];
    }, 520);
    setTimeout(function () {
      clearInterval(timer);
      compute();
      navigate("#/card");
    }, reduced() ? 200 : 1500);
  }

  /* -------------------- 计分 -------------------- */
  function compute() {
    var score = {};
    TYPES.forEach(function (t) { score[t.id] = 0; });
    state.answers.forEach(function (a) {
      if (!a) return;
      score[a.primary] = (score[a.primary] || 0) + 2;
      score[a.secondary] = (score[a.secondary] || 0) + 1;
    });
    var ids = TYPES.map(function (t) { return t.id; });
    var seed = seedOf(state.answers.map(function (a) { return a ? a.primary : 0; }));
    ids.sort(function (a, b) {
      if (score[b] !== score[a]) return score[b] - score[a];
      return ((a * 7 + seed) % 9) - ((b * 7 + seed) % 9);
    });
    var top = ids[0];
    var second = ids[1];
    // 隐藏面不能和主型同一类
    if (second === top) second = ids[2];
    state.result = {
      id: top,
      hidden: second,
      score: score,
      seed: seed,
      picks: state.answers.map(function (a) { return a ? a.primary : 0; })
    };
    try { store("gacha_last", JSON.stringify(state.result)); } catch (e) {}
  }

  /* -------------------- 结果页 -------------------- */
  function whyLine(r) {
    var count = 0;
    state.answers.forEach(function (a) {
      if (a && (a.primary === r.id || a.secondary === r.id)) count++;
    });
    var t = BY_ID[r.id];
    if (count >= 3) return "3 道题里有 " + count + " 次，你都选了和「" + t.core + "」有关的答案。";
    return "3 道题里有 " + count + " 次，你选了和「" + t.core + "」有关的答案；再加上隐藏面 " +
      BY_ID[r.hidden].code + " 号，就成了这张卡。";
  }

  function cardHTML(t, r) {
    var powers = rotate(t.powers, r.seed).slice(0, 2).join(" · ");
    var mines = rotate(t.mines, r.seed + 1).slice(0, 2).join(" · ");
    return '' +
      '<article class="card" data-no="' + t.code + '" style="--tc:' + t.color + '">' +
        '<div class="card__top"><span>PERSONA GACHA</span><span>NO.' + t.code + "</span></div>" +
        '<div class="card__stamp">' + t.code + "</div>" +
        '<h2 class="card__nick">' + t.nick + "</h2>" +
        '<div class="card__type">' + t.code + " · " + t.name + "<span>" + t.en + "</span></div>" +
        '<p class="card__tag">“' + t.tagline + "”</p>" +
        '<div class="card__rows">' +
          '<div class="card__row"><b>超能力</b><span>' + powers + "</span></div>" +
          '<div class="card__row"><b>今日雷区</b><span>' + mines + "</span></div>" +
          '<div class="card__row"><b>搭子画像</b><span>' + t.partner + "</span></div>" +
        "</div>" +
        '<div class="card__advice"><b>今日建议</b>' + t.advice + "</div>" +
        '<div class="card__foot"><span>PERSONA GACHA</span><span>' + hostText() + "</span></div>" +
      "</article>";
  }

  function hostText() {
    var h = location.hostname.replace(/^www\./, "");
    return h && h !== "localhost" && !/^127\./.test(h) && !/^file/.test(h) ? h : "persona-gacha";
  }

  function renderResult() {
    var r = state.result;
    if (!r) return navigate("#/");
    var t = BY_ID[r.id];
    if (!r.logged) {
      var L = loadLog();
      L.push({ t: r.id, s: null, u: 0, ts: Date.now() });
      saveLog(L);
      state.logIndex = Math.min(L.length - 1, 499);
      state.rated = false;
      r.logged = true;
    }
    $("#card-wrap").innerHTML = cardHTML(t, r);
    $("#result-eyebrow").textContent = "YOU GOT ／ NO." + t.code;
    $("#result-title").innerHTML = "你是 " + t.code + " 号";
    $("#result-sub").textContent = t.name + " · " + t.nick + " · 隐藏面 " + BY_ID[r.hidden].code + " 号";
    $("#result-why").textContent = whyLine(r);
    $("#btn-unlock").innerHTML = state.unlocked
      ? "查看深度解读 <span class=\"price\">已解锁</span>"
      : "解锁深度解读 <span class=\"price\">¥9.9</span>";
    $("#rate").hidden = false;
    $("#rate-opts").hidden = state.rated;
    $("#rate-done").hidden = !state.rated;
    show("result");
  }

  function rate(v, btn) {
    if (state.rated) return;
    var L = loadLog();
    if (L[state.logIndex]) {
      L[state.logIndex].s = v;
      saveLog(L);
    }
    state.rated = true;
    if (btn) btn.classList.add("is-on");
    $("#rate-opts").hidden = true;
    $("#rate-done").hidden = false;
    toast("已记录，谢谢你的反馈");
  }

  /* -------------------- 生成图片 -------------------- */
  function wrapText(ctx, text, maxWidth) {
    var lines = [], line = "";
    for (var i = 0; i < text.length; i++) {
      var test = line + text[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = text[i];
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawCard(canvas, t, r) {
    var W = 1080, H = 1440;
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    var serif = '"Songti SC","STSong","SimSun","Source Han Serif SC",serif';
    var sans = '"PingFang SC","Microsoft YaHei","Hiragino Sans GB",sans-serif';

    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#FDF8EF");
    g.addColorStop(0.55, "#F6EDDC");
    g.addColorStop(1, "#EFE2CA");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 暗纹
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#7a6440";
    ctx.lineWidth = 1;
    for (var i = -H; i < W; i += 14) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
    }
    ctx.restore();

    // 内框
    ctx.strokeStyle = "rgba(60,45,25,0.22)";
    ctx.lineWidth = 2;
    roundRect(ctx, 42, 42, W - 84, H - 84, 22);
    ctx.stroke();

    // 水印数字
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = t.color;
    ctx.font = "700 460px " + serif;
    ctx.textAlign = "right";
    ctx.fillText(t.code, W - 60, H - 90);
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = "#8a7a5f";
    ctx.font = "22px " + sans;
    letterText(ctx, "P E R S O N A   G A C H A", 84, 122);
    ctx.textAlign = "right";
    ctx.fillText("NO." + t.code, W - 84, 122);

    ctx.textAlign = "left";
    ctx.fillStyle = "#221c14";
    ctx.font = "700 104px " + serif;
    ctx.fillText(t.nick, 80, 300);

    ctx.fillStyle = t.color;
    ctx.font = "600 30px " + sans;
    ctx.fillText(t.code + " · " + t.name + "　" + t.en + "　· 隐藏面 " + BY_ID[r.hidden].code, 84, 360);

    // 金句
    ctx.fillStyle = "#4a3c2a";
    ctx.font = "34px " + serif;
    var tag = wrapText(ctx, "“" + t.tagline + "”", 860);
    var y = 440;
    ctx.fillStyle = t.color;
    ctx.fillRect(84, 400, 4, 40 + (tag.length - 1) * 54);
    ctx.fillStyle = "#4a3c2a";
    tag.forEach(function (line, k) { ctx.fillText(line, 108, 432 + k * 54); });
    y = 432 + (tag.length - 1) * 54 + 90;

    // 分割线
    ctx.strokeStyle = "rgba(60,45,25,0.15)";
    ctx.beginPath(); ctx.moveTo(84, y); ctx.lineTo(W - 84, y); ctx.stroke();
    y += 62;

    var powers = rotate(t.powers, r.seed).slice(0, 2).join(" · ");
    var mines = rotate(t.mines, r.seed + 1).slice(0, 2).join(" · ");
    var rows = [
      ["超能力", powers],
      ["今日雷区", mines],
      ["搭子画像", t.partner],
      ["今日建议", t.advice]
    ];

    rows.forEach(function (row) {
      ctx.fillStyle = "#93815f";
      ctx.font = "600 22px " + sans;
      ctx.fillText(row[0], 84, y + 8);
      ctx.fillStyle = "#2c2418";
      ctx.font = "28px " + sans;
      var lines = wrapText(ctx, row[1], 740);
      lines.forEach(function (ln, k) { ctx.fillText(ln, 230, y - 20 + k * 40); });
      y += Math.max(1, lines.length) * 40 + 46;
    });

    // 底栏
    ctx.fillStyle = "rgba(34,28,20,0.06)";
    roundRect(ctx, 84, H - 150, W - 168, 74, 14);
    ctx.fill();
    ctx.fillStyle = "#6b5b42";
    ctx.font = "24px " + sans;
    ctx.fillText("同款抽卡 · " + hostText(), 110, H - 103);

    ctx.fillStyle = "#a08e6f";
    ctx.font = "20px " + sans;
    ctx.textAlign = "left";
    ctx.fillText("娱乐向轻测 · 非心理诊断", 84, H - 56);
    ctx.textAlign = "right";
    ctx.fillText("PERSONA GACHA", W - 84, H - 56);
  }

  function letterText(ctx, text, x, y) {
    ctx.fillText(text, x, y);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function saveImage() {
    var r = state.result;
    if (!r) return;
    var t = BY_ID[r.id];
    var canvas = document.createElement("canvas");
    try {
      drawCard(canvas, t, r);
    } catch (e) {
      toast("图片生成失败，请换个浏览器试试");
      return;
    }
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    canvas.toBlob(function (blob) {
      if (!blob) { toast("图片生成失败"); return; }
      var url = URL.createObjectURL(blob);
      if (isIOS) {
        window.open(url, "_blank");
        toast("长按图片 → 存储到照片");
        return;
      }
      var a = document.createElement("a");
      a.href = url;
      a.download = "人格卡-" + t.code + t.nick + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      toast("已保存到下载文件夹");
    }, "image/png");
  }

  /* -------------------- 分享 -------------------- */
  function share() {
    var r = state.result;
    if (!r) return;
    var t = BY_ID[r.id];
    var base = location.origin === "null" ? location.href.split("?")[0] : location.origin + location.pathname;
    var url = base + "?t=" + t.id;
    var text = "我抽到了 " + t.code + " 号 · " + t.nick + "（" + t.name + "）：" + t.tagline +
      " 你是几号？";
    if (navigator.share) {
      navigator.share({ title: "人格抽卡机", text: text, url: url }).catch(function () {});
      return;
    }
    var full = text + " " + url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(function () {
        toast("分享文案已复制，去粘贴给朋友吧");
      }, function () { fallbackCopy(full); });
    } else fallbackCopy(full);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("分享文案已复制"); }
    catch (e) { toast("复制失败，请手动复制链接"); }
    document.body.removeChild(ta);
  }

  /* -------------------- 弹窗 -------------------- */
  function openModal(html) {
    $("#modal-body").innerHTML = html;
    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
    $("#modal-close").focus();
  }
  function closeModal() {
    $("#modal").hidden = true;
    document.body.style.overflow = "";
  }

  function openUnlock() {
    if (state.unlocked) return openReport();
    var r = state.result;
    var t = BY_ID[r.id];
    var html = '' +
      '<h3>解锁「' + t.nick + '」的深度解读</h3>' +
      '<p>卡片告诉你“是谁”，深度解读告诉你“为什么会这样、可以怎么办”。约 900 字，4 段：底层程序、压力下的样子、关系里的误会、一个可以试的小动作。</p>' +
      '<div class="price-line"><strong>¥9.9</strong><span>一次解锁，永久可看</span></div>' +
      (CONFIG.payUrl
        ? '<a class="btn btn--primary" style="width:100%" href="' + CONFIG.payUrl + '" target="_blank" rel="noopener">去付款，拿到卡密</a>'
        : '<p class="tiny">付款方式：扫描发起人给你的收款码，或直接找发起人要一张卡密。</p>') +
      '<div class="hr"></div>' +
      '<p style="margin-bottom:6px"><b>已有卡密？</b></p>' +
      '<div class="field"><input id="code-input" type="text" placeholder="输入卡密，例如 GACHA-2026" autocomplete="off" /><button class="btn btn--primary" id="code-go" type="button">解锁</button></div>' +
      '<p class="tiny">卡密不区分大小写。演示卡密：GACHA-2026</p>' +
      '<div class="hr"></div>' +
      '<p class="tiny">深度解读是内容产品，不是心理诊断；卡密一经使用不支持退款。</p>';
    openModal(html);
    $("#code-go").addEventListener("click", tryCode);
    $("#code-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryCode();
    });
    setTimeout(function () { var i = $("#code-input"); if (i) i.focus(); }, 60);
  }

  function tryCode() {
    var input = $("#code-input");
    var v = (input.value || "").trim().toUpperCase();
    if (!v) return toast("先输入卡密");
    if (CONFIG.codes.indexOf(v) === -1) {
      toast("这个卡密不对，再核对一下？");
      return;
    }
    state.unlocked = true;
    store("gacha_unlocked", "1");
    var L = loadLog();
    if (L[state.logIndex]) { L[state.logIndex].u = 1; saveLog(L); }
    $("#btn-unlock").innerHTML = '查看深度解读 <span class="price">已解锁</span>';
    toast("解锁成功");
    openReport();
  }

  function openReport() {
    var r = state.result;
    if (!r) return;
    if (!state.unlocked) return openUnlock();
    var t = BY_ID[r.id];
    var labels = ["底层程序", "压力之下", "关系里的误会", "可以试一次"];
    var blocks = labels.map(function (label, i) {
      return '<div class="report__block"><h4>' + label + "</h4><p>" + t.report[i] + "</p></div>";
    }).join("");
    var html = '' +
      '<div class="report">' +
        "<h3>" + t.nick + "</h3>" +
        '<div class="report__meta">NO.' + t.code + " · " + t.name + " · 深度解读</div>" +
        blocks +
        '<div class="hr"></div>' +
        "<h3 style=\"font-size:20px\">和谁最合？</h3>" +
        '<p class="tiny">选一个朋友的号，看看你们的关系类型。</p>' +
        '<div class="picker" id="picker"></div>' +
        '<div id="pair-result"></div>' +
        '<div class="hr"></div>' +
        '<p class="tiny">想保存这段？截图即可。想再看，随时点「查看深度解读」。</p>' +
      "</div>";
    openModal(html);

    var picker = $("#picker");
    TYPES.forEach(function (x) {
      if (x.id === t.id) return;
      var b = el("button", "pick", x.code + " " + x.name);
      b.type = "button";
      b.addEventListener("click", function () {
        picker.querySelectorAll(".pick").forEach(function (n) { n.classList.remove("is-on"); });
        b.classList.add("is-on");
        renderPair(t.id, x.id);
      });
      picker.appendChild(b);
    });
  }

  function renderPair(a, b) {
    var key = Math.min(a, b) + "-" + Math.max(a, b);
    var cat = DATA.pairs[key] || "steady";
    var rule = DATA.pairRules[cat];
    if (a === b) rule = DATA.pairRules.same;
    var base = { same: 82, complement: 88, steady: 74, stretch: 58 }[cat];
    var score = base + ((a * 3 + b * 7) % 7) - 3;
    $("#pair-result").innerHTML =
      '<div class="report__block" style="margin-top:16px">' +
        "<h4>" + rule.title + " · 默契度 " + score + "</h4>" +
        "<p>" + rule.line + "</p>" +
        '<p style="margin-top:8px"><b>相处建议：</b>' + rule.tip + "</p>" +
      "</div>";
  }

  function statsHTML() {
    var L = loadLog();
    var n = L.length;
    var rated = L.filter(function (x) { return typeof x.s === "number"; });
    var avg = rated.length
      ? (rated.reduce(function (a, b) { return a + b.s; }, 0) / rated.length).toFixed(1)
      : "—";
    var un = L.filter(function (x) { return x.u; }).length;
    var counts = {};
    L.forEach(function (x) { counts[x.t] = (counts[x.t] || 0) + 1; });
    var bars = TYPES.map(function (t) {
      var p = n ? Math.round((counts[t.id] || 0) / n * 100) : 0;
      return '<div class="stat-row"><span>' + t.code + " " + t.name +
        '</span><em><i style="width:' + p + '%"></i></em><b>' + p + "%</b></div>";
    }).join("");
    return '<div class="hr"></div>' +
      '<div class="report__block"><h4>这台设备上的数据</h4>' +
      "<p>抽卡 <b>" + n + "</b> 次 · 平均像你吗 <b>" + avg + "</b> / 5 · 解锁 <b>" + un + "</b> 次</p>" +
      '<div class="stats">' + bars + "</div>" +
      '<button class="btn btn--primary" id="btn-export" type="button" style="width:100%;min-height:46px;font-size:14px;margin-top:12px">导出 CSV</button>' +
      '<p class="tiny" style="margin-top:8px">统计只保存在这台设备的浏览器里，不会上传；换设备或清缓存会归零。</p></div>';
  }

  function exportCSV() {
    var L = loadLog();
    var rows = [["时间", "类型", "像你吗", "是否解锁"]];
    L.forEach(function (x) {
      rows.push([new Date(x.ts).toLocaleString("zh-CN"), x.t,
        x.s == null ? "" : x.s, x.u ? "是" : "否"]);
    });
    var csv = rows.map(function (r) { return r.join(","); }).join("\n");
    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "人格抽卡机-数据.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast("已导出 CSV");
  }

  function openAbout() {
    openModal('' +
      "<h3>关于这台机器</h3>" +
      "<p>3 道题不是标准心理测量，它更像一次“快速对号入座”。题目来自九型人格的九种核心动机，选项对应不同的动机组合。</p>" +
      "<p>计分规则：每个选项给主型 +2 分、次型 +1 分；总分最高的成为你的主型，第二名成为“隐藏面”。</p>" +
      "<p>所有计算在浏览器里完成，不上传、不存储任何个人信息；换一台设备，结果不会跟着你走。</p>" +
      "<p>结果只描述行为倾向，不构成心理诊断。你随时可以不是它。</p>" +
      statsHTML());
    var btn = $("#btn-export");
    if (btn) btn.addEventListener("click", exportCSV);
  }

  /* -------------------- 路由 -------------------- */
  function navigate(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    if (/^q[1-9]$/.test(h)) {
      var i = parseInt(h.slice(1), 10) - 1;
      if (i > state.answers.length) return navigate("#/");
      renderQuiz(i);
      return;
    }
    switch (h) {
      case "card":
        if (!state.result) return navigate("#/");
        renderResult();
        break;
      case "reading":
        break;
      default:
        show("home");
    }
  }

  /* -------------------- 事件绑定 -------------------- */
  $("#btn-start").addEventListener("click", startQuiz);
  $("#btn-retry").addEventListener("click", startQuiz);
  $("#btn-quit").addEventListener("click", function () { navigate("#/"); });
  $("#btn-save").addEventListener("click", saveImage);
  $("#btn-share").addEventListener("click", share);
  $("#btn-unlock").addEventListener("click", openUnlock);
  $("#btn-about").addEventListener("click", openAbout);
  $("#rate-opts").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button[data-score]") : null;
    if (!b) return;
    rate(parseInt(b.getAttribute("data-score"), 10), b);
  });
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", function (e) {
    if (e.target.dataset && e.target.dataset.close) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
    if (!$("#modal").hidden) return;
    if ($("#screen-quiz").hidden) return;
    var k = "12345".indexOf(e.key);
    if (k > -1) {
      var btns = $("#q-options").querySelectorAll(".opt");
      if (btns[k]) btns[k].click();
    }
  });
  window.addEventListener("hashchange", route);

  /* -------------------- 启动 -------------------- */
  renderFriendNote();
  route();

  // 演示用深链：?demo=card&t=4（只用于预览卡面，不解锁任何内容）
  (function demo() {
    var p = new URLSearchParams(location.search);
    var d = p.get("demo");
    if (!d) return;
    var t = parseInt(p.get("t") || "4", 10);
    if (!BY_ID[t]) t = 4;
    var ans = [];
    QS.forEach(function (q) {
      var chosen = null;
      q.options.forEach(function (o) { if (!chosen && o.primary === t) chosen = o; });
      if (!chosen) q.options.forEach(function (o) { if (!chosen && o.secondary === t) chosen = o; });
      if (!chosen) chosen = q.options[0];
      ans.push({ primary: chosen.primary, secondary: chosen.secondary, label: chosen.label });
    });
    state.answers = ans;
    compute();
    state.result.id = t;
    state.result.hidden = (t === 5 ? 4 : 5);
    if (d === "quiz") { navigate("#/q1"); return; }
    navigate("#/card");
    if (d === "report") setTimeout(function () { openReport(); }, 500);
  })();

  // PWA：只在 https / 本地服务下注册
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  window.__GACHA__ = { state: state, config: CONFIG };
})();
