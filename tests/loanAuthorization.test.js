const test = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../config/dp');
const loanController = require('../controllers/loancontroller');

const createResponse = () => ({
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(payload) {
        this.payload = payload;
        return this;
    }
});

test('loan endpoints stay scoped to the authenticated user', async () => {
    const originalQuery = pool.query;
    const calls = [];
    pool.query = async (query, values) => {
        calls.push({ query, values });
        return { rows: [] };
    };

    try {
        await loanController.getAllLoans({ user: { userId: 17 } }, createResponse());
        await loanController.getloanByid({ params: { id: 52 }, user: { userId: 17 } }, createResponse());
        await loanController.createLoans({
            user: { userId: 17 },
            body: { user_id: 99, book_id: 8 }
        }, createResponse());
        await loanController.updateLoans({
            params: { id: 52 },
            user: { userId: 17 },
            body: { book_id: 9 }
        }, createResponse());
        await loanController.deleteloan({
            params: { id: 52 },
            user: { userId: 17 }
        }, createResponse());

        const invalidUpdate = createResponse();
        await loanController.updateLoans({
            params: { id: 52 },
            user: { userId: 17 },
            body: { user_id: 99 }
        }, invalidUpdate);
        assert.equal(invalidUpdate.statusCode, 400);
    } finally {
        pool.query = originalQuery;
    }

    assert.match(calls[0].query, /where user_id=\$1/i);
    assert.deepEqual(calls[0].values, [17]);
    assert.match(calls[1].query, /where id=\$1 and user_id=\$2/i);
    assert.deepEqual(calls[1].values, [52, 17]);
    assert.deepEqual(calls[2].values, [17, 8]);
    assert.match(calls[3].query, /where id=\$2 and user_id=\$3/i);
    assert.deepEqual(calls[3].values, [9, 52, 17]);
    assert.match(calls[4].query, /where id=\$1 and user_id=\$2/i);
    assert.deepEqual(calls[4].values, [52, 17]);
});
