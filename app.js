const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Account, Transaction } = require('./db');

const app = express();
app.use(bodyParser.json());

// POST /api/payments/process
app.post('/api/payments/process', async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;

  if (!fromAccountId || !toAccountId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Lock the rows for the accounts involved
    const fromAccount = await Account.findByPk(fromAccountId, {
      transaction,
      lock: transaction.LOCK.UPDATE, // Apply row-level lock
    });

    const toAccount = await Account.findByPk(toAccountId, {
      transaction,
      lock: transaction.LOCK.UPDATE, // Apply row-level lock
    });255

    if (!fromAccount || !toAccount) {
      throw new Error('Invalid account IDs');
    }

    if (fromAccount.balance < amount) {
      throw new Error('Insufficient balance');
    }

    fromAccount.balance -= amount;
    await fromAccount.save({ transaction });

    toAccount.balance += amount;
    await toAccount.save({ transaction });

    await Transaction.create(
      {
        fromAccountId,
        toAccountId,
        amount,
        status: 'complete',
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();
    res.status(201).json({ message: 'Payment processed successfully' });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});