const Account = require('../models/Account');

// Get all accounts for a user
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.userId });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accounts', error: error.message });
  }
};

// Create a new account
exports.createAccount = async (req, res) => {
  try {
    const { type, name, balance, icon } = req.body;

    const account = new Account({
      user: req.userId,
      type,
      name,
      balance,
      icon
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: 'Error creating account', error: error.message });
  }
};

// Update an account
exports.updateAccount = async (req, res) => {
  try {
    const { type, name, icon } = req.body;
    const account = await Account.findOne({ _id: req.params.id, user: req.userId });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    account.type = type || account.type;
    account.name = name || account.name;
    account.icon = icon || account.icon;

    await account.save();
    res.json(account);
  } catch (error) {
    res.status(400).json({ message: 'Error updating account', error: error.message });
  }
};

// Delete an account
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.userId });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default account' });
    }

    await Account.deleteOne({ _id: account._id });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting account', error: error.message });
  }
};

// Get account balance
exports.getAccountBalance = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.userId });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ balance: account.balance });
  } catch (error) {
    res.status(400).json({ message: 'Error fetching account balance', error: error.message });
  }
}; 