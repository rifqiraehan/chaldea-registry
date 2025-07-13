const { createAccount, getAccountsByUser, deleteAccount, updateAccount } = require('../models/Account');
const sendJson = require('../utils/sendJson');
const readRequestBody = require('../utils/readRequestBody');

async function create(req, res) {
  const userId = req.user.id;
  const { server_id, status, transfer_code, game_code, ssr_list } = req.body;

  const validationErrors = isValidAccountData(req.body);
  if (validationErrors.length > 0) {
    return sendJson(res, 400, { message: 'Validation error', errors: validationErrors });
  }

  const newAccount = await createAccount({
    server_id,
    status,
    transfer_code,
    game_code,
    ssr_list,
    user_id: userId,
    created_at: new Date(),
    updated_at: new Date()
  });

  sendJson(res, 201, { message: 'Account created', account: newAccount });
}

async function list(req, res) {
  const userId = req.user.id;
  const accounts = await getAccountsByUser(userId);
  sendJson(res, 200, { accounts });
}

async function update(req, res, parsedUrl) {
  const userId = req.user.id;
  const accountId = parsedUrl.query.id;

  if (!accountId) return sendJson(res, 400, { message: 'Missing account ID' });

  try {
    const data = await readRequestBody(req);

    const validationErrors = isValidAccountData(data, true);
    if (validationErrors.length > 0) {
      return sendJson(res, 400, { message: 'Validation error', errors: validationErrors });
    }

    const allowedFields = ['server_id', 'status', 'transfer_code', 'game_code', 'ssr_list'];
    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    const updated = await updateAccount(accountId, userId, updateData);
    if (!updated) return sendJson(res, 404, { message: 'Account not found or not owned by you' });

    sendJson(res, 200, { message: 'Account updated' });
  } catch (err) {
    console.error('[UPDATE ERROR]', err);
    sendJson(res, 400, { message: err.message || 'Invalid request body' });
  }
}

async function remove(req, res, parsedUrl) {
  const userId = req.user.id;
  const accountId = parsedUrl.query.id;
  if (!accountId) return sendJson(res, 400, { message: 'Missing account ID' });

  const deleted = await deleteAccount(accountId, userId);
  if (!deleted) return sendJson(res, 404, { message: 'Account not found or unauthorized' });

  sendJson(res, 200, { message: 'Account deleted' });
}

function isValidAccountData(data, isUpdate = false) {
  const allowedStatus = ['ONLINE', 'OFFLINE', 'SOLD', 'MISSED'];
  const allowedServers = ['JP', 'NA', 'KR', 'CN'];
  const errors = [];

  if (!isUpdate || data.server_id !== undefined) {
    if (!allowedServers.includes(data.server_id)) {
      errors.push('Invalid server_id');
    }
  }

  if (!isUpdate || data.status !== undefined) {
    if (!allowedStatus.includes(data.status)) {
      errors.push('Invalid status');
    }
  }

  if (!isUpdate || data.transfer_code !== undefined) {
    if (
      typeof data.transfer_code !== 'string' ||
      data.transfer_code.length !== 10 ||
      !/^[A-Za-z0-9]+$/.test(data.transfer_code)
    ) {
      errors.push('transfer_code must be a 10-character alphanumeric string');
    }
  }

  if (!isUpdate || data.game_code !== undefined) {
    if (
      typeof data.game_code !== 'string' ||
      !/^\d{9}$/.test(data.game_code)
    ) {
      errors.push('game_code must be exactly 9 numeric digits');
    }
  }

  if (!isUpdate || data.ssr_list !== undefined) {
    if (!Array.isArray(data.ssr_list) || !data.ssr_list.every(s => typeof s === 'string')) {
      errors.push('ssr_list must be an array of strings');
    }
  }

  return errors;
}

module.exports = { create, list, update, remove };
