const api = { pot: '/pot', entries: '/entries', enter: '/enter', draw: '/draw' };

let connectedWallet = null;
const DOG_TOKEN_MINT = "dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u"; // <-- your real mint!

document.addEventListener('DOMContentLoaded', () => {
  const potEl = document.getElementById('pot');
  const resultEl = document.getElementById('result');
  const connectBtn = document.getElementById('connectBtn');
  const enterBtn = document.getElementById('enterBtn');
  const drawBtn = document.getElementById('drawBtn');

  // Load Pot
  const loadPot = () => fetch(api.pot)
    .then(res => res.json())
    .then(data => {
      potEl.textContent = `Total Pot: ${data.total} $DOG`;
    });

  loadPot();

  // Check Token Holding
  const checkDogToken = async (publicKey) => {
    try {
      const url = `https://api.mainnet-beta.solana.com`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            publicKey,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ]
        })
      });
      const data = await response.json();
      const tokens = data.result.value;

      const holdsDOG = tokens.some(token =>
        token.account.data.parsed.info.mint === DOG_TOKEN_MINT &&
        Number(token.account.data.parsed.info.tokenAmount.uiAmount) > 0
      );

      return holdsDOG;
    } catch (error) {
      console.error('Error checking DOG token:', error);
      return false;
    }
  };

  // Connect Phantom
  connectBtn.onclick = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        connectedWallet = resp.publicKey.toString();
        alert(`Connected Wallet: ${connectedWallet}`);

        // Check if they own $DOG
        const eligible = await checkDogToken(connectedWallet);
        if (eligible) {
          alert('You hold $DOG! You can enter the pot.');
          enterBtn.disabled = false;
        } else {
          alert('You must hold $DOG token to enter!');
          enterBtn.disabled = true;
        }

      } catch (err) {
        console.error('Connection failed', err);
      }
    } else {
      alert('Phantom Wallet not found. Please install Phantom extension.');
    }
  };

  // Enter the Pot
  enterBtn.onclick = () => {
    if (!connectedWallet) {
      alert('Please connect your wallet first!');
      return;
    }
    fetch(api.enter, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: connectedWallet, amount: 10 })
    })
    .then(res => res.json())
    .then(data => {
      alert('Successfully entered!');
      loadPot();
    });
  };

  // Draw Winner
  drawBtn.onclick = () => {
    fetch(api.draw, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        resultEl.textContent = data.success ? `Winner: ${data.winner.wallet}` : data.message;
      });
  };
});
