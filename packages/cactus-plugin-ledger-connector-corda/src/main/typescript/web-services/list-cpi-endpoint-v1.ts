import { Express, Request, Response } from "express";
import {
  IWebServiceEndpoint,
  IExpressRequestHandler,
  IEndpointAuthzOptions,
} from "@hyperledger/cactus-core-api";

import {
  registerWebServiceEndpoint,
  handleRestEndpointException,
} from "@hyperledger/cactus-core";

import {
  Checks,
  IAsyncProvider,
  Logger,
  LoggerProvider,
  LogLevelDesc,
} from "@hyperledger/cactus-common";
import { InternalServerError } from "http-errors-enhanced-cjs";
import OAS from "../../json/openapi.json";
import { PluginLedgerConnectorCorda } from "../plugin-ledger-connector-corda";
export interface IListCPIEndpointV1Options {
  logLevel?: LogLevelDesc;
  apiUrl: string;
  connector: PluginLedgerConnectorCorda;
}

export class ListCPIEndpointV1 implements IWebServiceEndpoint {
  public static readonly CLASS_NAME = "ListCPIEndpointV1";

  private readonly log: Logger;
  private readonly apiUrl: string;

  public get className(): string {
    return ListCPIEndpointV1.CLASS_NAME;
  }

  constructor(public readonly options: IListCPIEndpointV1Options) {
    const fnTag = `${this.className}#constructor()`;

    Checks.truthy(options, `${fnTag} options`);
    Checks.truthy(options.connector, `${fnTag} options.connector`);
    Checks.nonBlankString(options.apiUrl, `${fnTag} options.apiUrl`);

    this.log = LoggerProvider.getOrCreate({
      label: "list-cpi-endpoint-v1",
      level: options.logLevel || "INFO",
    });

    try {
      new URL(options.apiUrl);
    } catch (err) {
      throw new Error(`${fnTag} Invalid URL: ${options.apiUrl}`);
    }
    this.apiUrl = options.apiUrl;
  }

  getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions> {
    return {
      get: async () => ({
        isProtected: true,
        requiredRoles: [],
      }),
    };
  }

  public get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/list-cpi"] {
    return OAS.paths[
      "/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-corda/list-cpi"
    ];
  }

  /**
   * Returns the endpoint path to be used when installing the endpoint into the
   * API server of Cactus.
   */
  public getPath(): string {
    return this.oasPath.get["x-hyperledger-cactus"].https.path;
  }

  public getVerbLowerCase(): string {
    return this.oasPath.get["x-hyperledger-cactus"].https.verbLowerCase;
  }

  public getOperationId(): string {
    return this.oasPath.get.operationId;
  }

  public getExpressRequestHandler(): IExpressRequestHandler {
    return this.handleRequest.bind(this);
  }

  public async registerExpress(
    expressApp: Express,
  ): Promise<IWebServiceEndpoint> {
    await registerWebServiceEndpoint(expressApp, this);
    return this;
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const fnTag = "listCPIV1#handleRequest()";
    const verbUpper = this.getVerbLowerCase().toUpperCase();
    this.log.debug(`${verbUpper} ${this.getPath()}`);

    try {
      if (this.apiUrl === undefined)
        throw new InternalServerError("apiUrl option is necessary");
      const body = await this.options.connector.listCPI(req.body);
      res.status(200);
      res.json(body);
    } catch (ex) {
      const errorMsg = `${fnTag} Failed to perform request:`;
      handleRestEndpointException({ errorMsg, log: this.log, error: ex, res });
    }
  }
}