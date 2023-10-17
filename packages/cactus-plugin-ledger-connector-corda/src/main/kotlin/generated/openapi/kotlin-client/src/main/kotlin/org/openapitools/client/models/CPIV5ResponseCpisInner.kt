/**
 *
 * Please note:
 * This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * Do not edit this file manually.
 *
 */

@file:Suppress(
    "ArrayInDataClass",
    "EnumEntryName",
    "RemoveRedundantQualifierName",
    "UnusedImport"
)

package org.openapitools.client.models

import org.openapitools.client.models.CPIIDV5
import org.openapitools.client.models.CPIV5ResponseCpisInnerCpksInner

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * 
 *
 * @param cpiFileChecksum 
 * @param cpiFileFullChecksum 
 * @param cpks 
 * @param groupPolicy 
 * @param id 
 * @param timestamp 
 */


data class CPIV5ResponseCpisInner (

    @Json(name = "cpiFileChecksum")
    val cpiFileChecksum: kotlin.String? = null,

    @Json(name = "cpiFileFullChecksum")
    val cpiFileFullChecksum: kotlin.String? = null,

    @Json(name = "cpks")
    val cpks: kotlin.collections.List<CPIV5ResponseCpisInnerCpksInner>? = null,

    @Json(name = "groupPolicy")
    val groupPolicy: kotlin.String? = null,

    @Json(name = "id")
    val id: CPIIDV5? = null,

    @Json(name = "timestamp")
    val timestamp: java.time.OffsetDateTime? = null

)

