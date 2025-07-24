/* 사주 운세 풀이 애플리케이션 JS - 수정판 */

/*********************** 상수 데이터 ************************/ 
const cheongan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const jiji = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

const sijuTimes = [
  { name: "자시", range: "23:30~01:30", index: 0 },
  { name: "축시", range: "01:30~03:30", index: 1 },
  { name: "인시", range: "03:30~05:30", index: 2 },
  { name: "묘시", range: "05:30~07:30", index: 3 },
  { name: "진시", range: "07:30~09:30", index: 4 },
  { name: "사시", range: "09:30~11:30", index: 5 },
  { name: "오시", range: "11:30~13:30", index: 6 },
  { name: "미시", range: "13:30~15:30", index: 7 },
  { name: "신시", range: "15:30~17:30", index: 8 },
  { name: "유시", range: "17:30~19:30", index: 9 },
  { name: "술시", range: "19:30~21:30", index: 10 },
  { name: "해시", range: "21:30~23:30", index: 11 }
];

const ohaengMap = {
  "목": ["갑", "을", "인", "묘"],
  "화": ["병", "정", "사", "오"],
  "토": ["무", "기", "진", "술", "축", "미"],
  "금": ["경", "신", "유"],
  "수": ["임", "계", "자", "해"]
};

const wolgeonTable = {
  "갑기": ["병인", "정묘", "무진", "기사", "경오", "신미", "임신", "계유", "갑술", "을해", "병자", "정축"],
  "을경": ["무인", "기묘", "경진", "신사", "임오", "계미", "갑신", "을유", "병술", "정해", "무자", "기축"],
  "병신": ["경인", "신묘", "임진", "계사", "갑오", "을미", "병신", "정유", "무술", "기해", "경자", "신축"],
  "정임": ["임인", "계묘", "갑진", "을사", "병오", "정미", "무신", "기유", "경술", "신해", "임자", "계축"],
  "무계": ["갑인", "을묘", "병진", "정사", "무오", "기미", "경신", "신유", "임술", "계해", "갑자", "을축"]
};

const fortuneMessages = {
  "재물운": [
    "예상치 못한 금전적 이득이 있을 것입니다",
    "투자나 사업에서 좋은 성과를 거둘 수 있습니다",
    "지출이 늘어날 수 있으니 절약이 필요합니다",
    "안정적인 수입이 유지될 것입니다",
    "새로운 수입원이 생길 가능성이 있습니다"
  ],
  "애정운": [
    "새로운 만남의 기회가 찾아올 것입니다",
    "기존 관계가 더욱 깊어질 수 있습니다",
    "소통과 이해가 필요한 시기입니다",
    "로맨틱한 이벤트가 기다리고 있습니다",
    "자기 자신을 돌보는 시간이 필요합니다"
  ],
  "직장운": [
    "승진이나 인정받을 기회가 있습니다",
    "새로운 프로젝트나 업무가 주어질 것입니다",
    "동료들과의 협업이 중요한 시기입니다",
    "전문성을 인정받게 될 것입니다",
    "변화와 도전의 기회가 찾아옵니다"
  ],
  "건강운": [
    "전반적으로 건강한 상태를 유지할 것입니다",
    "규칙적인 운동이 필요한 시기입니다",
    "스트레스 관리에 신경써야 합니다",
    "충분한 휴식이 필요합니다",
    "건강검진을 받아보는 것이 좋습니다"
  ]
};

/******************* 유틸리티 & 계산 로직 *******************/

const sixtyCycle = (() => {
  const arr = [];
  for (let i = 0; i < 60; i++) {
    arr.push(cheongan[i % 10] + jiji[i % 12]);
  }
  return arr;
})();

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getYearPillar(year) {
  const diff = year - 1984; // 1984=갑자
  return cheongan[mod(diff, 10)] + jiji[mod(diff, 12)];
}

function getMonthPillar(yearStem, month) {
  const groupKey = Object.keys(wolgeonTable).find((k) => k.includes(yearStem));
  return wolgeonTable[groupKey][month - 1];
}

function getDayPillar(date) {
  const base = new Date("1900-01-01T00:00:00"); // 갑술일 index=10
  const days = Math.floor((date - base) / 864e5);
  const idx = mod(10 + days, 60);
  return { pillar: sixtyCycle[idx], stemIdx: idx % 10 };
}

function getTimePillar(dayStemIdx, timeIdx) {
  const stem = cheongan[mod(dayStemIdx * 2 + timeIdx, 10)];
  return stem + jiji[timeIdx];
}

function analyzeElements(pillars) {
  const cnt = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
  pillars.forEach((p) => {
    [...p].forEach((char) => {
      for (const el in ohaengMap) if (ohaengMap[el].includes(char)) cnt[el]++;
    });
  });
  return cnt;
}

function dominantElement(cnt) {
  return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
}

function personality(element) {
  const txt = {
    "목": "성장과 창의성을 중시하는 성향",
    "화": "열정적이고 활발한 성향",
    "토": "안정적이고 신뢰할 수 있는 성향",
    "금": "논리적이고 조직적인 성향",
    "수": "유연하고 직관적인 성향"
  };
  return `${element} 기운이 강해 ${txt[element]}입니다.`;
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randPercent() {
  return Math.floor(Math.random() * 61) + 40; // 40~100
}

/*********************** DOM ************************/ 
const form = document.getElementById("fortune-form");
const birthdateInput = document.getElementById("birthdate");
const birthtimeSelect = document.getElementById("birthtime");
const inputSection = document.getElementById("input-section");
const resultSection = document.getElementById("result-section");
const pillarDisplay = document.getElementById("pillar-display");
const personalityText = document.getElementById("personality-text");
const fortuneBlocks = document.getElementById("fortune-blocks");
let chartInstance;

// 시간 옵션 채우기 (placeholder 포함)
const placeholderOpt = document.createElement("option");
placeholderOpt.textContent = "시간 선택";
placeholderOpt.value = "";
placeholderOpt.disabled = true;
placeholderOpt.selected = true;
birthtimeSelect.appendChild(placeholderOpt);

sijuTimes.forEach((t) => {
  const o = document.createElement("option");
  o.value = t.index;
  o.textContent = `${t.name} (${t.range})`;
  birthtimeSelect.appendChild(o);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const birthdateStr = birthdateInput.value;
  const timeIdx = parseInt(birthtimeSelect.value, 10);
  const gender = form.elements["gender"].value;

  if (!birthdateStr) return alert("생년월일을 선택해주세요.");
  if (isNaN(timeIdx)) return alert("태어난 시간을 선택해주세요.");
  if (!gender) return alert("성별을 선택해주세요.");

  const birthDate = new Date(`${birthdateStr}T00:00:00`);
  showSection("result");
  pillarDisplay.textContent = "사주를 계산 중입니다...";

  setTimeout(() => {
    const yearP = getYearPillar(birthDate.getFullYear());
    const monthP = getMonthPillar(yearP[0], birthDate.getMonth() + 1);
    const dayData = getDayPillar(birthDate);
    const dayP = dayData.pillar;
    const timeP = getTimePillar(dayData.stemIdx, timeIdx);
    const pillars = [yearP, monthP, dayP, timeP];

    const cnt = analyzeElements(pillars);
    const mainEl = dominantElement(cnt);

    pillarDisplay.textContent = `년주: ${yearP} / 월주: ${monthP} / 일주: ${dayP} / 시주: ${timeP}`;
    personalityText.textContent = personality(mainEl);

    renderChart(cnt);
    renderFortunes();
    document.getElementById("special-advice").textContent = `${gender}분께 드리는 조언: 자신만의 리듬을 유지하며, 균형을 잃지 마세요.`;
  }, 400);
});

function showSection(name) {
  if (name === "result") {
    inputSection.classList.add("hidden");
    resultSection.classList.remove("hidden");
  } else {
    resultSection.classList.add("hidden");
    inputSection.classList.remove("hidden");
  }
}

document.getElementById("reset-btn").addEventListener("click", () => {
  form.reset();
  showSection("input");
});

document.getElementById("share-btn").addEventListener("click", async () => {
  const text = `${pillarDisplay.textContent}\n${personalityText.textContent}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "나의 사주 운세", text, url: location.href });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert("결과가 클립보드에 복사되었습니다.");
    } else {
      alert("공유 기능을 지원하지 않는 브라우저입니다.");
    }
  } catch (err) {
    console.error(err);
    alert("공유에 실패했습니다.");
  }
});

/*********************** 렌더링 ************************/ 
function renderChart(cnt) {
  const ctx = document.getElementById("elementChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: Object.keys(cnt),
      datasets: [
        {
          label: "오행 분포",
          data: Object.values(cnt),
          backgroundColor: "rgba(31,184,205,0.2)",
          borderColor: "#1FB8CD",
          pointBackgroundColor: "#1FB8CD"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 4,
          ticks: { stepSize: 1, backdropColor: "transparent", color: "var(--color-text)" },
          grid: { color: "rgba(255,255,255,0.1)" },
          angleLines: { color: "rgba(255,255,255,0.1)" },
          pointLabels: { color: "var(--color-text)" }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderFortunes() {
  fortuneBlocks.innerHTML = "";
  ["1주", "1개월", "3개월", "1년"].forEach((period) => {
    const card = document.createElement("div");
    card.className = "card";

    const headerBtn = document.createElement("button");
    headerBtn.className = "btn toggle-btn btn--outline flex justify-between items-center py-8 px-16";
    headerBtn.innerHTML = `${period} 운세 <span class='chevron'>▼</span>`;
    headerBtn.setAttribute("aria-expanded", "false");

    const body = document.createElement("div");
    body.className = "collapsible-body hidden px-16 py-8";

    ["재물운", "애정운", "직장운", "건강운"].forEach((cat) => {
      const sec = document.createElement("div");
      sec.innerHTML = `
        <h4>${cat}</h4>
        <div class='progress-bar mb-8'><div class='progress-fill' style='width:${randPercent()}%'></div></div>
        <p>${rand(fortuneMessages[cat])}</p>
      `;
      body.appendChild(sec);
    });

    headerBtn.addEventListener("click", () => {
      const exp = headerBtn.getAttribute("aria-expanded") === "true";
      headerBtn.setAttribute("aria-expanded", String(!exp));
      body.classList.toggle("hidden", exp);
    });

    card.appendChild(headerBtn);
    card.appendChild(body);
    fortuneBlocks.appendChild(card);
  });
}
