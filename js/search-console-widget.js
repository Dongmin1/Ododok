(function () {
  var CONTAINER_ID = "gsc-widget";
  var DATA_URL = "data/search-console.json";

  function formatNumber(n) {
    return new Intl.NumberFormat("ko-KR").format(n || 0);
  }

  function formatPercent(n) {
    return ((n || 0) * 100).toFixed(1) + "%";
  }

  function renderEmpty(container) {
    container.innerHTML =
      '<p class="gsc-widget__empty">검색 유입 데이터를 아직 불러오지 못했습니다. ' +
      "GitHub Actions가 최소 한 번 실행된 뒤 다시 확인해주세요.</p>";
  }

  function drawChart(canvas, daily) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var width = canvas.clientWidth || 300;
    var height = canvas.clientHeight || 160;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!daily.length) return;

    var clicks = daily.map(function (d) {
      return d.clicks;
    });
    var maxClicks = Math.max(1, Math.max.apply(null, clicks));
    var stepX = width / Math.max(1, daily.length - 1);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#4f46e5";
    daily.forEach(function (d, i) {
      var x = i * stepX;
      var y = height - (d.clicks / maxClicks) * (height - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function init() {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    fetch(DATA_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("fetch failed: " + res.status);
        return res.json();
      })
      .then(function (data) {
        var totals = data.totals || {};
        var daily = data.daily || [];

        container.innerHTML =
          '<div class="gsc-widget__title">검색 유입 현황 (최근 3개월)</div>' +
          '<div class="gsc-widget__stats">' +
          '<div class="gsc-stat"><div class="gsc-stat__value">' +
          formatNumber(totals.clicks) +
          '</div><div class="gsc-stat__label">총 클릭수</div></div>' +
          '<div class="gsc-stat"><div class="gsc-stat__value">' +
          formatNumber(totals.impressions) +
          '</div><div class="gsc-stat__label">총 노출수</div></div>' +
          '<div class="gsc-stat"><div class="gsc-stat__value">' +
          formatPercent(totals.ctr) +
          '</div><div class="gsc-stat__label">평균 CTR</div></div>' +
          '<div class="gsc-stat"><div class="gsc-stat__value">' +
          (totals.position || 0).toFixed(1) +
          '</div><div class="gsc-stat__label">평균 게재순위</div></div>' +
          "</div>" +
          '<canvas id="gscChart"></canvas>' +
          '<div class="gsc-widget__updated">업데이트: ' +
          (data.updatedAt ? data.updatedAt.slice(0, 10) : "-") +
          "</div>";

        var canvas = document.getElementById("gscChart");
        if (canvas) drawChart(canvas, daily);
      })
      .catch(function (err) {
        renderEmpty(container);
        console.warn("Search Console 위젯 로드 실패:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
