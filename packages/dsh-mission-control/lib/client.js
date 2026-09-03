window.__ModuleLoader__.load({
  id: 'dsh-mission-control',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var React = require('react')

    var CSS = [
      '.dsh-mission-view{height:100%;overflow:auto;box-sizing:border-box;background:var(--dsw-alias-bg-base);position:relative;}',
      '.dsh-mission-topbar{display:flex;flex-direction:column;gap:8px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);}',
      '.dsh-mission-line1{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}',
      '.dsh-mission-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.dsh-mission-pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:1px 8px;font-size:11px;line-height:18px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}',
      '.dsh-mission-pill-accepted{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent);color:var(--dsw-alias-state-success-primary);}',
      '.dsh-mission-pill-needs_review{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 40%,transparent);color:var(--dsw-alias-state-warn-primary);}',
      '.dsh-mission-pill-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 40%,transparent);color:var(--dsw-alias-brand-primary);}',
      '.dsh-mission-pill-rejected{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 40%,transparent);color:var(--dsw-alias-state-error-primary);}',
      '.dsh-mission-sub{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;word-break:break-word;}',
      '.dsh-mission-graph-wrap{position:relative;overflow:auto;padding:8px;}',
      '.dsh-mission-graph{display:block;background:var(--dsw-alias-bg-base);}',
      '.dsh-node{height:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2);padding:6px 8px;display:flex;flex-direction:column;gap:2px;overflow:hidden;cursor:pointer;}',
      '.dsh-node-open{border-left:4px solid var(--dsw-alias-border-l2);}',
      '.dsh-node-active{border-left:4px solid var(--dsw-alias-brand-primary);}',
      '.dsh-node-needs_review{border-left:4px solid var(--dsw-alias-state-warn-primary);}',
      '.dsh-node-accepted{border-left:4px solid var(--dsw-alias-state-success-primary);}',
      '.dsh-node-rejected{border-left:4px solid var(--dsw-alias-state-error-primary);}',
      '.dsh-node-title{font-size:12px;line-height:1.3;color:var(--dsw-alias-label-primary);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;}',
      '.dsh-node-meta{font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dsh-node-sub{font-size:10px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.dsh-node-tooltip{position:fixed;z-index:99999;max-width:300px;box-sizing:border-box;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:var(--dsw-shadow-lv3);padding:10px 12px;display:flex;flex-direction:column;gap:6px;pointer-events:none;color:var(--dsw-alias-label-primary);}',
      '.dsh-tooltip-title{font-size:12px;font-weight:600;line-height:1.35;word-break:break-word;}',
      '.dsh-tooltip-meta{font-size:10px;color:var(--dsw-alias-label-secondary);display:flex;flex-wrap:wrap;gap:4px;}',
      '.dsh-tooltip-section{font-size:11px;line-height:1.45;}',
      '.dsh-tooltip-label{font-size:10px;color:var(--dsw-alias-label-secondary);text-transform:uppercase;letter-spacing:.03em;}',
      '.dsh-tooltip-list{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-primary);padding-left:14px;margin:2px 0 0;}',
      '.dsh-mission-empty{padding:48px 20px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6;}',
      '.dsh-legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}',
    ].join('')

    var CSS_ID = 'dsh-mission-control:graph'

    function ensureStyles() {
      if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_ID) + ']') === null) {
        var tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-mission-control'
        tag.dataset.pluginCss = CSS_ID
        tag.textContent = CSS
        document.head.appendChild(tag)
      }
    }

    function fmtTime(ms) {
      if (!ms) return ''
      var d = new Date(ms)
      var p = function (n) { return n < 10 ? '0' + n : String(n) }
      return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
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
      return 'dsh-node-open'
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
      var nodeW = 170, nodeH = 60, gapX = 78, gapY = 34, pad = 18
      var positions = {}
      var maxRows = 0
      Object.keys(cols).forEach(function (k) {
        var arr = cols[k]
        if (arr.length > maxRows) maxRows = arr.length
        arr.forEach(function (t, i) {
          positions[t.id] = { x: pad + Number(k) * (nodeW + gapX), y: pad + i * (nodeH + gapY) }
        })
      })
      var width = pad * 2 + (maxLevel + 1) * nodeW + maxLevel * gapX
      var height = pad * 2 + maxRows * nodeH + Math.max(0, maxRows - 1) * gapY
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
        var tipState = React.useState(null)
        var tip = tipState[0]
        var setTip = tipState[1]

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
        if (!mission) {
          return React.createElement('div', { className: 'dsh-mission-view' }, React.createElement('div', { className: 'dsh-mission-empty' }, error || '\u5f53\u524d\u4f1a\u8bdd\u6ca1\u6709\u4efb\u52a1\uff08\u5728\u5de5\u4f5c\u533a\u542f\u52a8 mission_start \u540e\u53ef\u89c6\u5316\uff09'))
        }

        var tasks = mission.tasks || []
        var layout = computeLayout(tasks)
        var counts = mission.counts || {}
        var statItems = [
          ['\u5f85\u8ba4\u9886', counts.open || 0],
          ['\u8fdb\u884c\u4e2d', counts.active || 0],
          ['\u5f85\u5ba1\u6838', counts.needs_review || 0],
          ['\u5df2\u901a\u8fc7', counts.accepted || 0],
          ['\u5df2\u62d2\u7edd', counts.rejected || 0],
        ]
        var statPills = statItems.map(function (it, idx) {
          return React.createElement('span', { className: 'dsh-mission-pill', key: it[0] }, it[0] + ' ' + it[1])
        })

        var hasTaskReview = tasks.some(function (t) { return t.assignee === 'reviewer' || (t.kind === 'review' && t.assignee !== 'final_reviewer') })
        var hasFinalReview = tasks.some(function (t) { return t.assignee === 'final_reviewer' })
        var reviewPills = []
        if (hasTaskReview) reviewPills.push(React.createElement('span', { className: 'dsh-mission-pill', key: 'task' }, '\u4efb\u52a1\u7ea7\u8bc4\u5ba1'))
        if (hasFinalReview) reviewPills.push(React.createElement('span', { className: 'dsh-mission-pill dsh-mission-pill-needs_review', key: 'final' }, '\u6700\u7ec8\u8bc4\u5ba1'))

        var artifacts = mission.artifacts || []
        var wiki = mission.wiki || {}
        var cats = wiki.categories || {}

        var edges = []
        tasks.forEach(function (t) {
          (t.dependencies || []).forEach(function (d) {
            var from = layout.byId[d]
            var p1 = from && layout.positions[from.id]
            var p2 = layout.positions[t.id]
            if (!p1 || !p2) return
            var x1 = p1.x + layout.nodeW
            var y1 = p1.y + layout.nodeH / 2
            var x2 = p2.x
            var y2 = p2.y + layout.nodeH / 2
            var mx = (x1 + x2) / 2
            edges.push(React.createElement('path', {
              d: 'M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2,
              fill: 'none',
              stroke: 'var(--dsw-alias-border-l2)',
              strokeWidth: 1.4,
              markerEnd: 'url(#dsh-mission-arrow)',
              key: d + '->' + t.id,
            }))
          })
        })

        var nodes = tasks.map(function (t) {
          var p = layout.positions[t.id]
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
              onMouseEnter: function () {
                setTip({ task: t, x: 0, y: 0 })
              },
              onMouseMove: function (e) {
                setTip({ task: t, x: e.clientX + 14, y: e.clientY + 14 })
              },
              onMouseLeave: function () {
                setTip(null)
              },
            },
              React.createElement('div', { className: 'dsh-node-title' }, t.title),
              React.createElement('div', { className: 'dsh-node-meta' }, t.id + ' \u00b7 ' + statusLabel(t.status)),
              React.createElement('div', { className: 'dsh-node-sub' }, (roleLabel(t.assignee) || t.kind || '')),
            ),
          )
        })

        var tooltip = null
        if (tip && tip.task) {
          var task = tip.task
          var accepted = (task.acceptance || []).slice(0, 3)
          var evidence = task.requiredEvidence || []
          tooltip = React.createElement('div', {
            className: 'dsh-node-tooltip',
            style: { left: tip.x, top: tip.y },
          },
            React.createElement('div', { className: 'dsh-tooltip-title' }, task.title),
            React.createElement('div', { className: 'dsh-tooltip-meta' },
              React.createElement('span', null, task.id),
              React.createElement('span', null, statusLabel(task.status)),
              task.assignee ? React.createElement('span', null, roleLabel(task.assignee)) : null,
              task.kind ? React.createElement('span', null, task.kind) : null,
              task.scrutinyLevel ? React.createElement('span', null, task.scrutinyLevel) : null,
            ),
            (task.dependencies && task.dependencies.length > 0) ? React.createElement('div', { className: 'dsh-tooltip-section' },
              React.createElement('div', { className: 'dsh-tooltip-label' }, '\u4f9d\u8d56'),
              React.createElement('div', null, task.dependencies.join(' \u00b7 ')),
            ) : null,
            accepted.length > 0 ? React.createElement('div', { className: 'dsh-tooltip-section' },
              React.createElement('div', { className: 'dsh-tooltip-label' }, '\u9a8c\u6536\u6807\u51c6'),
              React.createElement('ul', { className: 'dsh-tooltip-list' }, accepted.map(function (a, i) {
                return React.createElement('li', { key: i }, a)
              })),
            ) : null,
            task.review ? React.createElement('div', { className: 'dsh-tooltip-section' },
              React.createElement('div', { className: 'dsh-tooltip-label' }, task.assignee === 'final_reviewer' || (task.kind === 'review' && task.assignee === 'reviewer') ? '\u6700\u7ec8\u8bc4\u5ba1' : '\u4efb\u52a1\u8bc4\u5ba1'),
              React.createElement('div', null, (task.review.verdict === 'pass' ? '\u901a\u8fc7' : task.review.verdict === 'reject' ? '\u62d2\u7edd' : task.review.verdict) + ' \u00b7 ' + (task.review.reviewer || '?')),
            ) : null,
            task.claim ? React.createElement('div', { className: 'dsh-tooltip-section' },
              React.createElement('div', { className: 'dsh-tooltip-label' }, '\u5360\u7528 / \u79df\u671f'),
              React.createElement('div', null, task.claim.worker + ' \u00b7 ' + fmtRemain(task.claim.leaseRemainingMs)),
            ) : null,
            evidence.length > 0 ? React.createElement('div', { className: 'dsh-tooltip-section' },
              React.createElement('div', { className: 'dsh-tooltip-label' }, '\u5fc5\u4ea4\u8bc1\u636e'),
              React.createElement('div', null, evidence.join(' \u00b7 ')),
            ) : null,
          )
        }

        return React.createElement('div', { className: 'dsh-mission-view' },
          React.createElement('div', { className: 'dsh-mission-topbar' },
            React.createElement('div', { className: 'dsh-mission-line1' },
              React.createElement('div', { className: 'dsh-mission-title' }, mission.title || mission.id),
              React.createElement('span', { className: 'dsh-mission-pill' }, mission.status + ' \u00b7 round ' + (mission.currentRound || 0)),
              React.createElement('span', { className: 'dsh-mission-pill' }, '\u4efb\u52a1 ' + (mission.counts && mission.counts.total || 0)),
              React.createElement('span', { className: 'dsh-mission-pill' }, '\u9ed1\u677f ' + artifacts.length),
              wiki.exists ? React.createElement('span', { className: 'dsh-mission-pill' }, '\u8bb0\u5fc6\u5e93 ' + (wiki.pages || 0)) : null,
            ),
            React.createElement('div', { className: 'dsh-mission-line1' }, statPills),
            React.createElement('div', { className: 'dsh-legend' }, reviewPills),
          ),
          React.createElement('div', { className: 'dsh-mission-graph-wrap' },
            React.createElement('svg', { className: 'dsh-mission-graph', width: layout.width, height: layout.height, viewBox: '0 0 ' + layout.width + ' ' + layout.height },
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
            tooltip,
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
