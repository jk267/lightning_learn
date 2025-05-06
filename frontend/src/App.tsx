import { useState, useEffect } from 'react';

function App() {
  // State for opening a channel
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

    const timer = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          if (animationState === 'opening') {
            setAnimationState('open');
          } else if (animationState === 'transacting') {
            setTimeout(() => setAnimationState('open'), 500);
          } else if (animationState === 'closing') {
            // after closing animation, reset channel and state
            setTimeout(() => {
              setAnimationState('idle');
              setChannelData(null);
            }, 500);
          }
          return 0;
        }
        return prev + 2;
      });
    }, 30);

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

    const channelId = `${payFrom}-${payTo}`;
    try {
      const res = await fetch('http://localhost:3001/update-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, payFrom, payTo, amount: Number(amount) }),
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
    const lightningPos = animationState === 'closing' ? 'top-1/2' :
      animationState === 'opening' ? 'top-1/2' :
        animationState === 'transacting' ? 'top-3/4' :
          'top-3/4';
    const lightningOpacity = animationState === 'closing' && animationProgress >= 90
      ? 'opacity-0 transition-opacity duration-500'
      : 'opacity-100';

    return (
      <div className="relative h-48 w-full">
        {/* Blockchain blocks */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold shadow-md">BLK</div>
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
              <circle cx={10 + animationProgress * 0.8} cy="20" r="6" fill="#ECC94B" />
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
      {/* Header with nav */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-400 text-2xl">⚡</div>
            <h1 className="text-xl font-bold">Lightning Network Simulator</h1>
          </div>
          </div>
          


      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Understand Bitcoin's Lightning ⚡ Network</h1>
              <p className="text-lg mb-6">Learn how the Lightning Network solves Bitcoin's scaling problems through interactive simulations.</p>
              <a href="#simulator" className="inline-block bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition">Try the Simulator</a>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-blue-800 p-6 rounded-lg shadow-lg">
                <div className="text-yellow-400 text-6xl mb-2 text-center">⚡</div>
                <div className="text-center text-sm">Fast, Low-cost Bitcoin Transactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <section id="how-it-works" className="py-12 bg-white">
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
              <p className="text-gray-600">1. Open a channel (requires one on-chain transaction)<br/>
              2. Exchange payments instantly with no blockchain fees<br/>
              3. Close the channel when done (one final on-chain transaction)</p>
              <div className="mt-4 text-blue-600 font-semibold text-center bg-blue-100 py-2 rounded">
                Fast & Low-cost Payments
              </div>
            </div>
          </div>
          
          <div className="mt-12 bg-gray-100 p-6 rounded-lg">
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
          </div>
        </div>
      </section>

      {/* Main Simulator Section */}
      <section id="simulator" className="py-12 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Interactive Lightning Network Simulator</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Experience how the Lightning Network operates by opening channels, making payments, and settling final balances.</p>
          
          <div className="flex flex-col lg:flex-row">
            {/* Left side */}
            <div className="lg:w-1/2 p-4">
              <div className="space-y-6 w-full max-w-md mx-auto">
                {/* Open Channel */}
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

                {/* Send Payment */}
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

                  {channelData && (
                    <button
                      onClick={closeChannel}
                      disabled={animationState !== 'open'}
                      className={`w-full ${animationState === 'open' ? 'bg-red-500 hover:bg-red-400' : 'bg-red-300'} p-2 rounded font-semibold text-white`}
                    >
                      Close Channel & Settle
                    </button>
                  )}
                </div>

                {/* API Response */}
                <div className="bg-gray-800 p-4 rounded w-full">
                  <h3 className="text-lg font-semibold mb-2 text-white">API Response</h3>
                  <pre className={`text-xs overflow-auto max-h-32 ${responseMessage.startsWith('❌') ? 'text-red-400' : 'text-white'}`}>
                    {responseMessage}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right side - Visualization and Balance sheet */}
            <div className="lg:w-1/2 p-4">
              <div className="space-y-6 w-full max-w-md mx-auto">
                {/* Network visualization */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl text-blue-800 font-semibold mb-4">Network Visualization</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    {animationState === 'idle' ? 'Create a channel to see it connect to the blockchain' :
                      animationState === 'opening' ? 'Opening channel on the blockchain...' :
                        animationState === 'open' ? 'Channel is open and ready for off-chain transactions' :
                          animationState === 'transacting' ? 'Off-chain transaction in progress...' :
                            'Closing channel and settling on blockchain...'}
                  </div>
                  {renderBitcoinNetwork()}
                  {animationState !== 'idle' && animationState !== 'open' && (
                    <div className="w-full max-w-xs mx-auto mt-2">
                      <div className="bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                          style={{ width: `${animationProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {animationState === 'opening' ? 'Creating on-chain transaction...' :
                          animationState === 'transacting' ? 'Processing off-chain payment...' :
                            'Settling final balances on blockchain...'}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-gray-600 border-l-4 border-blue-500">
                    <p className="font-semibold text-blue-800">Educational Note:</p>
                    <p>On-chain transactions (opening/closing channels) take minutes and have fees. Off-chain payments are instant and nearly free.</p>
                  </div>
                </div>

                {/* Balance sheet receipt */}
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

      {/* Resources Section */}
      <section id="resources" className="py-12 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Further Learning Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Recommended Reading</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <div className="text-blue-600 mr-2">📘</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:underline font-medium">The Bitcoin Lightning Network Paper</a>
                    <p className="text-sm">Original whitepaper by Joseph Poon and Thaddeus Dryja</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-blue-600 mr-2">📘</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:underline font-medium">Mastering the Lightning Network</a>
                    <p className="text-sm">Comprehensive book by Andreas Antonopoulos, Olaoluwa Osuntokun, and René Pickhardt</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-blue-600 mr-2">📘</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:underline font-medium">Lightning Network Development Guide</a>
                    <p className="text-sm">Technical resource for developers by Lightning Labs</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Video Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <div className="text-red-600 mr-2">🎥</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:underline font-medium">Lightning Network Explained</a>
                    <p className="text-sm">By Andreas Antonopoulos on YouTube</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-red-600 mr-2">🎥</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:underline font-medium">How to Setup a Lightning Node</a>
                    <p className="text-sm">Step-by-step tutorial by BTC Sessions</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="text-red-600 mr-2">🎥</div>
                  <div>
                    <a href="#" className="text-blue-600 hover:underline font-medium">Lightning Network Deep Dive</a>
                    <p className="text-sm">Technical explanation by MIT Digital Currency Initiative</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          

        </div>
      </section>


      
      {/* Footer with knowledge sources */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4">

          
          <div className="border-t border-gray-700 mt-8 pt-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Knowledge Sources</h3>
            <div className="text-sm space-y-2">
              <p><strong>YouTube Channels:</strong> Andreas Antonopoulos, BTC Sessions, MIT OpenCourseWare</p>
              <p><strong>Books:</strong> "Mastering the Lightning Network" by Andreas M. Antonopoulos, Olaoluwa Osuntokun, and René Pickhardt</p>
              <p><strong>Papers:</strong> "The Bitcoin Lightning Network: Scalable Off-Chain Instant Payments" by Joseph Poon and Thaddeus Dryja</p>
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