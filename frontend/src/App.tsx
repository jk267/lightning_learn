import { useState, useEffect } from 'react';


function App() {

  // State for opening a channel.
  const [openFrom, setOpenFrom] = useState('');
  const [openTo, setOpenTo] = useState('');
  const [initialAmount, setInitialAmount] = useState('');



  // State for updating the balance (sending payment)
  const [payFrom, setPayFrom] = useState('');
  const [payTo, setPayTo] = useState('');
  const [amount, setAmount] = useState('');

  const [responseMessage, setResponseMessage] = useState('');
  const [channelData, setChannelData] = useState(null);

  // Animation states
  const [animationState, setAnimationState] = useState('idle'); // idle, opening, open, transacting, closing
  const [animationProgress, setAnimationProgress] = useState(0);

  // Mobile responsiveness
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle animation effects
  useEffect(() => {
    if (animationState === 'idle' || animationState === 'open') return;

    let speed = 2;
    let interval = 30;

    if (animationState === 'opening' || animationState === 'closing') {
      speed = 1;
      interval = 50;
    } else if (animationState === 'transacting') {
      speed = 4;
      interval = 20;
    }

    const timer = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);

          if (animationState === 'opening') {
            setAnimationState('open');
          } else if (animationState === 'transacting') {
            setTimeout(() => setAnimationState('open'), 500);
          } else if (animationState === 'closing') {
            setTimeout(() => {
              setChannelData(null); // Hide channel
              setAnimationState('idle'); // ✅ Return to idle!
            }, 700);
          }

          return 0;
        }

        return prev + speed;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [animationState]);


  const openChannel = async () => {
    setAnimationState('opening');
    setAnimationProgress(0);

    try {
      const res = await fetch('http://localhost:3001/open-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openFrom,
          openTo,
          initialAmount: Number(initialAmount),
          openedBy: openFrom,
          isOnChain: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResponseMessage(`❌ Error: ${data.error || 'Unknown error'}`);
        setAnimationState('idle');
        return;
      }

      setResponseMessage(JSON.stringify(data, null, 2));
      setChannelData(data);
    } catch (error) {
      setResponseMessage('❌ Network error or server not responding');
      setAnimationState('idle');
    }
  };

  const updateBalance = async () => {
    setAnimationState('transacting');
    setAnimationProgress(0);

    const possibleChannelIds = [`${payFrom}-${payTo}`, `${payTo}-${payFrom}`];
    const validChannelId = possibleChannelIds.find(id =>
      channelData?.channelId === id
    );

    if (!validChannelId) {
      setResponseMessage('❌ Error: Invalid channel participants');
      setAnimationState('open');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: validChannelId, payFrom, payTo, amount: Number(amount) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponseMessage(`❌ Error: ${data.error || 'Unknown error'}`);
        setAnimationState('open');
        return;
      }

      setResponseMessage(JSON.stringify(data, null, 2));
      setChannelData(prev => ({ ...prev, balances: data.balances }));
    } catch (error) {
      setResponseMessage('❌ Network error or server not responding');
      setAnimationState('open');
    }
  };


  const closeChannel = async () => {
    if (!channelData) return;
    setAnimationState('closing');
    setAnimationProgress(0);

    try {
      const res = await fetch('http://localhost:3001/close-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelData.channelId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResponseMessage(`❌ Error: ${data.error || 'Unknown error'}`);
        setAnimationState('open');
        return;
      }

      setResponseMessage(`✅ Channel ${channelData.channelId} successfully closed.`);
      // channelData will be cleared at end of closing animation
    } catch (error) {
      setResponseMessage('❌ Network error or server not responding');
      setAnimationState('open');
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  };

  // Render Bitcoin network + lightning
  const renderBitcoinNetwork = () => {
    const lightningVisible = animationState !== 'idle';
    const lightningPos =
      animationState === 'closing' ? 'top-[50%]' :
        animationState === 'opening' ? 'top-[50%]' :
          animationState === 'transacting' ? 'top-[95%]' :
            'top-[95%]';
    const lightningOpacity = animationState === 'closing' && animationProgress >= 90
      ? 'opacity-0 transition-opacity duration-500'
      : 'opacity-100';

    return (



      <div className="relative h-32 w-full">
        {/* Speed Indicator Above Blockchain */}
        {/* Speed Indicator Above Blockchain */}
        {(animationState === 'opening' || animationState === 'transacting' || animationState === 'closing') && (
          <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-semibold z-10 transition-opacity duration-500">
            {animationState === 'opening' && (
              <div className="bg-red-100 text-red-600 px-3 py-1 rounded shadow">
                Slower ⏳ On-chain Transaction
              </div>
            )}
            {animationState === 'closing' && (
              <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded shadow">
                Settling to Blockchain 🔒
              </div>
            )}
            {animationState === 'transacting' && (
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded shadow">
                Faster ⚡ Off-chain Payment
              </div>
            )}
          </div>
        )}


        {/* Blockchain blocks */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex space-x-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-15 h-10 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold shadow-md">BLOCK</div>
            ))}
          </div>
        </div>

        {/* Lightning Channel */}
        {channelData && lightningVisible && (
          <div className={`absolute transition-all duration-700 ease-in-out ${lightningPos} left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${lightningOpacity}`}>
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-2 flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">{channelData.channelId.split('-')[0].charAt(0)}</div>
              <div className="text-yellow-600 font-bold">⚡</div>
              <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-xs text-white">{channelData.channelId.split('-')[1].charAt(0)}</div>
            </div>
          </div>
        )}

        {/* Transaction animation */}
        {animationState === 'transacting' && (
          <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg width="100" height="40">
              <line x1="10" y1="20" x2="90" y2="20" stroke="#CBD5E0" strokeWidth="4" />
              <circle
                cx={
                  payFrom < payTo
                    ? 10 + animationProgress * 0.8 // left to right
                    : 90 - animationProgress * 0.8 // right to left
                }
                cy="20"
                r="6"
                fill="#ECC94B"
              />

            </svg>
            <div className="absolute top-0 left-0 text-xs text-gray-600">{payFrom.charAt(0)}</div>
            <div className="absolute top-0 right-0 text-xs text-gray-600">{payTo.charAt(0)}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-indigo-700 text-2xl">⚡</span>
            <h1 className="text-2xl font-semibold text-gray-800">
              Lightning Network Simply Explained
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6 text-gray-600">
            <a href="#how-it-works" className="hover:text-indigo-700">How It Works</a>
            <a href="#simulator" className="hover:text-indigo-700">Simulator</a>
            {/* <a href="#applications" className="hover:text-indigo-700">Use Cases</a> */}
            {/* <a href="#resources" className="hover:text-indigo-700">Resources</a> */}
          </nav>
          <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(p => !p)}>
            {/* hamburger icon */}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="bg-gray-100 px-6 py-4 space-y-2 md:hidden text-gray-700">
            <a href="#how-it-works" className="block hover:text-indigo-700">How It Works</a>
            <a href="#simulator" className="block hover:text-indigo-700">Simulator</a>
            <a href="#applications" className="block hover:text-indigo-700">Use Cases</a>
            <a href="#resources" className="block hover:text-indigo-700">Resources</a>
          </div>
        )}
      </header>


      <section className="relative py-20">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('./assets/img/node_background.png')] bg-center bg-no-repeat bg-cover opacity-15"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-indigo-900 mb-4">
            So You’ve Heard of Bitcoin,
          </h2>
          <h2 className="text-4xl font-bold text-indigo-900 mb-6">
            But Can You Use It Like a Credit Card?
          </h2>

          <div className=" text-center py-2 px-4 text-xs text-gray-600">
            <p>
              Written by <span className="font-medium">David Kim</span> · <span>Last Updated on May 7, 2025</span> ·
              <a href="https://github.com/jk267" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 ml-1">GitHub</a>
              /
              <a href="https://www.linkedin.com/in/david-kim-b86217266/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 ml-1">LinkedIn</a>
            </p>
          </div>


        </div>
      </section>
      <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
        <div>
          <img src="../public/coffee_bit.png" alt="Bitcoin coffee payment delay" className="rounded-lg shadow-md" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Scenario: Buying Coffee with Bitcoin</h3>
          <p className="text-gray-700 mb-3">
            Alex walks into a café and decides to buy a $5 coffee using Bitcoin. He’s excited to try out crypto in the real world—but is quickly met with a surprise: the network fee is <strong>$1.88</strong>, and the confirmation time is <strong>over 30 minutes</strong>.
          </p>
          <p className="text-gray-700 mb-3">
            That means the fee alone is nearly <strong> 38%</strong> of the price of the coffee and the transaction will take longer than making the coffee itself!

            <br>
            </br>
            <br>
            </br>
            Alex hesitates and thinks: <em>“credit card is faster...and cheaper”</em>
          </p>
          <p className="text-gray-700 mb-3">
            Bitcoin is secure and decentralized, but the normal transactions(on-chain) aren’t built for fast, low-value purchases. That’s the limitation the Lightning Network is designed to solve.
          </p>

          <div className="text-sm text-gray-500">
            Sources:
            <a href="https://ycharts.com/indicators/bitcoin_average_transaction_fee#:~:text=Bitcoin%20Average%20Transaction%20Fee%20is,69.42%25%20from%20one%20year%20ago." className="underline text-blue-600 ml-1">bitinfocharts</a>,
            <a href="https://ycharts.com/indicators/bitcoin_average_confirmation_time" className="underline text-blue-600 ml-1">ycharts</a>
          </div>
        </div>
      </div>


      {/* Educational Section */}
      <section id="how-it-works" className="py-12 bg-white scroll-mt-24">

        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How the Lightning Network Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 shadow-md">
              <div className="text-4xl text-blue-600 mb-4">①</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">The Bitcoin Problem</h3>
              <p className="text-gray-600">Bitcoin's blockchain can process only 7 transactions per second, causing delays and high fees during congestion. Each transaction must be verified by miners and stored permanently on the blockchain.</p>
              <div className="mt-4 text-blue-600 font-semibold text-center bg-blue-100 py-2 rounded">
                Slow & Expensive On-chain Transactions
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 shadow-md">
              <div className="text-4xl text-blue-600 mb-4">②</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Lightning Solution</h3>
              <p className="text-gray-600">Lightning Network creates payment channels between users that exist off the main blockchain. Participants can make unlimited transactions through these channels without waiting for blockchain confirmations.</p>
              <div className="mt-4 text-blue-600 font-semibold text-center bg-blue-100 py-2 rounded">
                Off-chain Payment Channels
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 shadow-md">
              <div className="text-4xl text-blue-600 mb-4">③</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Channel Lifecycle</h3>
              <p className="text-gray-600">1. Open a channel (requires one on-chain transaction)<br />
                2. Exchange payments instantly with no blockchain fees<br />
                3. Close the channel when done (one final on-chain transaction)</p>
              <div className="mt-4 text-blue-600 font-semibold text-center bg-blue-100 py-2 rounded">
                Fast & Low-cost Payments
              </div>
            </div>
          </div>

          {/* <div className="mt-12 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Advanced Concepts</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Multi-hop Payments</h4>
                <p className="text-gray-600 text-sm">You don't need a direct channel with everyone. Payments can route through multiple channels, creating a network of connected users.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Hash Time-Locked Contracts (HTLCs)</h4>
                <p className="text-gray-600 text-sm">Smart contracts ensure payments are either completed fully or canceled entirely, making multi-hop payments secure.</p>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Main Simulator Section */}
      <section id="simulator" className="py-8 bg-gray-100 scroll-mt-24">

        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Interactive Lightning Network Simulator</h2>
          <p className="text-center text-gray-600 mb-2 max-w-2xl mx-auto">Experience how the Lightning Network operates by opening channels, making payments, and settling final balances.</p>
          {/* TOP: Blockchain Animation */}
          <div className="mb-8">
            {renderBitcoinNetwork()}
          </div>

          {/* Bottom: Grid layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT SIDE - Open/Send */}
            <div className="space-y-6">

              {/* Open Channel - show only when no channel */}
              {!channelData && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl text-blue-800 font-semibold mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-2 text-sm">1</span>
                    Open Channel
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    First, establish a payment channel between two parties by committing funds to the blockchain.
                  </div>
                  <input
                    type="text"
                    placeholder="Sender (e.g., Alice)"
                    value={openFrom}
                    onChange={(e) => setOpenFrom(e.target.value)}
                    className="w-full p-2 mb-2 rounded border border-gray-300 text-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Receiver (e.g., Bob)"
                    value={openTo}
                    onChange={(e) => setOpenTo(e.target.value)}
                    className="w-full p-2 mb-2 rounded border border-gray-300 text-gray-800"
                  />
                  <input
                    type="number"
                    placeholder="Initial BTC Amount"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full p-2 mb-4 rounded border border-gray-300 text-gray-800"
                  />
                  <button
                    onClick={openChannel}
                    disabled={animationState !== 'idle' && animationState !== 'open'}
                    className={`w-full ${animationState === 'idle' ? 'bg-green-600 hover:bg-green-500' : 'bg-green-400'} p-2 rounded font-semibold text-white`}
                  >
                    Open Channel
                  </button>
                </div>
              )}

              {/* Send Payment - show only if channel exists */}
              {channelData && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl text-blue-800 font-semibold mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-2 text-sm">2</span>
                    Send Payment
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    Exchange funds instantly through the open channel without touching the blockchain.
                  </div>
                  <input
                    type="text"
                    placeholder="From"
                    value={payFrom}
                    onChange={(e) => setPayFrom(e.target.value)}
                    disabled={animationState !== 'open'}
                    className="w-full p-2 mb-2 rounded border border-gray-300 text-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="To"
                    value={payTo}
                    onChange={(e) => setPayTo(e.target.value)}
                    disabled={animationState !== 'open'}
                    className="w-full p-2 mb-2 rounded border border-gray-300 text-gray-800"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={animationState !== 'open'}
                    className="w-full p-2 mb-4 rounded border border-gray-300 text-gray-800"
                  />
                  <button
                    onClick={updateBalance}
                    disabled={animationState !== 'open'}
                    className={`w-full ${animationState === 'open' ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-yellow-300'} p-2 rounded font-semibold text-white mb-2`}
                  >
                    Send Payment
                  </button>

                  <button
                    onClick={closeChannel}
                    disabled={animationState !== 'open'}
                    className={`w-full ${animationState === 'open' ? 'bg-red-500 hover:bg-red-400' : 'bg-red-300'} p-2 rounded font-semibold text-white`}
                  >
                    Close Channel & Settle
                  </button>
                </div>
              )}

              {/* API Response */}
              <div className="bg-gray-800 p-4 rounded w-full">
                <h3 className="text-lg font-semibold mb-2 text-white">API Response</h3>
                <pre className={`text-xs overflow-auto max-h-32 ${responseMessage.startsWith('❌') ? 'text-red-400' : 'text-white'}`}>
                  {responseMessage}
                </pre>
              </div>
            </div>

            {/* RIGHT SIDE - Balance Sheet */}
            <div className="space-y-6">
              {channelData ? (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-yellow-500 p-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-800">⚡ LIGHTNING CHANNEL ⚡</h3>
                    <p className="text-gray-800">Channel ID: {channelData.channelId}</p>
                    <p className="text-sm text-gray-800">{formatDate()}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between mb-6">
                      <div className="w-5/12 text-center">
                        <div className="text-lg font-bold text-blue-600">{channelData.channelId.split('-')[0]}</div>
                        <div className="text-sm text-gray-600">Sender</div>
                      </div>
                      <div className="w-2/12 flex items-center justify-center">
                        <div className="text-xl">⚡</div>
                      </div>
                      <div className="w-5/12 text-center">
                        <div className="text-lg font-bold text-pink-600">{channelData.channelId.split('-')[1]}</div>
                        <div className="text-sm text-gray-600">Receiver</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-4 border-b-2 border-gray-300 pb-2">
                      BALANCE SHEET
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(channelData.balances).map(([name, balance]) => (
                        <div key={name} className="flex justify-between items-center">
                          <div className="text-lg font-medium text-gray-800">{name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-yellow-600">{balance}</span>
                            <span className="text-sm text-gray-600">BTC</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                      <div className="text-center text-gray-500 text-sm">
                        <p>Transaction processed via Lightning Network</p>
                        <p className="mt-1">Channel status: {animationState.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center shadow-inner">
                  <div className="text-gray-500">
                    <p className="text-xl mb-2">No Active Channel</p>
                    <p className="text-sm">Open a channel to see the balance sheet and start transacting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Real-world applications */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Real-World Applications</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Microtransactions</h3>

              <p className="text-gray-600">Enable tiny payments (even fractions of a cent) for content, API calls, or gaming that would be impractical with regular Bitcoin transactions.</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🌎</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Global Remittances</h3>
              <p className="text-gray-600">Send money internationally with near-zero fees and instant settlement, bypassing traditional banking systems.</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Retail Payments</h3>
              <p className="text-gray-600">Process point-of-sale transactions instantly with confirmation times suitable for in-person commerce.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer with knowledge sources */}
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="border-t border-gray-700 mt-8 pt-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Sources</h3>
            <div className="text-sm space-y-2">
              <p><strong>YouTube Channels:</strong> Andreas Antonopoulos, BTC Sessions, MIT OpenCourseWare</p>
              <p><strong>Websites:</strong> lightning.network, bitcoinops.org, bitcoinmagazine.com, river.com/learn</p>
              <p><strong>Developer Documentation:</strong> lightning.engineering, lightningwiki.net</p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p> This is an educational simulator and does not handle real Bitcoin or Lightning Network transactions.</p>
            <p className="mt-2">Created for educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;