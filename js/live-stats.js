(function(){
  const $ = id => document.getElementById(id);

  const widgetEls = {
    clicks: $("liveClicks"),
    impressions: $("liveImpressions"),
    ctr: $("liveCtr"),
    position: $("livePosition"),
    updated: $("liveUpdated"),
    chart: $("liveChart")
  };
  const cardEl = $("homeLiveStat");

  if(!widgetEls.clicks && !cardEl) return;

  const dataPath = document.body.dataset.liveDataPath || "data/search-console.json";

  fetch(dataPath, {cache:"no-store"})
    .then(res => { if(!res.ok) throw new Error("no data"); return res.json(); })
    .then(data => {
      const t = data.totals || {};

      if(widgetEls.clicks){
        widgetEls.clicks.textContent = t.clicks ?? "–";
        widgetEls.impressions.textContent = t.impressions ?? "–";
        widgetEls.ctr.textContent = t.ctr!=null ? (t.ctr*100).toFixed(1)+"%" : "–";
        widgetEls.position.textContent = t.position!=null ? t.position.toFixed(1) : "–";

        const d = new Date(data.updatedAt);
        const dateStr = isNaN(d) ? "" : d.toLocaleDateString("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit"});
        widgetEls.updated.textContent = dateStr ? `업데이트 ${dateStr}` : "";

        if(widgetEls.chart && Array.isArray(data.daily) && data.daily.length){
          const w=600, h=120, pad=6;
          const vals = data.daily.map(x=>x.impressions||0);
          const max = Math.max(1, ...vals);
          const stepX = vals.length>1 ? (w-pad*2)/(vals.length-1) : 0;
          const pts = vals.map((v,i)=>{
            const x = pad + i*stepX;
            const y = h - pad - (v/max)*(h-pad*2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ");
          widgetEls.chart.innerHTML = `<polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
      }

      if(cardEl){
        const imp = t.impressions ?? "–";
        const clk = t.clicks ?? "–";
        cardEl.innerHTML = `<span class="dot"></span><span><strong>${imp}</strong>노출<span class="sep">·</span><strong>${clk}</strong>클릭</span>`;
      }
    })
    .catch(() => {
      if(widgetEls.updated) widgetEls.updated.textContent = "데이터를 불러오지 못했습니다";
      if(cardEl) cardEl.textContent = "";
    });
})();
