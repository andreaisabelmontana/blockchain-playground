// Bitcoin block reward & halving schedule
const INTERVAL = 210_000;

function rewardAt(height) {
  const halvings = Math.floor(height / INTERVAL);
  if (halvings >= 64) return 0;
  return 50 / 2 ** halvings;
}

function cumulativeSupplyAt(height) {
  let s = 0;
  for (let era = 0; ; era++) {
    const reward = 50 / 2 ** era;
    if (reward === 0 || era >= 64) break;
    const blocksInEra = Math.min(INTERVAL, Math.max(0, height - era * INTERVAL));
    s += blocksInEra * reward;
    if (height < (era + 1) * INTERVAL) break;
  }
  return s;
}

const eras = [
  { era: 0,  from: 0,       reward: 50,        date: '2009-01-03' },
  { era: 1,  from: 210_000, reward: 25,        date: '2012-11-28' },
  { era: 2,  from: 420_000, reward: 12.5,      date: '2016-07-09' },
  { era: 3,  from: 630_000, reward: 6.25,      date: '2020-05-11' },
  { era: 4,  from: 840_000, reward: 3.125,     date: '2024-04-19' },
  { era: 5,  from: 1_050_000, reward: 1.5625,  date: '~2028' },
  { era: 6,  from: 1_260_000, reward: 0.78125, date: '~2032' },
  { era: 7,  from: 1_470_000, reward: 0.390625,date: '~2036' },
];

export function initHalving() {
  const $tab = document.getElementById('halving-eras');
  $tab.innerHTML = '<div class="row2 head"><b>era</b><b>1st block</b><b>reward</b><b>date</b></div>' +
    eras.map(e => `<div class="row2"><span>#${e.era}</span><span>${e.from.toLocaleString()}</span><span>${e.reward} BTC</span><span>${e.date}</span></div>`).join('');

  const $h    = document.getElementById('halving-height');
  const $hVal = document.getElementById('halving-height-val');
  const $rew  = document.getElementById('halving-reward');
  const $sup  = document.getElementById('halving-supply');
  const $era  = document.getElementById('halving-era');

  function update() {
    const h = +$h.value;
    $hVal.textContent = h.toLocaleString();
    $rew.textContent  = rewardAt(h) + ' BTC';
    $sup.textContent  = cumulativeSupplyAt(h).toLocaleString(undefined,{maximumFractionDigits:0}) + ' BTC';
    $era.textContent  = Math.floor(h / INTERVAL);
  }
  $h.oninput = update;
  update();
}
