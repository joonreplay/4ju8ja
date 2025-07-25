// 사주팔자 운세 앱 완전 구현 (버그 수정 버전)
class FortuneApp {
  constructor() {
    // 천간 (Heavenly Stems)
    this.heavenlyStems = [
      { korean: '갑', hanja: '甲', element: '목' },
      { korean: '을', hanja: '乙', element: '목' },
      { korean: '병', hanja: '丙', element: '화' },
      { korean: '정', hanja: '丁', element: '화' },
      { korean: '무', hanja: '戊', element: '토' },
      { korean: '기', hanja: '己', element: '토' },
      { korean: '경', hanja: '庚', element: '금' },
      { korean: '신', hanja: '辛', element: '금' },
      { korean: '임', hanja: '壬', element: '수' },
      { korean: '계', hanja: '癸', element: '수' }
    ];

    // 지지 (Earthly Branches)
    this.earthlyBranches = [
      { korean: '자', hanja: '子', element: '수' },
      { korean: '축', hanja: '丑', element: '토' },
      { korean: '인', hanja: '寅', element: '목' },
      { korean: '묘', hanja: '卯', element: '목' },
      { korean: '진', hanja: '辰', element: '토' },
      { korean: '사', hanja: '巳', element: '화' },
      { korean: '오', hanja: '午', element: '화' },
      { korean: '미', hanja: '未', element: '토' },
      { korean: '신', hanja: '申', element: '금' },
      { korean: '유', hanja: '酉', element: '금' },
      { korean: '술', hanja: '戌', element: '토' },
      { korean: '해', hanja: '亥', element: '수' }
    ];

    // 오행 데이터
    this.elements = {
      목: { name: '목(木)', color: '#1FB8CD' },
      화: { name: '화(火)', color: '#B4413C' },
      토: { name: '토(土)', color: '#FFC185' },
      금: { name: '금(金)', color: '#ECEBD5' },
      수: { name: '수(水)', color: '#5D878F' }
    };

    // 시간대 배열
    this.timeSlots = [
      { name: '자시', range: '23:00~01:00' },
      { name: '축시', range: '01:00~03:00' },
      { name: '인시', range: '03:00~05:00' },
      { name: '묘시', range: '05:00~07:00' },
      { name: '진시', range: '07:00~09:00' },
      { name: '사시', range: '09:00~11:00' },
      { name: '오시', range: '11:00~13:00' },
      { name: '미시', range: '13:00~15:00' },
      { name: '신시', range: '15:00~17:00' },
      { name: '유시', range: '17:00~19:00' },
      { name: '술시', range: '19:00~21:00' },
      { name: '해시', range: '21:00~23:00' }
    ];

    this.fortuneData = null;
    this.chart = null;
    this.init();
  }

  init() {
    console.log('FortuneApp initializing...');
    this.setupEventListeners();
    this.setDefaultDate();
  }

  setDefaultDate() {
    // 현재 날짜로 기본값 설정
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');
    
    const birthdateInput = document.getElementById('birthdate');
    if (birthdateInput) {
      birthdateInput.value = dateStr;
    }
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // 폼 제출 - 이벤트 위임 방식으로 변경
    document.addEventListener('click', (e) => {
      if (e.target.type === 'submit' || e.target.closest('button[type="submit"]')) {
        e.preventDefault();
        console.log('Submit button clicked');
        this.handleFormSubmit(e);
      }
    });

    // 폼 제출 이벤트도 추가로 등록
    const form = document.getElementById('fortune-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');
        this.handleFormSubmit(e);
      });
    }

    // 다시 보기 버튼
    document.addEventListener('click', (e) => {
      if (e.target.id === 'reset-btn') {
        this.resetToInput();
      }
    });

    // 공유 버튼
    document.addEventListener('click', (e) => {
      if (e.target.id === 'share-btn') {
        this.showShareModal();
      }
    });

    // 부적 발급 버튼
    document.addEventListener('click', (e) => {
      if (e.target.id === 'talisman-btn') {
        this.generateTalisman();
      }
    });

    // 모달 관련
    this.setupModalListeners();
  }

  setupModalListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'close-modal' || e.target.classList.contains('modal-overlay')) {
        this.hideShareModal();
      }
      
      if (e.target.id === 'kakao-share') {
        this.shareToKakao();
      }
      
      if (e.target.id === 'telegram-share') {
        this.shareToTelegram();
      }
      
      if (e.target.id === 'copy-url') {
        this.copyUrl();
      }
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    console.log('Handling form submit...');
    
    const birthdate = document.getElementById('birthdate').value;
    const birthtime = document.getElementById('birthtime').value;
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : null;

    console.log('Form data:', { birthdate, birthtime, gender });

    if (!birthdate) {
      alert('생년월일을 입력해주세요!');
      return;
    }
    
    if (!birthtime && birthtime !== '0') {
      alert('태어난 시간을 선택해주세요!');
      return;
    }
    
    if (!gender) {
      alert('성별을 선택해주세요!');
      return;
    }

    console.log('All validation passed, calculating fortune...');
    
    // 사주 계산
    this.fortuneData = this.calculateFortune(birthdate, birthtime, gender);
    console.log('Fortune calculated:', this.fortuneData);
    
    this.displayResults();
  }

  calculateFortune(birthdate, timeIndex, gender) {
    console.log('Calculating fortune for:', birthdate, timeIndex, gender);
    
    const date = new Date(birthdate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 간단한 사주 계산 (실제로는 더 복잡한 음력 변환 필요)
    const yearStem = this.heavenlyStems[year % 10];
    const yearBranch = this.earthlyBranches[year % 12];
    
    const monthStem = this.heavenlyStems[(year * 2 + month) % 10];
    const monthBranch = this.earthlyBranches[(month + 1) % 12];
    
    const dayStem = this.heavenlyStems[(year + month + day) % 10];
    const dayBranch = this.earthlyBranches[(year + month + day) % 12];
    
    const timeStem = this.heavenlyStems[(year + month + day + parseInt(timeIndex)) % 10];
    const timeBranch = this.earthlyBranches[parseInt(timeIndex)];

    const result = {
      birth: { year, month, day, timeIndex, gender },
      pillars: {
        year: { stem: yearStem, branch: yearBranch },
        month: { stem: monthStem, branch: monthBranch },
        day: { stem: dayStem, branch: dayBranch },
        time: { stem: timeStem, branch: timeBranch }
      },
      elements: this.calculateElementBalance([yearStem, monthStem, dayStem, timeStem], [yearBranch, monthBranch, dayBranch, timeBranch]),
      fortune: this.generateFortune(dayStem, dayBranch, gender)
    };
    
    console.log('Fortune calculation result:', result);
    return result;
  }

  calculateElementBalance(stems, branches) {
    const balance = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    
    stems.forEach(stem => balance[stem.element]++);
    branches.forEach(branch => balance[branch.element]++);
    
    return balance;
  }

  generateFortune(dayStem, dayBranch, gender) {
    const periods = ['오늘', '이번 달', '올해'];
    const categories = ['재물운', '애정운', '직장운', '건강운'];
    const fortunes = {};

    periods.forEach(period => {
      fortunes[period] = {};
      categories.forEach(category => {
        // 일간과 성별을 기반으로 운세 점수 계산 (의사랜덤)
        const baseScore = this.hashCode(dayStem.korean + dayBranch.korean + category + period + gender) % 100;
        const score = Math.max(20, Math.min(95, 50 + baseScore % 50));
        
        fortunes[period][category] = {
          score,
          description: this.getFortuneDescription(category, score, dayStem, period)
        };
      });
    });

    return fortunes;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash);
  }

  getFortuneDescription(category, score, dayStem, period) {
    const descriptions = {
      재물운: {
        high: `${dayStem.korean}일간의 특성상 ${period} 재물운이 매우 좋습니다. 투자나 사업에서 좋은 성과가 기대됩니다.`,
        medium: `${dayStem.korean}일간으로서 ${period} 안정적인 재정 관리가 필요합니다. 무리한 투자는 피하세요.`,
        low: `${dayStem.korean}일간의 ${period} 재물운이 다소 약합니다. 절약과 저축에 집중하는 것이 좋겠습니다.`
      },
      애정운: {
        high: `${dayStem.korean}일간의 매력이 ${period} 크게 발산됩니다. 새로운 만남이나 관계 발전이 기대됩니다.`,
        medium: `${dayStem.korean}일간으로서 ${period} 안정적인 인간관계를 유지할 수 있습니다. 진정성 있는 소통이 중요합니다.`,
        low: `${dayStem.korean}일간의 ${period} 인간관계에서 오해나 갈등이 있을 수 있습니다. 신중한 말과 행동이 필요합니다.`
      },
      직장운: {
        high: `${dayStem.korean}일간의 능력이 ${period} 크게 인정받을 것입니다. 승진이나 좋은 기회가 찾아올 수 있습니다.`,
        medium: `${dayStem.korean}일간으로서 ${period} 꾸준한 노력이 결실을 맺을 것입니다. 현재 상황을 유지하며 발전시키세요.`,
        low: `${dayStem.korean}일간의 ${period} 직장운이 다소 침체될 수 있습니다. 인내심을 갖고 실력을 쌓는 시기입니다.`
      },
      건강운: {
        high: `${dayStem.korean}일간의 ${period} 건강운이 매우 좋습니다. 활력이 넘치고 컨디션이 최상입니다.`,
        medium: `${dayStem.korean}일간으로서 ${period} 적당한 운동과 규칙적인 생활이 건강을 유지하는 열쇠입니다.`,
        low: `${dayStem.korean}일간의 ${period} 건강관리에 특별히 신경 써야 합니다. 충분한 휴식과 영양 섭취가 중요합니다.`
      }
    };

    const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
    return descriptions[category][level];
  }

  displayResults() {
    console.log('Displaying results...');
    
    // 입력 섹션 숨기고 결과 섹션 표시
    const inputSection = document.getElementById('input-section');
    const resultSection = document.getElementById('result-section');
    
    if (inputSection) inputSection.classList.add('hidden');
    if (resultSection) resultSection.classList.remove('hidden');

    this.displayPillars();
    this.displayElementChart();
    this.displayFortunes();
  }

  displayPillars() {
    const pillarsContainer = document.getElementById('pillar-display');
    if (!pillarsContainer) return;
    
    const { pillars } = this.fortuneData;

    const pillarNames = ['년주', '월주', '일주', '시주'];
    const pillarKeys = ['year', 'month', 'day', 'time'];

    pillarsContainer.innerHTML = pillarKeys.map((key, index) => {
      const pillar = pillars[key];
      return `
        <div class="pillar-item">
          <div class="pillar-label">${pillarNames[index]}</div>
          <div class="pillar-chars">
            ${pillar.stem.korean}${pillar.branch.korean}<br>
            <small>(${pillar.stem.hanja}${pillar.branch.hanja})</small>
          </div>
        </div>
      `;
    }).join('');
  }

  displayElementChart() {
    const ctx = document.getElementById('elementChart');
    if (!ctx) return;
    
    const chartCtx = ctx.getContext('2d');
    const { elements } = this.fortuneData;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = Object.keys(elements).map(key => elements[key]);
    const labels = Object.keys(elements).map(key => this.elements[key].name);
    const colors = Object.keys(elements).map(key => this.elements[key].color);

    this.chart = new Chart(chartCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#DC143C'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 14
              }
            }
          }
        }
      }
    });
  }

  displayFortunes() {
    const fortuneContainer = document.getElementById('fortune-blocks');
    if (!fortuneContainer) return;
    
    const { fortune } = this.fortuneData;

    fortuneContainer.innerHTML = Object.keys(fortune).map(period => {
      const periodData = fortune[period];
      
      return `
        <div class="fortune-period">
          <h4 class="period-title">${period}</h4>
          <div class="fortune-categories">
            ${Object.keys(periodData).map(category => {
              const data = periodData[category];
              return `
                <div class="fortune-category">
                  <div class="category-name">${category}</div>
                  <div class="score-bar">
                    <div class="score-fill" style="width: ${data.score}%"></div>
                  </div>
                  <div class="score-text">${data.score}점</div>
                  <div class="category-description">${data.description}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  resetToInput() {
    console.log('Resetting to input...');
    
    const resultSection = document.getElementById('result-section');
    const inputSection = document.getElementById('input-section');
    
    if (resultSection) resultSection.classList.add('hidden');
    if (inputSection) inputSection.classList.remove('hidden');
    
    // 폼 리셋
    const form = document.getElementById('fortune-form');
    if (form) form.reset();
    
    // 기본 날짜 다시 설정
    this.setDefaultDate();
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  showShareModal() {
    // Web Share API 먼저 시도
    if (navigator.share) {
      const shareData = {
        title: '🔮 나의 사주팔자 운세',
        text: '내 사주팔자와 운세를 확인해보세요!',
        url: window.location.href
      };
      
      navigator.share(shareData).catch(() => {
        // Web Share API 실패 시 모달 표시
        const modal = document.getElementById('share-modal');
        if (modal) modal.classList.remove('hidden');
      });
    } else {
      // Web Share API 미지원 시 모달 표시
      const modal = document.getElementById('share-modal');
      if (modal) modal.classList.remove('hidden');
    }
  }

  hideShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) modal.classList.add('hidden');
  }

  shareToKakao() {
    const url = `https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('🔮 나의 사주팔자 운세 결과를 확인해보세요!')}`;
    window.open(url, '_blank');
    this.hideShareModal();
  }

  shareToTelegram() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('🔮 나의 사주팔자 운세 결과를 확인해보세요!')}`;
    window.open(url, '_blank');
    this.hideShareModal();
  }

  async copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('URL이 클립보드에 복사되었습니다!');
    } catch (err) {
      // 클립보드 API 실패 시 fallback
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('URL이 복사되었습니다!');
    }
    this.hideShareModal();
  }

  generateTalisman() {
    console.log('Generating talisman...');
    
    if (!this.fortuneData) {
      alert('먼저 운세를 확인해주세요!');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // 배경 (노란색)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, 300, 500);

    // 테두리 (빨간색)
    ctx.strokeStyle = '#DC143C';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 292, 492);

    // 복 글자 (빨간색, 큰 글씨)
    ctx.fillStyle = '#DC143C';
    ctx.font = 'bold 180px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('福', 150, 200);

    // 사용자 일간 (작은 글씨)
    const dayStem = this.fortuneData.pillars.day.stem;
    const dayBranch = this.fortuneData.pillars.day.branch;
    ctx.font = '24px serif';
    ctx.fillText(`${dayStem.korean}${dayBranch.korean}(${dayStem.hanja}${dayBranch.hanja})`, 150, 380);

    // 날짜
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')}`;
    ctx.font = '16px serif';
    ctx.fillText(dateStr, 150, 440);

    // 다운로드
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = '복부적.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('🪄 부적 이미지가 다운로드되었습니다!');
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  new FortuneApp();
});

// 추가 초기화 (만약을 위해)
window.addEventListener('load', () => {
  console.log('Window loaded');
  if (!window.fortuneApp) {
    window.fortuneApp = new FortuneApp();
  }
});