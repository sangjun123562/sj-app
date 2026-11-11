// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions }) {
      const container = document.createElement('div');
      container.className = 'student-identity-container';

      const deviceStatusMap = {
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족',
        unknown: '확인 불가',
      };

      const sessionStatusMap = {
        active: '활성',
        expired: '만료',
        revoked: '철회됨',
        unknown: '확인 불가',
      };

      const modeMap = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };

      const currentMode = me?.mode || devices?.mode || sessions?.mode;
      if (currentMode && modeMap[currentMode]) {
        const modeBadge = document.createElement('div');
        modeBadge.className = 'status-badge mode-notice';
        modeBadge.textContent = modeMap[currentMode];
        container.appendChild(modeBadge);
      }

      if (me?.status === 'loading' || devices?.status === 'loading' || sessions?.status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'loading-state';
        loadingEl.textContent = '불러오는 중';
        container.appendChild(loadingEl);
        return container;
      }

      if (me?.status === 'error' || devices?.status === 'error' || sessions?.error) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-state';

        const errMsg = me?.error?.message || devices?.error?.message || sessions?.error?.message || '확인 불가';
        const errText = document.createElement('p');
        errText.textContent = `연결 실패: ${errMsg}`;
        errorEl.appendChild(errText);

        container.appendChild(errorEl);
        return container;
      }

      const userData = me?.data?.user;
      const deviceData = me?.data?.device;
      const sessionData = me?.data?.session;

      const list = document.createElement('ul');
      list.className = 'identity-info-list';

      const userItem = document.createElement('li');
      const userLabel = userData?.label || userData?.id || '확인 불가';
      userItem.textContent = `사용자: ${userLabel}`;
      list.appendChild(userItem);

      const deviceItem = document.createElement('li');
      const devLabel = deviceData?.label || deviceData?.id || '확인 불가';
      const devStatusText = deviceStatusMap[deviceData?.status] || '확인 불가';
      deviceItem.textContent = `기기: ${devLabel} (${devStatusText})`;
      if (deviceData?.status === 'noncompliant') {
        deviceItem.className = 'status-warning';
      }
      list.appendChild(deviceItem);

      const sessionItem = document.createElement('li');
      const sessStatusText = sessionStatusMap[sessionData?.status] || '확인 불가';
      sessionItem.textContent = `세션: ${sessStatusText}`;
      if (sessionData?.status === 'expired' || sessionData?.status === 'revoked') {
        sessionItem.className = 'status-alert';
      }
      list.appendChild(sessionItem);

      container.appendChild(list);
      return container;
    },

    renderDecision({ status, mode, data, error, appId }) {
      const container = document.createElement('div');
      container.className = 'student-decision-container';

      const modeMap = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      if (mode && modeMap[mode]) {
        const modeBadge = document.createElement('div');
        modeBadge.className = 'status-badge mode-notice';
        modeBadge.textContent = modeMap[mode];
        container.appendChild(modeBadge);
      }

      if (status === 'idle') {
        const idleEl = document.createElement('p');
        idleEl.className = 'decision-state idle-state';
        idleEl.textContent = '앱을 골라 접속을 요청하세요';
        container.appendChild(idleEl);
        return container;
      }

      if (status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'decision-state loading-state';
        loadingEl.textContent = '판정 확인 중';
        container.appendChild(loadingEl);
        return container;
      }

      if (status === 'error') {
        const errorEl = document.createElement('div');
        errorEl.className = 'decision-state error-state';

        const errMsg = error?.message || '알 수 없는 오류';
        const errTitle = document.createElement('p');
        errTitle.textContent = `요청 실패: ${errMsg}`;
        errorEl.appendChild(errTitle);

        const noticeEl = document.createElement('p');
        noticeEl.className = 'error-distinction-note';
        noticeEl.textContent = '이 상태는 정책에 의한 접근 거부 판정이 아니며 요청 처리 중 발생한 실패입니다. (허용되지 않음)';
        errorEl.appendChild(noticeEl);

        container.appendChild(errorEl);
        return container;
      }

      const decisionValue = data?.decision;
      const reasonValue = data?.reason || '이유 정보 없음';
      const checkedAtValue = data?.checkedAt || '확인 시각 없음';
      const targetAppId = data?.appId || appId || '미지정 앱';

      const decisionMap = {
        allow: { text: '접근 허용(allow)', isAllowed: true },
        deny: { text: '접근 거부(deny)', isAllowed: false },
        challenge: { text: '추가 인증 필요(challenge)', isAllowed: false, note: '이 앱이 추가 확인 절차를 대신하지 않습니다.' },
        unknown: { text: '확인 불가(unknown)', isAllowed: false },
      };

      const matchedDecision = decisionMap[decisionValue] || {
        text: '확인 불가(unknown)',
        isAllowed: false,
      };

      const detailList = document.createElement('ul');
      detailList.className = 'decision-detail-list';

      const appItem = document.createElement('li');
      appItem.textContent = `대상 앱: ${targetAppId}`;
      detailList.appendChild(appItem);

      const decisionItem = document.createElement('li');
      decisionItem.textContent = `판정 결과: ${matchedDecision.text}`;
      if (!matchedDecision.isAllowed) {
        decisionItem.className = 'status-not-allowed';
      }
      detailList.appendChild(decisionItem);

      if (matchedDecision.note) {
        const challengeNoteItem = document.createElement('li');
        challengeNoteItem.className = 'decision-sub-note';
        challengeNoteItem.textContent = matchedDecision.note;
        detailList.appendChild(challengeNoteItem);
      }

      const reasonItem = document.createElement('li');
      reasonItem.textContent = `판정 이유: ${reasonValue}`;
      detailList.appendChild(reasonItem);

      const timeItem = document.createElement('li');
      timeItem.textContent = `판정 시각: ${checkedAtValue}`;
      detailList.appendChild(timeItem);

      container.appendChild(detailList);
      return container;
    },

    renderEvents({ status, mode, data, error }) {
      const container = document.createElement('div');
      container.className = 'student-events-container';

      const modeMap = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      if (mode && modeMap[mode]) {
        const modeBadge = document.createElement('div');
        modeBadge.className = 'status-badge mode-notice';
        modeBadge.textContent = modeMap[currentMode] || modeMap[mode];
        container.appendChild(modeBadge);
      }

      if (status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'loading-state';
        loadingEl.textContent = '기록 불러오는 중';
        container.appendChild(loadingEl);
        return container;
      }

      if (status === 'error') {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-state';
        const errMsg = error?.message || '알 수 없는 오류';
        const errText = document.createElement('p');
        errText.textContent = `기록을 불러오지 못했습니다: ${errMsg}`;
        errorEl.appendChild(errText);
        container.appendChild(errorEl);
        return container;
      }

      const rawEvents = Array.isArray(data) ? [...data] : [];
      if (rawEvents.length === 0) {
        const emptyEl = document.createElement('p');
        emptyEl.className = 'empty-state';
        emptyEl.textContent = '표시할 기록이 없습니다';
        container.appendChild(emptyEl);
        return container;
      }

      rawEvents.sort((a, b) => {
        const timeA = new Date(a.at || 0).getTime();
        const timeB = new Date(b.at || 0).getTime();
        return timeB - timeA;
      });

      const filterState = {
        kind: 'all',
        appId: 'all',
        access: 'all',
      };

      const kindMap = {
        access: '접속 기록(access)',
        xdr: 'XDR 경보(xdr)',
      };

      const accessMap = {
        allowed: '접근 허용(allowed)',
        denied: '접근 거부(denied)',
        unknown: '확인 불가(unknown)',
      };

      const sessionStatusMap = {
        active: '활성(active)',
        expired: '만료(expired)',
        revoked: '철회됨(revoked)',
        unknown: '확인 불가(unknown)',
      };

      const deviceStatusMap = {
        compliant: '보안 기준 충족(compliant)',
        noncompliant: '보안 기준 미충족(noncompliant)',
        unknown: '확인 불가(unknown)',
      };

      const filterBar = document.createElement('div');
      filterBar.className = 'events-filter-bar';

      const kindLabel = document.createElement('label');
      kindLabel.textContent = '기록 종류: ';
      const kindSelect = document.createElement('select');
      kindSelect.setAttribute('aria-label', '기록 종류');
      const kindOptionAll = document.createElement('option');
      kindOptionAll.value = 'all';
      kindOptionAll.textContent = '전체';
      kindSelect.appendChild(kindOptionAll);

      const uniqueKinds = [...new Set(rawEvents.map((e) => e.kind).filter(Boolean))];
      uniqueKinds.forEach((k) => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = kindMap[k] || k;
        kindSelect.appendChild(opt);
      });
      kindLabel.appendChild(kindSelect);
      filterBar.appendChild(kindLabel);

      const appLabel = document.createElement('label');
      appLabel.textContent = ' 업무 앱: ';
      const appSelect = document.createElement('select');
      appSelect.setAttribute('aria-label', '업무 앱');
      const appOptionAll = document.createElement('option');
      appOptionAll.value = 'all';
      appOptionAll.textContent = '전체';
      appSelect.appendChild(appOptionAll);

      const uniqueApps = [...new Set(rawEvents.map((e) => e.appId).filter(Boolean))];
      uniqueApps.forEach((app) => {
        const opt = document.createElement('option');
        opt.value = app;
        opt.textContent = app;
        appSelect.appendChild(opt);
      });
      appLabel.appendChild(appSelect);
      filterBar.appendChild(appLabel);

      const accessLabel = document.createElement('label');
      accessLabel.textContent = ' 접속 상태: ';
      const accessSelect = document.createElement('select');
      accessSelect.setAttribute('aria-label', '접속 상태');
      const accessOptionAll = document.createElement('option');
      accessOptionAll.value = 'all';
      accessOptionAll.textContent = '전체';
      accessSelect.appendChild(accessOptionAll);

      const uniqueAccesses = [...new Set(rawEvents.map((e) => e.state?.access).filter(Boolean))];
      uniqueAccesses.forEach((acc) => {
        const opt = document.createElement('option');
        opt.value = acc;
        opt.textContent = accessMap[acc] || acc;
        accessSelect.appendChild(opt);
      });
      accessLabel.appendChild(accessSelect);
      filterBar.appendChild(accessLabel);

      container.appendChild(filterBar);

      const listContainer = document.createElement('div');
      listContainer.className = 'events-list-container';

      const detailArea = document.createElement('div');
      detailArea.className = 'event-detail-display-area';

      function renderFilteredList() {
        listContainer.textContent = '';
        detailArea.textContent = '';

        const filtered = rawEvents.filter((ev) => {
          if (filterState.kind !== 'all' && ev.kind !== filterState.kind) return false;
          if (filterState.appId !== 'all' && ev.appId !== filterState.appId) return false;
          if (filterState.access !== 'all' && ev.state?.access !== filterState.access) return false;
          return true;
        });

        if (filtered.length === 0) {
          const noMatchEl = document.createElement('p');
          noMatchEl.textContent = '조건에 맞는 기록이 없습니다';
          listContainer.appendChild(noMatchEl);
          return;
        }

        const table = document.createElement('table');
        table.className = 'events-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['사건 ID', '시각', '종류', '업무 앱', '요약', '상세'].forEach((txt) => {
          const th = document.createElement('th');
          th.textContent = txt;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        filtered.forEach((ev) => {
          const row = document.createElement('tr');
          row.setAttribute('data-student-event-id', ev.id);

          const tdId = document.createElement('td');
          tdId.textContent = ev.id || '확인 불가';
          row.appendChild(tdId);

          const tdTime = document.createElement('td');
          tdTime.textContent = ev.at || '확인 불가';
          row.appendChild(tdTime);

          const tdKind = document.createElement('td');
          tdKind.textContent = kindMap[ev.kind] || ev.kind || '확인 불가';
          row.appendChild(tdKind);

          const tdApp = document.createElement('td');
          tdApp.textContent = ev.appId || '앱 확인 불가';
          row.appendChild(tdApp);

          const tdSummary = document.createElement('td');
          tdSummary.textContent = ev.summary || '요약 없음';
          row.appendChild(tdSummary);

          const tdAction = document.createElement('td');
          const detailBtn = document.createElement('button');
          detailBtn.setAttribute('type', 'button');
          detailBtn.setAttribute('aria-label', `${ev.id} 상세`);
          detailBtn.textContent = `${ev.id} 상세`;
          detailBtn.onclick = () => showEventDetail(ev);
          tdAction.appendChild(detailBtn);
          row.appendChild(tdAction);

          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        listContainer.appendChild(table);
      }

      function showEventDetail(ev) {
        detailArea.textContent = '';
        detailArea.setAttribute('data-student-event-detail', ev.id);

        const detailTitle = document.createElement('h4');
        detailTitle.textContent = `기록 상세 [${ev.id}]`;
        detailArea.appendChild(detailTitle);

        const infoList = document.createElement('ul');

        const idLi = document.createElement('li');
        idLi.textContent = `사건 ID: ${ev.id}`;
        infoList.appendChild(idLi);

        const appLi = document.createElement('li');
        appLi.textContent = `업무 앱: ${ev.appId || '앱 확인 불가'}`;
        infoList.appendChild(appLi);

        const accessStateText = accessMap[ev.state?.access] || '확인 불가(unknown)';
        const sessionStateText = sessionStatusMap[ev.state?.session] || '확인 불가(unknown)';
        const deviceStateText = deviceStatusMap[ev.state?.device] || '확인 불가(unknown)';

        const accessLi = document.createElement('li');
        accessLi.textContent = `접속 상태: ${accessStateText}`;
        infoList.appendChild(accessLi);

        const sessionLi = document.createElement('li');
        sessionLi.textContent = `세션 상태: ${sessionStateText}`;
        infoList.appendChild(sessionLi);

        const deviceLi = document.createElement('li');
        deviceLi.textContent = `기기 상태: ${deviceStateText}`;
        infoList.appendChild(deviceLi);

        const evidenceLi = document.createElement('li');
        evidenceLi.textContent = '근거(Evidence):';
        const evUl = document.createElement('ul');
        if (Array.isArray(ev.evidence) && ev.evidence.length > 0) {
          ev.evidence.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `[${item.id || '근거'}] ${item.text || ''}`;
            evUl.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = '등록된 근거 없음';
          evUl.appendChild(li);
        }
        evidenceLi.appendChild(evUl);
        infoList.appendChild(evidenceLi);

        const rulesLi = document.createElement('li');
        rulesLi.textContent = '적용 규칙(Rules):';
        const ruleUl = document.createElement('ul');
        if (Array.isArray(ev.rules) && ev.rules.length > 0) {
          ev.rules.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `[${item.id || '규칙'}] ${item.text || ''}`;
            ruleUl.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = '적용된 규칙 없음';
          ruleUl.appendChild(li);
        }
        rulesLi.appendChild(ruleUl);
        infoList.appendChild(rulesLi);

        if (Array.isArray(ev.supportedActions) && ev.supportedActions.length > 0) {
          const actionsLi = document.createElement('li');
          actionsLi.className = 'unsupported-actions-container';

          const actionNotice = document.createElement('p');
          actionNotice.textContent = '조치 실행 연결은 준비 중입니다';
          actionsLi.appendChild(actionNotice);

          ev.supportedActions.forEach((act) => {
            const disabledBtn = document.createElement('button');
            disabledBtn.setAttribute('type', 'button');
            disabledBtn.disabled = true;
            disabledBtn.textContent = `${act} 미지원`;
            actionsLi.appendChild(disabledBtn);
          });
          infoList.appendChild(actionsLi);
        }

        detailArea.appendChild(infoList);
      }

      kindSelect.onchange = (e) => {
        filterState.kind = e.target.value;
        renderFilteredList();
      };
      appSelect.onchange = (e) => {
        filterState.appId = e.target.value;
        renderFilteredList();
      };
      accessSelect.onchange = (e) => {
        filterState.access = e.target.value;
        renderFilteredList();
      };

      renderFilteredList();

      container.appendChild(listContainer);
      container.appendChild(detailArea);
      return container;
    },

    renderStatus({ devices, sessions, notifications, diagnostics, mode }) {
      const container = document.createElement('div');
      container.className = 'student-status-container';

      const modeMap = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      const currentMode = mode || devices?.mode || sessions?.mode || diagnostics?.mode;
      if (currentMode && modeMap[currentMode]) {
        const modeBadge = document.createElement('div');
        modeBadge.className = 'status-badge mode-notice';
        modeBadge.textContent = modeMap[currentMode];
        container.appendChild(modeBadge);
      }

      const notiSection = document.createElement('section');
      notiSection.className = 'status-section notifications-section';
      const notiTitle = document.createElement('h3');
      notiTitle.textContent = '보안 알림';
      notiSection.appendChild(notiTitle);

      const notiList = Array.isArray(notifications) ? notifications : [];
      if (notiList.length === 0) {
        const noNoti = document.createElement('p');
        noNoti.className = 'empty-notice';
        noNoti.textContent = '주의할 알림이 없습니다';
        notiSection.appendChild(noNoti);
      } else {
        const ul = document.createElement('ul');
        notiList.forEach((n) => {
          const li = document.createElement('li');
          const res = n.resource || '확인 불가';
          const code = n.code || '알림';
          const msg = n.message || '';
          li.textContent = `[${res}] (${code}) ${msg}`;
          ul.appendChild(li);
        });
        notiSection.appendChild(ul);
      }
      container.appendChild(notiSection);

      const deviceSection = document.createElement('section');
      deviceSection.className = 'status-section devices-section';
      const devTitle = document.createElement('h3');
      devTitle.textContent = '등록 기기 상태';
      deviceSection.appendChild(devTitle);

      if (devices?.status === 'loading') {
        const devLoading = document.createElement('p');
        devLoading.textContent = '기기 정보 불러오는 중';
        deviceSection.appendChild(devLoading);
      } else if (devices?.status === 'error') {
        const devErr = document.createElement('div');
        devErr.className = 'error-block';
        const msg = devices?.error?.message || '알 수 없는 오류';
        const isTimeout = msg.toLowerCase().includes('timeout') || msg.includes('시간 초과');
        const errText = document.createElement('p');
        errText.textContent = `기기 목록을 불러오지 못했습니다: ${msg}${isTimeout ? ' (시간 초과)' : ''}`;
        devErr.appendChild(errText);

        const retryNotice = document.createElement('p');
        retryNotice.className = 'retry-guidance';
        retryNotice.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
        devErr.appendChild(retryNotice);

        deviceSection.appendChild(devErr);
      } else {
        const devArray = Array.isArray(devices?.data) ? devices.data : [];
        if (devArray.length === 0) {
          const emptyDev = document.createElement('p');
          emptyDev.textContent = '등록된 기기가 없음';
          deviceSection.appendChild(emptyDev);
        } else {
          const ul = document.createElement('ul');
          devArray.forEach((d) => {
            const li = document.createElement('li');
            li.textContent = `기기: ${d.label || d.id || '확인 불가'} (${d.status || 'unknown'})`;
            ul.appendChild(li);
          });
          deviceSection.appendChild(ul);
        }
      }
      container.appendChild(deviceSection);

      const sessionSection = document.createElement('section');
      sessionSection.className = 'status-section sessions-section';
      const sessTitle = document.createElement('h3');
      sessTitle.textContent = '현재 세션 연결 상태';
      sessionSection.appendChild(sessTitle);

      const sessScopeNotice = document.createElement('p');
      sessScopeNotice.className = 'scope-subtext';
      sessScopeNotice.textContent = '세션 조회는 지금 검증된 연결 하나만 대상으로 하며 과거 세션 목록이 아닙니다.';
      sessionSection.appendChild(sessScopeNotice);

      if (sessions?.status === 'loading') {
        const sessLoading = document.createElement('p');
        sessLoading.textContent = '세션 정보 불러오는 중';
        sessionSection.appendChild(sessLoading);
      } else if (sessions?.status === 'error') {
        const sessErr = document.createElement('div');
        sessErr.className = 'error-block';
        const msg = sessions?.error?.message || '알 수 없는 오류';
        const isTimeout = msg.toLowerCase().includes('timeout') || msg.includes('시간 초과');
        const errText = document.createElement('p');
        errText.textContent = `세션 정보를 불러오지 못했습니다: ${msg}${isTimeout ? ' (시간 초과)' : ''}`;
        sessErr.appendChild(errText);

        const retryNotice = document.createElement('p');
        retryNotice.className = 'retry-guidance';
        retryNotice.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
        sessErr.appendChild(retryNotice);

        sessionSection.appendChild(sessErr);
      } else {
        const sessData = sessions?.data;
        const sessArray = Array.isArray(sessData) ? sessData : (sessData ? [sessData] : []);
        if (sessArray.length === 0) {
          const emptySess = document.createElement('p');
          emptySess.textContent = '현재 연결 없음';
          sessionSection.appendChild(emptySess);
        } else {
          const ul = document.createElement('ul');
          sessArray.forEach((s) => {
            const li = document.createElement('li');
            li.textContent = `세션: ${s.id || '확인 불가'} (${s.status || 'unknown'})`;
            ul.appendChild(li);
          });
          sessionSection.appendChild(ul);
        }
      }
      container.appendChild(sessionSection);

      const diagSection = document.createElement('section');
      diagSection.className = 'status-section diagnostics-section';
      const diagTitle = document.createElement('h3');
      diagTitle.textContent = '시스템 진단 정보';
      diagSection.appendChild(diagTitle);

      if (diagnostics?.status === 'loading') {
        const diagLoading = document.createElement('p');
        diagLoading.textContent = '진단 정보 불러오는 중';
        diagSection.appendChild(diagLoading);
      } else if (diagnostics?.status === 'error') {
        const diagErr = document.createElement('div');
        diagErr.className = 'error-block';
        const msg = diagnostics?.error?.message || '알 수 없는 오류';
        const errText = document.createElement('p');
        errText.textContent = `진단 정보를 불러오지 못했습니다: ${msg}`;
        diagErr.appendChild(errText);

        const retryNotice = document.createElement('p');
        retryNotice.className = 'retry-guidance';
        retryNotice.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.';
        diagErr.appendChild(retryNotice);

        diagSection.appendChild(diagErr);
      } else {
        const diagData = diagnostics?.data || {};
        const safeDiag = {
          requestId: diagData.requestId || '확인 불가',
          component: diagData.component || '확인 불가',
          version: diagData.version || '확인 불가',
          checkedAt: diagData.checkedAt || '확인 불가',
          'engine.mode': diagData.engine?.mode || '확인 불가',
          'engine.code': diagData.engine?.code || '확인 불가',
        };

        const diagUl = document.createElement('ul');
        diagUl.className = 'diagnostics-fields-list';
        Object.entries(safeDiag).forEach(([k, v]) => {
          const li = document.createElement('li');
          li.textContent = `${k}: ${v}`;
          diagUl.appendChild(li);
        });
        diagSection.appendChild(diagUl);

        const copyNotice = document.createElement('p');
        copyNotice.className = 'copy-guide-text';
        copyNotice.textContent = '이 정보는 고객지원 및 오류 문의 시 도움 요청에 쓰도록 복사하는 정보입니다.';
        diagSection.appendChild(copyNotice);

        const copyBtn = document.createElement('button');
        copyBtn.setAttribute('type', 'button');
        copyBtn.textContent = '도움정보 복사';
        copyBtn.onclick = () => {
          const copyPayload = JSON.stringify(safeDiag, null, 2);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(copyPayload).then(() => {
              copyBtn.textContent = '도움정보 복사 완료';
              setTimeout(() => {
                copyBtn.textContent = '도움정보 복사';
              }, 2000);
            }).catch(() => {});
          }
        };
        diagSection.appendChild(copyBtn);
      }
      container.appendChild(diagSection);

      return container;
    },

    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·osv 출처·조회 시각을 연결하세요.'; },

    renderAiConnection({ status, mode, data, error, checkedAt }) {
      const container = document.createElement('div');
      container.className = 'student-ai-connection-container';

      const modeMap = {
        demo: '예제 자료',
        disconnected: '연결 없음',
        unknown: '확인 불가',
      };
      if (mode && modeMap[mode]) {
        const modeBadge = document.createElement('div');
        modeBadge.className = 'status-badge mode-notice';
        modeBadge.textContent = modeMap[mode];
        container.appendChild(modeBadge);
      }

      if (status === 'idle') {
        const idleEl = document.createElement('p');
        idleEl.className = 'ai-state idle-state';
        idleEl.textContent = 'AI 연결 점검 전';
        container.appendChild(idleEl);

        const guideEl = document.createElement('p');
        guideEl.className = 'ai-guide-text';
        guideEl.textContent = '다시 점검은 사용자가 버튼을 직접 누르는 것입니다.';
        container.appendChild(guideEl);
        return container;
      }

      if (status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'ai-state loading-state';
        loadingEl.textContent = 'AI 연결 점검 중';
        container.appendChild(loadingEl);
        return container;
      }

      if (status === 'error') {
        const errorEl = document.createElement('div');
        errorEl.className = 'ai-state error-state';

        const rawCode = String(error?.code || 'UNKNOWN').toUpperCase();
        const safeMsg = error?.message || '알 수 없는 오류';

        let causeCategory = '확인 불가';
        let actionGuide = '담당자에게 계정 연결과 앱 권한 확인 요청이 필요합니다.';

        if (
          rawCode.includes('WB_CLCO_COHORT_BUDGET_EXHAUSTED') ||
          rawCode.includes('BUDGET_EXHAUSTED') ||
          rawCode.includes('QUOTA') ||
          rawCode.includes('LIMIT') ||
          rawCode.includes('USAGE')
        ) {
          causeCategory = '반 사용량·이용 한도';
          actionGuide = '반 사용량 또는 이용 한도를 초과했습니다. 담당자에게 확인을 요청하세요.';
        } else if (
          rawCode.includes('WB_CLCO_SESSION_CLOSED') ||
          rawCode.includes('SESSION_CLOSED') ||
          rawCode.includes('SCHEDULE') ||
          rawCode.includes('HOURS') ||
          rawCode.includes('TIME_WINDOW')
        ) {
          causeCategory = '이용 시간 아님';
          actionGuide = '현재는 서비스 이용 시간이 아닙니다. 이용 가능 시간을 확인하세요.';
        } else if (
          rawCode.includes('ON_AI_MODEL_LIST_EMPTY') ||
          rawCode.includes('MODEL_LIST_EMPTY') ||
          rawCode.includes('NO_MODEL') ||
          rawCode.includes('MODEL_NOT_FOUND')
        ) {
          causeCategory = '쓸 수 있는 모델 없음';
          actionGuide = '담당자에게 사용할 수 있는 AI 모델 허용 설정을 확인 요청하세요.';
        } else if (rawCode.includes('AUTH') || rawCode.includes('UNAUTHENTICATED')) {
          causeCategory = '인증 실패';
          actionGuide = '계정 연결 상태를 다시 확인하고, 담당자 확인을 요청하세요.';
        } else if (rawCode.includes('PERMISSION') || rawCode.includes('FORBIDDEN') || rawCode.includes('ACCESS')) {
          causeCategory = '접근 제한';
          actionGuide = '계정 연결을 다시 확인하거나 담당자에게 권한 승인을 요청하세요.';
        } else if (rawCode.includes('PREPARING') || rawCode.includes('NOT_READY') || rawCode.includes('PENDING')) {
          causeCategory = '권한 준비 중';
          actionGuide = '담당자에게 계정 연결과 앱 권한 발급을 확인 요청하세요.';
        } else if (rawCode.includes('TIMEOUT') || rawCode.includes('NETWORK') || rawCode.includes('RATE')) {
          causeCategory = '요청 제한·시간 초과·네트워크';
          actionGuide = '잠시 뒤 다시 점검 버튼을 직접 눌러 점검하세요.';
        } else if (rawCode.includes('CANCEL') || rawCode.includes('ABORT')) {
          causeCategory = '취소';
          actionGuide = '점검이 취소되었습니다. 이전 결과는 현재 결과가 아닙니다.';
        }

        const titleP = document.createElement('p');
        titleP.textContent = `연결 실패 [${causeCategory}]: ${safeMsg}`;
        errorEl.appendChild(titleP);

        const codeP = document.createElement('p');
        codeP.textContent = `오류 코드: ${error?.code || 'ERROR'}`;
        errorEl.appendChild(codeP);

        const guideP = document.createElement('p');
        guideP.textContent = actionGuide;
        errorEl.appendChild(guideP);

        const retryNotice = document.createElement('p');
        retryNotice.className = 'retry-guidance';
        retryNotice.textContent = '자동으로 다시 점검하지 않습니다. 다시 점검은 사용자가 버튼을 직접 누르는 것입니다.';
        errorEl.appendChild(retryNotice);

        container.appendChild(errorEl);
        return container;
      }

      const authType = data?.audienceAuthorization;
      const authLabel = authType === 'verified'
        ? '앱 권한 확인 후 점검(verified)'
        : '시험 연결 점검(test)';

      const modelCountText = data?.modelCount !== undefined ? `${data.modelCount}개` : '확인 불가';
      const checkTime = checkedAt || data?.checkedAt || '시각 확인 불가';

      const okList = document.createElement('ul');
      okList.className = 'ai-connection-detail-list';

      const authLi = document.createElement('li');
      authLi.textContent = `권한 확인: ${authLabel}`;
      okList.appendChild(authLi);

      const countLi = document.createElement('li');
      countLi.textContent = `사용 가능한 모델 수: ${modelCountText}`;
      okList.appendChild(countLi);

      const timeLi = document.createElement('li');
      timeLi.textContent = `점검 시각: ${checkTime}`;
      okList.appendChild(timeLi);

      const distinctNotice = document.createElement('li');
      distinctNotice.className = 'distinct-scope-notice';
      distinctNotice.textContent = '사건 설명은 아직 실행하지 않았습니다. (현재 상태는 API 연결 점검 결과만 반영되어 있습니다)';
      okList.appendChild(distinctNotice);

      container.appendChild(okList);
      return container;
    },

    renderExplanation({ event, explanation, checkedAt }) {
      const container = document.createElement('div');
      container.className = 'student-explanation-container';

      if (explanation?.status === 'error') {
        const errEl = document.createElement('div');
        errEl.className = 'explanation-error-block';

        const safeCode = explanation.error?.code || 'ERROR';
        const safeMsg = explanation.error?.message || '설명 생성 실패';

        const errTitle = document.createElement('p');
        errTitle.textContent = `AI 설명 실패: ${safeMsg}`;
        errEl.appendChild(errTitle);

        const codeP = document.createElement('p');
        codeP.textContent = `오류 코드: ${safeCode}`;
        errEl.appendChild(codeP);

        const executedNotice = document.createElement('p');
        executedNotice.textContent = '실행됐다고 주장한 AI 설명이나 오류 상태의 설명은 쓸 수 없습니다.';
        errEl.appendChild(executedNotice);

        const safeP = document.createElement('p');
        safeP.textContent = '기록은 그대로이며 과제 실패가 아닙니다.';
        errEl.appendChild(safeP);

        container.appendChild(errEl);
        return container;
      }

      if (!event) {
        const noEventP = document.createElement('p');
        noEventP.className = 'explanation-notice no-event-notice';
        noEventP.textContent = '보안 기록에서 기록을 먼저 고르세요';
        container.appendChild(noEventP);
        return container;
      }

      if (explanation?.status === 'loading') {
        const loadingP = document.createElement('p');
        loadingP.className = 'explanation-notice loading-notice';
        loadingP.textContent = '설명 요청 중';
        container.appendChild(loadingP);
        return container;
      }

      if (!explanation || explanation.status === 'idle') {
        const idleP = document.createElement('p');
        idleP.className = 'explanation-notice idle-notice';
        idleP.textContent = '사건 설명을 요청하기 전입니다';
        container.appendChild(idleP);
        return container;
      }

      if (explanation.status === 'ok') {
        const expData = explanation.data || {};
        const eventEvidenceList = Array.isArray(event.evidence) ? event.evidence : [];
        const evidenceIdMap = new Map(eventEvidenceList.map((item) => [item.id, item.text]));

        const citedIds = Array.isArray(expData.evidenceIds) ? expData.evidenceIds : [];
        const hasMissingEvidence = citedIds.some((id) => !evidenceIdMap.has(id));

        if (hasMissingEvidence) {
          const mismatchEl = document.createElement('div');
          mismatchEl.className = 'explanation-mismatch-block';

          const failTitle = document.createElement('p');
          failTitle.textContent = 'AI 설명을 쓸 수 없습니다: 근거가 맞지 않음';
          mismatchEl.appendChild(failTitle);

          const detailP = document.createElement('p');
          detailP.textContent = '인용된 근거 ID가 사건 기록의 실제 근거와 일치하지 않아 내용을 지어내지 않고 기각합니다.';
          mismatchEl.appendChild(detailP);

          const safeP = document.createElement('p');
          safeP.textContent = '기록은 그대로입니다.';
          mismatchEl.appendChild(safeP);

          container.appendChild(mismatchEl);
          return container;
        }

        container.setAttribute('data-student-explanation-event', event.id);

        const headerEl = document.createElement('div');
        headerEl.className = 'explanation-header';

        const eventIdP = document.createElement('p');
        eventIdP.textContent = `사건 ID: ${event.id}`;
        headerEl.appendChild(eventIdP);

        const summaryTitle = document.createElement('h4');
        summaryTitle.textContent = 'AI 설명(참고용)';
        headerEl.appendChild(summaryTitle);

        const summaryP = document.createElement('p');
        summaryP.textContent = expData.summary || '요약 없음';
        headerEl.appendChild(summaryP);
        container.appendChild(headerEl);

        const evidenceSection = document.createElement('div');
        evidenceSection.className = 'explanation-sub-section';
        const evTitle = document.createElement('h5');
        evTitle.textContent = '인용 근거 목록';
        evidenceSection.appendChild(evTitle);

        const evUl = document.createElement('ul');
        if (citedIds.length > 0) {
          citedIds.forEach((eid) => {
            const li = document.createElement('li');
            const eText = evidenceIdMap.get(eid) || '근거 원문 없음';
            li.textContent = `${eid} — ${eText}`;
            evUl.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = '인용된 근거 ID 없음';
          evUl.appendChild(li);
        }
        evidenceSection.appendChild(evUl);
        container.appendChild(evidenceSection);

        const rulesSection = document.createElement('div');
        rulesSection.className = 'explanation-sub-section';
        const rulesTitle = document.createElement('h5');
        rulesTitle.textContent = '적용 규칙 목록';
        rulesSection.appendChild(rulesTitle);

        const rulesUl = document.createElement('ul');
        const eventRules = Array.isArray(event.rules) ? event.rules : [];
        if (eventRules.length > 0) {
          eventRules.forEach((rule) => {
            const li = document.createElement('li');
            li.textContent = `${rule.id || '규칙'} — ${rule.text || ''}`;
            rulesUl.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = '적용된 규칙 없음';
          rulesUl.appendChild(li);
        }
        rulesSection.appendChild(rulesUl);
        container.appendChild(rulesSection);

        const stateSection = document.createElement('div');
        stateSection.className = 'explanation-sub-section';
        const stateTitle = document.createElement('h5');
        stateTitle.textContent = '확인 불가 상태 항목';
        stateSection.appendChild(stateTitle);

        const unknownList = [];
        if (event.state?.access === 'unknown') unknownList.push('접속: 확인 불가(unknown)');
        if (event.state?.session === 'unknown') unknownList.push('세션: 확인 불가(unknown)');
        if (event.state?.device === 'unknown') unknownList.push('기기: 확인 불가(unknown)');

        const stateUl = document.createElement('ul');
        if (unknownList.length > 0) {
          unknownList.forEach((txt) => {
            const li = document.createElement('li');
            li.textContent = txt;
            stateUl.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = '없음';
          stateUl.appendChild(li);
        }
        stateSection.appendChild(stateUl);
        container.appendChild(stateSection);

        const proposalSection = document.createElement('div');
        proposalSection.className = 'explanation-sub-section';
        const propTitle = document.createElement('h5');
        propTitle.textContent = '조치 제안';
        proposalSection.appendChild(propTitle);

        const proposals = Array.isArray(expData.proposals) ? expData.proposals : [];
        const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];

        if (proposals.length === 0) {
          const noPropP = document.createElement('p');
          if (supportedActions.length === 0) {
            noPropP.textContent = '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상)';
          } else {
            noPropP.textContent = 'AI가 제안한 조치가 없습니다.';
          }
          proposalSection.appendChild(noPropP);
        } else {
          const propUl = document.createElement('ul');
          proposals.forEach((p) => {
            const li = document.createElement('li');
            li.textContent = `제안 조치: ${p.action || '미지정'} (이유: ${p.reason || '이유 없음'}) - 사람 확인이 필요하며 실행되지 않았습니다`;
            propUl.appendChild(li);
          });
          proposalSection.appendChild(propUl);
        }
        container.appendChild(proposalSection);

        return container;
      }

      return container;
    },

    /**
     * 19단계: 보안 조치 요청 상태와 실제 결과 구분
     */
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error }) {
      const container = document.createElement('div');
      container.className = 'student-action-container';

      // 1. 이벤트가 있을 때만 event.id 속성 바인딩
      if (event?.id) {
        container.setAttribute('data-student-action-event', event.id);
      }

      // 2. 요청 ID가 있을 때만 request 속성 바인딩
      if (receipt?.requestId) {
        container.setAttribute('data-student-action-request', receipt.requestId);
      }

      // 3. 상단 안내: 연동 시스템 지원 조치 유무 안내
      const supportNotice = document.createElement('p');
      supportNotice.className = 'action-support-notice';
      const supportedActions = Array.isArray(event?.supportedActions) ? event.supportedActions : [];
      if (supportedActions.length === 0) {
        supportNotice.textContent = '연동 시스템이 지원하는 조치가 없어(supportedActions 빈 배열) 조치 준비 버튼이 나오지 않는 것이 정상입니다.';
      } else {
        supportNotice.textContent = '조치 집행 및 재조회는 제공 화면의 버튼을 사용하세요.';
      }
      container.appendChild(supportNotice);

      // 4. 상태별 표시 영역
      const statusSection = document.createElement('section');
      statusSection.className = 'action-status-section';

      const statusTitle = document.createElement('h4');
      statusTitle.textContent = `조치 상태: ${status || 'unknown'}`;
      statusSection.appendChild(statusTitle);

      const statusDesc = document.createElement('p');
      statusDesc.className = 'action-status-desc';

      if (status === 'idle') {
        statusDesc.textContent = '아직 미실행';
      } else if (status === 'loading') {
        statusDesc.textContent = '조치 준비 또는 결과 조회 중';
      } else if (status === 'prepared') {
        statusDesc.textContent = '준비됨·미실행';
        if (confirmationExpiresAt) {
          const expireP = document.createElement('p');
          expireP.className = 'action-expire-time';
          expireP.textContent = `확인 기한: ${confirmationExpiresAt}`;
          statusSection.appendChild(expireP);
        }
      } else if (status === 'executing') {
        statusDesc.textContent = '서버에 전달 중(executing). 결과가 아직 없음';
      } else if (status === 'pending') {
        statusDesc.textContent = '서버 접수·처리 중(pending). 서버가 받았다는 것(ACK)은 효과가 아님 (완료 아님)';
      } else if (status === 'succeeded') {
        if (observation && observation.effectApplied === true) {
          statusDesc.textContent = '효과 확인(succeeded)';

          const effectUl = document.createElement('ul');
          effectUl.className = 'action-effect-list';

          const effectLi = document.createElement('li');
          effectLi.textContent = 'effectApplied: true';
          effectUl.appendChild(effectLi);

          const timeLi = document.createElement('li');
          timeLi.textContent = `관측 시각: ${observation.observedAt || '시각 확인 불가'}`;
          effectUl.appendChild(timeLi);

          if (receipt?.receiptId) {
            const receiptLi = document.createElement('li');
            receiptLi.textContent = `접수 번호(receiptId): ${receipt.receiptId}`;
            effectUl.appendChild(receiptLi);
          }

          statusSection.appendChild(effectUl);
        } else {
          statusDesc.textContent = '결과 불명(unknown) - 효과가 관측되지 않았으므로 성공으로 단정하지 않고 결과를 재조회해야 합니다.';
        }
      } else if (status === 'denied') {
        statusDesc.textContent = `거절(denied): ${message || '거절 이유 없음'}`;
      } else if (status === 'failed') {
        statusDesc.textContent = `실패(failed): ${message || '실패 사유 없음'}`;
      } else if (status === 'unknown') {
        statusDesc.textContent = '결과 불명(unknown) - 효과 없음으로도 성공으로도 판단하지 말고 연동 시스템 결과만 재조회하세요.';
      } else if (status === 'expired') {
        statusDesc.textContent = '확인 기한 지남(expired) - 다시 준비하세요.';
      } else if (status === 'error') {
        const safeCode = error?.code || 'ERROR';
        const safeMsg = error?.message || '요청 처리 안 됨';
        statusDesc.textContent = `요청 처리 안 됨: [${safeCode}] ${safeMsg}`;
      } else {
        statusDesc.textContent = `알 수 없는 상태(${status}) - 연동 시스템 결과만 재조회하세요.`;
      }

      statusSection.appendChild(statusDesc);
      container.appendChild(statusSection);

      // 5. 사건 식별자 및 세부 정보 (받은 범위에서만 표시)
      const detailsSection = document.createElement('section');
      detailsSection.className = 'action-details-section';

      const detailsTitle = document.createElement('h5');
      detailsTitle.textContent = '조치 관련 정보';
      detailsSection.appendChild(detailsTitle);

      const detailsUl = document.createElement('ul');
      detailsUl.className = 'action-details-list';

      if (event?.id) {
        const li = document.createElement('li');
        li.textContent = `사건 ID: ${event.id}`;
        detailsUl.appendChild(li);
      }

      if (Array.isArray(event?.evidence) && event.evidence.length > 0) {
        const evidenceIds = event.evidence.map((ev) => ev.id).filter(Boolean).join(', ');
        if (evidenceIds) {
          const li = document.createElement('li');
          li.textContent = `근거 ID: ${evidenceIds}`;
          detailsUl.appendChild(li);
        }
      }

      if (actionId) {
        const li = document.createElement('li');
        li.textContent = `조치 ID(actionId): ${actionId}`;
        detailsUl.appendChild(li);
      }

      if (target?.id) {
        const li = document.createElement('li');
        const genText = target.generation !== undefined ? ` (generation: ${target.generation})` : '';
        li.textContent = `실제 대상 ID: ${target.id}${genText}`;
        detailsUl.appendChild(li);
      }

      if (receipt?.requestId) {
        const li = document.createElement('li');
        li.textContent = `요청 번호(requestId): ${receipt.requestId}`;
        detailsUl.appendChild(li);
      }

      if (receipt?.receiptId) {
        const li = document.createElement('li');
        li.textContent = `접수 번호(receiptId): ${receipt.receiptId}`;
        detailsUl.appendChild(li);
      }

      if (receipt?.version !== undefined) {
        const li = document.createElement('li');
        li.textContent = `버전(version): ${receipt.version}`;
        detailsUl.appendChild(li);
      }

      detailsSection.appendChild(detailsUl);
      container.appendChild(detailsSection);

      return container;
    },
  };
}