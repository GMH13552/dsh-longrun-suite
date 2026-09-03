window.__ModuleLoader__.load({
  id: 'dsh-mission-control',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var React = require('react')

    var CSS = [
      '.dsh-mission-layer{position:fixed;inset:0;z-index:9999;pointer-events:none;}',
      '.dsh-mission-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.22);pointer-events:auto;}',
      '.dsh-mission-drawer{position:absolute;top:0;right:0;bottom:0;width:min(400px,100vw);pointer-events:auto;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);border-left:1px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;overflow:hidden;}',
      '.dsh-mission-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);box-sizing:border-box;}',
      '.dsh-mission-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.dsh-mission-close{min-height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;padding:2px 8px;font-size:12px;line-height:20px;}',
      '.dsh-mission-close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);}',
      '.dsh-mission-body{flex:1;overflow:auto;padding:12px 14px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;}',
      '.dsh-mission-section{display:flex;flex-direction:column;gap:6px;}',
      '.dsh-mission-section-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);text-transform:uppercase;letter-spacing:.04em;}',
      '.dsh-mission-empty{padding:24px 12px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5;}',
      '.dsh-mission-sub{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;word-break:break-word;}',
      '.dsh-mission-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(52px,1fr));gap:6px;}',
      '.dsh-mission-stat{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 4px;text-align:center;box-sizing:border-box;}',
      '.dsh-mission-stat-num{font-size:16px;font-weight:700;line-height:1.2;color:var(--dsw-alias-label-primary);}',
      '.dsh-mission-stat-label{font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:2px;}',
      '.dsh-mission-task{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-left-width:3px;border-radius:8px;padding:7px 8px;box-sizing:border-box;display:flex;flex-direction:column;gap:3px;}',
      '.dsh-mission-task-title{font-size:12px;line-height:1.35;color:var(--dsw-alias-label-primary);word-break:break-word;}',
      '.dsh-mission-task-meta{font-size:10px;color:var(--dsw-alias-label-secondary);display:flex;flex-wrap:wrap;gap:6px;}',
      '.dsh-mission-chip{display:inline-flex;align-items:center;gap:3px;border-radius:999px;padding:1px 6px;font-size:10px;line-height:16px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}',
      '.dsh-mission-chip-accepted{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent);color:var(--dsw-alias-state-success-primary);}',
      '.dsh-mission-chip-needs_review{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);color:var(--dsw-alias-state-warn-primary);}',
      '.dsh-mission-chip-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,transparent);color:var(--dsw-alias-brand-primary);}',
      '.dsh-mission-chip-rejected{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);color:var(--dsw-alias-state-error-primary);}',
      '.dsh-mission-chip-leased{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);color:var(--dsw-alias-state-warn-primary);}',
      '.dsh-mission-chip-blocked{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);color:var(--dsw-alias-state-error-primary);}',
      '.dsh-mission-trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:4px;padding:3px 6px;font-size:12px;line-height:18px;display:inline-flex;}',
      '.dsh-mission-trigger:hover,.dsh-mission-trigger:focus-visible{color:var(--dsw-alias-label-secondary);}',
      '.dsh-mission-trigger-active{color:var(--dsw-alias-brand-primary);}',
      '.dsh-mission-ready{display:flex;flex-direction:column;gap:4px;}',
      '.dsh-mission-ready-item{font-size:12px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px dashed var(--dsw-alias-border-l2);border-radius:8px;padding:6px 8px;box-sizing:border-box;}',
      '.dsh-mission-artifact{font-size:11px;line-height:1.35;color:var(--dsw-alias-label-primary);padding:6px 8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;box-sizing:border-box;}',
      '.dsh-mission-wiki{font-size:12px;color:var(--dsw-alias-label-primary);line-height:1.5;}',
    ].join('')

    var CSS_ID = 'dsh-mission-control:panel'

    function ensureStyles() {
      if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_ID) + ']') === null) {
        var tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-mission-control'
        tag.dataset.pluginCss = CSS_ID
        tag.textContent = CSS
        document.head.appendChild(tag)
      }
    }

    var missionOpen = false
    var missionOpenListeners = []
    function setMissionOpen(next) {
      if (missionOpen === next) return
      missionOpen = next
      for (var i = 0; i < missionOpenListeners.length; i += 1) {
        try { missionOpenListeners[i](missionOpen) } catch (e) { /* listener errors must not break toggling */ }
      }
    }
    function subscribeMissionOpen(fn) {
      missionOpenListeners.push(fn)
      return function () {
        var i = missionOpenListeners.indexOf(fn)
        if (i >= 0) missionOpenListeners.splice(i, 1)
      }
    }

    function statusLabel(status) {
      if (status === 'open') return '待认领'
      if (status === 'active') return '进行中'
      if (status === 'needs_review') return '待审核'
      if (status === 'accepted') return '已通过'
      if (status === 'rejected') return '已拒绝'
      return status || '?'
    }
    function statusClass(status) {
      if (status === 'accepted') return 'dsh-mission-chip-accepted'
      if (status === 'needs_review') return 'dsh-mission-chip-needs_review'
      if (status === 'active') return 'dsh-mission-chip-active'
      if (status === 'rejected') return 'dsh-mission-chip-rejected'
      return ''
    }
    function fmtTime(ms) {
      if (!ms) return ''
      var d = new Date(ms)
      var p = function (n) { return n < 10 ? '0' + n : String(n) }
      return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
    }
    function fmtRemain(ms) {
      if (typeof ms !== 'number') return ''
      if (ms <= 0) return '已过期'
      var h = Math.floor(ms / 3600000)
      var m = Math.floor((ms % 3600000) / 60000)
      if (h > 0) return h + 'h' + (m > 0 ? ' ' + m + 'm' : '')
      if (m > 0) return m + 'm'
      return Math.max(1, Math.floor(ms / 1000)) + 's'
    }

    exports.inject = ['slots', 'timer', 'sessions']

    exports.apply = function (ctx) {
      ensureStyles()

      function MissionTrigger() {
        var openState = React.useState(missionOpen)
        var open = openState[0]
        var setOpen = openState[1]
        React.useEffect(function () {
          return subscribeMissionOpen(setOpen)
        }, [])
        return React.createElement('button', {
          type: 'button',
          className: 'dsh-mission-trigger' + (open ? ' dsh-mission-trigger-active' : ''),
          'aria-expanded': open,
          'aria-label': '\u4efb\u52a1\u53ef\u89c6\u5316',
          onClick: function () { setMissionOpen(!missionOpen) },
        }, React.createElement('span', null, open ? '\u00b7 \u4efb\u52a1' : '\u4efb\u52a1'))
      }

      function Chip(props) {
        return React.createElement('span', { className: 'dsh-mission-chip ' + (props.className || '') }, props.children)
      }

      function MissionDrawer() {
        var openState = React.useState(missionOpen)
        var open = openState[0]
        var setOpen = openState[1]
        var dataState = React.useState(null)
        var data = dataState[0]
        var setData = dataState[1]
        var errorState = React.useState(null)
        var error = errorState[0]
        var setError = errorState[1]

        React.useEffect(function () {
          return subscribeMissionOpen(setOpen)
        }, [])

        React.useEffect(function () {
          if (!open) return
          function onKey(e) {
            if (e.key === 'Escape') setMissionOpen(false)
          }
          document.addEventListener('keydown', onKey)
          return function () { document.removeEventListener('keydown', onKey) }
        }, [open])

        React.useEffect(function () {
          if (!open) return
          var alive = true
          function poll() {
            var sessionId
            var cwd = ''
            try {
              var snap = ctx.sessions.list.getSnapshot()
              sessionId = snap.current
              if (sessionId && snap.byId && snap.byId[sessionId] && snap.byId[sessionId].cwd) cwd = snap.byId[sessionId].cwd
            } catch (e) { sessionId = undefined }
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
        }, [open])

        if (!open) return null

        var mission = data && data.mission ? data.mission : null

        function close() { setMissionOpen(false) }

        var stats = null
        var readyList = null
        var taskList = null
        var artifactList = null
        var blindCard = null
        var wikiCard = null

        if (mission) {
          var counts = mission.counts || {}
          var statItems = [
            ['open', counts.open || 0, '\u5f85\u8ba4\u9886'],
            ['active', counts.active || 0, '\u8fdb\u884c\u4e2d'],
            ['needs_review', counts.needs_review || 0, '\u5f85\u5ba1\u6838'],
            ['accepted', counts.accepted || 0, '\u5df2\u901a\u8fc7'],
            ['rejected', counts.rejected || 0, '\u5df2\u62d2\u7edd'],
          ]
          stats = React.createElement('div', { className: 'dsh-mission-stats' }, statItems.map(function (item) {
            return React.createElement('div', { className: 'dsh-mission-stat', key: item[0] },
              React.createElement('div', { className: 'dsh-mission-stat-num', style: item[0] === 'accepted' ? { color: 'var(--dsw-alias-state-success-primary)' } : item[0] === 'rejected' ? { color: 'var(--dsw-alias-state-error-primary)' } : item[0] === 'needs_review' ? { color: 'var(--dsw-alias-state-warn-primary)' } : undefined }, String(item[1])),
              React.createElement('div', { className: 'dsh-mission-stat-label' }, item[2]),
            )
          }))

          var readyTasks = (mission.ready || []).map(function (id) {
            return (mission.tasks || []).find(function (t) { return t.id === id })
          }).filter(Boolean)
          readyList = React.createElement('div', { className: 'dsh-mission-ready' }, readyTasks.length === 0
            ? React.createElement('div', { className: 'dsh-mission-sub' }, '\u5f53\u524d\u6ca1\u6709\u53ef\u8ba4\u9886\u7684\u4efb\u52a1')
            : readyTasks.map(function (t) {
              return React.createElement('div', { className: 'dsh-mission-ready-item', key: t.id },
                React.createElement('div', { className: 'dsh-mission-task-title' }, t.title),
                React.createElement('div', { className: 'dsh-mission-task-meta' },
                  React.createElement(Chip, { className: 'dsh-mission-chip-active' }, t.id),
                  t.kind ? React.createElement(Chip, null, t.kind) : null,
                  t.assignee ? React.createElement(Chip, null, t.assignee) : null,
                  t.capabilities && t.capabilities.length ? React.createElement(Chip, null, t.capabilities.join(', ')) : null,
                ),
              )
            }))

          taskList = React.createElement('div', { className: 'dsh-mission-section' }, (mission.tasks || []).map(function (t) {
            var chips = []
            chips.push(React.createElement(Chip, { className: statusClass(t.status), key: 'status' }, statusLabel(t.status)))
            if (t.scrutinyLevel === 'high') chips.push(React.createElement(Chip, { key: 'scrutiny' }, 'high'))
            else if (t.scrutinyLevel === 'low') chips.push(React.createElement(Chip, { key: 'scrutiny' }, 'low'))
            if (t.claim) {
              var leaseCls = t.claim.leaseRemainingMs !== null && t.claim.leaseRemainingMs <= 0 ? 'dsh-mission-chip-blocked' : 'dsh-mission-chip-leased'
              chips.push(React.createElement(Chip, { className: leaseCls, key: 'claim' }, t.claim.worker + ' ' + fmtRemain(t.claim.leaseRemainingMs)))
            }
            if (t.leaseBlocked) chips.push(React.createElement(Chip, { className: 'dsh-mission-chip-blocked', key: 'blocked' }, '\u5df2\u5c01\u9501'))
            if (t.review) chips.push(React.createElement(Chip, { className: t.review.verdict === 'pass' ? 'dsh-mission-chip-accepted' : 'dsh-mission-chip-rejected', key: 'review' }, t.review.verdict + ' by ' + (t.review.reviewer || '?')))
            if (t.outcome) chips.push(React.createElement(Chip, { key: 'outcome' }, t.outcome))
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
          artifactList = React.createElement('div', { className: 'dsh-mission-section' }, artifacts.length === 0
            ? React.createElement('div', { className: 'dsh-mission-sub' }, '\u9ed1\u677f\u6682\u65e0\u4ea7\u7269')
            : artifacts.map(function (a) {
              return React.createElement('div', { className: 'dsh-mission-artifact', key: a.id || (a.type + a.path) },
                React.createElement('div', { className: 'dsh-mission-task-title' }, (a.type || 'artifact') + (a.path ? ' \u00b7 ' + a.path : '')),
                React.createElement('div', { className: 'dsh-mission-sub' }, (a.summary || '') + (a.taskId ? ' \u00b7 task ' + a.taskId : '')),
              )
            }))

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
          wikiCard = React.createElement('div', { className: 'dsh-mission-section' },
            React.createElement('div', { className: 'dsh-mission-section-title' }, '\u8bb0\u5fc6\u5e93'),
            React.createElement('div', { className: 'dsh-mission-wiki' }, wiki.exists ? ('\u5171 ' + (wiki.pages || 0) + ' \u7bc7 \u00b7 ' + catText) : '\u6682\u65e0 .memory'),
          )
        }

        return React.createElement('div', { className: 'dsh-mission-layer' },
          React.createElement('div', { className: 'dsh-mission-backdrop', onClick: close }),
          React.createElement('div', { className: 'dsh-mission-drawer', role: 'dialog', 'aria-label': '\u4efb\u52a1\u53ef\u89c6\u5316' },
            React.createElement('div', { className: 'dsh-mission-head' },
              React.createElement('div', { className: 'dsh-mission-title' }, mission ? (mission.title || mission.id) : '\u4efb\u52a1\u53ef\u89c6\u5316'),
              React.createElement('button', { type: 'button', className: 'dsh-mission-close', onClick: close, 'aria-label': '\u5173\u95ed' }, '\u00d7'),
            ),
            React.createElement('div', { className: 'dsh-mission-body' },
              !mission ? React.createElement('div', { className: 'dsh-mission-empty' }, error ? error : '\u5f53\u524d\u4f1a\u8bdd\u6ca1\u6709\u4efb\u52a1\uff08\u5728\u5de5\u4f5c\u533a\u542f\u52a8 mission_start \u540e\u53ef\u89c6\u5316\uff09') : React.createElement(React.Fragment, null,
                React.createElement('div', { className: 'dsh-mission-section' },
                  React.createElement('div', { className: 'dsh-mission-section-title' }, mission.status + ' \u00b7 round ' + (mission.currentRound || 0)),
                  React.createElement('div', { className: 'dsh-mission-sub' }, (mission.goals && mission.goals[0]) || ''),
                  React.createElement('div', { className: 'dsh-mission-sub' }, '\u6210\u529f\u6807\u51c6 ' + (mission.successCriteria || []).length + ' \u6761 \u00b7 \u4efb\u52a1 ' + (mission.counts && mission.counts.total || 0) + ' \u9879'),
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
                wikiCard,
                mission.finalAudit ? React.createElement('div', { className: 'dsh-mission-section' },
                  React.createElement('div', { className: 'dsh-mission-section-title' }, '\u6700\u7ec8\u5ba1\u8ba1'),
                  React.createElement('div', { className: 'dsh-mission-sub' }, (mission.finalAudit.passed ? 'PASS' : 'BLOCKED') + (mission.finalAudit.gaps && mission.finalAudit.gaps.length ? ' \u00b7 ' + mission.finalAudit.gaps.join('; ') : '')),
                ) : null,
              ),
            ),
          ),
        )
      }

      ctx.slots.inject('conversation.session.header.actions', function () {
        return ctx.slots.register(
          { name: 'conversation.session.header.actions', id: 'mission-visualizer', order: 25, label: '\u4efb\u52a1\u53ef\u89c6\u5316' },
          function () { return React.createElement(MissionTrigger, null) },
        )
      })

      ctx.slots.inject('shell.overlay', function () {
        return ctx.slots.register(
          { name: 'shell.overlay', id: 'mission-visualizer', order: 50, label: '\u4efb\u52a1\u53ef\u89c6\u5316' },
          function () { return React.createElement(MissionDrawer, null) },
        )
      })
    }

    return module.exports
  },
})
