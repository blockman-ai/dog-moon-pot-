const api = { pot: '/pot', entries: '/entries', enter: '/enter', draw: '/draw' };

let connectedWallet = null;
const DOG_TOKEN_MINT = "dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u"; 

document.addEventListener('DOMContentLoaded', () => {
  const potEl = document.getElementById('pot');
  const resultEl = document.getElementById('result');
  const connectBtn = document.getElementById('connectBtn');
  const walletInfo = document.getElementById('walletInfo');
  const walletAddressEl = document.getElementById('walletAddress');
  const connectedBadge = document.getElementById('connectedCheck');
  const enterBtn = document.getElementById('enterBtn');
  const drawBtn = document.getElementById('drawBtn');

  // Load Pot
  const loadPot = () => fetch(api.pot)
    .then(res => res.json())
    .then(data => {
      potEl.textContent = `Total Pot: ${data.total} $DOG`;
    });

  loadPot();

  // ✅ Check if wallet holds DOG Token using Solana RPC
  const checkDogToken = async (publicKey) => {
    try {
      const url = 'https://api.mainnet-beta.solana.com';
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

      const holdsDOG = tokens.some(token => {
        const info = token.account.data.parsed.info;
        return (
          info.mint === DOG_TOKEN_MINT &&
          Number(info.tokenAmount.amount) > 0
        );
      });

      return holdsDOG;
    } catch (error) {
      console.error('Error checking DOG token with Solana RPC:', error);
      return false;
    }
  };

  // Connect Phantom Wallet
  const handleWalletConnected = async (walletAddress) => {
    connectedWallet = walletAddress;
    console.log(`Connected Wallet: ${connectedWallet}`);

    connectBtn.style.display = 'none';
    walletInfo.style.display = 'block';
    walletAddressEl.textContent = connectedWallet.slice(0, 4) + "..." + connectedWallet.slice(-4);

    const eligible = await checkDogToken(connectedWallet);
    if (eligible) {
      enterBtn.disabled = false;
      connectedBadge.style.display = 'inline';
    } else {
      alert('You must hold $DOG token to enter!');
      enterBtn.disabled = true;
      connectedBadge.style.display = 'none';
    }
  };

  connectBtn.onclick = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        await handleWalletConnected(resp.publicKey.toString());
      } catch (err) {
        console.error('Connection failed', err);
      }
    } else {
      alert('Phantom Wallet not found. Please install Phantom extension.');
    }
  };

  // Auto-Detect Phantom Wallet
  if (window.solana && window.solana.isPhantom) {
    window.solana.connect({ onlyIfTrusted: true })
      .then(async (resp) => {
        await handleWalletConnected(resp.publicKey.toString());
      })
      .catch((err) => {
        console.log('No trusted wallet connection found.');
      });
  }

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
