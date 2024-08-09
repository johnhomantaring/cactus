/*
Hyperledger Cacti Plugin - Connector Corda

Can perform basic tasks on a Corda ledger

API version: 2.0.0-rc.3
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package cactus-plugin-ledger-connector-corda

import (
	"encoding/json"
)

// checks if the FlowStatusV1Responses type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &FlowStatusV1Responses{}

// FlowStatusV1Responses struct for FlowStatusV1Responses
type FlowStatusV1Responses struct {
	FlowStatusResponses []FlowStatusV1ResponsesFlowStatusResponsesInner `json:"flowStatusResponses,omitempty"`
}

// NewFlowStatusV1Responses instantiates a new FlowStatusV1Responses object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewFlowStatusV1Responses() *FlowStatusV1Responses {
	this := FlowStatusV1Responses{}
	return &this
}

// NewFlowStatusV1ResponsesWithDefaults instantiates a new FlowStatusV1Responses object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewFlowStatusV1ResponsesWithDefaults() *FlowStatusV1Responses {
	this := FlowStatusV1Responses{}
	return &this
}

// GetFlowStatusResponses returns the FlowStatusResponses field value if set, zero value otherwise.
func (o *FlowStatusV1Responses) GetFlowStatusResponses() []FlowStatusV1ResponsesFlowStatusResponsesInner {
	if o == nil || IsNil(o.FlowStatusResponses) {
		var ret []FlowStatusV1ResponsesFlowStatusResponsesInner
		return ret
	}
	return o.FlowStatusResponses
}

// GetFlowStatusResponsesOk returns a tuple with the FlowStatusResponses field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *FlowStatusV1Responses) GetFlowStatusResponsesOk() ([]FlowStatusV1ResponsesFlowStatusResponsesInner, bool) {
	if o == nil || IsNil(o.FlowStatusResponses) {
		return nil, false
	}
	return o.FlowStatusResponses, true
}

// HasFlowStatusResponses returns a boolean if a field has been set.
func (o *FlowStatusV1Responses) HasFlowStatusResponses() bool {
	if o != nil && !IsNil(o.FlowStatusResponses) {
		return true
	}

	return false
}

// SetFlowStatusResponses gets a reference to the given []FlowStatusV1ResponsesFlowStatusResponsesInner and assigns it to the FlowStatusResponses field.
func (o *FlowStatusV1Responses) SetFlowStatusResponses(v []FlowStatusV1ResponsesFlowStatusResponsesInner) {
	o.FlowStatusResponses = v
}

func (o FlowStatusV1Responses) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o FlowStatusV1Responses) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.FlowStatusResponses) {
		toSerialize["flowStatusResponses"] = o.FlowStatusResponses
	}
	return toSerialize, nil
}

type NullableFlowStatusV1Responses struct {
	value *FlowStatusV1Responses
	isSet bool
}

func (v NullableFlowStatusV1Responses) Get() *FlowStatusV1Responses {
	return v.value
}

func (v *NullableFlowStatusV1Responses) Set(val *FlowStatusV1Responses) {
	v.value = val
	v.isSet = true
}

func (v NullableFlowStatusV1Responses) IsSet() bool {
	return v.isSet
}

func (v *NullableFlowStatusV1Responses) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableFlowStatusV1Responses(val *FlowStatusV1Responses) *NullableFlowStatusV1Responses {
	return &NullableFlowStatusV1Responses{value: val, isSet: true}
}

func (v NullableFlowStatusV1Responses) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableFlowStatusV1Responses) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


