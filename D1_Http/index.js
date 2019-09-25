const df = require("durable-functions");

const timeout = "timeout";
const retryInterval = "retryInterval";

module.exports = async function (context, req) {
    const client = df.getClient(context);
    const instanceId = await client.startNew("D1_Orchestrator", undefined, req.body);

    return client.createCheckStatusResponse(
        context.bindingData.req,
        instanceId);
};


