import test, { Test } from "tape-promise/tape";
import { v4 as uuidv4 } from "uuid";
import { AddressInfo } from "net";
import "jest-extended";
//import { Server as SecureServer } from "https";
//import { AxiosRequestConfig } from "axios";

import {
  CordaV5TestLedger,
  Containers,
  pruneDockerAllIfGithubAction,
} from "@hyperledger/cactus-test-tooling";

import {
  LogLevelDesc,
  Servers,
  Logger,
  LoggerProvider,
  IListenOptions,
} from "@hyperledger/cactus-common";
import {
  IPluginLedgerConnectorCordaOptions,
  PluginLedgerConnectorCorda,
  CordaVersion,
} from "../../../main/typescript/plugin-ledger-connector-corda";
import {
  DefaultApi as CordaApi,
  Configuration,
  CPIIDV5,
  CPIV5Response,
  DefaultApi,
  FlowStatusV5Response,
} from "../../../main/typescript/generated/openapi/typescript-axios/index";
import axios, { AxiosRequestConfig } from "axios";
//import { Configuration } from "@hyperledger/cactus-core-api";

const testCase = "Tests are passing on the JVM side";
const logLevel: LogLevelDesc = "TRACE";

/* Working POST
import express from "express";
import bodyParser from "body-parser";
import http from "http";
*/
import https from "https";

test.onFailure(async () => {
  await Containers.logDiagnostics({ logLevel });
});

test("BEFORE " + testCase, async (t: Test) => {
  const pruning = pruneDockerAllIfGithubAction({ logLevel });
  await t.doesNotReject(pruning, "Pruning didn't throw OK");
  t.end();
});

test("can get past logs of an account", async (t: Test) => {
  const logLevel: LogLevelDesc = "TRACE";
  const logger: Logger = LoggerProvider.getOrCreate({
    label: "test-check-connection-to-ethereum-ledger",
    level: logLevel,
  });

  const cordaV5TestLedger = new CordaV5TestLedger();
  await cordaV5TestLedger.start();
  t.ok(cordaV5TestLedger, "cordaV5TestLedger started OK");

  test.onFinish(async () => {
    await cordaV5TestLedger.stop();
    await cordaV5TestLedger.destroy();
  });
  const sshConfig = await cordaV5TestLedger.getSshConfig();
  const connector: PluginLedgerConnectorCorda = new PluginLedgerConnectorCorda({
    instanceId: uuidv4(),
    sshConfigAdminShell: sshConfig,
    corDappsDir: "",
    logLevel,
    cordaVersion: CordaVersion.CORDA_V5,
    apiUrl: "https://127.0.0.1:8888",
  });
  const apiUrl = "https://127.0.0.1:8888";

  //const expressApp = express();
  //expressApp.use(bodyParser.json({ limit: "250mb" }));
  //const server = http.createServer(expressApp);
  //test.onFinish(async () => await Servers.shutdown(server));

  /*
  const idHash = "0A63C81EDC93";
  const param: StartFlowRequest = {
    parameters: {
      clientRequestId: "create-1",
      flowClassName:
        "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
      requestBody: {
        chatName: "Chat with Bob",
        otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
        message: "Hello Bob",
      },
    },
  };*/

  await connector.getOrCreateWebServices();
  //await connector.registerWebServices(expressApp);
  /*const listenOptions: IListenOptions = {
    hostname: "localhost",
    port: 8888,
    server,
  };
 */
  const customHttpsAgent = new https.Agent({
    // Configure your custom settings here
    rejectUnauthorized: false, // Example: Allow self-signed certificates (use with caution)
  });

  const username = "admin";
  const password = "admin";
  const axiosConfig: AxiosRequestConfig = {
    baseURL: apiUrl,
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
        "base64",
      )}`,
    },
    httpsAgent: customHttpsAgent,
  };

  //const apiConfig = new Configuration({ basePath: apiUrl });
  //const apiClient = new CordaApi(apiConfig);
  const axiosInstance = axios.create(axiosConfig);
  const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);

  const container = cordaV5TestLedger.getContainer();
  const cmd = ["./gradlew", "listVNodes"];
  const timeout = 180000; // 3 minutes
  const cwd = "/CSDE-cordapp-template-kotlin";
  const shortHashID = await Containers.exec(
    container,
    cmd,
    timeout,
    logLevel,
    cwd,
  );

  function extractShortHash(name: string) {
    const regex = new RegExp(`MyCorDapp\\s*([A-Z0-9]*)\\s*CN=${name}`);
    const match = shortHashID.match(regex);
    if (match) {
      return match[1];
    } else {
      return "err";
    }
  }

  const shortHashBob = extractShortHash("Bob");
  t.ok(shortHashBob, `Short hash ID for Bob: ${shortHashBob}`);

  const shortHashDave = extractShortHash("Dave");
  t.ok(shortHashDave, `Short hash ID for Dave: ${shortHashDave}`);

  const shortHashCharlie = extractShortHash("Charlie");
  t.ok(shortHashCharlie, `Short hash ID for Charlie: ${shortHashCharlie}`);

  const shortHashAlice = extractShortHash("Alice");
  t.ok(shortHashAlice, `Short hash ID for Alice: ${shortHashAlice}`);

  const request = {
    clientRequestId: "test-1",
    flowClassName:
      "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
    requestBody: {
      chatName: "Chat with Bob",
      otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
      message: "Hello Bob",
    },
  };

  const listCPI = await apiClient.getCPIResponse();
  t.ok(listCPI, "getCPIResponse truthy OK");

  const startflow = await apiClient.startFlowParameters(
    shortHashCharlie,
    request,
  );

  t.ok(startflow.status, "startFlowParameters endpoint OK");

  //Need to check further, might need to add a delay here. Getting 404 status code
  // t.timeoutAfter(60000);

  await waitForStatusChange(shortHashCharlie, "test-1");

  // const checkflow = await apiClient.flowStatusResponse(shortHashCharlie, "test-1");
  // t.ok(checkflow.status, "flowStatusResponse endpoint OK");
  // const flowData = await waitForStatusChange(shortHashCharlie, "test-1");

  // WIP Simulate conversation between Bob and Alice
  // Follow the flow as per https://docs.r3.com/en/platform/corda/5.0/developing-applications/getting-started/utxo-ledger-example-cordapp/running-the-chat-cordapp.html
  test("Simulate a conversation between Alice and Bob", async (t) => {
    //Add code here
    //1. Alice creates a new chat
    const aliceCreateChat = {
      clientRequestId: "create-1",
      flowClassName:
        "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
      requestBody: {
        chatName: "Chat with Bob",
        otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
        message: "Hello Bob",
      },
    };
    let startflowChat = await apiClient.startFlowParameters(
      shortHashAlice,
      aliceCreateChat,
    );
    t.ok(startflowChat.status, "startflowChat OK");
    const checkflow = await apiClient.flowStatusResponse(
      shortHashAlice,
      "create-1",
    );
    t.ok(checkflow.status, "flowStatusResponse OK");

    await waitForStatusChange(shortHashAlice, "create-1");
    //2. Bob lists his chats
    const bobListChats = {
      clientRequestId: "list-1",
      flowClassName:
        "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
      requestBody: {},
    };
    startflowChat = await apiClient.startFlowParameters(
      shortHashBob,
      bobListChats,
    );
    const flowData = await waitForStatusChange(shortHashBob, "list-1");
    console.log(flowData);
    t.end();
  });

  // Reusable function to wait for the status to change to COMPLETED
  async function waitForStatusChange(shortHash: string, flowName: string) {
    try {
      let checkFlowObject = await apiClient.flowStatusResponse(
        shortHash,
        flowName,
      );

      if (checkFlowObject.data.flowStatus === "COMPLETED") {
        t.ok(checkFlowObject.status, "flowStatusResponse endpoint OK");
        t.equal(
          checkFlowObject.data.flowStatus,
          "COMPLETED",
          "flowStatus is COMPLETED",
        );
        t.equal(
          checkFlowObject.data.flowError,
          null,
          "flowError should be null",
        );
      } else {
        console.log("Waiting for status change");
        await new Promise((resolve) => setTimeout(resolve, 20000));
        checkFlowObject = await apiClient.flowStatusResponse(
          shortHash,
          flowName,
        );
        await waitForStatusChange(shortHash, flowName);
      }
    } catch (error) {
      console.error(
        "An error occurred while waiting for status change:",
        error,
      );
    }
  }
  // TO FIX: Address and port checking is still having an issue because of
  // "--network host" parameters set during container creation
  //const addressInfo = (await Servers.listen(listenOptions)) as AddressInfo;
  //const { address, port } = addressInfo;

  // Working POST
  //const apiHost = `https://127.0.0.1:8888`;
  //const apiConfig = new Configuration({ basePath: apiHost });
  //const apiClient = new CordaApi(apiConfig);
  //const flowsRes1 = await apiClient.listFlowsV1();
  //t.ok(flowsRes1, "listFlowsV1() out truthy OK");

  //Testing using a created axios instance in plugin-ledger-connector-corda
  //TEST
  /*const request = {
    clientRequestId: "r1",
    flowClassName:
      "com.r3.developers.csdetemplate.flowexample.workflows.MyFirstFlow",
    requestBody: {
      otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
    },
  };*/

  /*
  requestBody: {
    chatName: "YourChatName",
    otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
    message: "YourMessage",
  */
  //const response = await connector.startFlow(shortHashCharlie, request);
  //t.ok(response.status, "ok!");

  // t.end();
});
