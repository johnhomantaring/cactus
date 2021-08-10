/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package com.weaver.corda.sdk;

import arrow.core.Either
import arrow.core.Left
import arrow.core.Right
import io.grpc.ManagedChannelBuilder
import java.lang.Exception
import kotlinx.coroutines.*
import net.corda.core.messaging.startFlow
import java.util.*
import net.corda.core.messaging.CordaRPCOps

import com.weaver.corda.app.interop.flows.CreateExternalRequest
import com.weaver.corda.app.interop.flows.WriteExternalStateInitiator
import com.weaver.corda.app.interop.flows.GetExternalStateByLinearId
import com.weaver.protos.corda.ViewDataOuterClass
import com.weaver.protos.common.state.State
import com.weaver.protos.networks.networks.Networks

class InteroperableHelper {
    companion object {
        @JvmStatic
        fun interopFlow (
            proxy: CordaRPCOps,
            localRelayEndpoint: String,
            externalStateAddress: String
        ): Either<Error, String> {
            val localRelayHost = localRelayEndpoint.split(":").first()
            val localRelayPort = localRelayEndpoint.split(":").last().toInt()
            val client = RelayClient(
                ManagedChannelBuilder.forAddress(localRelayHost, localRelayPort)
                        .usePlaintext()
                        .executor(Dispatchers.Default.asExecutor())
                        .build()
            )
            var result: Either<Error, String> = Left(Error(""))
            runBlocking {
                val eitherErrorQuery = constructNetworkQuery(proxy, externalStateAddress)
                println("\nCorda network returned: $eitherErrorQuery \n")
                eitherErrorQuery.map { networkQuery ->
                    println("Network query: $networkQuery")
                    runBlocking {
                        val ack = async { client.requestState(networkQuery) }.await()
                        pollForState(ack.requestId, client).map {
                            result = writeExternalStateToVault(
                                proxy,  
                                it,
                                externalStateAddress)
                        }
                    }
                }
            }
            return result
        }
        
        @JvmStatic
        fun getExternalStateView(
            proxy: CordaRPCOps,
            externalStateLinearId: String
        ): ViewDataOuterClass.ViewData {
            val response = proxy.startFlow(::GetExternalStateByLinearId, externalStateLinearId)
                    .returnValue.get()
            return ViewDataOuterClass.ViewData.parseFrom(response)
        }
        
        
        @JvmStatic
        fun getExternalStatePayloadString(
            proxy: CordaRPCOps,
            externalStateLinearId: String
        ): String {
            val responseView = getExternalStateView(proxy, externalStateLinearId)
            return responseView.payload.toStringUtf8()
        }
        
        @JvmStatic
        fun getExternalStateSignatories(
            proxy: CordaRPCOps,
            externalStateLinearId: String
        ): List<String> {
            var i = 1
            val responseView = getExternalStateView(proxy, externalStateLinearId)
            var result: List<String> = listOf()
            for (notarization in responseView.notarizationsList) {
                val id = notarization.id
                result += id
                i += 1
            }
            return result
        }
        
        @JvmStatic
        fun getExternalStateSignature(
            proxy: CordaRPCOps,
            externalStateLinearId: String,
            signerId: String
        ): String {
            var i = 1
            val responseView = getExternalStateView(proxy, externalStateLinearId)
            for (notarization in responseView.notarizationsList) {
                val id = notarization.id
                if (id == signerId) {
                    return notarization.signature
                }
                i += 1
            }
            return ""
        }
        
        @JvmStatic
        fun getExternalStateSignatoryCertificate(
            proxy: CordaRPCOps,
            externalStateLinearId: String,
            signerId: String
        ): String {
            var i = 1
            val responseView = getExternalStateView(proxy, externalStateLinearId)
            for (notarization in responseView.notarizationsList) {
                val id = notarization.id
                if (id == signerId) {
                    return notarization.certificate
                }
                i += 1
            }
            return ""
        }
        
        /**
         * The constructNetworkQuery function passes the address provided by the user to the interoperation CorDapp
         * to get the external network's endorsement policy, and to provide a signature and certificate for the
         * external network to authenticate the request.
         *
         * @property address The address of the view provided by the user.
         * @property host The hostname of the Corda node.
         * @property port The port of the Corda node.
         * @property rpc The Corda node RPC connection.
         * @property proxy The proxy to the Corda node RPC connection.
         * @return Returns an Either with an error if the RPC connection failed or the interop flow failed, or a NetworkQuery.
         */
        suspend fun constructNetworkQuery(
            proxy: CordaRPCOps,
            address: String
        ): Either<Error, Networks.NetworkQuery> {
            println("Getting query information for foreign network from Corda network")
            try {
                val eitherErrorRequest = proxy.startFlow(::CreateExternalRequest, address)
                        .returnValue.get().map {
                            Networks.NetworkQuery.newBuilder()
                                    .addAllPolicy(it.policy)
                                    .setAddress(address)
                                    .setRequestingRelay("")
                                    .setRequestingNetwork("Corda_Network")
                                    .setCertificate(it.certificate)
                                    .setRequestorSignature(it.signature)
                                    .setRequestingOrg(it.requestingOrg)
                                    .setNonce(it.nonce)
                                    .build()
                        }
                return eitherErrorRequest
            } catch (e: Exception) {
                return Left(Error("Corda Network Error: ${e.message}"))
            }
        }
        
        /**
         * pollForState is used to poll the local relay for the requested state. This is a recursive function that continues
         * to poll if the returned state is "PENDING" or "PENDING_ACK" or returns the "COMPLETED" or "ERROR" state.
         *
         * @property requestId The requestId for the original request.
         * @property client The gRPC client for the relay.
         * @property requestState The state response from the relay.
         * Will have status "PENDING", "PENDING_ACK", "COMPLETED" or "ERROR".
         * @return Returns the request state when it has status "COMPLETED" or "ERROR".
         */
        suspend fun pollForState(requestId: String, client: RelayClient, retryCount: Int = 0): Either<Error, State.RequestState> = coroutineScope {
            val num = 10
            if (retryCount > num) {
                Left(Error("Error: Timeout, remote network took longer than $num seconds to respond"))
            } else {
                delay(1000L)
                val requestState = async { client.getState(requestId) }.await()
                println("Response from getState: $requestState")
                when (requestState.status.toString()) {
                    "COMPLETED" -> Right(requestState)
                    "PENDING" -> async { pollForState(requestId, client, retryCount + 1) }.await()
                    "PENDING_ACK" -> async { pollForState(requestId, client, retryCount + 1) }.await()
                    "ERROR" -> {
                        println("Error returned from the remote network: $requestState")
                        Left(Error("Error returned from remote network $requestState"))
                    }
                    else -> Left(Error("Unexpected status returned in RequestState"))
                }
            }
        }
        
        /**
         * writeExternalStateToVault is used to trigger the interoperation CorDapp to store the requested state in the ledger.
         *
         * @property requestState The state that is returned by the external network.
         * @property host The host of the Corda node to connect to.
         * @property port The port of the Corda node to connect to.
         * @property rpc The Corda node RPC connection.
         * @property stateId The linearId of the state stored in the Corda ledger.
         * @property proxy The proxy to the Corda node RPC connection.
         * @return Returns an Either with an error if the RPC connection failed or the Corda network returned an error, else
         * the unique identifier of the stored state.
         */
        fun writeExternalStateToVault(
            proxy: CordaRPCOps,
            requestState: State.RequestState,
            address: String
        ): Either<Error, String> {
            return try {
                println("Sending response to Corda for view verification.\n")
                val stateId = runCatching {
                    val viewBase64String = Base64.getEncoder().encodeToString(requestState.view.toByteArray())
                    proxy.startFlow(::WriteExternalStateInitiator, viewBase64String, address)
                            .returnValue.get()
                }.fold({
                    it.map { linearId ->
                        println("Verification was successful and external-state was stored with linearId $linearId.\n")
                        linearId.toString()
                    }
                }, {
                    Left(Error("Corda Network Error: Error running WriteExternalStateInitiator flow: ${it.message}\n"))
                })
                stateId
            } catch (e: Exception) {
                println("Error writing state to Corda network: ${e.message}\n")
                Left(Error("Error writing state to Corda network: ${e.message}"))
            }
        }
    }
}
