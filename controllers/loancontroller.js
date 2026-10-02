const { loanService } = require("../business/loanService");

const loanController = {
    getWelcome: async (req, res) => {
        return res.status(200).json({ message: "welcome in loans managment API" });
    },

    getAllLoans: async (req, res) => {
        try {
            const loans = await loanService.getAllLoans(req.user.userId);
            return res.status(200).json(loans);
        } catch (error) {
            return res.status(500).json({ message: "failed to get loans", error: error.message });
        }
    },

    getloanByid: async (req, res) => {
        try {
            const { id } = req.params;
            const loan = await loanService.getLoanById(id, req.user.userId);

            if (!loan) {
                return res.status(404).json({ message: "loans not found" });
            }

            return res.status(200).json(loan);
        } catch (error) {
            return res.status(500).json({ message: "failed to get loans", error: error.message });
        }
    },

    createLoans: async (req, res) => {
        try {
            const newLoans = await loanService.createLoan(req.user.userId, req.body);
            return res.status(201).json({ message: "loan created", loan: newLoans });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    updateLoans: async (req, res) => {
        try {
            const { id } = req.params;
            if (Object.hasOwn(req.body, "user_id")) {
                return res.status(400).json({ message: "user_id cannot be changed" });
            }

            const updLoan = await loanService.updateLoan(id, req.user.userId, req.body);

            if (!updLoan) {
                return res.status(404).json({ message: "loan not found" });
            }

            return res.status(200).json({ message: "updating succefully", loan: updLoan });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    deleteloan: async (req, res) => {
        try {
            const { id } = req.params;
            const delLoan = await loanService.deleteLoan(id, req.user.userId);

            if (!delLoan) {
                return res.status(404).json({ message: "no loan to delete" });
            }

            return res.status(200).json({ message: "deleting succefully", loan: delLoan });
        } catch (error) {
            return res.status(500).json({ message: "failed deleting", error: error.message });
        }
    }
};

module.exports = loanController;