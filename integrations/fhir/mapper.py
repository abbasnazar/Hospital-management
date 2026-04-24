"""
Bidirectional mapping helpers between FHIR R4 Patient and HMIS Patient DTOs.
"""

from __future__ import annotations

from typing import Any, Dict


def fhir_to_hmis(resource: Dict[str, Any]) -> Dict[str, Any]:
    assert resource.get("resourceType") == "Patient"
    name    = (resource.get("name") or [{}])[0]
    telecom = {t.get("system"): t.get("value") for t in resource.get("telecom", [])}
    address = (resource.get("address") or [{}])[0].get("text")
    gender_map = {"male": "M", "female": "F", "other": "O", "unknown": "O"}
    return {
        "firstName":  (name.get("given") or [""])[0],
        "lastName":   name.get("family") or "",
        "dob":        resource.get("birthDate"),
        "gender":     gender_map.get(resource.get("gender", "").lower(), "O"),
        "phone":      telecom.get("phone"),
        "email":      telecom.get("email"),
        "address":    address,
    }


def hmis_to_fhir(patient: Dict[str, Any]) -> Dict[str, Any]:
    gender_map = {"M": "male", "F": "female", "O": "other"}
    telecom = []
    if patient.get("phone"): telecom.append({"system": "phone", "value": patient["phone"], "use": "mobile"})
    if patient.get("email"): telecom.append({"system": "email", "value": patient["email"]})
    return {
        "resourceType": "Patient",
        "id":         str(patient.get("id", "")),
        "identifier": [{"system": "urn:hmis:mrn", "value": patient.get("mrn")}],
        "active":     True,
        "name":       [{"use": "official", "family": patient.get("lastName"), "given": [patient.get("firstName")]}],
        "telecom":    telecom,
        "gender":     gender_map.get(patient.get("gender"), "unknown"),
        "birthDate":  patient.get("dob"),
        "address":    [{"use": "home", "text": patient.get("address")}] if patient.get("address") else [],
    }
