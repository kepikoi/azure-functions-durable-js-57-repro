# azure-functions-durable-js repro for [JS context.df.continueAsNew not working in 1.8.0 #57](https://github.com/Azure/azure-functions-durable-js/issues/57)
 
A `POST` call to the `D1_Http` trigger kicks off the eternal orchestration `D1_Orchestrator` which is supposed to call `D1_Activity` every four seconds indefinitely. 
Due to a bug in Azure functions `DurableTask` extension in versions `1.8.0 - 1.8.3` the orchestration stops working after a single invocation

## Specifications:
* Windows 10 Pro 1903
* Azure Storage Emulator 5.9
* Node.js 10.16.0
* NPM 6.10.3
* azure-functions-core-tools@2.7.1585
* durable-funtions@1.2.4
* DurableTask extension version 1.8.3

## Install & start
execute in project root
```
npm install
npm install -g azure-functions-core-tools
func extensions install
func start
```

## Invoke
via PowerShell
```
Invoke-WebRequest -Uri http://127.0.0.1:7071/api/start -Method POST
```
or via any Http client: [http/start.http](./http/start.http)

## Result
`D1_Activity` activity is only called once in the logs and the eternal orchestration stalls
````
Now listening on: http://0.0.0.0:7071

Application started. Press Ctrl+C to shut down.
Http Functions:

        D1_Http: [POST] http://localhost:7071/api/start

[25.09.2019 09:19:33] Executing 'Functions.D1_Orchestrator' (Reason='', Id=837a3133-155d-42ba-9146-bc35f0d3906e)
[25.09.2019 09:19:33] bc0be634644b4e8bab6a4d9b711b0dee: Function 'D1_Orchestrator (Orchestrator)' started. IsReplay: False. Input: (16 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.8.3. SequenceNumber: 2.
[25.09.2019 09:19:34] bc0be634644b4e8bab6a4d9b711b0dee: Function 'D1_Activity (Activity)' scheduled. Reason: D1_Orchestrator. IsReplay: False. State: Scheduled. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.8.3. SequenceNumber: 3.
[25.09.2019 09:19:34] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=837a3133-155d-42ba-9146-bc35f0d3906e)
[25.09.2019 09:19:34] bc0be634644b4e8bab6a4d9b711b0dee: Function 'D1_Activity (Activity)' started. IsReplay: False. Input: (24 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.8.3. SequenceNumber: 4.
[25.09.2019 09:19:34] Executing 'Functions.D1_Activity' (Reason='', Id=7c2ec67b-0749-4046-af06-62bb99507afb)
[25.09.2019 09:19:34] Executed 'Functions.D1_Activity' (Succeeded, Id=7c2ec67b-0749-4046-af06-62bb99507afb)
[25.09.2019 09:19:34] !!!!!!!!!!!! ACTIVITY CALLED[25.09.2019 09:19:34] bc0be634644b4e8bab6a4d9b711b0dee: Function 'D1_Activity (Activity)' completed. ContinuedAsNew: False. IsReplay: False. Output: (16 bytes). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.8.3. SequenceNumber: 5.

[25.09.2019 09:19:34] Executing 'Functions.D1_Orchestrator' (Reason='', Id=73f03136-cd1c-43eb-be9a-bf54ada805c9)
[25.09.2019 09:19:34] bc0be634644b4e8bab6a4d9b711b0dee: Function 'D1_Orchestrator (Orchestrator)' is waiting for input. Reason: CreateTimer:2019-09-25T09:19:38.7830000Z. IsReplay: False. State: Listening. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.8.3. SequenceNumber: 6.
[25.09.2019 09:19:34] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=73f03136-cd1c-43eb-be9a-bf54ada805c9)
[25.09.2019 09:19:38] Host lock lease acquired by instance ID '0000000000000000000000000B775925'.
[25.09.2019 09:19:38] Executing 'Functions.D1_Orchestrator' (Reason='', Id=afae476c-c912-4f5b-b84b-37e749341c01)
[25.09.2019 09:19:38] bc0be634644b4e8bab6a4d9b711b0dee: Function 'D1_Orchestrator (Orchestrator)' was resumed by a timer scheduled for '2019-09-25T09:19:38.7830000Z'. IsReplay: False. State: TimerExpired. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.8.3. SequenceNumber: 7.
[25.09.2019 09:19:38] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=afae476c-c912-4f5b-b84b-37e749341c01)
````

## Expected behaviour with DurableTask extension version 1.7.1
In [extensions.csproj](extensions.csproj)  change the line `    <PackageReference Include="Microsoft.Azure.WebJobs.Extensions.DurableTask" Version="1.8.3" />` to `<PackageReference Include="Microsoft.Azure.WebJobs.Extensions.DurableTask" Version="1.7.1" />` and restart the project with
````
func durable purge-history
func extensions install
func start
````

The orchestration calls `D1_Activity` now indefinitely
```
Now listening on: http://0.0.0.0:7071
Application started. Press Ctrl+C to shut down.

Http Functions:

        D1_Http: [POST] http://localhost:7071/api/start

[25.09.2019 09:24:49] Executing HTTP request: {
[25.09.2019 09:24:49]   "requestId": "2a7df2b6-e770-4da3-92da-a27d77199872",
[25.09.2019 09:24:49]   "method": "POST",
[25.09.2019 09:24:49]   "uri": "/api/start"
[25.09.2019 09:24:49] }
[25.09.2019 09:24:50] Executing 'Functions.D1_Http' (Reason='This function was programmatically called via the host APIs.', Id=57732b0f-63eb-4e81-896c-3ecfb35bbaa3)
[25.09.2019 09:24:50] Executing HTTP request: {
[25.09.2019 09:24:50]   "requestId": "0cb21775-5642-4b76-9d13-b0be8987eef1",
[25.09.2019 09:24:50]   "method": "POST",
[25.09.2019 09:24:50]   "uri": "/runtime/webhooks/durabletask/orchestrators/D1_Orchestrator"
[25.09.2019 09:24:50] }
[25.09.2019 09:24:50] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' scheduled. Reason: NewInstance. IsReplay: False. State: Scheduled. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 2.
[25.09.2019 09:24:51] Executed HTTP request: {
[25.09.2019 09:24:51]   "requestId": "0cb21775-5642-4b76-9d13-b0be8987eef1",
[25.09.2019 09:24:51]   "method": "POST",
[25.09.2019 09:24:51]   "uri": "/runtime/webhooks/durabletask/orchestrators/D1_Orchestrator",
[25.09.2019 09:24:51]   "identities": [
[25.09.2019 09:24:51]     {
[25.09.2019 09:24:51]       "type": "WebJobsAuthLevel",
[25.09.2019 09:24:51] Executing 'Functions.D1_Orchestrator' (Reason='', Id=c110af66-0b8d-4e82-82d3-eec16084454b)
[25.09.2019 09:24:51]       "level": "Admin"
[25.09.2019 09:24:51]     }
[25.09.2019 09:24:51]   ],
[25.09.2019 09:24:51]   "status": 202,
[25.09.2019 09:24:51]   "duration": 979
[25.09.2019 09:24:51] }
[25.09.2019 09:24:51] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' started. IsReplay: False. Input: (16 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 3.
[25.09.2019 09:24:51] Executed 'Functions.D1_Http' (Succeeded, Id=57732b0f-63eb-4e81-896c-3ecfb35bbaa3)
[25.09.2019 09:24:51] Executed HTTP request: {
[25.09.2019 09:24:51]   "requestId": "2a7df2b6-e770-4da3-92da-a27d77199872",
[25.09.2019 09:24:51]   "method": "POST",
[25.09.2019 09:24:51]   "uri": "/api/start",
[25.09.2019 09:24:51]   "identities": [
[25.09.2019 09:24:51]     {
[25.09.2019 09:24:51]       "type": "WebJobsAuthLevel",
[25.09.2019 09:24:51]       "level": "Admin"
[25.09.2019 09:24:51]     }
[25.09.2019 09:24:51]   ],
[25.09.2019 09:24:51]   "status": 202,
[25.09.2019 09:24:51]   "duration": 1859
[25.09.2019 09:24:51] }
[25.09.2019 09:24:51] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' scheduled. Reason: D1_Orchestrator. IsReplay: False. State: Scheduled. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 4.
[25.09.2019 09:24:51] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=c110af66-0b8d-4e82-82d3-eec16084454b)
[25.09.2019 09:24:51] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' started. IsReplay: False. Input: (24 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 5.
[25.09.2019 09:24:51] Executing 'Functions.D1_Activity' (Reason='', Id=5530f798-425e-4439-9c65-93c3f6338144)
[25.09.2019 09:24:51] Executed 'Functions.D1_Activity' (Succeeded, Id=5530f798-425e-4439-9c65-93c3f6338144)[25.09.2019 09:24:51] !!!!!!!!!!!! ACTIVITY CALLED

[25.09.2019 09:24:51] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' completed. ContinuedAsNew: False. IsReplay: False. Output: (16 bytes). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 6.
[25.09.2019 09:24:52] Executing 'Functions.D1_Orchestrator' (Reason='', Id=b6e21a47-97e5-4abb-b585-85134ee5bd49)
[25.09.2019 09:24:52] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' is waiting for input. Reason: CreateTimer:2019-09-25T09:24:56.1420000Z. IsReplay: False. State: Listening. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 7.
[25.09.2019 09:24:52] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=b6e21a47-97e5-4abb-b585-85134ee5bd49)
[25.09.2019 09:24:53] Host lock lease acquired by instance ID '00000000000000000000000081112D91'.
[25.09.2019 09:24:55] Executing 'Functions.D1_Orchestrator' (Reason='', Id=5ab57e84-5560-4234-a66d-ee8f5c58d4bb)
[25.09.2019 09:24:55] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' was resumed by a timer scheduled for '2019-09-25T09:24:56.1420000Z'. IsReplay: False. State: TimerExpired. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 8.
[25.09.2019 09:24:55] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' completed. ContinuedAsNew: True. IsReplay: False. Output: (null). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 9.
[25.09.2019 09:24:55] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=5ab57e84-5560-4234-a66d-ee8f5c58d4bb)
[25.09.2019 09:24:56] Executing 'Functions.D1_Orchestrator' (Reason='', Id=b97cf33c-6505-4cb3-be83-0bf3023f02fa)
[25.09.2019 09:24:56] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' started. IsReplay: False. Input: (16 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 10.
[25.09.2019 09:24:56] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' scheduled. Reason: D1_Orchestrator. IsReplay: False. State: Scheduled. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 11.
[25.09.2019 09:24:56] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=b97cf33c-6505-4cb3-be83-0bf3023f02fa)
[25.09.2019 09:24:56] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' started. IsReplay: False. Input: (24 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 12.
[25.09.2019 09:24:56] Executing 'Functions.D1_Activity' (Reason='', Id=dfada5d4-8cbf-4faf-a524-1c64d72e6279)
[25.09.2019 09:24:56] !!!!!!!!!!!! ACTIVITY CALLED
[25.09.2019 09:24:56] Executed 'Functions.D1_Activity' (Succeeded, Id=dfada5d4-8cbf-4faf-a524-1c64d72e6279)
[25.09.2019 09:24:56] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' completed. ContinuedAsNew: False. IsReplay: False. Output: (16 bytes). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 13.
[25.09.2019 09:24:56] Executing 'Functions.D1_Orchestrator' (Reason='', Id=d3245de8-2b5a-42cb-a3e8-d1b6aa6d40a3)
[25.09.2019 09:24:56] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' is waiting for input. Reason: CreateTimer:2019-09-25T09:25:00.4660000Z. IsReplay: False. State: Listening. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 14.
[25.09.2019 09:24:56] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=d3245de8-2b5a-42cb-a3e8-d1b6aa6d40a3)
[25.09.2019 09:25:00] Executing 'Functions.D1_Orchestrator' (Reason='', Id=3325e74d-7eeb-4484-920f-4b2764e02152)
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' was resumed by a timer scheduled for '2019-09-25T09:25:00.4660000Z'. IsReplay: False. State: TimerExpired. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 15.
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' completed. ContinuedAsNew: True. IsReplay: False. Output: (null). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 16.
[25.09.2019 09:25:00] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=3325e74d-7eeb-4484-920f-4b2764e02152)
[25.09.2019 09:25:00] Executing 'Functions.D1_Orchestrator' (Reason='', Id=afc4df5f-1c07-4ac0-8b67-ab43ade102c0)
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' started. IsReplay: False. Input: (16 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 17.
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' scheduled. Reason: D1_Orchestrator. IsReplay: False. State: Scheduled. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 18.
[25.09.2019 09:25:00] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=afc4df5f-1c07-4ac0-8b67-ab43ade102c0)
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' started. IsReplay: False. Input: (24 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 19.
[25.09.2019 09:25:00] Executing 'Functions.D1_Activity' (Reason='', Id=0051d911-5b17-4608-8d4e-027afb52ecff)
[25.09.2019 09:25:00] !!!!!!!!!!!! ACTIVITY CALLED
[25.09.2019 09:25:00] Executed 'Functions.D1_Activity' (Succeeded, Id=0051d911-5b17-4608-8d4e-027afb52ecff)
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' completed. ContinuedAsNew: False. IsReplay: False. Output: (16 bytes). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 20.
[25.09.2019 09:25:00] Executing 'Functions.D1_Orchestrator' (Reason='', Id=0116e780-b13b-4051-8a0f-41284777c773)
[25.09.2019 09:25:00] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' is waiting for input. Reason: CreateTimer:2019-09-25T09:25:04.5630000Z. IsReplay: False. State: Listening. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 21.
[25.09.2019 09:25:00] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=0116e780-b13b-4051-8a0f-41284777c773)
[25.09.2019 09:25:04] Executing 'Functions.D1_Orchestrator' (Reason='', Id=10cdefe2-f281-4f73-900f-7869095168d5)
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' was resumed by a timer scheduled for '2019-09-25T09:25:04.5630000Z'. IsReplay: False. State: TimerExpired. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 22.
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' completed. ContinuedAsNew: True. IsReplay: False. Output: (null). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 23.
[25.09.2019 09:25:04] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=10cdefe2-f281-4f73-900f-7869095168d5)
[25.09.2019 09:25:04] Executing 'Functions.D1_Orchestrator' (Reason='', Id=a277f8cf-1b6c-4d73-810d-f2f33e8e15ee)
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' started. IsReplay: False. Input: (16 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 24.
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' scheduled. Reason: D1_Orchestrator. IsReplay: False. State: Scheduled. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 25.
[25.09.2019 09:25:04] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=a277f8cf-1b6c-4d73-810d-f2f33e8e15ee)
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' started. IsReplay: False. Input: (24 bytes). State: Started. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 26.
[25.09.2019 09:25:04] Executing 'Functions.D1_Activity' (Reason='', Id=294e227e-0bb6-407d-b1d2-a1ff93d101e0)
[25.09.2019 09:25:04] !!!!!!!!!!!! ACTIVITY CALLED
[25.09.2019 09:25:04] Executed 'Functions.D1_Activity' (Succeeded, Id=294e227e-0bb6-407d-b1d2-a1ff93d101e0)
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Activity (Activity)' completed. ContinuedAsNew: False. IsReplay: False. Output: (16 bytes). State: Completed. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 27.
[25.09.2019 09:25:04] Executing 'Functions.D1_Orchestrator' (Reason='', Id=9f7808e8-0644-4c7a-b938-b82beab3dac3)
[25.09.2019 09:25:04] f16eeb603b4c4bf6826fe8a0a32bf784: Function 'D1_Orchestrator (Orchestrator)' is waiting for input. Reason: CreateTimer:2019-09-25T09:25:08.6580000Z. IsReplay: False. State: Listening. HubName: D1SampleHub. AppName: . SlotName: . ExtensionVersion: 1.7.1. SequenceNumber: 28.
[25.09.2019 09:25:04] Executed 'Functions.D1_Orchestrator' (Succeeded, Id=9f7808e8-0644-4c7a-b938-b82beab3dac3)
...
```
