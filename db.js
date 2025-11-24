const { Sequelize, DataTypes } = require('sequelize');

// Connect to PostgreSQL database
const sequelize = new Sequelize('test_db', 'test_user', 'test_password', {
  host: 'localhost',
  dialect: 'postgres',
});

const Account = require('./models/account')(sequelize, DataTypes);
const Transaction = require('./models/transaction')(sequelize, DataTypes);

sequelize.sync({ force: true }).then(async () => {
  console.log('Database synced');
  // Seed some initial data
  await Account.bulkCreate([
    { balance: 1000, type: 'client' },
    { balance: 500, type: 'contractor' },
  ]);
});

module.exports = { sequelize, Account, Transaction };