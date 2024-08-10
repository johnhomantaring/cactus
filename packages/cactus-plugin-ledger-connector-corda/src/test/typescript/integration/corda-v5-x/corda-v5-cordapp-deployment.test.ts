import "jest-extended";
import { CordaV5TestLedger } from "@hyperledger/cactus-test-tooling";
import fetch from "node-fetch";
import FormData from "form-data";
import https from "https";

describe("Corda Test Case", () => {
  const cordaV5TestLedger = new CordaV5TestLedger({
    imageName: "cactuts/cordappdeployment",
    imageVersion: "latest",
  });
  beforeAll(async () => {
    await cordaV5TestLedger.start();
    expect(cordaV5TestLedger).toBeTruthy();
  });
  afterAll(async () => {
    await cordaV5TestLedger.stop();
    await cordaV5TestLedger.destroy();
  });
  describe("Upload Certificates and CPI ", () => {
    const username = "admin";
    const password = "admin";
    const auth =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    let cpiHash = "";
    let sampleHoldingId = "";
    const agent = new https.Agent({ rejectUnauthorized: false });
    test("Get and upload digicert-ca", async () => {
      const cpiFilePath = "/CSDE-cordapp-template-kotlin/config/r3-ca-key.pem";
      const r3KeyBuffer =
        await cordaV5TestLedger.getFileFromContainer(cpiFilePath);
      const form = new FormData();
      form.append("alias", "digicert-ca");
      form.append("certificate", r3KeyBuffer, "r3-ca-key.pem");
      const response = await fetch(
        "https://localhost:8888/api/v1/certificates/cluster/code-signer",
        {
          method: "PUT",
          body: form,
          headers: {
            accept: "*/*",
            Authorization: auth,
            ...form.getHeaders(),
          },
          agent: agent,
        },
      );
      expect(response.status).toBe(204);
    });
    test("Get and upload default key", async () => {
      const defaultKeyFilePath =
        "/CSDE-cordapp-template-kotlin/config/gradle-plugin-default-key.pem";
      const defaultKeyBuffer =
        await cordaV5TestLedger.getFileFromContainer(defaultKeyFilePath);
      const form = new FormData();
      form.append("alias", "gradle-plugin-default-key");
      form.append(
        "certificate",
        defaultKeyBuffer,
        "gradle-plugin-default-key.pem",
      );
      const response = await fetch(
        "https://localhost:8888/api/v1/certificates/cluster/code-signer",
        {
          method: "PUT",
          body: form,
          headers: {
            accept: "*/*",
            Authorization: auth,
            ...form.getHeaders(),
          },
          agent: agent,
        },
      );
      expect(response.status).toBe(204);
    });
    test("Get and upload signing key", async () => {
      const signingKeyFilePath =
        "/CSDE-cordapp-template-kotlin/workspace/signingkey1.pem";
      const signingKeyBuffer =
        await cordaV5TestLedger.getFileFromContainer(signingKeyFilePath);
      const form = new FormData();
      form.append("alias", "my-signing-key");
      form.append("certificate", signingKeyBuffer, "signingkey1.pem");
      const response = await fetch(
        "https://localhost:8888/api/v1/certificates/cluster/code-signer",
        {
          method: "PUT",
          body: form,
          headers: {
            accept: "*/*",
            Authorization: auth,
            ...form.getHeaders(),
          },
          agent: agent,
        },
      );
      expect(response.status).toBe(204);
    });
    test("Query Certificates", async () => {
      const response = await fetch(
        "https://localhost:8888/api/v1/certificates/cluster/code-signer",
        {
          method: "GET",
          headers: {
            Authorization: auth,
          },
          agent: agent,
        },
      );
      expect(response.status).toBe(200);
    });
    test("Get and upload CPI", async () => {
      const cpiFilePath =
        "/CSDE-cordapp-template-kotlin/workflows/build/MyCorDapp-1.0-SNAPSHOT.cpi";
      const cpiBuffer =
        await cordaV5TestLedger.getFileFromContainer(cpiFilePath);
      const form = new FormData();
      form.append("upload", cpiBuffer, "MyCorDapp-1.0-SNAPSHOT.cpi");
      let response = await fetch("https://localhost:8888/api/v1/cpi", {
        method: "POST",
        body: form,
        headers: {
          accept: "*/*",
          Authorization: auth,
          ...form.getHeaders(),
        },
        agent: agent,
      });
      let responseBody = await response.json();
      expect(response.status).toBe(200);
      const requestId = responseBody.id;

      // Wait time to make sure upload is done
      await new Promise((resolve) => setTimeout(resolve, 5000));

      response = await fetch(
        `https://localhost:8888/api/v1/cpi/status/${requestId}`,
        {
          method: "GET",
          headers: {
            Authorization: auth,
          },
          agent: agent,
        },
      );
      responseBody = await response.json();
      cpiHash = responseBody.cpiFileChecksum;
    });
    test("Create Virtual Nodes", async () => {
      const X500 = "CN=IRunCorDapps, OU=Application, O=R3, L=London, C=GB";
      let response = await fetch(`https://localhost:8888/api/v1/virtualnode`, {
        method: "POST",
        body: JSON.stringify({
          cpiFileChecksum: cpiHash,
          x500Name: X500,
        }),
        headers: {
          Authorization: auth,
        },
        agent: agent,
      });
      let responseBody = await response.json();
      sampleHoldingId = responseBody.requestId;

      // Wait time to make sure Node creation is done
      await new Promise((resolve) => setTimeout(resolve, 5000));

      response = await fetch(
        `https://localhost:8888/api/v1/virtualnode/status/${sampleHoldingId}`,
        {
          method: "GET",
          headers: {
            Authorization: auth,
          },
          agent: agent,
        },
      );
      responseBody = await response.json();
      expect(responseBody.status).toBe("SUCCEEDED");
    });
    test("Start Sample Flow", async () => {
      const createSampleFlow = {
        clientRequestId: "create-1",
        flowClassName:
          "com.r3.developers.csdetemplate.utxoexample.workflows.CreateNewChatFlow",
        requestBody: {
          chatName: "Chat with Bob",
          otherMember: "CN=Bob, OU=Test Dept, O=R3, L=London, C=GB",
          message: "Hello Bob",
        },
      };
      const cordaReqBuff = Buffer.from(JSON.stringify(createSampleFlow));
      const response = await fetch(
        `https://localhost:8888/api/v1/flow/${sampleHoldingId}`,
        {
          method: `POST`,
          headers: {
            Authorization: auth,
          },
          body: cordaReqBuff,
          agent,
        },
      );
      const responseBody = await response.json();
      expect(responseBody.flowStatus).toBe("START_REQUESTED");
    });
  });
});
