import express from 'express';
import cors from 'cors';
import { openChannel, updateBalanceSheet, closeChannel } from './routes/simulate';

const app = express();
app.use(cors());
app.use(express.json());

// Setup routes

app.post('/open-channel', openChannel);
app.post('/update-balance', updateBalanceSheet);
app.post('/close-channel', closeChannel);

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
