window.__ModuleLoader__.load({
  id: 'dsh-mission-control',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var React = require('react')

    var CSS = [
      '.dsh-mission-view{height:100%;overflow:auto;padding:16px 20px;box-sizing:border-box;display:flex;flex-direction:column;gap:14px;background:var(--dsw-alias-bg-base);}',
      '.dsh-mission-section{display:flex;flex-direction:column;gap:6px;}',
      '.dsh-mission-section-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);text-transform:uppercase;letter-spacing:.04em;}',
      '.dsh-mission-sub{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;word-break:break-word;}',
      '.dsh-mission-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:8px;}',
      '.dsh-mission-stat{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:8px 6px;text-align:center;box-sizing:border-box;}',
      '.dsh-mission-stat-num{font-size:20px;font-weight:700;line-height:1.2;color:var(--dsw-alias-label-primary);}',
      '.dsh-mission-stat-label{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:2px;}',
      '.dsh-mission-task{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-left-width:3px;border-radius:10px;padding:9px 10px;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;}',
      '.dsh-mission-task-title{font-size:13px;line-height:1.4;color:var(--dsw-alias-label-primary);word-break:break-word;}',
      '.dsh-mission-task-meta{font-size:11px;color:var(--dsw-alias-label-secondary);display:flex;flex-wrap:wrap;gap:6px;}',
      '.dsh-mission-chip{display:inline-flex;align-items:center;gap:3px;border-radius:999px;padding:1px 7px;font-size:10px;line-height:17px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}',
      '.dsh-mission-chip-accepted{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent);color:var(--dsw-alias-state-success-primary);}',
      '.dsh-mission-chip-needs_review{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);color:var(--dsw-alias-state-warn-primary);}',
      '.dsh-mission-chip-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,transparent);color:var(--dsw-alias-brand-primary);}',
      '.dsh-mission-chip-rejected{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);color:var(--dsw-alias-state-error-primary);}',
      '.dsh-mission-chip-leased{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);color:var(--dsw-alias-state-warn-primary);}',
      '.dsh-mission-chip-blocked{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);color:var(--dsw-alias-state-error-primary);}',
      '.dsh-mission-ready{display:flex;flex-direction:column;gap:6px;}',
      '.dsh-mission-ready-item{font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:8px 10px;box-sizing:border-box;}',
      '.dsh-mission-artifact{font-size:12px;line-height:1.4;color:var(--dsw-alias-label-primary);padding:8px 10px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;box-sizing:border-box;}',
      '.dsh-mission-wiki{font-size:13px;color:var(--dsw-alias-label-primary);line-height:1.5;}',
      '.dsh-mission-empty{padding:48px 20px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6;}',
    ].join('')

    var CSS_ID = 'dsh-mission-control:view'

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
    function statusClass(s) {
      if (s === 'accepted') return 'dsh-mission-chip-accepted'
      if (s === 'needs_review') return 'dsh-mission-chip-needs_review'
      if (s === 'active') return 'dsh-mission-chip-active'
      if (s === 'rejected') return 'dsh-mission-chip-rejected'
      return ''
    }

    exports.inject = ['slots', 'timer', 'sessions']

    exports.apply = function (ctx) {
      ensureStyles()

      function Chip(props) {
        return React.createElement('span', { className: 'dsh-mission-chip ' + (props.className || '') }, props.children)
      }

      function MissionView() {
        var dataState = React.useState(null)
        var data = dataState[0]
        var setData = dataState[1]
        var errorState = React.useState(null)
        var error = errorState[0]
        var setError = errorState[1]

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

        var counts = mission.counts || {}
        var statItems = [
          ['open', counts.open || 0, '\u5f85\u8ba4\u9886'],
          ['active', counts.active || 0, '\u8fdb\u884c\u4e2d'],
          ['needs_review', counts.needs_review || 0, '\u5f85\u5ba1\u6838'],
          ['accepted', counts.accepted || 0, '\u5df2\u901a\u8fc7'],
          ['rejected', counts.rejected || 0, '\u5df2\u62d2\u7edd'],
        ]
        var stats = React.createElement('div', { className: 'dsh-mission-stats' }, statItems.map(function (it) {
          return React.createElement('div', { className: 'dsh-mission-stat', key: it[0] },
            React.createElement('div', {
              className: 'dsh-mission-stat-num',
              style: it[0] === 'accepted' ? { color: 'var(--dsw-alias-state-success-primary)' } : it[0] === 'rejected' ? { color: 'var(--dsw-alias-state-error-primary)' } : it[0] === 'needs_review' ? { color: 'var(--dsw-alias-state-warn-primary)' } : undefined,
            }, String(it[1])),
            React.createElement('div', { className: 'dsh-mission-stat-label' }, it[2]),
          )
        }))

        var readyTasks = (mission.ready || []).map(function (id) {
          return (mission.tasks || []).find(function (t) { return t.id === id })
        }).filter(Boolean)
        var readyList = React.createElement('div', { className: 'dsh-mission-ready' }, readyTasks.length === 0
          ? React.createElement('div', { className: 'dsh-mission-sub' }, '\u5f53\u524d\u6ca1\u6709\u53ef\u8ba4\u9886\u7684\u4efb\u52a1')
          : readyTasks.map(function (t) {
            return React.createElement('div', { className: 'dsh-mission-ready-item', key: t.id },
              React.createElement('div', { className: 'dsh-mission-task-title' }, t.title),
              React.createElement('div', { className: 'dsh-mission-task-meta' },
                React.createElement(Chip, { className: 'dsh-mission-chip-active' }, t.id),
                t.kind ? React.createElement(Chip, null, t.kind) : null,
                t.assignee ? React.createElement(Chip, null, t.assignee) : null,
              ),
            )
          }))

        var taskList = React.createElement('div', { className: 'dsh-mission-section' }, (mission.tasks || []).map(function (t) {
          var chips = [React.createElement(Chip, { className: statusClass(t.status), key: 'status' }, statusLabel(t.status))]
          if (t.scrutinyLevel === 'high') chips.push(React.createElement(Chip, { key: 'scrutiny' }, 'high'))
          else if (t.scrutinyLevel === 'low') chips.push(React.createElement(Chip, { key: 'scrutiny' }, 'low'))
          if (t.claim) {
            var leaseCls = t.claim.leaseRemainingMs !== null && t.claim.leaseRemainingMs <= 0 ? 'dsh-mission-chip-blocked' : 'dsh-mission-chip-leased'
            chips.push(React.createElement(Chip, { className: leaseCls, key: 'claim' }, t.claim.worker + ' ' + fmtRemain(t.claim.leaseRemainingMs)))
          }
          if (t.leaseBlocked) chips.push(React.createElement(Chip, { className: 'dsh-mission-chip-blocked', key: 'blocked' }, '\u5df2\u5c01\u9501'))
          if (t.review) chips.push(React.createElement(Chip, { className: t.review.verdict === 'pass' ? 'dsh-mission-chip-accepted' : 'dsh-mission-chip-rejected', key: 'review' }, t.review.verdict + ' by ' + (t.review.reviewer || '?')))
          return React.createElement('div', {
            className: 'dsh-mission-task',
            style: { borderLeftColor: t.status === 'accepted' ? 'var(--dsw-alias-state-success-primary)' : t.status === 'rejected' ? 'var(--dsw-alias-state-error-primary)' : t.status === 'needs_review' ? 'var(--dsw-alias-state-warn-primary)' : t.status === 'active' ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l2)' },
            key: t.id,
          },
            React.createElement('div', { className: 'dsh-mission-task-title' }, t.id + ' \u00b7 ' + t.title),
            React.createElement('div', { className: 'dsh-mission-task-meta' }, chips),
            React.createElement('div', { className: 'dsh-mission-sub' }, (t.dependencies && t.dependencies.length ? 'dep: ' + t.dependencies.join(', ') : 'no deps') + (t.assignee ? ' \u00b7 ' + t.assignee : '')),
          )
        }))

        var artifacts = mission.artifacts || []
        var artifactList = React.createElement('div', { className: 'dsh-mission-section' }, artifacts.length === 0
          ? React.createElement('div', { className: 'dsh-mission-sub' }, '\u9ed1\u677f\u6682\u65e0\u4ea7\u7269')
          : artifacts.map(function (a) {
            return React.createElement('div', { className: 'dsh-mission-artifact', key: a.id || (a.type + a.path) },
              React.createElement('div', { className: 'dsh-mission-task-title' }, (a.type || 'artifact') + (a.path ? ' \u00b7 ' + a.path : '')),
              React.createElement('div', { className: 'dsh-mission-sub' }, (a.summary || '') + (a.taskId ? ' \u00b7 task ' + a.taskId : '')),
            )
          }))

        var blindCard = null
        if (mission.blindReview) {
          var br = mission.blindReview
          blindCard = React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u76f2\u5ba1'),
            React.createElement('div', { className: 'dsh-mission-task' },
              React.createElement('div', { className: 'dsh-mission-task-meta' },
                React.createElement(Chip, { className: br.decision === 'accept' ? 'dsh-mission-chip-accepted' : br.decision === 'reject' ? 'dsh-mission-chip-rejected' : 'dsh-mission-chip-needs_review' }, String(br.decision || '?')),
                React.createElement(Chip, null, 'avg ' + (br.avg_rating ?? '?')),
                React.createElement(Chip, null, 'n=' + (br.n_reviews ?? '?')),
              ),
              React.createElement('div', { className: 'dsh-mission-sub' }, 'calibration_gap: ' + (br.calibration_gap === null || br.calibration_gap === undefined ? 'none' : String(br.calibration_gap)) + (br.at ? ' \u00b7 ' + fmtTime(br.at) : '')),
            ),
          )
        }

        var wiki = mission.wiki || {}
        var cats = wiki.categories || {}
        var catText = Object.keys(cats).map(function (k) { return k + ':' + cats[k] }).join(' \u00b7 ') || 'none'

        return React.createElement('div', { className: 'dsh-mission-view' },
          React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, mission.status + ' \u00b7 round ' + (mission.currentRound || 0)),
            React.createElement('div', { className: 'dsh-mission-task-title' }, mission.title || mission.id),
            React.createElement('div', { className: 'dsh-mission-sub' }, (mission.goals && mission.goals[0]) || ''),
            React.createElement('div', { className: 'dsh-mission-sub' }, '\u6210\u529f\u6807\u51c6 ' + (mission.successCriteria || []).length + ' \u6761 \u00b7 \u4efb\u52a1 ' + ((mission.counts && mission.counts.total) || 0) + ' \u9879'),
          ),
          React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u72b6\u6001'),
            stats,
          ),
          React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u53ef\u8ba4\u9886\u961f\u5217'),
            readyList,
          ),
          React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u4efb\u52a1\u56fe'),
            taskList,
          ),
          React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u9ed1\u677f\u4ea7\u7269'),
            artifactList,
          ),
          blindCard,
          React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u8bb0\u5fc6\u5e93'),
            React.createElement('div', { className: 'dsh-mission-wiki' }, wiki.exists ? ('\u5171 ' + (wiki.pages || 0) + ' \u7bc7 \u00b7 ' + catText) : '\u6682\u65e0 .memory'),
          ),
          mission.finalAudit ? React.createElement('div', { className: 'dsh-mission-section' }, React.createElement('div', { className: 'dsh-mission-section-title' }, '\u6700\u7ec8\u5ba1\u8ba1'), React.createElement('div', { className: 'dsh-mission-sub' }, (mission.finalAudit.passed ? 'PASS' : 'BLOCKED') + (mission.finalAudit.gaps && mission.finalAudit.gaps.length ? ' \u00b7 ' + mission.finalAudit.gaps.join('; ') : ''))) : null,
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
