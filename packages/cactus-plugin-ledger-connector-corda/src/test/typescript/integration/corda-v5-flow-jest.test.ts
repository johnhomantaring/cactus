// import test, { Test } from "tape-promise/tape";
import { v4 as uuidv4 } from "uuid";
import "jest-extended";
import { Config as SshConfig } from "node-ssh";
import {
  CordaV5TestLedger,
  Containers,
  pruneDockerAllIfGithubAction,
} from "@hyperledger/cactus-test-tooling";

import { LogLevelDesc } from "@hyperledger/cactus-common";
import {
  PluginLedgerConnectorCorda,
  CordaVersion,
} from "../../../main/typescript/plugin-ledger-connector-corda";
import { DefaultApi, FlowStatusV5Response } from "../../../main/typescript/generated/openapi/typescript-axios/index";
import axios, { AxiosRequestConfig } from "axios";

const testCase = "Tests are passing on the JVM side";
const logLevel: LogLevelDesc = "TRACE";

import https from "https";
import exp from "constants";
import { check } from "yargs";
import { response } from "express";
import { interval } from "rxjs";

describe("Corda Setup", () => {
  const cordaV5TestLedger = new CordaV5TestLedger();
  test("On Failure", async () => {
    const logDiagnosticsSpy = jest.spyOn(Containers, "logDiagnostics");
    console.log("checking failure");
  });
  beforeAll(async () => {
    const pruning = pruneDockerAllIfGithubAction({ logLevel });
    await pruning;
  });
  test("can get past logs of an account", async () => {
    await cordaV5TestLedger.start();
    expect(cordaV5TestLedger).toBeTruthy();
  });
  afterAll(async () => {
    await cordaV5TestLedger.stop();
    await cordaV5TestLedger.destroy();
  });
  let connector: PluginLedgerConnectorCorda;
  it("Get sshConfig", async () => {
    const sshConfig = await cordaV5TestLedger.getSshConfig();
    connector = new PluginLedgerConnectorCorda({
      instanceId: uuidv4(),
      sshConfigAdminShell: sshConfig,
      corDappsDir: "",
      logLevel,
      cordaVersion: CordaVersion.CORDA_V5,
      apiUrl: "https://127.0.0.1:8888",
    });
  });
  const apiUrl = "https://127.0.0.1:8888";
  it("Get or Create Web Services", async () => {
    await connector.getOrCreateWebServices();
  });
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
  const axiosInstance = axios.create(axiosConfig);
  const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
  let shortHashID: string;
  it("Get container", async () => {
    const container = cordaV5TestLedger.getContainer();
    const cmd = ["./gradlew", "listVNodes"];
    const timeout = 180000; // 3 minutes
    const cwd = "/CSDE-cordapp-template-kotlin";
    shortHashID = await Containers.exec(container, cmd, timeout, logLevel, cwd);
  });

  function extractShortHash(name: string) {
    const regex = new RegExp(`MyCorDapp\\s*([A-Z0-9]*)\\s*CN=${name}`);
    const match = shortHashID.match(regex);
    if (match) {
      return match[1];
    } else {
      return "err";
    }
  }
  describe("Endpoint Testing", () => {
    let shortHashAlice = "";
    let shortHashBob = "";
    let shortHashCharlie = "";
    let shortHashDave = "";
    it("Extract short hash for Alice", () => {
      shortHashAlice = extractShortHash("Alice");
      expect(shortHashAlice).toBeTruthy();
      expect(`Short hash ID for Alice: ${shortHashAlice}`).toMatch(
        /Short hash ID for Alice:/,
      );
      console.log(`Short hash ID for Alice: ${shortHashAlice}`);
    });
    it("Extract short hash for Bob", () => {
      shortHashBob = extractShortHash("Bob");
      expect(shortHashBob).toBeTruthy();
      expect(`Short hash ID for Bob: ${shortHashBob}`).toMatch(
        /Short hash ID for Bob:/,
      );
      console.log(`Short hash ID for Bob: ${shortHashBob}`);
    });
    it("Extract short hash for Charlie", () => {
      shortHashCharlie = extractShortHash("Charlie");
      expect(typeof shortHashCharlie === "string").toBe(true);
      expect(shortHashCharlie).toBeTruthy();
      expect(`Short hash ID for Charlie: ${shortHashCharlie}`).toMatch(
        /Short hash ID for Charlie:/,
      );
      console.log(`Short hash ID for Charlie: ${shortHashCharlie}`);
    });
    it("Extract short hash for Dave", () => {
      shortHashDave = extractShortHash("Dave");
      expect(shortHashDave).toBeTruthy();
      expect(`Short hash ID for Dave: ${shortHashDave}`).toMatch(
        /Short hash ID for Dave:/,
      );
      console.log(`Short hash ID for Dave: ${shortHashDave}`);
    });

    it("Endpoints initial test", async () => {
      const request = {
        clientRequestId: "test-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
        requestBody: {
          chatName: "Test-1",
          otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
          message: "Testing",
        },
      };
      const listCPI = await apiClient.getCPIResponse();
      expect(listCPI).toBeTruthy();
      const startflow = await apiClient.startFlowParameters(
        shortHashCharlie,
        request,
      );
      expect(startflow).toBeTruthy();

      // await waitProcess(5);
      // await waitForStatusChange(shortHashCharlie, "test-1");
      const testResponse = await pollEndpointWithApiClient(
        shortHashCharlie,
        "test-1",
      );
      // const checkflow = await apiClient.flowStatusResponse(
      //   shortHashCharlie,
      //   "test-1",
      // );
      // expect(checkflow).toBeTruthy();
      // expect(checkflow.data.flowStatus).toBe("COMPLETED");
      // expect(checkflow.data.flowError).toBe(null);
    });
    it("Simulate conversation between Alice and Bob", async () => {
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
      expect(startflowChat).toBeTruthy();
      // // await waitProcess(5);
      let test1 = await pollEndpointWithApiClient(shortHashAlice, "create-1");
      // console.log("check stop");
      // const checkflow = await apiClient.flowStatusResponse(
      //   shortHashAlice,
      //   "create-1",
      // );
      expect(test1).toBeTruthy();
      // await waitForStatusChange(shortHashAlice, "create-1");
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
      expect(startflowChat).toBeTruthy();
      // await waitProcess(10);
      // const flowData = await waitForStatusChange(shortHashBob, "list-1");
      // uncomment si 206 later
      const flowData = await pollEndpointWithApiClient(shortHashBob, "list-1");
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
      // //3. Bob updates chat twice
      const bobUpdate1 = {
        clientRequestId: "update-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
        requestBody: {
          id: chatWithBobId,
          message: "Hi Alice",
        },
      };
      const bobUpdate1Response = await apiClient.startFlowParameters(
        shortHashBob,
        bobUpdate1,
      );
      // await waitProcess(5);
      await pollEndpointWithApiClient(shortHashBob, "update-1");
      // const bobUpdate2 = {
      //   clientRequestId: "update-2",
      //   flowClassName:
      //     "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
      //   requestBody: {
      //     id: chatWithBobId,
      //     message: "How are you today?",
      //   },
      // };
      // await apiClient.startFlowParameters(shortHashBob, bobUpdate2);
      // await waitProcess(5);
      // await waitForStatusChange(shortHashBob, "update-2");

      // //4. Alice lists chat
      // const aliceListsChat = {
      //   clientRequestId: "list-2",
      //   flowClassName:
      //     "com.r3.developers.csdetemplate.utxoexample.workflows.ListChatsFlow",
      //   requestBody: {},
      // };
      // await apiClient.startFlowParameters(shortHashAlice, aliceListsChat);
      // await waitProcess(5);
      // await waitForStatusChange(shortHashAlice, "list-2");

      // //5. Alice checks the history of the chat with Bob
      // const aliceHistoryRequest = {
      //   clientRequestId: "get-1",
      //   flowClassName:
      //     "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
      //   requestBody: {
      //     id: chatWithBobId,
      //     numberOfRecords: "4",
      //   },
      // };
      // await apiClient.startFlowParameters(shortHashAlice, aliceHistoryRequest);
      // await waitProcess(5);
      // await waitForStatusChange(shortHashAlice, "get-1");

      // //6. Alice replies to Bob
      // const aliceReply = {
      //   clientRequestId: "update-4",
      //   flowClassName:
      //     "com.r3.developers.csdetemplate.utxoexample.workflows.UpdateChatFlow",
      //   requestBody: {
      //     id: chatWithBobId,
      //     message: "I am very well thank you",
      //   },
      // };
      // await apiClient.startFlowParameters(shortHashAlice, aliceReply);
      // await waitProcess(5);
      // await waitForStatusChange(shortHashAlice, "update-4");

      // //7. Bob gets the chat history
      // const bobHistoryRequest = {
      //   clientRequestId: "get-2",
      //   flowClassName:
      //     "com.r3.developers.csdetemplate.utxoexample.workflows.GetChatFlow",
      //   requestBody: {
      //     id: chatWithBobId,
      //     numberOfRecords: "2",
      //   },
      // };
      // await apiClient.startFlowParameters(shortHashBob, bobHistoryRequest);
      // await waitProcess(5);
      // await waitForStatusChange(shortHashBob, "get-2");
    });
    // describe("Negative Testing", () => {
    //   it("Invalid username and password", async () => {
    //     const apiUrl = "https://127.0.0.1:8888";
    //     const username = "invalidUsername";
    //     const password = "invalidPassword";
    //     const axiosConfig: AxiosRequestConfig = {
    //       baseURL: apiUrl,
    //       headers: {
    //         Authorization: `Basic ${Buffer.from(
    //           `${username}:${password}`,
    //           "base64",
    //         )}`,
    //       },
    //     };
    //     const axiosInstance = axios.create(axiosConfig);
    //     const apiClient = new DefaultApi(undefined, apiUrl, axiosInstance);
    //     try {
    //       await apiClient.getCPIResponse();
    //       fail("Expected an error for unauthorized access but it succeeded.");
    //     } catch (error) {
    //       expect(error).toBeDefined();
    //       // expect("Failed as expected for unauthorized access.");
    //       expect(error.message).toContain("Invalid");
    //     }
    //   });
    //   it("Negative Test, invalid flow class name", async () => {
    //     const invalidFlowName = "nonExistentFlow";
    //     const shortHash = shortHashBob;
    //     const request = {
    //       clientRequestId: "test-1",
    //       flowClassName: invalidFlowName,
    //       requestBody: {
    //         chatName: "Test-1",
    //         otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
    //         message: "Testing",
    //       },
    //     };
    //     try {
    //       await apiClient.startFlowParameters(shortHash, request);
    //       fail("Expected an error for unauthorized access but it succeeded.");
    //     } catch (error) {
    //       expect(error).toBeDefined();
    //       expect(error.message).toContain("Request failed");
    //     }
    //   });
    // });
  });
  async function pollEndpointWithApiClient(
    shortHash: string,
    chatName: string,
    interval = 5000,
    maxAttempts = 10,
  ) {
    return new Promise<FlowStatusV5Response>(async (resolve, reject) => {
      let attempts = 0;

      async function poll() {
        attempts++;

        try {
          const response = await apiClient.flowStatusResponse(
            shortHash,
            chatName,
          );
          if (response.status === 200) {
            console.log("show response.status if statement " + response.status);
            if (response.data.flowStatus === "COMPLETED") {
              console.log("show status " + response.data.flowStatus);
              resolve(response.data);
            } else {
              console.log("show status " + response.data.flowStatus);
              setTimeout(poll, interval);
            }
          } else if (attempts < maxAttempts) {
            console.log(
              "show response.status else if statement " + response.status,
            );
            setTimeout(poll, interval);
          } else {
            console.log("show response.status else  " + response.status);
            reject(
              new Error(
                `Max attempts (${maxAttempts}) reached. Unable to get status 200.`,
              ),
            );
          }
        } catch (error) {
          console.log("catch error");
          setTimeout(poll, interval);
        }
      }

      // Start polling
      poll();
    });
  }
});
