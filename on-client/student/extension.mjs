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
        modeBadge.textContent = modeMap[mode];
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

    /**
     * 17단계: AI 연결 상태 표시 및 연결 점검 결과 분리
     * 수정 대상: renderAiConnection
     */
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

      // 1. 점검 전 상태 (idle)
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

      // 2. 점검 중 상태 (loading)
      if (status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'ai-state loading-state';
        loadingEl.textContent = 'AI 연결 점검 중';
        container.appendChild(loadingEl);
        return container;
      }

      // 3. 점검 오류 상태 (error) - 원인별 세분화 안내, 열쇠 미포함
      if (status === 'error') {
        const errorEl = document.createElement('div');
        errorEl.className = 'ai-state error-state';

        const rawCode = String(error?.code || 'UNKNOWN').toUpperCase();
        const safeMsg = error?.message || '알 수 없는 오류';

        let causeCategory = '확인 불가';
        let actionGuide = '담당자에게 계정 연결과 앱 권한 확인 요청이 필요합니다.';

        if (rawCode.includes('AUTH') || rawCode.includes('UNAUTHENTICATED')) {
          causeCategory = '인증 실패';
          actionGuide = '계정 연결 상태를 다시 확인하고, 담당자 확인을 요청하세요.';
        } else if (rawCode.includes('PERMISSION') || rawCode.includes('FORBIDDEN') || rawCode.includes('ACCESS')) {
          causeCategory = '접근 제한';
          actionGuide = '계정 연결을 다시 확인하거나 담당자에게 권한 승인을 요청하세요.';
        } else if (rawCode.includes('PREPARING') || rawCode.includes('NOT_READY') || rawCode.includes('PENDING')) {
          causeCategory = '권한 준비 중';
          actionGuide = '담당자에게 계정 연결과 앱 권한 발급을 확인 요청하세요.';
        } else if (rawCode.includes('QUOTA') || rawCode.includes('LIMIT') || rawCode.includes('USAGE')) {
          causeCategory = '사용량·한도 초과';
          actionGuide = '반 사용량 또는 이용 한도를 초과했습니다. 담당자에게 확인을 요청하세요.';
        } else if (rawCode.includes('SCHEDULE') || rawCode.includes('HOURS') || rawCode.includes('TIME_WINDOW')) {
          causeCategory = '이용 시간 아님';
          actionGuide = '현재는 서비스 이용 시간이 아닙니다. 이용 가능 시간을 확인하세요.';
        } else if (rawCode.includes('TIMEOUT') || rawCode.includes('NETWORK') || rawCode.includes('RATE')) {
          causeCategory = '요청 제한·시간 초과·네트워크 오류';
          actionGuide = '잠시 뒤 다시 점검 버튼을 직접 눌러 점검하세요.';
        } else if (rawCode.includes('CANCEL') || rawCode.includes('ABORT')) {
          causeCategory = '점검 취소';
          actionGuide = '점검이 취소되었습니다. 이전 결과는 현재 결과가 아닙니다.';
        } else if (rawCode.includes('NO_MODEL') || rawCode.includes('MODEL_NOT_FOUND')) {
          causeCategory = '쓸 수 있는 모델 없음';
          actionGuide = '담당자에게 사용할 수 있는 AI 모델 허용 설정을 확인 요청하세요.';
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

      // 4. 점검 완료 상태 (ok) - audienceAuthorization test/verified 구분, 시각 및 개수 표기
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

    /**
     * 17단계: renderExplanation 기초 구현
     */
    renderExplanation({ event, explanation }) {
      const container = document.createElement('div');
      container.className = 'student-explanation-container';

      if (!explanation || explanation.status === 'idle') {
        const idleP = document.createElement('p');
        idleP.textContent = '사건 설명을 요청하기 전입니다';
        container.appendChild(idleP);
        return container;
      }

      if (explanation.status === 'loading') {
        const loadingP = document.createElement('p');
        loadingP.textContent = '사건 설명 생성 중';
        container.appendChild(loadingP);
        return container;
      }

      // 성공 시에만 data-student-explanation-event 속성 부여
      if (explanation.status === 'ok') {
        if (event?.id) {
          container.setAttribute('data-student-explanation-event', event.id);
        }
        const eventP = document.createElement('p');
        eventP.textContent = `사건 ID: ${event?.id || '확인 불가'}`;
        container.appendChild(eventP);

        const summaryP = document.createElement('p');
        summaryP.textContent = `설명 요약: ${explanation?.data?.summary || '요약 없음'}`;
        container.appendChild(summaryP);
        return container;
      }

      // 실패 시 속성을 부여하지 않고 오류와 원본 보존 안내 표시
      if (explanation.status === 'error') {
        const errP = document.createElement('p');
        const errCode = explanation?.error?.code || 'ERROR';
        const errMsg = explanation?.error?.message || '설명 생성 실패';
        errP.textContent = `설명 생성 실패 (${errCode}): ${errMsg}`;
        container.appendChild(errP);

        const safeP = document.createElement('p');
        safeP.textContent = '사건 설명 요청에 실패했으며 기존 보안 기록은 그대로 유지됩니다.';
        container.appendChild(safeP);
        return container;
      }

      return container;
    },

    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 모드를 연결하세요.'; },
  };
}