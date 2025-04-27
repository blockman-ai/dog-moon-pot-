const api = { pot: '/pot', entries: '/entries', enter: '/enter', draw: '/draw' };

document.addEventListener('DOMContentLoaded', () => {
  const potEl = document.getElementById('pot');
  const resultEl = document.getElementById('result');

  const loadPot = () => fetch(api.pot).then(res => res.json()).then(data => {
    potEl.textContent = `Total Pot: ${data.total} $DOG`;
  });

  document.getElementById('enterBtn').onclick = () => {
    fetch(api.enter, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: 'YOUR_WALLET', amount: 10 })
    }).then(loadPot);
  };

  document.getElementById('drawBtn').onclick = () => {
    fetch(api.draw, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        resultEl.textContent = data.success ? `Winner: ${data.winner.wallet}` : data.message;
      });
  };

  loadPot();
});
