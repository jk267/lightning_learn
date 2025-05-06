import { Request, Response } from 'express';

interface Channel {
    channelId: string;
    openFrom: string;
    openTo: string;
    status: 'open' | 'closed';
    openedBy: string;
    isOnChain: boolean;
    initialAmount: number;
    balances: {
        [participant: string]: number; // e.g., { 'Adam': 10000, 'Shop': 0 }
    };
}

interface Node {
    name: string;
    role: 'sender' | 'receiver' // You can modify roles based on your requirements // add the shops later on.
}

// Sample data storage with types
let channels: Channel[] = [];
let people: Node[] = [];


export const openChannel = (req: Request, res: Response) => {
    const { openFrom, openTo, openedBy, initialAmount, isOnChain } = req.body;

    const channelId = `${openFrom}-${openTo}`;

    const newChannel: Channel = {
        channelId,
        openFrom,
        openTo,
        status: 'open',
        openedBy,
        isOnChain: isOnChain ?? true, // default to true if not provided
        initialAmount,
        balances: {
            [openFrom]: initialAmount,
            [openTo]: 0
        }
    };

    channels.push(newChannel);

    res.json({
        message: `Channel opened between ${openFrom} and ${openTo}`,
        channelId,
        onChain: newChannel.isOnChain,
        balances: newChannel.balances,
        initialAmount,
        openedBy: newChannel.openedBy,
    });
};

export const updateBalanceSheet = (req: Request, res: Response) => {
    const { channelId, payFrom, payTo, amount } = req.body;

    const channel = channels.find(c => c.channelId === channelId);

    if (!channel) {
        res.status(404).json({ error: 'Channel not found' });
        return;  // Exit the function after responding
    }

    if (channel.status !== 'open') {
        res.status(400).json({ error: 'Channel is not open' });
        return;  // Exit the function after responding
    }

    if (!channel.balances[payFrom] || channel.balances[payFrom] < amount) {
        res.status(400).json({ error: 'Insufficient balance' });
        return;  // Exit the function after responding
    }

    // Update balances
    channel.balances[payFrom] -= amount;
    channel.balances[payTo] = (channel.balances[payTo] || 0) + amount;

    // Send response after updating balance
    res.json({
        message: `Balance updated for channel ${channelId}`,
        balances: channel.balances
    });
};




export const closeChannel = (req: Request, res: Response) => {
    const { channelId } = req.body;

    if (!channelId) {
        res.status(400).json({ error: 'channelId is required' });
        return;
    }

    const channel = channels.find(c => c.channelId === channelId);

    if (!channel) {
        res.status(404).json({ error: `Channel ${channelId} not found` });
        return;
    }

    if (channel.status === 'closed') {
        res.status(400).json({ message: `Channel ${channelId} is already closed` });
    }

    channel.status = 'closed';

    res.json({
        message: `Channel ${channelId} successfully closed`,
        channel: {
            channelId: channel.channelId,
            openFrom: channel.openFrom,
            openTo: channel.openTo,
            status: channel.status,
            balances: channel.balances,
        },
    });
};






// export const closeChannel = (req: Request, res: Response) => {
//     const { channelId } = req.body;
//     channels = channels.filter(channel => channel.channelId !== channelId);
//     res.json({ message: `Channel ${channelId} closed` });
// };

// export const addNode = (req: Request, res: Response) => {
//     const { name, role } = req.body;  // Example: role could be 'sender' or 'receiver'
//     const person = { name, role };
//     people.push(person);
//     res.json({ message: `Person added: ${name} as ${role}` });
// };

// export const addCoffeeShop = (req: Request, res: Response) => {
//     const { name, location } = req.body;
//     const coffeeShop = { name, location };
//     coffeeShops.push(coffeeShop);
//     res.json({ message: `Coffee shop added: ${name} at ${location}` });
// };
