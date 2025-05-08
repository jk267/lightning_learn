# ⚡ Lightning Network Simulator – Visual & Interactive Demo

![Lightning Network Demo Screenshot](./assets/img/demo_screenshot.png) <!-- Replace with an actual screenshot if available -->

### Created by [David Kim](https://www.linkedin.com/in/david-kim-b86217266/) · [GitHub](https://github.com/jk267)

---

## 🚀 Overview

**Lightning Network Simulator** is an educational web app that visually demonstrates how Bitcoin's Lightning Network enables instant, low-cost transactions by creating off-chain payment channels. Built with React and Node.js, this project helps users understand:

- How payment channels are opened and closed
- How fast, off-chain Bitcoin transactions work
- The trade-offs between on-chain vs. Lightning payments

---

## 🧠 Key Features

- 🧰 **Open Channel** – Simulate funding a Lightning channel
- ⚡ **Send Payment** – Show animated off-chain payments between users
- 🔒 **Close Channel** – Settle balances back on-chain
- 📊 **Balance Sheet** – Live updates of user balances
- 🧾 **API Response Viewer** – Displays mock server responses
- 🎓 **Educational UI** – Includes explanations and real-world examples

---

## 🖼️ Screenshot

![Screenshot](./assets/img/node_background.png) <!-- Replace with a better screenshot if needed -->

---

## 🛠️ Tech Stack

| Layer      | Tech                        |
|------------|-----------------------------|
| Frontend   | React, Tailwind CSS         |
| Backend    | Node.js, Express (Mock API) |
| Animation  | Custom React state + SVG    |
| Hosting    | (Localhost for now)         |

---

## ⚙️ Running Locally

1. **Clone the Repository**

```bash
git clone https://github.com/jk267/lightning-network-simulator.git
cd lightning-network-simulator
```

2. **Install Dependencies**

```bash
npm install
```

3. **Start the Mock Backend**

Make sure your backend is running on `http://localhost:3001`.

```bash
node server.js
```

4. **Start the Frontend**

```bash
npm start
```

Then open your browser and go to `http://localhost:3000`.

---

## 🔌 API Simulation Endpoints

| Endpoint             | Method | Description               |
|----------------------|--------|---------------------------|
| `/open-channel`      | POST   | Simulate channel creation |
| `/update-balance`    | POST   | Simulate payment transfer |
| `/close-channel`     | POST   | Simulate closing a channel |

---

## 📚 Learning Concepts

- **Blockchain congestion** vs. **Lightning scalability**
- Payment channel lifecycle: open → transact → close
- Real-world limitations of Bitcoin for small payments
- Lightning use cases: microtransactions, remittances, retail

---

## 🧠 Educational Scenario

> Buying a $5 coffee on Bitcoin mainnet might cost $1.88 in fees and take 30 minutes to confirm.

This simulator helps you experience how Lightning channels solve that problem using:
- ⚡ Near-instant payments
- ⚡ Low fees
- ⚡ No need to record every transaction on-chain

---

## 📌 Disclaimer

This simulator is for **educational purposes only** and does **not handle real Bitcoin or Lightning payments**. It is meant to help visualize the process in a simplified, interactive way.

---

## 📄 License

MIT License

---

## 📬 Contact

For feedback or questions, feel free to reach out on [GitHub](https://github.com/jk267) or [LinkedIn](https://www.linkedin.com/in/david-kim-b86217266/).
