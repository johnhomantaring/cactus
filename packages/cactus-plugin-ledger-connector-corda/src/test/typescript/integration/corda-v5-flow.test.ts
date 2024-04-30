import { v4 as uuidv4 } from "uuid";
import "jest-extended";
import {
  CordaV5TestLedger,
  Containers,
  pruneDockerAllIfGithubAction,
} from "@hyperledger/cactus-test-tooling";

import {
  IListenOptions,
  LogLevelDesc,
  Servers,
} from "@hyperledger/cactus-common";
import {
  PluginLedgerConnectorCorda,
  CordaVersion,
} from "../../../main/typescript/plugin-ledger-connector-corda";
import {
  DefaultApi,
  FlowStatusV1Response,
  GetFlowV1Request,
} from "../../../main/typescript/generated/openapi/typescript-axios/index";

const logLevel: LogLevelDesc = "TRACE";

import http from "http";
import { extractShortHash } from "./../../../../../cactus-test-tooling/src/main/typescript/corda/corda-v5-test-ledger";
import express from "express";
import bodyParser from "body-parser";
import { AddressInfo } from "net";
import { Configuration } from "@hyperledger/cactus-core-api";

describe("Corda Test Case", () => {
  const cordaV5TestLedger = new CordaV5TestLedger();
  let apiClient: DefaultApi;
  const expressApp = express();
  const server = http.createServer(expressApp);
  let plugin: PluginLedgerConnectorCorda;

  beforeAll(async () => {
    const pruning = pruneDockerAllIfGithubAction({ logLevel });
    await expect(pruning).resolves.toBeTruthy();
    expressApp.use(bodyParser.json({ limit: "250mb" }));
    const sshConfig = await cordaV5TestLedger.getSshConfig();

    plugin = new PluginLedgerConnectorCorda({
      instanceId: uuidv4(),
      sshConfigAdminShell: sshConfig,
      corDappsDir: "",
      logLevel,
      cordaVersion: CordaVersion.CORDA_V5,
      apiUrl: "https://127.0.0.1:8888",
    });
    const listenOptions: IListenOptions = {
      hostname: "127.0.0.1",
      port: 0,
      server,
    };
    const addressInfo = (await Servers.listen(listenOptions)) as AddressInfo;
    const { address, port } = addressInfo;
    const apiHost = `http://${address}:${port}`;
    const config = new Configuration({ basePath: apiHost });
    await plugin.registerWebServices(expressApp);
    apiClient = new DefaultApi(config);
    await cordaV5TestLedger.start();
    expect(cordaV5TestLedger).toBeTruthy();
  });
  afterAll(async () => {
    await cordaV5TestLedger.stop();
    await cordaV5TestLedger.destroy();
    await Servers.shutdown(server);
  });
  let shortHashID: string;
  it("Get container", async () => {
    const container = cordaV5TestLedger.getContainer();
    const cmd = ["./gradlew", "listVNodes"];
    const timeout = 180000; // 3 minutes
    const cwd = "/CSDE-cordapp-template-kotlin";
    shortHashID = await Containers.exec(container, cmd, timeout, logLevel, cwd);
  });

  describe("Endpoint Testing", () => {
    let shortHashAlice = "";
    let shortHashBob = "";
    let shortHashCharlie = "";
    let shortHashDave = "";
    it("Extract short hash for Alice", () => {
      shortHashAlice = extractShortHash(shortHashID, "Alice");
      expect(shortHashAlice).toBeTruthy();
      expect(`Short hash ID for Alice: ${shortHashAlice}`).toMatch(
        /Short hash ID for Alice:/,
      );
      console.log(`Short hash ID for Alice: ${shortHashAlice}`);
    });
    it("Extract short hash for Bob", () => {
      shortHashBob = extractShortHash(shortHashID, "Bob");
      expect(shortHashBob).toBeTruthy();
      expect(`Short hash ID for Bob: ${shortHashBob}`).toMatch(
        /Short hash ID for Bob:/,
      );
      console.log(`Short hash ID for Bob: ${shortHashBob}`);
    });
    it("Extract short hash for Charlie", () => {
      shortHashCharlie = extractShortHash(shortHashID, "Charlie");
      expect(typeof shortHashCharlie === "string").toBe(true);
      expect(shortHashCharlie).toBeTruthy();
      expect(`Short hash ID for Charlie: ${shortHashCharlie}`).toMatch(
        /Short hash ID for Charlie:/,
      );
      console.log(`Short hash ID for Charlie: ${shortHashCharlie}`);
    });
    it("Extract short hash for Dave", () => {
      shortHashDave = extractShortHash(shortHashID, "Dave");
      expect(shortHashDave).toBeTruthy();
      expect(`Short hash ID for Dave: ${shortHashDave}`).toMatch(
        /Short hash ID for Dave:/,
      );
      console.log(`Short hash ID for Dave: ${shortHashDave}`);
    });

    it("CPI test", async () => {
      const listCPI = await apiClient.listCPIV1();
      expect(listCPI).toBeTruthy();
    });
    test("Simulate conversation between Alice and Bob", async () => {
      //1. Alice creates a new chat
      const aliceCreateChat = {
        holdingIDShortHash: shortHashAlice,
        clientRequestId: "create-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
        requestBody: {
          chatName: "Chat with Bob",
          otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
          message: "Hello Bob",
        },
      };
      let startflowChat = await apiClient.startFlowV1(aliceCreateChat);
      expect(startflowChat).toBeTruthy();
      const aliceCreateResponse = await pollEndpointUntilCompleted(
        shortHashAlice,
        "create-1",
      );
      expect(aliceCreateResponse).toBeTruthy();

      //2. Bob lists his chats
      const bobListChats = {
        holdingIDShortHash: shortHashBob,
        clientRequestId: "list-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
        requestBody: {},
      };
      startflowChat = await apiClient.startFlowV1(bobListChats);
      expect(startflowChat).toBeTruthy();
      const flowData = await pollEndpointUntilCompleted(shortHashBob, "list-1");
      expect(flowData).toBeTruthy();
      const flowResult =
        flowData !== null && flowData !== undefined
          ? flowData.flowResult
          : null;
      const chatWithBobId = (() => {
        if (typeof flowResult === "string") {
          const parseFlowResult = JSON.parse(flowResult);
          const chatWithBobObj = parseFlowResult.find(
            (item: { chatName: string }) => item.chatName === "Chat with Bob",
          );
          return chatWithBobObj && "id" in chatWithBobObj
            ? chatWithBobObj.id
            : undefined;
        }
      })();
      //3. Bob updates chat twice
      const bobUpdate1 = {
        holdingIDShortHash: shortHashBob,
        clientRequestId: "update-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        requestBody: {
          id: chatWithBobId,
          message: "Hi Alice",
        },
      };
      await apiClient.startFlowV1(bobUpdate1);
      const bobUpdate1Response = await pollEndpointUntilCompleted(
        shortHashBob,
        "update-1",
      );
      expect(bobUpdate1Response).toBeTruthy();

      const bobUpdate2 = {
        holdingIDShortHash: shortHashBob,
        clientRequestId: "update-2",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        requestBody: {
          id: chatWithBobId,
          message: "How are you today?",
        },
      };
      await apiClient.startFlowV1(bobUpdate2);

      const bobUpdate2Response = await pollEndpointUntilCompleted(
        shortHashBob,
        "update-2",
      );
      expect(bobUpdate2Response).toBeTruthy();

      //4. Alice lists chat
      const aliceListsChat = {
        holdingIDShortHash: shortHashAlice,
        clientRequestId: "list-2",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
        requestBody: {},
      };
      await apiClient.startFlowV1(aliceListsChat);
      const aliceList2Response = await pollEndpointUntilCompleted(
        shortHashAlice,
        "list-2",
      );
      expect(aliceList2Response).toBeTruthy();

      //5. Alice checks the history of the chat with Bob
      const aliceHistoryRequest = {
        holdingIDShortHash: shortHashAlice,
        clientRequestId: "get-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
        requestBody: {
          id: chatWithBobId,
          numberOfRecords: "4",
        },
      };
      await apiClient.startFlowV1(aliceHistoryRequest);

      const aliceHistoryResponse = await pollEndpointUntilCompleted(
        shortHashAlice,
        "get-1",
      );
      expect(aliceHistoryResponse).toBeTruthy();

      //6. Alice replies to Bob
      const aliceReply = {
        holdingIDShortHash: shortHashAlice,
        clientRequestId: "update-4",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        requestBody: {
          id: chatWithBobId,
          message: "I am very well thank you",
        },
      };

      await apiClient.startFlowV1(aliceReply);
      const aliceReplyResponse = await pollEndpointUntilCompleted(
        shortHashAlice,
        "update-4",
      );
      expect(aliceReplyResponse).toBeTruthy();

      //7. Bob gets the chat history
      const bobHistoryRequest = {
        holdingIDShortHash: shortHashBob,
        clientRequestId: "get-2",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
        requestBody: {
          id: chatWithBobId,
          numberOfRecords: "2",
        },
      };
      await apiClient.startFlowV1(bobHistoryRequest);

      const bobHistoryResponse = await pollEndpointUntilCompleted(
        shortHashBob,
        "get-2",
      );
      expect(bobHistoryResponse).toBeTruthy();

      //8. List Flows Endpoint Test
      const queryVar: GetFlowV1Request = {
        holdingIDShortHash: shortHashBob,
      };
      const response = await apiClient.listFlowV1(queryVar);
      expect(response).toBeTruthy();
    });

    describe("Negative Testing", () => {
      it("Negative Test, invalid flow class name", async () => {
        const invalidFlowName = "nonExistentFlow";
        const request = {
          holdingIDShortHash: shortHashBob,
          clientRequestId: "test-1",
          flowClassName: invalidFlowName,
          requestBody: {
            chatName: "Test-1",
            otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
            message: "Testing",
          },
        };
        try {
          await apiClient.startFlowV1(request);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  async function pollEndpointUntilCompleted(
    shortHash: string,
    clientRequestId: string,
    interval = 5000,
    maxAttempts = 10,
  ) {
    return new Promise<FlowStatusV1Response>(async (resolve, reject) => {
      let attempts = 0;

      async function poll() {
        attempts++;
        const queryVar: GetFlowV1Request = {
          holdingIDShortHash: shortHash,
          clientRequestId,
        };
        try {
          const response = await apiClient.getFlowV1(queryVar);
          if (response.status === 200) {
            if (response.data.flowStatus === "COMPLETED") {
              resolve(response.data);
            } else {
              setTimeout(poll, interval);
            }
          } else if (attempts < maxAttempts) {
            setTimeout(poll, interval);
          } else {
            reject(
              new Error(
                `Max attempts (${maxAttempts}) reached. Unable to get status 200.`,
              ),
            );
          }
        } catch (error) {
          setTimeout(poll, interval);
        }
      }
      poll();
    });
  }
});
