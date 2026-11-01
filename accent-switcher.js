(function () {
  var PREFIX = "oc-color-"
  var COLORS = [
    { key: "accent", label: "Accent", fallback: "#d97757", base: true },
    { key: "accent-text", label: "Accent text (links, titles)", fallback: "#f29a7a", base: true },
    { key: "border", label: "Base border", fallback: "#3d4350", base: true },
    { key: "surface", label: "Surface (blocks)", fallback: "#1f232b", base: true },
    { key: "surface-2", label: "Surface header", fallback: "#282d36", base: true },
    { key: "rail", label: "Left edge line (replies)", fallback: "#d97757", block: true },
    { key: "heading", label: "Heading underline", fallback: "#6b4a3c", block: true },
    { key: "f-user", label: "Your message fill", fallback: "#3a2d29", block: true },
    { key: "f-quote", label: "Quote fill", fallback: "#33302a", block: true },
    { key: "f-code", label: "Inline code fill", fallback: "#4a3328", block: true },
    { key: "b-user", label: "Your message border", fallback: "#7a4a3c", block: true },
    { key: "b-assistant", label: "Assistant reply border", fallback: "#3d4350", block: true },
    { key: "b-code", label: "Code block border", fallback: "#3d4350", block: true },
    { key: "b-table", label: "Table border", fallback: "#3d4350", block: true },
    { key: "b-quote", label: "Quote border", fallback: "#3d4350", block: true },
    { key: "b-tool", label: "Tool card border", fallback: "#3d4350", block: true },
    { key: "b-prompt", label: "Permission prompt border", fallback: "#3d4350", block: true },
    { key: "b-divider", label: "Turn divider", fallback: "#3d4350", block: true }
  ]

  var LAYOUT_PREFIX = "oc-layout-"
  var LAYOUT = [
    { key: "timeline-width", label: "Chat column width", fallback: 60 },
    { key: "prompt-width", label: "Prompt box width", fallback: 60 }
  ]

  // Each preset gives six values plus a your-message fill; the rest are derived in derive().
  var PRESETS = {
    "Claude orange": { userFill: "#3a2d27", accent: "#d97757", text: "#f29a7a", border: "#3d3a36", strong: "#55514b", surface: "#1f1e1c", surface2: "#2a2825" },
    "Dracula": { userFill: "#3d3350", accent: "#bd93f9", text: "#ff79c6", border: "#44475a", strong: "#6272a4", surface: "#282a36", surface2: "#343746" },
    "Nord": { userFill: "#3a4657", accent: "#88c0d0", text: "#81a1c1", border: "#3b4252", strong: "#4c566a", surface: "#2e3440", surface2: "#3b4252" },
    "Catppuccin Mocha": { userFill: "#3d3140", accent: "#fab387", text: "#cba6f7", border: "#313244", strong: "#45475a", surface: "#1e1e2e", surface2: "#181825" },
    "Tokyo Night": { userFill: "#293552", accent: "#7aa2f7", text: "#bb9af7", border: "#292e42", strong: "#3b4261", surface: "#1a1b26", surface2: "#16161e" },
    "Gruvbox Dark": { userFill: "#42331f", accent: "#fe8019", text: "#fabd2f", border: "#3c3836", strong: "#504945", surface: "#282828", surface2: "#32302f" },
    "One Dark": { userFill: "#2e3b4e", accent: "#61afef", text: "#c678dd", border: "#3e4451", strong: "#5c6370", surface: "#282c34", surface2: "#21252b" },
    "Solarized Dark": { userFill: "#0b4150", accent: "#268bd2", text: "#2aa198", border: "#073642", strong: "#586e75", surface: "#002b36", surface2: "#073642" },
    "Monokai": { userFill: "#3d2a33", accent: "#f92672", text: "#a6e22e", border: "#3e3d32", strong: "#75715e", surface: "#272822", surface2: "#3e3d32" },
    "Rosé Pine": { userFill: "#2d2536", accent: "#ebbcba", text: "#c4a7e7", border: "#26233a", strong: "#403d52", surface: "#191724", surface2: "#1f1d2e" },
    "Everforest": { userFill: "#374a3c", accent: "#a7c080", text: "#83c092", border: "#343f44", strong: "#495156", surface: "#2d353b", surface2: "#343f44" },
    "Kanagawa": { userFill: "#2c2e44", accent: "#7e9cd8", text: "#957fb8", border: "#2a2a37", strong: "#54546d", surface: "#1f1f28", surface2: "#2a2a37" },
    "Night Owl": { userFill: "#0f3050", accent: "#82aaff", text: "#c792ea", border: "#1d3b53", strong: "#5f7e97", surface: "#011627", surface2: "#0b253a" },
    "GitHub Dark": { userFill: "#13284a", accent: "#58a6ff", text: "#79c0ff", border: "#30363d", strong: "#484f58", surface: "#0d1117", surface2: "#161b22" },
    "Ayu Mirage": { userFill: "#3a3a2c", accent: "#ffcc66", text: "#ffa759", border: "#33415e", strong: "#4c5a77", surface: "#1f2430", surface2: "#242936" },
    "Material Palenight": { userFill: "#3a3358", accent: "#c792ea", text: "#82aaff", border: "#32374d", strong: "#444267", surface: "#292d3e", surface2: "#232635" },
    "Synthwave": { userFill: "#3a1a4a", accent: "#ff2a6d", text: "#05d9e8", border: "#2a1f4a", strong: "#4b3b7a", surface: "#1a1033", surface2: "#241845" }
  }

  var root = document.documentElement

  function get(k) { return localStorage.getItem(PREFIX + k) }

  function getLayout(k) { return localStorage.getItem(LAYOUT_PREFIX + k) }

  function hex(c) {
    return "#" + [0, 2, 4].map(function (i) {
      return Math.round(c[i]).toString(16).padStart(2, "0")
    }).join("")
  }

  function rgb(h) {
    return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16) })
  }

  function mix(a, b, t) {
    var x = rgb(a), y = rgb(b)
    return hex(x.map(function (v, i) { return v * (1 - t) + y[i] * t }))
  }

  function derive(p) {
    return {
      accent: p.accent,
      "accent-text": p.text,
      border: p.border,
      surface: p.surface,
      "surface-2": p.surface2,
      rail: p.accent,
      heading: mix(p.border, p.accent, 0.35),
      "f-user": p.userFill || mix(p.surface, p.accent, 0.08),
      "f-quote": mix(p.surface, p.accent, 0.06),
      "f-code": mix(p.surface, p.accent, 0.12),
      "b-user": mix(p.border, p.accent, 0.45),
      "b-assistant": p.strong,
      "b-code": p.strong,
      "b-table": p.strong,
      "b-quote": p.strong,
      "b-tool": p.strong,
      "b-prompt": p.strong,
      "b-divider": p.strong
    }
  }

  function apply() {
    COLORS.forEach(function (c) {
      var v = get(c.key)
      var name = "--oc-" + c.key
      if (v) root.style.setProperty(name, v)
      else root.style.removeProperty(name)
    })
    LAYOUT.forEach(function (l) {
      var v = getLayout(l.key)
      var name = "--oc-" + l.key
      if (v) root.style.setProperty(name, v + "vw")
      else root.style.removeProperty(name)
    })
  }

  function mount() {
    var box = document.createElement("div")
    box.id = "oc-accent-switcher"
    box.setAttribute("style", "position:fixed;right:12px;bottom:12px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:6px;font-family:var(--font-family-sans,sans-serif);font-size:12px")

    var panel = document.createElement("div")
    panel.setAttribute("style", "display:none;flex-direction:column;gap:6px;padding:10px 12px;width:270px;max-height:70vh;overflow:auto;border-radius:10px;background:var(--background-base,#101010);border:1px solid rgba(127,127,127,.35);color:var(--text-strong,#eee)")

    var toggle = document.createElement("button")
    toggle.type = "button"
    toggle.title = "Theme patcher"
    toggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-4.9-4.5-9-10-9z"/><circle cx="7.5" cy="10.5" r="1" fill="currentColor"/><circle cx="10.5" cy="6.5" r="1" fill="currentColor"/><circle cx="15" cy="7.5" r="1" fill="currentColor"/></svg>'
    toggle.setAttribute("style", "padding:5px 9px;border-radius:999px;background:var(--background-base,#101010);border:1px solid rgba(127,127,127,.35);color:var(--text-base,#ccc);cursor:pointer;display:flex;align-items:center")
    toggle.addEventListener("click", function () {
      panel.style.display = panel.style.display === "none" ? "flex" : "none"
    })

    var inputs = {}

    function row(c) {
      var r = document.createElement("div")
      r.setAttribute("style", "display:flex;justify-content:space-between;align-items:center;gap:6px")
      var t = document.createElement("span")
      t.textContent = c.label
      var right = document.createElement("span")
      right.setAttribute("style", "display:flex;align-items:center;gap:2px;flex:none")
      var input = document.createElement("input")
      input.type = "color"
      input.setAttribute("style", "width:40px;height:24px;padding:0;border:0;background:transparent;cursor:pointer")
      input.addEventListener("input", function () {
        localStorage.setItem(PREFIX + c.key, input.value)
        apply()
      })
      var clear = document.createElement("button")
      clear.type = "button"
      clear.title = "Use theme default"
      clear.textContent = "×"
      clear.setAttribute("style", "border:0;background:transparent;color:inherit;cursor:pointer;font:inherit;padding:0 4px;opacity:.7")
      clear.addEventListener("click", function () {
        localStorage.removeItem(PREFIX + c.key)
        apply()
        paint()
      })
      inputs[c.key] = input
      right.appendChild(input)
      right.appendChild(clear)
      r.appendChild(t)
      r.appendChild(right)
      return r
    }

    function heading(text) {
      var h = document.createElement("div")
      h.textContent = text
      h.setAttribute("style", "margin-top:6px;font-weight:600;opacity:.8")
      return h
    }

    function section(text) {
      var h = document.createElement("div")
      h.textContent = text
      h.setAttribute("style", "font-weight:700;font-size:13px;margin-top:2px")
      return h
    }

    var layoutInputs = {}

    function layoutRow(l) {
      var r = document.createElement("div")
      r.setAttribute("style", "display:flex;flex-direction:column;gap:2px")
      var top = document.createElement("div")
      top.setAttribute("style", "display:flex;justify-content:space-between;align-items:center;gap:6px")
      var t = document.createElement("span")
      t.textContent = l.label
      var right = document.createElement("span")
      right.setAttribute("style", "display:flex;align-items:center;gap:2px;flex:none")
      var value = document.createElement("span")
      value.setAttribute("style", "min-width:56px;text-align:right;opacity:.8")
      var clear = document.createElement("button")
      clear.type = "button"
      clear.title = "Use app default"
      clear.textContent = "×"
      clear.setAttribute("style", "border:0;background:transparent;color:inherit;cursor:pointer;font:inherit;padding:0 4px;opacity:.7")
      clear.addEventListener("click", function () {
        localStorage.removeItem(LAYOUT_PREFIX + l.key)
        apply()
        paint()
      })
      var range = document.createElement("input")
      range.type = "range"
      range.min = "30"
      range.max = "100"
      range.step = "1"
      range.setAttribute("style", "width:100%;margin:0;accent-color:var(--oc-accent,#d97757)")
      range.addEventListener("input", function () {
        localStorage.setItem(LAYOUT_PREFIX + l.key, range.value)
        apply()
        value.textContent = range.value + "%"
      })
      right.appendChild(value)
      right.appendChild(clear)
      top.appendChild(t)
      top.appendChild(right)
      r.appendChild(top)
      r.appendChild(range)
      layoutInputs[l.key] = { range: range, value: value }
      return r
    }

    var presetSelect = document.createElement("select")
    presetSelect.setAttribute("style", "width:100%;padding:4px;border-radius:6px;background:#1f232b;color:#eee;border:1px solid rgba(127,127,127,.35);font:inherit;color-scheme:dark")
    var placeholder = document.createElement("option")
    placeholder.textContent = "Choose a preset…"
    placeholder.value = ""
    placeholder.setAttribute("style", "background:#1f232b;color:#eee")
    presetSelect.appendChild(placeholder)
    Object.keys(PRESETS).forEach(function (name) {
      var o = document.createElement("option")
      o.value = name
      o.textContent = name
      o.setAttribute("style", "background:#1f232b;color:#eee")
      presetSelect.appendChild(o)
    })
    presetSelect.addEventListener("change", function () {
      var name = presetSelect.value
      if (!name) return
      var values = derive(PRESETS[name])
      COLORS.forEach(function (c) { localStorage.setItem(PREFIX + c.key, values[c.key]) })
      apply()
      paint()
      presetSelect.value = ""
    })

    var resetStyle = "margin-top:6px;border:1px solid rgba(127,127,127,.35);border-radius:6px;background:transparent;color:inherit;cursor:pointer;padding:4px 8px;font:inherit"

    panel.appendChild(section("Colors"))
    panel.appendChild(presetSelect)
    panel.appendChild(heading("Base colors"))
    COLORS.filter(function (c) { return c.base }).forEach(function (c) { panel.appendChild(row(c)) })
    panel.appendChild(heading("Blocks"))
    COLORS.filter(function (c) { return c.block }).forEach(function (c) { panel.appendChild(row(c)) })

    var reset = document.createElement("button")
    reset.type = "button"
    reset.textContent = "Reset all"
    reset.setAttribute("style", resetStyle)
    reset.addEventListener("click", function () {
      COLORS.forEach(function (c) { localStorage.removeItem(PREFIX + c.key) })
      apply()
      paint()
    })
    panel.appendChild(reset)

    var divider = document.createElement("div")
    divider.setAttribute("style", "height:1px;background:rgba(127,127,127,.35);margin:8px 0 4px")
    panel.appendChild(divider)

    panel.appendChild(section("Layout"))
    LAYOUT.forEach(function (l) { panel.appendChild(layoutRow(l)) })

    var resetLayout = document.createElement("button")
    resetLayout.type = "button"
    resetLayout.textContent = "Reset layout"
    resetLayout.setAttribute("style", resetStyle)
    resetLayout.addEventListener("click", function () {
      LAYOUT.forEach(function (l) { localStorage.removeItem(LAYOUT_PREFIX + l.key) })
      apply()
      paint()
    })
    panel.appendChild(resetLayout)

    function paint() {
      COLORS.forEach(function (c) {
        inputs[c.key].value = get(c.key) || c.fallback
      })
      LAYOUT.forEach(function (l) {
        var v = getLayout(l.key)
        layoutInputs[l.key].range.value = v || l.fallback
        layoutInputs[l.key].value.textContent = v ? v + "%" : "Default"
      })
    }

    box.appendChild(panel)
    box.appendChild(toggle)
    document.body.appendChild(box)
    paint()
  }

  apply()
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount)
  else mount()
})()
