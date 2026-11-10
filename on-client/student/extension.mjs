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

      if (me?.status === 'error' || devices?.status === 'error' || sessions?.status === 'error') {
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

    /**
     * 15단계: 최근 보안 기록 필터링 및 기록별 근거·규칙·상태 상세 표시
     * 수정 대상: renderEvents
     */
    renderEvents({ status, mode, data, error }) {
      const container = document.createElement('div');
      container.className = 'student-events-container';

      // 모드 안내 배지
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

      // 로딩 상태
      if (status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'loading-state';
        loadingEl.textContent = '기록 불러오는 중';
        container.appendChild(loadingEl);
        return container;
      }

      // 오류 상태
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

      // 데이터 검증 및 복사 후 at 최신순 정렬
      const rawEvents = Array.isArray(data) ? [...data] : [];
      if (rawEvents.length === 0) {
        const emptyEl = document.createElement('p');
        emptyEl.className = 'empty-state';
        emptyEl.textContent = '표시할 기록이 없습니다';
        container.appendChild(emptyEl);
        return container;
      }

      // at 기준 내림차순(최신순) 정렬
      rawEvents.sort((a, b) => {
        const timeA = new Date(a.at || 0).getTime();
        const timeB = new Date(b.at || 0).getTime();
        return timeB - timeA;
      });

      // 필터 상태 유지 객체
      const filterState = {
        kind: 'all',
        appId: 'all',
        access: 'all',
      };

      // 매핑 사전
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

      // 필터 영역 생성
      const filterBar = document.createElement('div');
      filterBar.className = 'events-filter-bar';

      // 1) 기록 종류 필터
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

      // 2) 업무 앱 필터
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

      // 3) 접속 상태 필터
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

      // 목록 및 상세 영역
      const listContainer = document.createElement('div');
      listContainer.className = 'events-list-container';

      const detailArea = document.createElement('div');
      detailArea.className = 'event-detail-display-area';

      function renderFilteredList() {
        listContainer.textContent = '';
        detailArea.textContent = ''; // 목록 갱신 시 기존 상세 닫기

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

          // ID
          const tdId = document.createElement('td');
          tdId.textContent = ev.id || '확인 불가';
          row.appendChild(tdId);

          // 시각
          const tdTime = document.createElement('td');
          tdTime.textContent = ev.at || '확인 불가';
          row.appendChild(tdTime);

          // 종류
          const tdKind = document.createElement('td');
          tdKind.textContent = kindMap[ev.kind] || ev.kind || '확인 불가';
          row.appendChild(tdKind);

          // 앱
          const tdApp = document.createElement('td');
          tdApp.textContent = ev.appId || '앱 확인 불가';
          row.appendChild(tdApp);

          // 요약
          const tdSummary = document.createElement('td');
          tdSummary.textContent = ev.summary || '요약 없음';
          row.appendChild(tdSummary);

          // 상세 버튼
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

        // 3대 상태
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

        // 근거 (evidence)
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

        // 규칙 (rules)
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

        detailArea.appendChild(infoList);
      }

      // 이벤트 리스너 연결
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

      // 초기 렌더링
      renderFilteredList();

      container.appendChild(listContainer);
      container.appendChild(detailArea);
      return container;
    },

    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분해서 연결하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·osv 출처·조회 시각을 연결하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 연결하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 모드를 연결하세요.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 모드를 연결하세요.'; },
  };
}