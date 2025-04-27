const api = { pot: '/pot', entries: '/entries', enter: '/enter', draw: '/draw' };

let connectedWallet = null;
const DOG_TOKEN_MINT = "dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u"; // Your real $DOG mint!
const HELIUS_API_KEY = "512281c9-ff3c-4013-9781-ebf93007fc7e";


document.addEventListener('DOMContentLoaded', () => {
  const potEl = document.getElementById('pot');
  const resultEl = document.getElementById('result');
  const connectBtn = document.getElementById('connectBtn');
  const walletInfo = document.getElementById('walletInfo');
  const walletAddressEl = document.getElementById('walletAddress');
  const enterBtn = document.getElementById('enterBtn');
  const drawBtn = document.getElementById('drawBtn');

  // Load Pot
  const loadPot = () => fetch(api.pot)
    .then(res => res.json())
    .then(data => {
      potEl.textContent = `Total Pot: ${data.total} $DOG`;
    });

  loadPot();

  // Check if wallet holds DOG Token
  const checkDogToken = async (publicKey) => {
  const checkDogToken = async (publicKey) => {
  try {
    const url = `https://api.helius.xyz/v0/addresses/${publicKey}/tokens?api-key=${HELIUS_API_KEY}`;
    const response = await fetch(url);
    const tokens = await response.json();

    const holdsDOG = tokens.some(token => {
      return (
        token.mint === DOG_TOKEN_MINT &&
        Number(token.amount) > 0
      );
    });

    return holdsDOG;
  } catch (error) {
    console.error('Error checking DOG token with Helius:', error);
    return false;
  }
};

      });
      const data = await response.json();
      const tokens = data.result.value;

      const holdsDOG = tokens.some(token => {
        const info = token.account.data.parsed.info;
        return (
          info.mint === DOG_TOKEN_MINT &&
          Number(info.tokenAmount.amount) > 0 // Use raw amount, safer for decimals
        );
      });

      return holdsDOG;
    } catch (error) {
      console.error('Error checking DOG token:', error);
      return false;
    }
  };

  // Connect Phantom Wallet
  connectBtn.onclick = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        connectedWallet = resp.publicKey.toString();
        console.log(`Connected Wallet: ${connectedWallet}`);

        // Show wallet info
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'block';
        walletAddressEl.textContent = connectedWallet.slice(0, 4) + "..." + connectedWallet.slice(-4);

        // Check if user holds $DOG
        const eligible = await checkDogToken(connectedWallet);
        if (eligible) {
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

  // Auto-Detect Phantom Connection (onlyIfTrusted)
  if (window.solana && window.solana.isPhantom) {
    window.solana.connect({ onlyIfTrusted: true })
      .then(async (resp) => {
        connectedWallet = resp.publicKey.toString();
        console.log(`Auto-connected Wallet: ${connectedWallet}`);

        // Show wallet info
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'block';
        walletAddressEl.textContent = connectedWallet.slice(0, 4) + "..." + connectedWallet.slice(-4);

        // Check if user holds $DOG
        const eligible = await checkDogToken(connectedWallet);
        if (eligible) {
          enterBtn.disabled = false;
        } else {
          enterBtn.disabled = true;
        }
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
