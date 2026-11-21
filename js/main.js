/* ============================================================
   星火征途 · 交互脚本
   星火粒子 / 滚动显现 / 数字滚动 / 导航
   青年长征路：重走长征路(顺序解锁) / 时空连线 / 知识闯关 / 宣言墙
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. 首屏星火粒子 ---------- */
  var canvas = document.getElementById("emberCanvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var COLORS = ["#f0c75e", "#c8102e", "#ff9aa8", "#8fd3ff", "#ffffff"];

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 60,
        r: 0.8 + Math.random() * 2.4,
        speed: 0.25 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.4,
        alpha: 0.15 + Math.random() * 0.55,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        tw: Math.random() * Math.PI * 2
      };
    }
    for (var i = 0; i < 70; i++) {
      var p = spawn();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    (function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.speed;
        p.x += p.drift + Math.sin(p.tw += 0.02) * 0.15;
        if (p.y < -10) { particles[i] = spawn(); continue; }
        var flicker = 0.7 + Math.sin(p.tw * 3) * 0.3;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 2. 滚动显现 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 3. 数字滚动 ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var start = null;
    var dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.round(target * eased).toLocaleString("zh-CN");
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".counter");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = parseInt(el.getAttribute("data-target"), 10).toLocaleString("zh-CN"); });
  }

  /* ---------- 4. 导航状态 ---------- */
  var nav = document.getElementById("nav");
  var progressBar = document.getElementById("progressBar");
  var backTop = document.getElementById("backTop");
  var sections = [];
  document.querySelectorAll("main section[id], header[id]").forEach(function (s) { sections.push(s); });
  var navAnchors = document.querySelectorAll(".nav-links a");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    nav.classList.toggle("scrolled", y > 40);
    backTop.classList.toggle("show", y > 600);

    var current = "";
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop - 120 <= y) current = sections[i].id;
    }
    navAnchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 5. 移动端菜单 ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  /* ---------- 6. 关卡一：重走长征路（顺序解锁） ---------- */
  var STATIONS = [
    { id: "ruijin", icon: "🚩", name: "瑞金 · 于都", year: "1934.10", title: "于都河畔的出发",
      story: "中央红军 8.6 万余人星夜渡过于都河，踏上战略转移的漫漫远征。于都河上，百姓拆下门板搭起浮桥——长征，从人民的支持中出发。" },
    { id: "zunyi", icon: "📜", name: "遵义会议", year: "1935.01", title: "生死攸关的转折",
      story: "遵义会议确立了毛泽东同志在党中央和红军的领导地位，在极端危急的关头挽救了党、挽救了红军、挽救了中国革命。" },
    { id: "luding", icon: "🌉", name: "飞夺泸定桥", year: "1935.05", title: "大渡桥横铁索寒",
      story: "22 名勇士冒着枪林弹雨，沿 13 根铁索攀爬夺桥，红军主力跨越天险大渡河，粉碎了敌人围歼的企图。" },
    { id: "snow", icon: "🏔️", name: "雪山草地", year: "1935.06—08", title: "最艰难的行军",
      story: "夹金山海拔 4000 多米，战士们衣着单薄翻越雪山；茫茫草地沼泽密布、粮食断绝，无数战士长眠于此，队伍依然向前。" },
    { id: "wuqi", icon: "🏳️", name: "吴起镇", year: "1935.10", title: "到陕北去",
      story: "中央红军率先到达陕北吴起镇，纵横十一省，行程二万五千里，中央红军长征到此结束。" },
    { id: "huining", icon: "🤝", name: "会宁会师", year: "1936.10", title: "三军过后尽开颜",
      story: "红一、红二、红四方面军三大主力胜利会师，长征以我们的胜利、敌人的失败而告终。" }
  ];
  var JOURNEY_KEY = "xinghuo_journey_v1";
  var journeyDetours = 0;

  var journeyPath = document.getElementById("journeyPath");
  var journeyDetail = document.getElementById("journeyDetail");
  var journeyProgress = document.getElementById("journeyProgress");
  var journeyDone = document.getElementById("journeyDone");
  var journeyReset = document.getElementById("journeyReset");

  function loadJourney() {
    try {
      var raw = localStorage.getItem(JOURNEY_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveJourney(list) {
    try { localStorage.setItem(JOURNEY_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }

  function showStationStory(s) {
    journeyDetail.innerHTML = "";
    var h = document.createElement("h5");
    h.textContent = s.year + " · " + s.title;
    var p = document.createElement("p");
    p.textContent = s.story;
    journeyDetail.appendChild(h);
    journeyDetail.appendChild(p);
  }

  function renderJourney() {
    var lit = loadJourney();
    var nodes = journeyPath.querySelectorAll(".j-node");
    nodes.forEach(function (node) {
      var id = node.getAttribute("data-id");
      var idx = STATIONS.findIndex(function (s) { return s.id === id; });
      var isLit = lit.indexOf(id) >= 0;
      var isNext = idx === lit.length;
      node.classList.toggle("lit", isLit);
      node.classList.toggle("next", isNext);
      var nextTag = node.querySelector(".j-next");
      if (nextTag) nextTag.remove();
    });
    // 轨迹填充
    var fill = journeyPath.querySelector(".journey-fill");
    if (fill) fill.style.width = (lit.length / STATIONS.length) * 90 + "%";
    if (journeyProgress) journeyProgress.textContent = "（已点亮 " + lit.length + " / " + STATIONS.length +
      (journeyDetours ? " · 绕路 " + journeyDetours + " 次" : " · 零绕路") + "）";
    if (journeyDone) {
      journeyDone.hidden = lit.length < STATIONS.length;
      if (lit.length === STATIONS.length) {
        journeyDone.textContent = journeyDetours === 0
          ? "🏆 完美通关：零绕路走完二万五千里！你练成了「活地图」。"
          : journeyDetours <= 2
            ? "🔥 六簇火种全部点亮！绕路 " + journeyDetours + " 次，方向感不错。"
            : "⛰️ 六簇火种全部点亮！绕路 " + journeyDetours + " 次——真实的长征路上，绕路代价要大得多。";
      }
    }
  }

  function buildJourney() {
    if (!journeyPath) return;
    journeyPath.innerHTML = "";
    var fill = document.createElement("span");
    fill.className = "journey-fill";
    journeyPath.appendChild(fill);
    STATIONS.forEach(function (s) {
      var node = document.createElement("button");
      node.type = "button";
      node.className = "j-node";
      node.setAttribute("data-id", s.id);
      var dot = document.createElement("span");
      dot.className = "j-dot";
      dot.textContent = s.icon;
      var name = document.createElement("span");
      name.className = "j-name";
      name.textContent = s.name;
      node.appendChild(dot);
      node.appendChild(name);
      node.addEventListener("click", function () {
        var lit = loadJourney();
        var idx = STATIONS.indexOf(s);
        if (lit.indexOf(s.id) >= 0) {
          // 已到达：回看故事
          showStationStory(s);
          return;
        }
        if (idx !== lit.length) {
          // 未按顺序：记一次绕路并提示
          journeyDetours++;
          node.classList.remove("deny");
          void node.offsetWidth; // 重启动画
          node.classList.add("deny");
          journeyDetail.innerHTML = "";
          var h = document.createElement("h5");
          h.textContent = "🧭 走岔了，绕路 +1";
          var p = document.createElement("p");
          p.textContent = "长征是一步步走出来的，方向错了要付代价。想想哪一站更早发生——继续找正确的下一站。";
          journeyDetail.appendChild(h);
          journeyDetail.appendChild(p);
          renderJourney();
          return;
        }
        lit.push(s.id);
        saveJourney(lit);
        showStationStory(s);
        if (lit.length === STATIONS.length) {
          journeyDetail.innerHTML = "";
          var dh = document.createElement("h5");
          dh.textContent = journeyDetours === 0 ? "🏆 零绕路抵达会宁" : "🔥 抵达会宁 · 全程绕路 " + journeyDetours + " 次";
          var dp = document.createElement("p");
          dp.textContent = "三大主力胜利会师。点击「重新出发」再挑战一次，看看能不能零绕路走完全程。";
          journeyDetail.appendChild(dh);
          journeyDetail.appendChild(dp);
        }
        renderJourney();
      });
      journeyPath.appendChild(node);
    });
    renderJourney();
  }

  if (journeyPath) {
    buildJourney();
    journeyReset.addEventListener("click", function () {
      saveJourney([]);
      journeyDetours = 0;
      journeyDetail.innerHTML = '<p class="jd-placeholder">👆 按历史顺序点击地标，从瑞金出发。没有提示，走错就算一次绕路。</p>';
      buildJourney();
    });
  }

  /* ---------- 7. 关卡二：时空连线（6 对 + 纪录） ---------- */
  var PAIRS = [
    { id: "p1", left: "遵义会议", right: "1935 年 1 月" },
    { id: "p2", left: "三大主力会师", right: "1936 年 10 月" },
    { id: "p3", left: "杭电前身创建", right: "1956 年" },
    { id: "p4", left: '更名"杭州电子科技大学"', right: "2004 年" },
    { id: "p5", left: '"半部电台"起家', right: "1930 年龙冈战斗" },
    { id: "p6", left: "省局共建杭电", right: "2011 年" },
    { id: "p7", left: "中央红军到达吴起镇", right: "1935 年 10 月" },
    { id: "p8", left: "首批集成电路一级学科博士点", right: "2021 年" }
  ];
  var MATCH_TIME = 90;
  var MATCH_KEY = "xinghuo_match_best_v1";

  var matchGame = document.getElementById("matchGame");
  var matchStats = document.getElementById("matchStats");
  var matchDone = document.getElementById("matchDone");
  var matchReset = document.getElementById("matchReset");

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function getMatchBest() {
    try { return parseInt(localStorage.getItem(MATCH_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function setMatchBest(v) {
    try { localStorage.setItem(MATCH_KEY, String(v)); } catch (e) { /* ignore */ }
  }

  var matchTimer = null;

  function buildMatch() {
    if (!matchGame) return;
    if (matchTimer) { clearInterval(matchTimer); matchTimer = null; }
    matchGame.innerHTML = "";
    if (matchDone) matchDone.hidden = true;
    var state = { selected: null, matched: 0, moves: 0, remain: MATCH_TIME, started: false, over: false };

    var colL = document.createElement("div");
    colL.className = "match-col";
    var colR = document.createElement("div");
    colR.className = "match-col";

    function updateStats() {
      if (matchStats) {
        var best = getMatchBest();
        matchStats.textContent = "（已配对 " + state.matched + " / " + PAIRS.length +
          " · 本次 " + state.moves + " 次 · ⏱ " + state.remain + "s" +
          (best ? " · 纪录 " + best + " 次" : "") + "）";
      }
    }

    function endByTimeout() {
      state.over = true;
      if (matchTimer) { clearInterval(matchTimer); matchTimer = null; }
      matchGame.querySelectorAll(".match-btn").forEach(function (b) { b.disabled = true; b.classList.remove("sel"); });
      matchStats.textContent = "（⏰ 时间到！已配对 " + state.matched + " / " + PAIRS.length + "）";
      if (matchDone) {
        matchDone.textContent = "⏰ 90 秒到，还有 " + (PAIRS.length - state.matched) + " 组没连上。点「重新连线」再试一次。";
        matchDone.hidden = false;
      }
    }

    function startMatchTimer() {
      if (state.started || state.over) return;
      state.started = true;
      matchTimer = setInterval(function () {
        state.remain--;
        updateStats();
        if (state.remain <= 0) { state.remain = 0; endByTimeout(); }
      }, 1000);
    }
    updateStats();

    function makeBtn(text, side, id) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "match-btn";
      btn.textContent = text;
      btn.setAttribute("data-id", id);
      btn.setAttribute("data-side", side);
      btn.addEventListener("click", function () {
        if (btn.classList.contains("done") || state.over) return;
        startMatchTimer();
        state.moves++;
        if (side === "L") {
          colL.querySelectorAll(".match-btn").forEach(function (b) { b.classList.remove("sel"); });
          if (state.selected === id) { state.selected = null; updateStats(); return; }
          btn.classList.add("sel");
          state.selected = id;
        } else {
          if (!state.selected) {
            btn.classList.add("err");
            setTimeout(function () { btn.classList.remove("err"); }, 450);
            updateStats();
            return;
          }
          if (state.selected === id) {
            btn.classList.add("done");
            colL.querySelector('.match-btn[data-id="' + id + '"]').classList.add("done");
            colL.querySelectorAll(".match-btn").forEach(function (b) { b.classList.remove("sel"); });
            state.selected = null;
            state.matched++;
            if (state.matched === PAIRS.length && matchDone) {
              if (matchTimer) { clearInterval(matchTimer); matchTimer = null; }
              var best = getMatchBest();
              if (!best || state.moves < best) {
                setMatchBest(state.moves);
                best = state.moves;
              }
              matchDone.textContent = "🎉 全部配对成功！本次 " + state.moves + " 次点击 · 用时 " +
                (MATCH_TIME - state.remain) + " 秒 · 最少点击纪录 " + best + " 次。";
              matchDone.hidden = false;
            }
          } else {
            btn.classList.add("err");
            var lbtn = colL.querySelector('.match-btn[data-id="' + state.selected + '"]');
            if (lbtn) {
              lbtn.classList.add("err");
              setTimeout(function () { lbtn.classList.remove("err"); }, 450);
            }
            setTimeout(function () { btn.classList.remove("err"); }, 450);
            state.selected = null;
          }
        }
        updateStats();
      });
      return btn;
    }

    shuffle(PAIRS).forEach(function (p) { colL.appendChild(makeBtn(p.left, "L", p.id)); });
    shuffle(PAIRS).forEach(function (p) { colR.appendChild(makeBtn(p.right, "R", p.id)); });

    matchGame.appendChild(colL);
    matchGame.appendChild(colR);
  }

  if (matchGame) {
    buildMatch();
    matchReset.addEventListener("click", buildMatch);
  }

  /* ---------- 8. 关卡三：知识闯关（选择 + 判断 + 连击） ---------- */
  var QUIZ = [
    { cat: "长征", type: "choice", q: "1936 年 10 月，红军三大主力胜利会师的地点是？",
      opts: ["陕北吴起镇", "甘肃会宁", "贵州遵义", "四川泸定"], answer: 1,
      note: "1936 年 10 月，红一、红二、红四方面军在甘肃会宁和将台堡会师，长征胜利结束。" },
    { cat: "长征", type: "choice", q: "1935 年 1 月召开的、成为党的历史上生死攸关转折点的会议是？",
      opts: ["古田会议", "瓦窑堡会议", "遵义会议", "洛川会议"], answer: 2,
      note: "遵义会议在极端危急关头挽救了党、挽救了红军、挽救了中国革命。" },
    { cat: "长征", type: "judge", q: "遵义会议后，中央红军四渡赤水、巧渡金沙江，跳出了敌人的包围圈。",
      opts: ["√ 对", "× 错"], answer: 0,
      note: "遵义会议后，红军在毛泽东等指挥下灵活机动，四渡赤水、巧渡金沙江，取得了战略转移的决定性胜利。" },
    { cat: "长征", type: "choice", q: "中央红军长征的出发地是？",
      opts: ["江西瑞金、于都", "陕西延安", "贵州遵义", "甘肃会宁"], answer: 0,
      note: "1934 年 10 月，中央红军 8.6 万余人从江西瑞金、于都出发，踏上战略转移之路。" },
    { cat: "长征", type: "choice", q: "红军飞夺泸定桥发生在哪一年？",
      opts: ["1934 年", "1935 年", "1936 年", "1937 年"], answer: 1,
      note: "1935 年 5 月，22 名勇士飞夺泸定桥，红军主力跨越天险大渡河。" },
    { cat: "长征", type: "choice", q: "“长征是宣言书，长征是宣传队，长征是播种机”这一著名论断出自毛泽东的哪篇文章？",
      opts: ["《星星之火，可以燎原》", "《论反对日本帝国主义的策略》", "《实践论》", "《论持久战》"], answer: 1,
      note: "出自 1935 年 12 月毛泽东在陕北瓦窑堡党的活动分子会议上的报告。" },
    { cat: "长征", type: "judge", q: "红军“半部电台”是指缴获的电台只剩发报功能，无法收报。",
      opts: ["√ 对", "× 错"], answer: 1,
      note: "恰好相反：发报机被损坏，只剩收报功能，“半部电台”由此得名。红军正是用它抄收新闻、侦听敌情。" },
    { cat: "长征", type: "choice", q: "红军“半部电台”的故事，源于缴获敌军电台的哪次战斗？",
      opts: ["飞夺泸定桥", "四渡赤水", "龙冈战斗", "直罗镇战役"], answer: 2,
      note: "1930 年龙冈战斗中红军缴获一部只剩收报功能的“半部电台”，人民军队无线电通信事业由此起步。" },
    { cat: "杭电", type: "choice", q: "杭州电子科技大学的前身创建于哪一年？",
      opts: ["1949 年", "1956 年", "1978 年", "1980 年"], answer: 1,
      note: "1956 年国家第二机械工业部创建杭州航空工业财经学校，即杭电前身。" },
    { cat: "杭电", type: "choice", q: "1980 年经国务院批准建立的高等学校名称是？",
      opts: ["杭州电子工业学院", "杭州无线电工业学校", "杭州电子科技大学", "浙江电机专科学校"], answer: 0,
      note: "1980 年国务院批准建立杭州电子工业学院；2004 年更名杭州电子科技大学。" },
    { cat: "杭电", type: "judge", q: "杭电是浙江省人民政府与国家国防科技工业局共建高校。",
      opts: ["√ 对", "× 错"], answer: 0,
      note: "2011 年浙江省与国家国防科技工业局签署共建协议，杭电是省属高校中唯一拥有国防特色重点专业的高校。" },
    { cat: "杭电", type: "choice", q: "杭电的校训是？",
      opts: ["求是创新", "笃学力行、守正求新", "团结勤奋、求实创新", "自强不息、厚德载物"], answer: 1,
      note: "校训“笃学力行、守正求新”；“团结勤奋、求实创新”是杭电的校风。" },
    { cat: "长征", type: "choice", q: "中央红军长征途中翻越的第一座大雪山是？",
      opts: ["夹金山", "六盘山", "岷山", "大巴山"], answer: 0,
      note: "1935 年 6 月，中央红军翻越海拔 4000 多米的夹金山，这是长征中翻越的第一座大雪山。" },
    { cat: "长征", type: "judge", q: "中央红军长征出发时约 8.6 万人，抵达陕北时人数已大幅减少。",
      opts: ["√ 对", "× 错"], answer: 0,
      note: "1934 年 10 月中央红军 8.6 万余人出发，历经千难万险，到达陕北时已不足万人，代价极其惨重。" },
    { cat: "杭电", type: "choice", q: "杭电入选全国首批“集成电路科学与工程”一级学科博士学位授权点是哪一年？",
      opts: ["2011 年", "2018 年", "2021 年", "2023 年"], answer: 2,
      note: "2021 年杭电入选全国首批“集成电路科学与工程”一级学科博士学位授权点，为浙江省属高校唯一。" }
  ];
  var QUIZ_TIME = 120;
  var QUIZ_PENALTY = 10;
  var QUIZ_KEY = "xinghuo_quiz_best_v1";

  var quizBox = document.getElementById("quizBox");
  var quizResult = document.getElementById("quizResult");
  var quizScore = document.getElementById("quizScore");
  var quizRank = document.getElementById("quizRank");
  var quizBest = document.getElementById("quizBest");
  var quizRetry = document.getElementById("quizRetry");
  var quizProgressFill = document.getElementById("quizProgressFill");
  var quizTimerEl = document.getElementById("quizTimer");
  var quizComboEl = document.getElementById("quizCombo");

  var quizState = { answered: 0, score: 0, combo: 0, started: false, remain: QUIZ_TIME, timer: null, finished: false };

  function getBest() {
    try { return parseInt(localStorage.getItem(QUIZ_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function setBest(v) {
    try { localStorage.setItem(QUIZ_KEY, String(v)); } catch (e) { /* ignore */ }
  }
  function rankOf(score) {
    if (score === QUIZ.length) return "称号：星火传承人 🔥";
    if (score >= QUIZ.length - 3) return "称号：长征突击手 ⚔️";
    if (score >= Math.ceil(QUIZ.length * 0.6)) return "称号：行军战士 🎖️";
    return "称号：初上征途 🌱";
  }
  function showCombo(n) {
    if (!quizComboEl) return;
    if (n >= 2) {
      quizComboEl.hidden = false;
      quizComboEl.textContent = "🔥 连击 ×" + n;
      quizComboEl.style.animation = "none";
      void quizComboEl.offsetWidth;
      quizComboEl.style.animation = "";
    } else {
      quizComboEl.hidden = true;
    }
  }
  function updateTimerText() {
    if (!quizTimerEl) return;
    quizTimerEl.textContent = "⏱ " + quizState.remain + "s";
    quizTimerEl.classList.toggle("warn", quizState.started && quizState.remain <= 30);
  }
  function stopTimer() {
    if (quizState.timer) { clearInterval(quizState.timer); quizState.timer = null; }
  }
  function startTimer() {
    if (quizState.started) return;
    quizState.started = true;
    quizState.timer = setInterval(function () {
      quizState.remain--;
      updateTimerText();
      if (quizState.remain <= 0) {
        finishQuiz("⏰ 时间到！已答部分计入成绩。");
      }
    }, 1000);
  }
  function updateProgress() {
    if (quizProgressFill) quizProgressFill.style.width = (quizState.answered / QUIZ.length) * 100 + "%";
  }
  function finishQuiz(prefix) {
    if (quizState.finished) return;
    quizState.finished = true;
    stopTimer();
    showCombo(0);
    quizBox.querySelectorAll(".q-opt").forEach(function (b) { b.disabled = true; });
    var best = getBest();
    var isNew = quizState.score > best;
    if (isNew) { best = quizState.score; setBest(best); }
    var used = QUIZ_TIME - quizState.remain;
    var msg = quizState.score === QUIZ.length
      ? "🎉 满分！你已经准备好了走自己的长征路。"
      : quizState.score >= QUIZ.length * 0.6
        ? "👍 不错！历史是最好的教科书，再接再厉。"
        : "💪 别灰心，回到上文再读一遍，重走一遍来时的路。";
    quizScore.textContent = (prefix ? prefix + " " : "") + "得分：" + quizState.score + " / " + QUIZ.length +
      " · 用时 " + used + " 秒。" + msg;
    quizRank.textContent = rankOf(quizState.score) + (isNew && quizState.score > 0 ? " · 🏅 新纪录！" : "");
    quizBest.textContent = "历史最佳：" + best + " / " + QUIZ.length;
    quizResult.hidden = false;
  }

  function buildQuiz() {
    quizState = { answered: 0, score: 0, combo: 0, started: false, remain: QUIZ_TIME, timer: null, finished: false };
    stopTimer();
    showCombo(0);
    quizResult.hidden = true;
    quizBox.innerHTML = "";
    updateProgress();
    updateTimerText();
    quizBest.textContent = "历史最佳：" + getBest() + " / " + QUIZ.length;

    QUIZ.forEach(function (item, qi) {
      var div = document.createElement("div");
      div.className = "q-item";
      var title = document.createElement("p");
      title.className = "q-title";
      var typeTag = item.type === "judge" ? "判断" : "选择";
      title.innerHTML = '<span class="q-index q-cat-' + (item.cat === "长征" ? "red" : "blue") + '">' + item.cat + " · " + typeTag + "</span>第" + (qi + 1) + "题 " + item.q;
      div.appendChild(title);
      var opts = document.createElement("div");
      opts.className = "q-opts";
      if (item.type === "judge") opts.classList.add("q-judge");
      item.opts.forEach(function (opt, oi) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "q-opt" + (item.type === "judge" ? " judge " + (oi === 0 ? "j-right-opt" : "j-wrong-opt") : "");
        btn.textContent = item.type === "judge" ? opt : String.fromCharCode(65 + oi) + ". " + opt;
        btn.addEventListener("click", function () {
          if (quizState.finished) return;
          startTimer();
          var all = opts.querySelectorAll(".q-opt");
          all.forEach(function (b) { b.disabled = true; });
          if (oi === item.answer) {
            btn.classList.add("correct");
            quizState.score++;
            quizState.combo++;
            showCombo(quizState.combo);
          } else {
            btn.classList.add("wrong");
            all[item.answer].classList.add("correct");
            quizState.combo = 0;
            showCombo(0);
            quizState.remain = Math.max(1, quizState.remain - QUIZ_PENALTY);
            updateTimerText();
            var penalty = document.createElement("span");
            penalty.className = "quiz-penalty";
            penalty.textContent = " ⏱ -" + QUIZ_PENALTY + "s";
            btn.appendChild(penalty);
          }
          var note = document.createElement("p");
          note.className = "quiz-hint";
          note.style.margin = "12px 0 0";
          note.textContent = "📌 " + item.note;
          div.appendChild(note);
          quizState.answered++;
          updateProgress();
          if (quizState.answered === QUIZ.length) {
            finishQuiz("");
          }
        });
        opts.appendChild(btn);
      });
      div.appendChild(opts);
      quizBox.appendChild(div);
    });
  }
  if (quizBox) {
    buildQuiz();
    quizRetry.addEventListener("click", buildQuiz);
  }

  /* ---------- 9. 关卡四：宣言墙 ---------- */
  var WALL_KEY = "xinghuo_wall_v1";
  var SEEDS = [
    { text: "先辈用脚步丈量信仰，我们用芯片丈量未来。", meta: "来自一名杭电学子" },
    { text: "把每一行代码，都写成新时代的行军号子。", meta: "计算机学院 · 匿名" },
    { text: "走好我们这代人的长征路！", meta: "2026 · 双庆之年" }
  ];
  var wallGrid = document.getElementById("wallGrid");
  var wallInput = document.getElementById("wallInput");
  var wallSubmit = document.getElementById("wallSubmit");

  function makeNote(item) {
    var note = document.createElement("div");
    note.className = "wall-note";
    var star = document.createElement("span");
    star.className = "note-star";
    star.textContent = "★";
    var txt = document.createElement("span");
    txt.textContent = item.text;
    var meta = document.createElement("span");
    meta.className = "note-meta";
    meta.textContent = "—— " + item.meta;
    note.appendChild(star);
    note.appendChild(txt);
    note.appendChild(meta);
    return note;
  }
  function loadWall() {
    try {
      var raw = localStorage.getItem(WALL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveWall(list) {
    try { localStorage.setItem(WALL_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  if (wallGrid) {
    SEEDS.forEach(function (s) { wallGrid.appendChild(makeNote(s)); });
    loadWall().forEach(function (item) { wallGrid.appendChild(makeNote(item)); });

    function addWall() {
      var text = (wallInput.value || "").trim();
      if (!text) { wallInput.focus(); return; }
      var list = loadWall();
      var item = { text: text, meta: "我 · " + new Date().toLocaleDateString("zh-CN") };
      list.unshift(item);
      saveWall(list);
      var empty = wallGrid.querySelector(".wall-empty");
      if (empty) empty.remove();
      wallGrid.insertBefore(makeNote(item), wallGrid.firstChild);
      wallInput.value = "";
    }
    wallSubmit.addEventListener("click", addWall);
    wallInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") addWall();
    });
  }
})();
