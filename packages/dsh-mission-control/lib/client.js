window.__ModuleLoader__.load({
  id: 'dsh-mission-control',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var React = require('react')

    var CSS = [
      '.dsh-mission-view{height:100%;display:flex;flex-direction:column;box-sizing:border-box;background:var(--dsw-alias-bg-base);overflow:hidden;}',
      '.dsh-mission-topbar{display:flex;flex-direction:column;gap:6px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);}',
      '.dsh-mission-line1{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
      '.dsh-mission-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.dsh-mission-pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:0 8px;font-size:11px;line-height:18px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}',
      '.dsh-mission-pill-accepted{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent);color:var(--dsw-alias-state-success-primary);}',
      '.dsh-mission-pill-needs_review{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 40%,transparent);color:var(--dsw-alias-state-warn-primary);}',
      '.dsh-mission-pill-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 40%,transparent);color:var(--dsw-alias-brand-primary);}',
      '.dsh-mission-pill-rejected{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,transparent);color:var(--dsw-alias-state-error-primary);}',
      '.dsh-mission-sub{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;word-break:break-word;}',
      '.dsh-mission-main{flex:1;display:flex;min-height:0;}',
      '.dsh-mission-canvas{flex:1;min-width:0;position:relative;overflow:hidden;background:var(--dsw-alias-bg-base);overscroll-behavior:none;touch-action:none;}',
      '.dsh-mission-canvas svg{display:block;width:100%;height:100%;}',
      '.dsh-mission-side{width:300px;min-width:260px;max-width:340px;box-sizing:border-box;border-left:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px;}',
      '.dsh-side-section{display:flex;flex-direction:column;gap:5px;}',
      '.dsh-side-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);line-height:1.35;word-break:break-word;}',
      '.dsh-side-label{font-size:10px;color:var(--dsw-alias-label-secondary);text-transform:uppercase;letter-spacing:.03em;}',
      '.dsh-side-list{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-primary);padding-left:14px;margin:2px 0 0;}',
      '.dsh-side-empty{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.5;}',
      '.dsh-side-chip{display:inline-flex;align-items:center;border-radius:999px;padding:0 7px;font-size:10px;line-height:17px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}',
      '.dsh-node{height:100%;box-sizing:border-box;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);display:flex;align-items:center;gap:7px;padding:0 9px;overflow:hidden;cursor:pointer;}',
      '.dsh-node-dot{width:9px;height:9px;border-radius:50%;flex:none;}',
      '.dsh-node-label{font-size:11px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dsh-node-id{font-size:10px;color:var(--dsw-alias-label-secondary);flex:none;}',
      '.dsh-node-active{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent);}',
      '.dsh-node-needs_review{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 8%,transparent);}',
      '.dsh-node-accepted{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,transparent);}',
      '.dsh-node-rejected{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);}',
      '.dsh-mission-empty{padding:48px 20px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6;}',
      '.dsh-canvas-controls{position:absolute;top:10px;right:12px;display:flex;gap:4px;z-index:2;}',
      '.dsh-canvas-btn{min-width:26px;height:26px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:14px;line-height:24px;text-align:center;cursor:pointer;}',
      '.dsh-canvas-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);}',
      '.dsh-node{cursor:move;}',
    ].join('')

    var CSS_ID = 'dsh-mission-control:graph2'

    function ensureStyles() {
      if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_ID) + ']') === null) {
        var tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-mission-control'
        tag.dataset.pluginCss = CSS_ID
        tag.textContent = CSS
        document.head.appendChild(tag)
      }
    }

    function fmtRemain(ms) {
      if (typeof ms !== 'number') return ''
      if (ms <= 0) return '\u5df2\u8fc7\u671f'
      var h = Math.floor(ms / 3600000)
      var m = Math.floor((ms % 3600000) / 60000)
      if (h > 0) return h + 'h' + (m > 0 ? ' ' + m + 'm' : '')
      if (m > 0) return m + 'm'
      return Math.max(1, Math.floor(ms / 1000)) + 's'
    }
    function statusLabel(s) {
      if (s === 'open') return '\u5f85\u8ba4\u9886'
      if (s === 'active') return '\u8fdb\u884c\u4e2d'
      if (s === 'needs_review') return '\u5f85\u5ba1\u6838'
      if (s === 'accepted') return '\u5df2\u901a\u8fc7'
      if (s === 'rejected') return '\u5df2\u62d2\u7edd'
      return s || '?'
    }
    function pillClass(s) {
      if (s === 'accepted') return 'dsh-mission-pill-accepted'
      if (s === 'needs_review') return 'dsh-mission-pill-needs_review'
      if (s === 'active') return 'dsh-mission-pill-active'
      if (s === 'rejected') return 'dsh-mission-pill-rejected'
      return ''
    }
    function nodeClass(s) {
      if (s === 'accepted') return 'dsh-node-accepted'
      if (s === 'needs_review') return 'dsh-node-needs_review'
      if (s === 'active') return 'dsh-node-active'
      if (s === 'rejected') return 'dsh-node-rejected'
      return ''
    }
    function dotColor(s) {
      if (s === 'accepted') return 'var(--dsw-alias-state-success-primary)'
      if (s === 'needs_review') return 'var(--dsw-alias-state-warn-primary)'
      if (s === 'active') return 'var(--dsw-alias-brand-primary)'
      if (s === 'rejected') return 'var(--dsw-alias-state-error-primary)'
      return 'var(--dsw-alias-label-secondary)'
    }
    function roleLabel(a) {
      if (a === 'final_reviewer') return '\u6700\u7ec8\u8bc4\u5ba1'
      if (a === 'reviewer') return '\u4efb\u52a1\u8bc4\u5ba1'
      return a
    }

    function computeLayout(tasks) {
      var byId = {}
      tasks.forEach(function (t) { byId[t.id] = t })
      var level = {}
      function getLevel(id, seen) {
        if (level[id] !== undefined) return level[id]
        if (seen[id]) return 0
        seen[id] = true
        var t = byId[id]
        var max = 0
        if (t) {
          (t.dependencies || []).forEach(function (d) {
            if (byId[d]) max = Math.max(max, getLevel(d, seen) + 1)
          })
        }
        level[id] = max
        return max
      }
      tasks.forEach(function (t) { getLevel(t.id, {}) })
      var cols = {}
      tasks.forEach(function (t) {
        var l = level[t.id] || 0
        if (!cols[l]) cols[l] = []
        cols[l].push(t)
      })
      var maxLevel = 0
      Object.keys(cols).forEach(function (k) { if (Number(k) > maxLevel) maxLevel = Number(k) })
      var nodeW = 150, nodeH = 32, gapX = 42, gapY = 52, pad = 30
      var positions = {}
      var maxCols = 0
      Object.keys(cols).forEach(function (k) {
        var arr = cols[k]
        if (arr.length > maxCols) maxCols = arr.length
        arr.forEach(function (t, i) {
          positions[t.id] = { x: pad + i * (nodeW + gapX), y: pad + Number(k) * (nodeH + gapY) }
        })
      })
      var width = pad * 2 + maxCols * nodeW + Math.max(0, maxCols - 1) * gapX
      var height = pad * 2 + (maxLevel + 1) * nodeH + maxLevel * gapY
      return { byId: byId, positions: positions, width: width, height: height, nodeW: nodeW, nodeH: nodeH }
    }

    exports.inject = ['slots', 'timer', 'sessions']

    exports.apply = function (ctx) {
      ensureStyles()

      function MissionView() {
        var dataState = React.useState(null)
        var data = dataState[0]
        var setData = dataState[1]
        var errorState = React.useState(null)
        var error = errorState[0]
        var setError = errorState[1]
        var activeState = React.useState(null)
        var active = activeState[0]
        var setActive = activeState[1]
        var chosenState = React.useState(null)
        var chosen = chosenState[0]
        var setChosen = chosenState[1]
        var hideRejectedState = React.useState(true)
        var hideRejected = hideRejectedState[0]
        var setHideRejected = hideRejectedState[1]
        var hiddenState = React.useState({})
        var hiddenIds = hiddenState[0]
        var setHiddenIds = hiddenState[1]
        var viewState = React.useState({ x: 0, y: 0, scale: 1 })
        var view = viewState[0]
        var setView = viewState[1]
        var posState = React.useState(null)
        var positions = posState[0]
        var setPositions = posState[1]
        var canvasRef = React.useRef(null)
        var panRef = React.useRef(null)
        var dragRef = React.useRef(null)

        React.useEffect(function () {
          var alive = true
          function poll() {
            var sessionId
            var cwd = ''
            try {
              var snap = ctx.sessions.list.getSnapshot()
              sessionId = snap.current
              if (sessionId && snap.byId && snap.byId[sessionId] && snap.byId[sessionId].cwd) cwd = snap.byId[sessionId].cwd
            } catch (e) {
              sessionId = undefined
            }
            if (!sessionId) {
              if (alive) { setData(null); setError(null) }
              return
            }
            var url = '/api/mission-state?sessionId=' + encodeURIComponent(sessionId)
            if (cwd !== '') url += '&cwd=' + encodeURIComponent(cwd)
            fetch(url, { cache: 'no-store' })
              .then(function (r) { return r.json() })
              .then(function (d) {
                if (!alive) return
                setData(d)
                setError(d && d.error ? d.error : null)
              })
              .catch(function (err) {
                if (!alive) return
                setError(String((err && err.message) || err))
                setData(null)
              })
          }
          poll()
          var stop
          if (typeof ctx.interval === 'function') stop = ctx.interval(poll, 2000)
          else if (ctx.timer && typeof ctx.timer.interval === 'function') stop = ctx.timer.interval(poll, 2000)
          else {
            var id = window.setInterval(poll, 2000)
            stop = function () { window.clearInterval(id) }
          }
          return function () { alive = false; if (typeof stop === 'function') stop() }
        }, [])

        var mission = data && data.mission ? data.mission : null

        React.useEffect(function () {
          if (!mission || positions !== null) return
          var posKey = 'dsh-mission-positions:' + mission.id
          var viewKey = 'dsh-mission-view:' + mission.id
          var hiddenKey = 'dsh-mission-hidden:' + mission.id
          try {
            var savedHidden = window.localStorage.getItem(hiddenKey)
            if (savedHidden) setHiddenIds(JSON.parse(savedHidden))
          } catch (e) {}
          try {
            var savedPos = window.localStorage.getItem(posKey)
            if (savedPos) {
              setPositions(JSON.parse(savedPos))
              return
            }
          } catch (e) {}
          try {
            var savedView = window.localStorage.getItem(viewKey)
            if (savedView) setView(JSON.parse(savedView))
          } catch (e) {}
          var initial = {}
          var lp = computeLayout(mission.tasks || []).positions
          Object.keys(lp).forEach(function (id) { initial[id] = { x: lp[id].x, y: lp[id].y } })
          setPositions(initial)
        }, [mission, positions])

        React.useEffect(function () {
          if (!mission) return
          var viewKey = 'dsh-mission-view:' + mission.id
          try { window.localStorage.setItem(viewKey, JSON.stringify(view)) } catch (e) {}
        }, [mission, view])

        if (!mission) {
          return React.createElement('div', { className: 'dsh-mission-view' }, React.createElement('div', { className: 'dsh-mission-empty' }, error || '\u5f53\u524d\u4f1a\u8bdd\u6ca1\u6709\u4efb\u52a1\uff08\u5728\u5de5\u4f5c\u533a\u542f\u52a8 mission_start \u540e\u53ef\u89c6\u5316\uff09'))
        }

        var tasks = mission.tasks || []
        var visibleTasks = tasks.filter(function (t) { return !hiddenIds[t.id] && (hideRejected ? t.status !== 'rejected' : true) })
        var layout = computeLayout(visibleTasks)
        function currentPos(id) {
          return positions && positions[id] ? positions[id] : layout.positions[id]
        }
        function startNodeDrag(e, task) {
          e.preventDefault()
          e.stopPropagation()
          var p = currentPos(task.id)
          dragRef.current = { id: task.id, startX: e.clientX, startY: e.clientY, origX: p.x, origY: p.y }
        }
        function canvasDown(e) {
          if (e.target && e.target.closest && e.target.closest('.dsh-node')) return
          panRef.current = { startX: e.clientX, startY: e.clientY, x: view.x, y: view.y }
          e.preventDefault()
        }
        function canvasMove(e) {
          var rect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : null
          if (!rect) return
          var scale = view.scale
          var ux = layout.width / scale / rect.width
          var uy = layout.height / scale / rect.height
          if (dragRef.current) {
            var d = dragRef.current
            var nx = d.origX + (e.clientX - d.startX) * ux
            var ny = d.origY + (e.clientY - d.startY) * uy
            var next = {}
            Object.keys(positions || {}).forEach(function (id) { next[id] = positions[id] })
            next[d.id] = { x: nx, y: ny }
            setPositions(next)
            try {
              if (mission) window.localStorage.setItem('dsh-mission-positions:' + mission.id, JSON.stringify(next))
            } catch (e) {}
          } else if (panRef.current) {
            var p = panRef.current
            setView({ x: p.x - (e.clientX - p.startX) * ux, y: p.y - (e.clientY - p.startY) * uy, scale: scale })
          }
        }
        function canvasUp() {
          panRef.current = null
          dragRef.current = null
        }
        function canvasWheel(e) {
          e.preventDefault()
          e.stopPropagation()
          var rect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : null
          if (!rect) return
          var oldScale = view.scale
          var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
          var newScale = Math.max(0.4, Math.min(3, oldScale * factor))
          var fx = (e.clientX - rect.left) / rect.width
          var fy = (e.clientY - rect.top) / rect.height
          var wx = view.x + fx * (layout.width / oldScale)
          var wy = view.y + fy * (layout.height / oldScale)
          setView({ x: wx - fx * (layout.width / newScale), y: wy - fy * (layout.height / newScale), scale: newScale })
        }
        function zoomBy(f) {
          var oldScale = view.scale
          var newScale = Math.max(0.4, Math.min(3, oldScale * f))
          setView({ x: view.x, y: view.y, scale: newScale })
        }
        function resetView() { setView({ x: 0, y: 0, scale: 1 }) }
        function deleteTask(task) {
          var next = Object.assign({}, hiddenIds)
          next[task.id] = true
          setHiddenIds(next)
          try { if (mission) window.localStorage.setItem('dsh-mission-hidden:' + mission.id, JSON.stringify(next)) } catch (e) {}
          if (current && current.id === task.id) {
            setChosen(null)
            setActive(null)
          }
        }
        function restoreHidden() {
          setHiddenIds({})
          try { if (mission) window.localStorage.removeItem('dsh-mission-hidden:' + mission.id) } catch (e) {}
        }

        var counts = mission.counts || {}
        var statItems = [
          ['\u5f85\u8ba4\u9886', counts.open || 0],
          ['\u8fdb\u884c\u4e2d', counts.active || 0],
          ['\u5f85\u5ba1\u6838', counts.needs_review || 0],
          ['\u5df2\u901a\u8fc7', counts.accepted || 0],
          ['\u5df2\u62d2\u7edd', counts.rejected || 0],
        ]
        var statPills = statItems.map(function (it) {
          return React.createElement('span', { className: 'dsh-mission-pill', key: it[0] }, it[0] + ' ' + it[1])
        })

        var artifacts = mission.artifacts || []
        var wiki = mission.wiki || {}
        var cats = wiki.categories || {}

        var hasTaskReview = tasks.some(function (t) { return t.assignee === 'reviewer' || (t.kind === 'review' && t.assignee !== 'final_reviewer') })
        var hasFinalReview = tasks.some(function (t) { return t.assignee === 'final_reviewer' })

        var edges = []
        visibleTasks.forEach(function (t) {
          (t.dependencies || []).forEach(function (d) {
            var from = layout.byId[d]
            var p1 = from && currentPos(from.id)
            var p2 = currentPos(t.id)
            if (!p1 || !p2) return
            var x1 = p1.x + layout.nodeW / 2
            var y1 = p1.y + layout.nodeH
            var x2 = p2.x + layout.nodeW / 2
            var y2 = p2.y
            var my = (y1 + y2) / 2
            edges.push(React.createElement('path', {
              d: 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + my + ', ' + x2 + ' ' + my + ', ' + x2 + ' ' + y2,
              fill: 'none',
              stroke: 'var(--dsw-alias-border-l2)',
              strokeWidth: 1.4,
              markerEnd: 'url(#dsh-mission-arrow)',
              key: d + '->' + t.id,
            }))
          })
        })

        var nodes = visibleTasks.map(function (t) {
          var p = currentPos(t.id)
          if (!p) return null
          return React.createElement('foreignObject', {
            key: t.id,
            x: p.x,
            y: p.y,
            width: layout.nodeW,
            height: layout.nodeH,
          },
            React.createElement('div', {
              className: 'dsh-node ' + nodeClass(t.status),
              onMouseEnter: function () { setActive(t) },
              onMouseLeave: function () { setActive(null) },
              onMouseDown: function (e) { startNodeDrag(e, t) },
              onClick: function () { setChosen(t) },
            },
              React.createElement('span', { className: 'dsh-node-dot', style: { background: dotColor(t.status) } }),
              React.createElement('span', { className: 'dsh-node-id' }, t.id),
              React.createElement('span', { className: 'dsh-node-label' }, t.title),
            ),
          )
        })

        var current = active || chosen
        var side = null
        if (current) {
          var task = current
          var evidence = task.requiredEvidence || []
          side = React.createElement('div', { className: 'dsh-mission-side' },
            React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '任务'),
              React.createElement('div', { className: 'dsh-side-title' }, task.title),
              React.createElement('div', { className: 'dsh-mission-line1' },
                React.createElement('span', { className: 'dsh-mission-pill' }, task.id),
                React.createElement('span', { className: 'dsh-mission-pill ' + pillClass(task.status) }, statusLabel(task.status)),
                task.assignee ? React.createElement('span', { className: 'dsh-mission-pill' }, roleLabel(task.assignee)) : null,
                task.kind ? React.createElement('span', { className: 'dsh-mission-pill' }, task.kind) : null,
                task.scrutinyLevel ? React.createElement('span', { className: 'dsh-mission-pill' }, task.scrutinyLevel) : null,
              ),
            ),
            (task.dependencies && task.dependencies.length > 0) ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '依赖'),
              React.createElement('div', { className: 'dsh-side-empty' }, task.dependencies.join(' \u00b7 ')),
            ) : null,
            (task.acceptance && task.acceptance.length > 0) ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '验收标准'),
              React.createElement('ul', { className: 'dsh-side-list' }, task.acceptance.map(function (a, i) { return React.createElement('li', { key: i }, a) })),
            ) : null,
            task.review ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, task.assignee === 'final_reviewer' ? '最终评审' : '任务评审'),
              React.createElement('div', { className: 'dsh-side-empty' }, (task.review.verdict === 'pass' ? '通过' : task.review.verdict === 'reject' ? '拒绝' : task.review.verdict) + ' \u00b7 ' + (task.review.reviewer || '?')),
            ) : null,
            task.claim ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '占用 / 租期'),
              React.createElement('div', { className: 'dsh-side-empty' }, task.claim.worker + ' \u00b7 ' + fmtRemain(task.claim.leaseRemainingMs)),
            ) : null,
            evidence.length > 0 ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '必交证据'),
              React.createElement('div', { className: 'dsh-side-empty' }, evidence.join(' \u00b7 ')),
            ) : null,
            (task.capabilities && task.capabilities.length > 0) ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '能力'),
              React.createElement('div', { className: 'dsh-mission-line1' }, task.capabilities.map(function (c) { return React.createElement('span', { className: 'dsh-side-chip', key: c }, c) })),
            ) : null,
            task.leaseBlocked ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '封锁'),
              React.createElement('div', { className: 'dsh-side-empty' }, task.blockedReason || 'claim 次数超限'),
            ) : null,
            task.status === 'rejected' ? React.createElement('button', {
              className: 'dsh-canvas-btn',
              style: { alignSelf: 'flex-start' },
              onClick: function () { deleteTask(task) },
            }, '从图中删除') : null,
          )
        } else {
          side = React.createElement('div', { className: 'dsh-mission-side' },
            React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '成功标准'),
              React.createElement('ul', { className: 'dsh-side-list' }, (mission.successCriteria || []).map(function (c, i) { return React.createElement('li', { key: i }, c) })),
            ),
            React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '评审层级'),
              React.createElement('div', { className: 'dsh-mission-line1' },
                hasTaskReview ? React.createElement('span', { className: 'dsh-side-chip' }, '任务级评审') : null,
                hasFinalReview ? React.createElement('span', { className: 'dsh-side-chip' }, '最终评审') : null,
              ),
              React.createElement('div', { className: 'dsh-side-empty' }, '悬停节点可查看任务详情'),
            ),
            React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '黑板产物 ' + artifacts.length),
              artifacts.length === 0 ? React.createElement('div', { className: 'dsh-side-empty' }, '暂无') : artifacts.slice(0, 6).map(function (a) {
                return React.createElement('div', { className: 'dsh-side-empty', key: a.id || (a.type + a.path) }, (a.type || 'artifact') + (a.path ? ' \u00b7 ' + a.path : ''))
              }),
            ),
            React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '记忆库'),
              React.createElement('div', { className: 'dsh-side-empty' }, wiki.exists ? ('共 ' + (wiki.pages || 0) + ' 篇 \u00b7 ' + Object.keys(cats).map(function (k) { return k + ':' + cats[k] }).join(' \u00b7 ')) : '暂无 .memory'),
            ),
            mission.blindReview ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '外部盲审 / 校准'),
              React.createElement('div', { className: 'dsh-side-empty' }, 'avg ' + (mission.blindReview.avg_rating ?? '?') + ' \u00b7 n=' + (mission.blindReview.n_reviews ?? '?') + ' \u00b7 ' + (mission.blindReview.decision || '')),
            ) : null,
            mission.finalAudit ? React.createElement('div', { className: 'dsh-side-section' },
              React.createElement('div', { className: 'dsh-side-label' }, '完成审计'),
              React.createElement('div', { className: 'dsh-side-empty' }, (mission.finalAudit.passed ? 'PASS' : 'BLOCKED') + (mission.finalAudit.gaps && mission.finalAudit.gaps.length ? ' \u00b7 ' + mission.finalAudit.gaps.join('; ') : '')),
            ) : null,
          )
        }

        return React.createElement('div', { className: 'dsh-mission-view' },
          React.createElement('div', { className: 'dsh-mission-topbar' },
            React.createElement('div', { className: 'dsh-mission-line1' },
              React.createElement('div', { className: 'dsh-mission-title' }, mission.title || mission.id),
              React.createElement('span', { className: 'dsh-mission-pill' }, mission.status + ' \u00b7 round ' + (mission.currentRound || 0)),
              React.createElement('span', { className: 'dsh-mission-pill' }, '任务 ' + ((mission.counts && mission.counts.total) || 0)),
              React.createElement('span', { className: 'dsh-mission-pill' }, '黑板 ' + artifacts.length),
              wiki.exists ? React.createElement('span', { className: 'dsh-mission-pill' }, '记忆库 ' + (wiki.pages || 0)) : null,
            ),
            React.createElement('div', { className: 'dsh-mission-line1' },
              statPills,
              React.createElement('button', {
                className: 'dsh-mission-pill',
                style: { cursor: 'pointer' },
                onClick: function () { setHideRejected(!hideRejected) },
              }, hideRejected ? ('显示已拒绝 ' + tasks.filter(function (t) { return t.status === 'rejected' }).length) : '隐藏已拒绝'),
              Object.keys(hiddenIds).length > 0 ? React.createElement('button', {
                className: 'dsh-mission-pill',
                style: { cursor: 'pointer' },
                onClick: restoreHidden,
              }, '已删除 ' + Object.keys(hiddenIds).length + ' · 恢复') : null,
            ),
          ),
          React.createElement('div', { className: 'dsh-mission-main' },
            React.createElement('div', {
              className: 'dsh-mission-canvas',
              ref: canvasRef,
              onMouseDown: canvasDown,
              onMouseMove: canvasMove,
              onMouseUp: canvasUp,
              onMouseLeave: canvasUp,
              onWheel: canvasWheel,
            },
              React.createElement('div', { className: 'dsh-canvas-controls' },
                React.createElement('button', { className: 'dsh-canvas-btn', onClick: function () { zoomBy(1.2) }, 'aria-label': '放大' }, '+'),
                React.createElement('button', { className: 'dsh-canvas-btn', onClick: function () { zoomBy(1 / 1.2) }, 'aria-label': '缩小' }, '−'),
                React.createElement('button', { className: 'dsh-canvas-btn', onClick: resetView, 'aria-label': '复位' }, '⟲'),
              ),
              React.createElement('svg', { viewBox: view.x + ' ' + view.y + ' ' + (layout.width / view.scale) + ' ' + (layout.height / view.scale), preserveAspectRatio: 'xMidYMid meet' },
                React.createElement('defs', null,
                  React.createElement('marker', {
                    id: 'dsh-mission-arrow',
                    markerWidth: 8,
                    markerHeight: 8,
                    refX: 7,
                    refY: 4,
                    orient: 'auto',
                    markerUnits: 'strokeWidth',
                  },
                    React.createElement('path', { d: 'M0,0 L8,4 L0,8 z', fill: 'var(--dsw-alias-border-l2)' }),
                  ),
                ),
                React.createElement('g', null, edges),
                React.createElement('g', null, nodes),
              ),
            ),
            side,
          ),
        )
      }

      ctx.slots.inject('conversation.view', function () {
        return ctx.slots.register(
          { name: 'conversation.view', id: 'mission', order: 5, label: '\u4efb\u52a1' },
          function () { return React.createElement(MissionView, null) },
        )
      })
    }

    return module.exports
  },
})
