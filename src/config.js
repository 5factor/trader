module.exports = {
    defaultData: (id) => ({
        _id: id,
        primary: {
            value: 0,
            stocks: { $CASH: { amount: 100_000, average: 1 } },
            options: {},
            futures: {},
            history: [],
            trades: 0
        },
        secondary: {
            value: 0,
            stocks: { $CASH: { amount: 100_000, average: 1 } },
            options: {},
            futures: {},
            history: [],
            trades: 0
        }
    }),
    admins: ["879130852162928650"]
}