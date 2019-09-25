const df = require("durable-functions");
const moment = require("moment");

module.exports = df.orchestrator(function * (context) {
    const hi = yield context.df.callActivity("D1_Activity");

    const nextCleanup = moment.utc(context.df.currentUtcDateTime).add(4, "s");
    yield context.df.createTimer(nextCleanup.toDate());
    
    return context.df.continueAsNew(undefined);
});
