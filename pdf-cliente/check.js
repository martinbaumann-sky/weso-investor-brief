window.addEventListener("load", () => setTimeout(() => {
  const out = [];
  document.querySelectorAll(".slide").forEach((slide, i) => {
    const sr = slide.getBoundingClientRect();
    const bg = el => el.closest(".blob");
    slide.querySelectorAll("*").forEach(el => {
      if (bg(el) || el.closest("svg") && el.tagName !== "svg") return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const name = (el.className && el.className.baseVal === undefined ? el.className : el.tagName) + " «" + (el.textContent || "").trim().slice(0, 30) + "»";
      if (r.left < sr.left + 78 || r.right > sr.right - 78 || r.top < sr.top + 26 || r.bottom > sr.bottom - 20) {
        if (!el.classList.contains("blob")) out.push(`p${i+1} MARGIN ${name} [${Math.round(r.left-sr.left)},${Math.round(r.top-sr.top)},${Math.round(r.right-sr.left)},${Math.round(r.bottom-sr.top)}]`);
      }
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== "visible" && el.tagName !== "IMG") out.push(`p${i+1} CLIPPED-X ${name}`);
      if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow !== "visible" && el.tagName !== "IMG") out.push(`p${i+1} CLIPPED-Y ${name}`);
    });
    // children overflowing their parent box
    slide.querySelectorAll(".issue,.callout,.pillars>div,.channel,.kpi,.cats>div,.roles>div,.compare>div,.saving,.step,.member,.contacts>div,.journey li").forEach(box => {
      const b = box.getBoundingClientRect();
      box.querySelectorAll("*").forEach(c => { const r = c.getBoundingClientRect(); if (r.width && (r.bottom > b.bottom + 1 || r.right > b.right + 1)) out.push(`p${i+1} OVERFLOW ${box.className} ← ${c.tagName} «${(c.textContent||"").trim().slice(0,25)}»`); });
    });
    slide.querySelectorAll("img").forEach(img => { if (!img.complete || !img.naturalWidth) out.push(`p${i+1} BROKEN IMG ${img.getAttribute("src")}`); });
  });
  document.body.setAttribute("data-report", JSON.stringify(out));
}, 1500));
