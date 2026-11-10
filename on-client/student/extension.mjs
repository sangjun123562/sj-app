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

    /**
     * 14단계: 업무 앱 접근 판정 및 판정 이유 표시
     * 수정 대상: renderDecision
     */
    renderDecision({ status, mode, data, error, appId }) {
      const container = document.createElement('div');
      container.className = 'student-decision-container';

      // 모드 안내
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

      // 1. 요청 전 상태 (idle)
      if (status === 'idle') {
        const idleEl = document.createElement('p');
        idleEl.className = 'decision-state idle-state';
        idleEl.textContent = '앱을 골라 접속을 요청하세요';
        container.appendChild(idleEl);
        return container;
      }

      // 2. 요청 중 상태 (loading)
      if (status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'decision-state loading-state';
        loadingEl.textContent = '판정 확인 중';
        container.appendChild(loadingEl);
        return container;
      }

      // 3. 요청 실패 상태 (error) - 거부 판정이 아님을 명시
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

      // 4. 정상 판정 수신 상태 (ok)
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

      // 대상 앱
      const appItem = document.createElement('li');
      appItem.textContent = `대상 앱: ${targetAppId}`;
      detailList.appendChild(appItem);

      // 판정 결과 (코드값 및 한국어 병기)
      const decisionItem = document.createElement('li');
      decisionItem.textContent = `판정 결과: ${matchedDecision.text}`;
      if (!matchedDecision.isAllowed) {
        decisionItem.className = 'status-not-allowed';
      }
      detailList.appendChild(decisionItem);

      // challenge 추가 안내문구
      if (matchedDecision.note) {
        const challengeNoteItem = document.createElement('li');
        challengeNoteItem.className = 'decision-sub-note';
        challengeNoteItem.textContent = matchedDecision.note;
        detailList.appendChild(challengeNoteItem);
      }

      // 판정 이유
      const reasonItem = document.createElement('li');
      reasonItem.textContent = `판정 이유: ${reasonValue}`;
      detailList.appendChild(reasonItem);

      // 판정 시각
      const timeItem = document.createElement('li');
      timeItem.textContent = `판정 시각: ${checkedAtValue}`;
      detailList.appendChild(timeItem);

      container.appendChild(detailList);
      return container;
    },

    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분해서 연결하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·osv 출처·조회 시각을 연결하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 연결하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 모드를 연결하세요.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 모드를 연결하세요.'; },
  };
}