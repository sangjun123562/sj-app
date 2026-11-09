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

      // 모드 안내
      const currentMode = me?.mode || devices?.mode || sessions?.mode;
      if (currentMode && modeMap[currentMode]) {
        const modeBadge = document.createElement('div');
        modeBadge.className = 'status-badge mode-notice';
        modeBadge.textContent = modeMap[currentMode];
        container.appendChild(modeBadge);
      }

      // 1. 로딩 상태
      if (me?.status === 'loading' || devices?.status === 'loading' || sessions?.status === 'loading') {
        const loadingEl = document.createElement('p');
        loadingEl.className = 'loading-state';
        loadingEl.textContent = '불러오는 중';
        container.appendChild(loadingEl);
        return container;
      }

      // 2. 에러 상태 (이전 정보 제거)
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

      // 3. 정상 상태 (ok)
      const userData = me?.data?.user;
      const deviceData = me?.data?.device;
      const sessionData = me?.data?.session;

      const list = document.createElement('ul');
      list.className = 'identity-info-list';

      // 사용자 정보
      const userItem = document.createElement('li');
      const userLabel = userData?.label || userData?.id || '확인 불가';
      userItem.textContent = `사용자: ${userLabel}`;
      list.appendChild(userItem);

      // 기기 정보 및 보안 상태
      const deviceItem = document.createElement('li');
      const devLabel = deviceData?.label || deviceData?.id || '확인 불가';
      const devStatusText = deviceStatusMap[deviceData?.status] || '확인 불가';
      deviceItem.textContent = `기기: ${devLabel} (${devStatusText})`;
      if (deviceData?.status === 'noncompliant') {
        deviceItem.className = 'status-warning';
      }
      list.appendChild(deviceItem);

      // 세션 정보 및 상태
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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분해서 연결하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·osv 출처·조회 시각을 연결하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 연결하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 모드를 연결하세요.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 모드를 연결하세요.'; },
  };
}