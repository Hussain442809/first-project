const test=require('node:test');
const assert=require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { authenticate, authorize } = require('../middleware/auth');

test("authorize blocks non_admin users",()=>{
    const req={
        headers:{},
        user:{role:'user'}
    };

const res={
    statusCode:200,
    status(code)
    {
        this.statusCode=code
        return this;
    },
    json(payload)
    {
        this.payload=payload
        return this;
    }
};

let nextCalled = false;
    const next = () => {
    nextCalled = true;
};

authorize('admin')(req , res , next);
assert.equal(res.statusCode, 403);
assert.equal(nextCalled, false);
});

test("authorize allows admin users with an allowed role",()=>{
    const req={user:{role:'admin'}};
    const res={
        status(code)
        {
            this.status=code;
            return this;
        },
        json(payload)
        {
            this.payload=payload;
            return this;
        }
    };

    let nextCalled=false;
    authorize('admin')(req,res,()=>{nextCalled=true});
    assert.equal(nextCalled,true);
});

test('authenticate rejects a request without a bearer token',()=>{
    const req={headers:{}};
    const res={
        status(code)
        {
            this.statusCode=code;
            return this;
        },
        json(payload)
        {
            this.payload=payload;
            return this;
        }
    };
    let nextCalled=false;
    authenticate(req,res,()=>{
        nextCalled=true;
    });
    assert.equal(res.statusCode,401);
    assert.equal(nextCalled,false);
});

test('authenticate attaches the verified token user to the request', () => {
    const secret = 'auth-test-secret';
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = secret;
    const token = jwt.sign({ userId: 17, role: 'user' }, secret);
    const req = { headers: { authorization: `Bearer ${token}` } };
    let nextCalled = false;

    try {
        authenticate(req, {}, () => {
            nextCalled = true;
        });
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousSecret;
        }
    }

    assert.equal(req.user.userId, 17);
    assert.equal(nextCalled, true);
});
