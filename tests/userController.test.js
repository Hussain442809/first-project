const test = require("node:test");
const assert = require("node:assert/strict");
const { userService } = require("../business/userService");
const userController = require("../controllers/userController");

const createResponse = () => ({
    statusCode: 200,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(payload) {
        this.payload = payload;
        return this;
    }
});

test("admin cannot delete their own account", async () => {
    const originalDeleteUser = userService.deleteUser;
    let deleteCalled = false;
    userService.deleteUser = async () => {
        deleteCalled = true;
    };

    try {
        const response = createResponse();
        await userController.deleteUser({
            params: { id: "17" },
            user: { userId: 17 }
        }, response);

        assert.equal(response.statusCode, 403);
        assert.equal(deleteCalled, false);
    } finally {
        userService.deleteUser = originalDeleteUser;
    }
});
