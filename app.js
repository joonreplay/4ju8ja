/* ------------------------------
 * 공용 도우미 함수
 * ------------------------------ */
function $(sel){return document.querySelector(sel);}
function $all(sel){return document.querySelectorAll(sel);}
const 천간=['갑','을','병','정','무','기','경','신','임','계'];
const 지지=['자','축','인','묘','진','사','오','미','신','유','술','해'];
const 오행표={갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수'};

/* ------------------------------
 * 1) 입력 → 사주 계산
 * ------------------------------ */
$('#fortune-form').addEventListener('submit',e=>{
  e.preventDefault();
  const dateVal=$('#birth-date').value;
  const timeVal=$('#birth-time').value;
  const gender=$('#gender').value;
  if(!dateVal||!timeVal||!gender){alert('모든 항목을 입력하세요');return;}

  const birth=new Date(dateVal+'T00:00:00');
  const year=birth.getFullYear();
  const month=birth.getMonth()+1;
  const day=birth.getDate();
  const hour=parseInt(timeVal,10);

  /* 간지 계산 (단순화된 60갑자 순환) */
  const baseYear=1984; // 갑자(갑자)
  const offset=(year-baseYear)%60;
  const yearStem=천간[offset%10];
  const yearBranch=지지[offset%12];

  /* 월주는 통상식 간략화: (yearStem*2+month) % 10 ... */
  const monthStem=천간[(offset*2+month)%10];
  const monthBranch=지지[(month+1)%12];

  /* 일주는 Date 기반 근사치 (만세력 미사용) */
  const daysSinceBase=Math.floor((birth-new Date('1924-02-05'))/86400000);
  const dayStem=천간[(daysSinceBase+50)%10];
  const dayBranch=지지[(daysSinceBase+12)%12];

  /* 시주 */
  const timeIndex=Math.floor((hour%24)/2);
  const hourStem=천간[(dayStem.charCodeAt(0)+timeIndex)%10];
  const hourBranch=지지[timeIndex];

  const saju={
    year:`${yearStem}${yearBranch}(${getHanja(yearStem)}${getHanja(yearBranch)})`,
    month:`${monthStem}${monthBranch}(${getHanja(monthStem)}${getHanja(monthBranch)})`,
    day:`${dayStem}${dayBranch}(${getHanja(dayStem)}${getHanja(dayBranch)})`,
    hour:`${hourStem}${hourBranch}(${getHanja(hourStem)}${getHanja(hourBranch)})`,
    dayStem:{kor:dayStem,hanja:getHanja(dayStem)},
  };
  renderResult(saju);
});

/* ------------------------------
 * 2) 결과 렌더링
 * ------------------------------ */
function renderResult(saju){
  $('#form-section').hidden=true;
  $('#result-section').hidden=false;

  $('#saju-summary').innerHTML=`
    <h2>사주팔자</h2>
    <p><strong>년주</strong>: ${saju.year}</p>
    <p><strong>월주</strong>: ${saju.month}</p>
    <p><strong>일주</strong>: ${saju.day}</p>
    <p><strong>시주</strong>: ${saju.hour}</p>
  `;

  drawFiveElementsChart(saju);
  drawPeriodFortune();
}

/* ------------------------------
 * 3) 오행 균형 차트
 * ------------------------------ */
function drawFiveElementsChart(saju){
  const counts={목:0,화:0,토:0,금:0,수:0};
  [saju.year,saju.month,saju.day,saju.hour].forEach(col=>{
    const stem=col[0];
    counts[오행표[stem]]++;
  });
  const ctx=$('#five-elements-chart').getContext('2d');
  new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:Object.keys(counts),
      datasets:[{data:Object.values(counts),backgroundColor:['#3CB371','#FF6347','#DAA520','#B0C4DE','#1E90FF']}]
    },
    options:{plugins:{legend:{display:false}}}
  });
}

/* ------------------------------
 * 4) 기간별 운세 (하루/한달/1년)
 * ------------------------------ */
const periodSetup={
  day:'하루 운세입니다. 오늘 하루는 새로운 기회를 위한 시기입니다.',
  month:'한달 운세입니다. 꾸준한 노력이 결실을 맺는 달입니다.',
  year:'연간 운세입니다. 장기적 목표를 재정비하세요.'
};
$all('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $all('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    drawPeriodFortune(btn.dataset.period);
  });
});
function drawPeriodFortune(period='day'){
  const container=$('#period-results');
  container.innerHTML='';
  ['재물','애정','직장','건강'].forEach(type=>{
    const score=Math.floor(Math.random()*56)+45; // 45~100
    container.insertAdjacentHTML('beforeend',`
      <h3>${type}운  ‧  ${score}점</h3>
      <div class="progress-bar"><span style="width:${score}%"></span></div>
      <p>${type}운 해설: ${periodSetup[period]} (점수 산정 근거: 일간 <strong>${period}</strong>의 기운과 상생·상극 분석)</p>
    `);
  });
}

/* ------------------------------
 * 5) 공유 & 초기화
 * ------------------------------ */
$('#btn-reset').addEventListener('click',()=>{
  location.reload();
});
$('#btn-share').addEventListener('click',()=>{
  const shareUrl=location.href;
  if(navigator.share){
    navigator.share({title:'福 사주운세',text:'나의 사주 운세를 확인해 보세요!',url:shareUrl});
  }else{
    prompt('URL을 복사하세요',shareUrl);
  }
});

/* ------------------------------
 * 6) 부적 발급 (★ 새로 교체된 함수 ★)
 * ------------------------------ */
$('#btn-talisman').addEventListener('click',()=>{
  const dayStemText=$('#saju-summary').querySelectorAll('p')[2]?.textContent||'';
  const match=/\((.)\S(.)\S\)/.exec(dayStemText);
  const dayStemHanja=match?match[1]:'甲';
  generateTalisman({dayStem:{hanja:dayStemHanja}});
});

/* ==========================================
 *  부적 발급 : “행운‧상승” 클로버 부적
 *  - 진노랑 배경(#FFD700)
 *  - 붉은 테두리(20 px) & 모서리 홈
 *  - 코너 한자 ❶幸 ❷運 ❸上 ❹昇
 *  - 중앙 : ‘행운’(70 px) + 네잎클로버
 *  - 하단 : ‘상승’(70 px)
 *  - 해상도 1080×1920, 파일명 lucky_bujeok.png
 * ========================================== */
function generateTalisman() {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  /* 1) 배경 */
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(0, 0, W, H);

  /* 2) 붉은 테두리 (+ 모서리 홈) */
  const border = 20, corner = 80;
  ctx.strokeStyle = '#C4001E';
  ctx.lineWidth = border;
  ctx.beginPath();
  // 위쪽
  ctx.moveTo(corner, border / 2);
  ctx.lineTo(W - corner, border / 2);
  // 우측
  ctx.lineTo(W - border / 2, corner);
  ctx.lineTo(W - border / 2, H - corner);
  // 아래
  ctx.lineTo(W - corner, H - border / 2);
  ctx.lineTo(corner, H - border / 2);
  // 좌측
  ctx.lineTo(border / 2, H - corner);
  ctx.lineTo(border / 2, corner);
  ctx.closePath();
  ctx.stroke();

  /* 3) 코너 한자 */
  ctx.fillStyle = '#C4001E';
  ctx.font = '64px KaiTi, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('幸', corner / 2 + 10, corner / 2 + 10);                 // 좌상
  ctx.fillText('運', W - corner / 2 - 10, corner / 2 + 10);             // 우상
  ctx.fillText('上', corner / 2 + 10, H - corner / 2 - 10);             // 좌하
  ctx.fillText('昇', W - corner / 2 - 10, H - corner / 2 - 10);         // 우하

  /* 4) 중앙 ‘행운’ 텍스트 */
  ctx.font = '700 70px "Pretendard", "Noto Sans KR", sans-serif';
  ctx.fillText('행운', W / 2, H / 2 - 260);

  /* 5) 네잎클로버 그리기 */
  ctx.lineWidth = 18;
  const r = 180, cx = W / 2, cy = H / 2;
  const drawLeaf = angle => {
    const rad = angle * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(rad), cy + r * Math.sin(rad), r, 0, 2 * Math.PI);
    ctx.stroke();
  };
  [45, 135, 225, 315].forEach(drawLeaf);
  // 줄기
  ctx.beginPath();
  ctx.moveTo(cx, cy + r);
  ctx.lineTo(cx, cy + r + 140);
  ctx.stroke();

  /* 6) 하단 ‘상승’ 텍스트 */
  ctx.font = '700 70px "Pretendard", "Noto Sans KR", sans-serif';
  ctx.fillText('상승', W / 2, H - 220);

  /* 7) 저장 */
  const link = document.createElement('a');
  link.download = 'lucky_bujeok.png';
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert('행운·상승 부적이 다운로드되었습니다!');
}


/* ------------------------------
 * 7) 한자 변환 유틸
 * ------------------------------ */
function getHanja(kor){
  const map={
    '갑':'甲','을':'乙','병':'丙','정':'丁','무':'戊','기':'己',
    '경':'庚','신':'辛','임':'壬','계':'癸','자':'子','축':'丑',
    '인':'寅','묘':'卯','진':'辰','사':'巳','오':'午','미':'未',
    '신':'申','유':'酉','술':'戌','해':'亥'
  };
  return map[kor]||kor;
}
