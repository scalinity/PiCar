use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{path::Path, time::Duration};

pub const LIMIT: usize = 8 * 1024 * 1024;
type Result<T> = std::result::Result<T, String>;
fn io(e: impl std::fmt::Display) -> String {
    format!("IO_FAILURE: {e}")
}
fn require(ok: bool, code: &str) -> Result<()> {
    if ok {
        Ok(())
    } else {
        Err(code.into())
    }
}
fn canon(v: &Value) -> Result<String> {
    serde_json_canonicalizer::to_string(v).map_err(io)
}
pub fn hash(kind: &str, v: &Value) -> Result<String> {
    let mut h = Sha256::new();
    h.update(format!("picar-v2:{kind}\n"));
    h.update(canon(v)?);
    Ok(format!("{:x}", h.finalize()))
}
fn raw_hash(s: &str) -> String {
    format!("{:x}", Sha256::digest(s.as_bytes()))
}
fn text<'a>(v: &'a Value, key: &str) -> Result<&'a str> {
    v[key].as_str().ok_or_else(|| "INVALID_SCHEMA".into())
}
fn number(v: &Value, key: &str) -> Result<u64> {
    v[key]
        .as_u64()
        .filter(|n| *n <= 9007199254740991)
        .ok_or_else(|| "INVALID_SCHEMA".into())
}
fn keys(v: &Value, expected: &[&str]) -> Result<()> {
    let o = v.as_object().ok_or("INVALID_SCHEMA")?;
    require(
        o.len() == expected.len() && expected.iter().all(|k| o.contains_key(*k)),
        "INVALID_SCHEMA",
    )
}
fn id(s: &str) -> Result<()> {
    require(
        (s.starts_with("PX-") || s.starts_with("TEST-"))
            && s.len() <= 256
            && s.bytes()
                .all(|b| b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'-'),
        "INVALID_ID",
    )
}
fn parse(s: &str) -> Result<Value> {
    require(s.len() <= LIMIT, "ENVELOPE_TOO_LARGE")?;
    super::strict_json::parse(s)
}
fn graph(binding: &str) -> Result<&'static Value> {
    static GRAPHS: std::sync::OnceLock<[Value; 3]> = std::sync::OnceLock::new();
    let graphs = GRAPHS.get_or_init(|| {
        [
            serde_json::from_str(include_str!(
                "../../../../digital-twin/validation/m2/rpi4/compiled-graph.json"
            ))
            .expect("accepted graph"),
            serde_json::from_str(include_str!(
                "../../../../digital-twin/validation/m2/rpi5/compiled-graph.json"
            ))
            .expect("accepted graph"),
            serde_json::from_str(include_str!(
                "../../../../digital-twin/validation/m2/rpi-zero-2-w/compiled-graph.json"
            ))
            .expect("accepted graph"),
        ]
    });
    graphs
        .iter()
        .find(|g| g["graphHash"] == binding)
        .ok_or("UNKNOWN_MODEL".into())
}
fn schema_session(v: &Value) -> Result<()> {
    static VALIDATOR: std::sync::OnceLock<jsonschema::Validator> = std::sync::OnceLock::new();
    let validator = VALIDATOR.get_or_init(|| {
        let mut schema: Value = serde_json::from_str(include_str!(
            "../../../../digital-twin/schemas/digital-twin.schema.json"
        ))
        .expect("accepted schema");
        schema["$ref"] = json!("#/$defs/AssemblySession");
        schema.as_object_mut().unwrap().remove("oneOf");
        jsonschema::options()
            .should_validate_formats(true)
            .build(&schema)
            .expect("accepted schema")
    });
    require(validator.is_valid(v), "INVALID_SESSION_SCHEMA")
}

fn observation(r: &Value, g: &Value, session_id: &Value) -> Result<()> {
    static VALIDATOR: std::sync::OnceLock<jsonschema::Validator> = std::sync::OnceLock::new();
    let validator = VALIDATOR.get_or_init(|| {
        let schema: Value = serde_json::from_str(include_str!("../../../../digital-twin/schemas/studio-observation.schema.json")).expect("observation schema");
        jsonschema::options().should_validate_formats(true).build(&schema).expect("observation schema")
    });
    require(validator.is_valid(r), "INVALID_OBSERVATION")?;
    require(r["sessionId"] == *session_id && r["variantId"] == g["variantId"]
        && g["steps"].as_array().unwrap().iter().any(|s|s["id"]==r["stepId"])
        && r["file"]["storageKey"] == format!("evidence/{}/{}",text(r,"sessionId")?,text(r,"id")?), "OBSERVATION_BINDING")?;
    let instances=g["instances"].as_array().unwrap();
    for instance in r["contextInstances"].as_array().unwrap(){
        require(instances.iter().any(|i|i["id"]==*instance && i["variantIds"].as_array().unwrap().contains(&r["variantId"])),"OBSERVATION_BINDING")?;
    }
    let geometry=r["geometry"].as_array().unwrap();
    for (n,entry) in geometry.iter().enumerate(){
        require(r["contextInstances"].as_array().unwrap().contains(&entry["instanceId"])
            && instances.iter().any(|i|i["id"]==entry["instanceId"]&&i["definitionId"]==entry["definitionId"])
            && geometry[..n].iter().all(|i|i["instanceId"]!=entry["instanceId"]),"OBSERVATION_BINDING")?;
    }
    Ok(())
}

fn setup(v: &Value) -> Result<()> {
    keys(
        v,
        &[
            "steps",
            "checks",
            "lastRoute",
            "pdfLastPage",
            "legacyAssemblyReportedDone",
        ],
    )?;
    let route = text(v, "lastRoute")?;
    require(
        route.is_empty()
            || (route.starts_with("#/")
                && ["", "wizard", "reference", "videos", "assembly"]
                    .contains(&route[2..].split(['/', '?']).next().unwrap_or(""))),
        "INVALID_SETUP",
    )?;
    let steps = v["steps"].as_object().ok_or("INVALID_SETUP")?;
    let checks = v["checks"].as_object().ok_or("INVALID_SETUP")?;
    require(
        steps.iter().all(|(k, x)| {
            [
                "parts",
                "os",
                "power",
                "connect",
                "software",
                "servo-zero",
                "assembly",
                "calibrate",
            ]
            .contains(&k.as_str())
                && x == "done"
        }) && checks.iter().all(|(k, x)| k.len() <= 256 && x.is_boolean())
            && text(v, "lastRoute")?.len() <= 4096
            && (1..=100000).contains(&number(v, "pdfLastPage")?)
            && v["legacyAssemblyReportedDone"].is_boolean(),
        "INVALID_SETUP",
    )
}
fn legacy_copy(r: &Value) -> Result<Value> {
    let raw = text(r, "raw")?;
    let interpreted: Result<Value> = (|| {
        require(raw.len() <= LIMIT, "LEGACY_OVERSIZED")?;
        let v = super::strict_json::parse(raw)?;
        let object = v.as_object().ok_or("LEGACY_TYPE")?;
        require(
            object
                .keys()
                .all(|k| ["steps", "checks", "lastRoute", "pdfLastPage"].contains(&k.as_str())),
            "LEGACY_TYPE",
        )?;
        let mut s = json!({"steps":{},"checks":{},"lastRoute":"","pdfLastPage":1,"legacyAssemblyReportedDone":false});
        for k in ["steps", "checks", "lastRoute", "pdfLastPage"] {
            if let Some(value) = v.get(k) {
                s[k] = value.clone();
            }
        }
        s["legacyAssemblyReportedDone"] = json!(s["steps"]["assembly"] == "done");
        setup(&s)?;
        require(
            canon(r)?.len() + canon(&s)?.len() * 2 <= LIMIT - 65536,
            "LEGACY_OVERSIZED",
        )?;
        Ok(s)
    })();
    Ok(interpreted.unwrap_or(Value::Null))
}
fn event_authorization(c: &Value, old: Option<&Value>) -> Result<()> {
    let p = &c["payload"];
    let next = &c["proposal"];
    let kind = text(p, "kind")?;
    if c["graphHash"].is_null() {
        require(c["modelHash"].is_null(), "UNKNOWN_MODEL")?;
        setup(next)?;
        require(
            c["aggregateId"] == "PX-SETUP"
                || (kind == "legacy"
                    && p["choice"] == "recovery"
                    && text(c, "aggregateId")?
                        == format!(
                            "PX-RECOVERY-{}",
                            text(&p["record"], "rawHash")?.to_uppercase()
                        ))
                || (old.is_some() && text(c, "aggregateId")?.starts_with("PX-RECOVERY-")),
            "UNKNOWN_AGGREGATE",
        )?;
        match kind {
            "reconcile" => {
                keys(p, &["kind", "sessionId", "sessionRevision", "graphHash"])?;
                id(text(p, "sessionId")?)?;
                number(p, "sessionRevision")?;
                graph(text(p, "graphHash")?)?;
                let mut expected=old.map(|o|o["snapshot"].clone()).unwrap_or(json!({"steps":{},"checks":{},"lastRoute":"","pdfLastPage":1,"legacyAssemblyReportedDone":false}));
                expected["steps"]["assembly"] = json!("done");
                expected["legacyAssemblyReportedDone"] = json!(false);
                require(expected == *next, "PROPOSAL_AUTHORIZATION")?;
            }
            "setup" => {
                keys(p, &["kind", "setup"])?;
                let flag = old
                    .map(|o| o["snapshot"]["legacyAssemblyReportedDone"].clone())
                    .unwrap_or(json!(false));
                require(
                    (p["setup"]["steps"]["assembly"] != "done"
                        || old.is_some_and(|o| o["snapshot"]["steps"]["assembly"] == "done"))
                        && p["setup"]["legacyAssemblyReportedDone"] == flag,
                    "RECONCILIATION_REQUIRED",
                )?;
                require(p["setup"] == *next, "PROPOSAL_AUTHORIZATION")?;
            }
            "legacy" => {
                keys(p, &["kind", "record", "setup", "choice"])?;
                require(
                    ["initial", "keepNew", "recovery"].contains(&text(p, "choice")?),
                    "MIGRATION_CHOICE",
                )?;
                let r = &p["record"];
                import_record(r)?;
                require(legacy_copy(r)? == p["setup"], "LEGACY_SETUP_MISMATCH")?;
                keys(
                    r,
                    &[
                        "id",
                        "sourceOrigin",
                        "sourceKey",
                        "raw",
                        "rawHash",
                        "migrationVersion",
                        "status",
                        "reason",
                    ],
                )?;
                require(
                    raw_hash(text(r, "raw")?) == text(r, "rawHash")?
                        && number(r, "migrationVersion")? == 1,
                    "LEGACY_HASH",
                )?;
                if !p["setup"].is_null() {
                    setup(&p["setup"])?;
                }
                let expected = if p["choice"] == "keepNew" || p["setup"].is_null() {
                    old.map(|o|o["snapshot"].clone()).unwrap_or(json!({"steps":{},"checks":{},"lastRoute":"","pdfLastPage":1,"legacyAssemblyReportedDone":false}))
                } else {
                    p["setup"].clone()
                };
                require(expected == *next, "PROPOSAL_AUTHORIZATION")?;
                require(
                    text(p, "choice")? != "initial" || old.is_none(),
                    "LEGACY_DIVERGENCE",
                )?;
            }
            _ => return Err("EVENT_AUTHORIZATION".into()),
        }
        return Ok(());
    }
    let g = graph(text(c, "graphHash")?)?;
    require(g["modelHash"] == c["modelHash"], "UNKNOWN_MODEL")?;
    schema_session(next)?;
    require(
        next["evidenceHash"] == "e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c",
        "EVIDENCE_BINDING",
    )?;
    require(
        next["id"] == c["aggregateId"]
            && next["graphHash"] == g["graphHash"]
            && next["modelHash"] == g["modelHash"]
            && next["variantId"] == g["variantId"]
            && number(next, "revision")? == number(c, "expectedRevision")? + 1
            && number(next, "schemaVersion")? == 1,
        "SESSION_BINDING",
    )?;
    let steps = g["steps"].as_array().unwrap();
    let ops = g["operations"].as_array().unwrap();
    if kind == "create" {
        keys(p, &["kind", "session", "forkOf"])?;
        require(old.is_none(), "AGGREGATE_EXISTS")?;
        for k in [
            "confirmationRecords",
            "procedureAcknowledgments",
            "zeroingAttestations",
            "invalidationEventIds",
            "observationIds",
            "sourceAdoptionEventIds",
        ] {
            require(
                next[k].as_array().is_some_and(|a| a.is_empty()),
                "CREATE_NOT_EMPTY",
            )?;
        }
        require(
            next["servoEpochs"]
                .as_array()
                .is_some_and(|a| a.len() == 3 && a.iter().all(|e| e["epoch"] == 0)),
            "CREATE_EPOCH",
        )?;
        validate_write_surface(c, None)?;
        return Ok(());
    }
    let old = old.ok_or("UNKNOWN_AGGREGATE")?;
    let s = &old["snapshot"];
    require(
        s["variantId"] == next["variantId"] && s["evidenceHash"] == next["evidenceHash"],
        "SESSION_BINDING",
    )?;
    let completed: Vec<&Value> = s["confirmationRecords"]
        .as_array()
        .ok_or("CORRUPT_STATE")?
        .iter()
        .filter(|r| r["invalidatedByEventRef"]["state"] == "notApplicable")
        .map(|r| &r["stepId"])
        .collect();
    match kind {
        "condition" => {
            keys(p, &["kind", "record"])?;
            let r = &p["record"];
            let op = ops
                .iter()
                .find(|o| o["id"] == r["operationId"])
                .ok_or("CONDITION_OPERATION")?;
            require(
                ["acknowledgeProcedure", "confirmZeroing"].contains(&text(op, "kind")?),
                "CONDITION_OPERATION",
            )?;
            require(
                r["sessionId"] == c["aggregateId"]
                    && r["graphHash"] == c["graphHash"]
                    && r["modelHash"] == c["modelHash"]
                    && r["variantId"] == g["variantId"]
                    && r["conditionRuleId"] == op["payload"]["conditionRuleId"]
                    && r["actor"] == "self_confirmed"
                    && r["invalidationEventRef"]["state"] == "notApplicable",
                "CONDITION_BINDING",
            )?;
            let rule = g["verificationRules"]
                .as_array()
                .unwrap()
                .iter()
                .find(|v| v["id"] == r["conditionRuleId"])
                .ok_or("CONDITION_RULE")?;
            let ledger = include_str!("../../../../docs/digital-twin/V40_ASSEMBLY_LEDGER.md");
            let step_number = text(op, "stepId")?.rsplit('-').next().ok_or("STEP_ID")?;
            let marker = format!("## {step_number}.");
            let start = ledger.find(&marker).ok_or("PROCEDURE_TEXT_MISSING")?;
            let end = ledger[start + marker.len()..]
                .find("\n## ")
                .map(|i| start + marker.len() + i + 1)
                .unwrap_or(ledger.len());
            let preimage = json!({"contractVersion":2,"operation":op,"rule":rule,"sourceProcedureText":&ledger[start..end]});
            require(
                r["procedureRevisionHash"] == hash("procedure", &preimage)?,
                "PROCEDURE_REVISION",
            )?;
            let index = steps
                .iter()
                .position(|t| t["id"] == op["stepId"])
                .ok_or("STEP_ID")?;
            require(
                steps[..index].iter().all(|t| completed.contains(&&t["id"]))
                    && !completed.contains(&&op["stepId"]),
                "PHYSICAL_PREREQUISITE",
            )?;
            if op["kind"] == "confirmZeroing" {
                let epoch = s["servoEpochs"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .find(|e| e["servoInstanceId"] == r["servoInstanceId"])
                    .ok_or("SERVO_SCOPE")?;
                require(
                    r["servoInstanceId"] == op["payload"]["servoInstanceId"]
                        && r["validForOperationId"] == op["payload"]["validForOperationId"]
                        && r["servoEpoch"] == epoch["epoch"]
                        && r["movementSinceZeroingDenied"] == true
                        && r["consumedByCommandRef"]["state"] == "notApplicable",
                    "ZEROING_SCOPE",
                )?;
            }
        }
        "complete" => {
            keys(
                p,
                &["kind", "stepId", "statement", "checkedRuleIds", "createdAt"],
            )?;
            let index = steps
                .iter()
                .position(|t| t["id"] == p["stepId"])
                .ok_or("STEP_ID")?;
            let step = &steps[index];
            require(
                steps[..index].iter().all(|t| completed.contains(&&t["id"]))
                    && !completed.contains(&&step["id"]),
                "PHYSICAL_PREREQUISITE",
            )?;
            require(
                !text(p, "statement")?.trim().is_empty(),
                "CONFIRMATION_STATEMENT",
            )?;
            for op in ops.iter().filter(|o| o["stepId"] == step["id"]) {
                if op["kind"] == "acknowledgeProcedure" {
                    require(
                        s["procedureAcknowledgments"]
                            .as_array()
                            .unwrap()
                            .iter()
                            .any(|r| {
                                r["operationId"] == op["id"]
                                    && r["invalidationEventRef"]["state"] == "notApplicable"
                            }),
                        "PROCEDURE_REQUIRED",
                    )?;
                }
                if op["kind"] == "confirmZeroing" {
                    let r = s["zeroingAttestations"]
                        .as_array()
                        .unwrap()
                        .iter()
                        .rev()
                        .find(|r| {
                            r["operationId"] == op["id"]
                                && r["invalidationEventRef"]["state"] == "notApplicable"
                                && r["consumedByCommandRef"]["state"] == "notApplicable"
                        })
                        .ok_or("ZEROING_REQUIRED")?;
                    let epoch = s["servoEpochs"]
                        .as_array()
                        .unwrap()
                        .iter()
                        .find(|e| e["servoInstanceId"] == r["servoInstanceId"])
                        .ok_or("SERVO_SCOPE")?;
                    require(
                        r["servoEpoch"] == epoch["epoch"]
                            && r["validForOperationId"] == op["payload"]["validForOperationId"],
                        "ZEROING_SCOPE",
                    )?;
                    require(
                        next["zeroingAttestations"]
                            .as_array()
                            .unwrap()
                            .iter()
                            .any(|n| {
                                n["id"] == r["id"]
                                    && n["consumedByCommandRef"]["ref"] == c["commandId"]
                            }),
                        "ZEROING_ATOMIC_CONSUMPTION",
                    )?;
                }
            }
        }
        "invalidate" => {
            keys(
                p,
                &["kind", "stepId", "servoInstanceId", "reason", "createdAt"],
            )?;
            require(steps.iter().any(|s| s["id"] == p["stepId"]), "STEP_ID")?;
        }
        "bookmark" => {
            keys(p, &["kind", "stepId"])?;
            require(steps.iter().any(|s| s["id"] == p["stepId"]), "STEP_ID")?;
        }
        "observation" => {
            keys(p, &["kind", "record"])?;
            observation(&p["record"], g, &c["aggregateId"])?;
            require(!s["observationIds"].as_array().unwrap().contains(&p["record"]["id"]),"OBSERVATION_BINDING")?;
        }
        _ => return Err("EVENT_AUTHORIZATION".into()),
    }
    validate_write_surface(c, Some(old))?;
    Ok(())
}

// Storage authorization only: validates ledger record changes, never evaluates mechanical operations.
fn sorted_unique(values: impl Iterator<Item = Value>) -> Value {
    let mut values: Vec<Value> = values.collect();
    values.sort_by(|a, b| a.as_str().cmp(&b.as_str()));
    values.dedup();
    json!(values)
}
fn validate_write_surface(c: &Value, old: Option<&Value>) -> Result<()> {
    let next = &c["proposal"];
    let p = &c["payload"];
    let kind = text(p, "kind")?;
    if c["graphHash"].is_null() {
        return Ok(());
    }
    let g = graph(text(c, "graphHash")?)?;
    let steps = g["steps"].as_array().ok_or("GRAPH_SCHEMA")?;
    let ops = g["operations"].as_array().ok_or("GRAPH_SCHEMA")?;
    if kind == "create" {
        let mut expected = p["session"].clone();
        require(
            expected["revision"] == 0
                && expected["projectId"] == "PX-V40-PROJECT"
                && expected["setupProgressRef"] == "PX-SETUP"
                && expected["contractVersion"] == 2
                && expected["reviewStepId"] == steps[0]["id"],
            "CREATE_BINDING",
        )?;
        let epochs: Vec<Value> = ops
            .iter()
            .filter(|o| o["kind"] == "confirmZeroing")
            .map(|o| json!({"servoInstanceId":o["payload"]["servoInstanceId"],"epoch":0}))
            .collect();
        require(expected["servoEpochs"] == json!(epochs), "CREATE_EPOCH")?;
        expected["revision"] = next["revision"].clone();
        require(expected == *next, "PROPOSAL_AUTHORIZATION")?;
        return Ok(());
    }
    let s = &old.ok_or("UNKNOWN_AGGREGATE")?["snapshot"];
    let mut expected = s.clone();
    expected["revision"] = next["revision"].clone();
    match kind {
        "condition" => {
            let r = &p["record"];
            let op = ops
                .iter()
                .find(|o| o["id"] == r["operationId"])
                .ok_or("CONDITION_OPERATION")?;
            let rule = g["verificationRules"]
                .as_array()
                .unwrap()
                .iter()
                .find(|r0| r0["id"] == r["conditionRuleId"])
                .ok_or("CONDITION_RULE")?;
            let deps = sorted_unique(
                rule["invalidationDependencyIds"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .cloned()
                    .chain(std::iter::once(op["id"].clone())),
            );
            require(
                r["dependencyIds"] == deps
                    && r["invalidationEventRef"]
                        == json!({"state":"notApplicable","reason":"No event recorded."}),
                "CONDITION_SCOPE",
            )?;
            require(
                !["procedureAcknowledgments", "zeroingAttestations"]
                    .iter()
                    .any(|f| s[f].as_array().unwrap().iter().any(|v| v["id"] == r["id"])),
                "DUPLICATE_CONDITION_ID",
            )?;
            let family = if op["kind"] == "confirmZeroing" {
                "zeroingAttestations"
            } else {
                let expected_kind = if text(op, "id")?.contains("POWER-OFF") {
                    "powerOff"
                } else {
                    "procedureRead"
                };
                require(
                    r["kind"] == expected_kind && r["accepted"] == true,
                    "CONDITION_SCOPE",
                )?;
                "procedureAcknowledgments"
            };
            expected[family].as_array_mut().unwrap().push(r.clone());
        }
        "complete" => {
            let index = steps
                .iter()
                .position(|t| t["id"] == p["stepId"])
                .ok_or("STEP_ID")?;
            let step = &steps[index];
            let rules = sorted_unique(
                step["verificationRuleIds"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .cloned(),
            );
            require(
                sorted_unique(
                    p["checkedRuleIds"]
                        .as_array()
                        .ok_or("CHECKS_REQUIRED")?
                        .iter()
                        .cloned(),
                ) == rules,
                "CHECKS_REQUIRED",
            )?;
            let mut acknowledgments = Vec::new();
            let mut attestations = Vec::new();
            for op in ops
                .iter()
                .filter(|o| step["operationIds"].as_array().unwrap().contains(&o["id"]))
            {
                if op["kind"] == "acknowledgeProcedure" {
                    let r = s["procedureAcknowledgments"]
                        .as_array()
                        .unwrap()
                        .iter()
                        .rev()
                        .find(|r| {
                            r["operationId"] == op["id"]
                                && r["invalidationEventRef"]["state"] == "notApplicable"
                        })
                        .ok_or("PROCEDURE_REQUIRED")?;
                    acknowledgments.push(r["id"].clone());
                }
                if op["kind"] == "confirmZeroing" {
                    let r = expected["zeroingAttestations"]
                        .as_array_mut()
                        .unwrap()
                        .iter_mut()
                        .rev()
                        .find(|r| {
                            r["operationId"] == op["id"]
                                && r["invalidationEventRef"]["state"] == "notApplicable"
                                && r["consumedByCommandRef"]["state"] == "notApplicable"
                        })
                        .ok_or("ZEROING_REQUIRED")?;
                    r["consumedByCommandRef"] = json!({"state":"known","ref":c["commandId"]});
                    attestations.push(r["id"].clone());
                }
            }
            let deps = sorted_unique(
                step["prerequisites"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .cloned()
                    .chain(step["operationIds"].as_array().unwrap().iter().cloned())
                    .chain(rules.as_array().unwrap().iter().cloned()),
            );
            expected["confirmationRecords"].as_array_mut().unwrap().push(json!({"id":c["commandId"],"stepId":step["id"],"operationIds":step["operationIds"],"actor":"self_confirmed","statement":p["statement"],"createdAt":p["createdAt"],"modelHash":c["modelHash"],"graphHash":c["graphHash"],"variantId":g["variantId"],"dependencyIds":deps,"observationIds":[],"invalidatedByEventRef":{"state":"notApplicable","reason":"No event recorded."},"procedureAcknowledgmentIds":acknowledgments,"zeroingAttestationIds":attestations}));
            expected["reviewStepId"] = steps.get(index + 1).unwrap_or(step)["id"].clone();
        }
        "invalidate" => {
            require(
                [
                    "undo",
                    "movement",
                    "replacement",
                    "reindex",
                    "disassembly",
                    "dependency",
                    "procedure",
                ]
                .contains(&text(p, "reason")?),
                "INVALIDATION",
            )?;
            let index = steps
                .iter()
                .position(|t| t["id"] == p["stepId"])
                .ok_or("STEP_ID")?;
            let affected: Vec<&Value> = steps[index..].iter().map(|t| &t["id"]).collect();
            let servos: Vec<&Value> = ops
                .iter()
                .filter(|o| o["kind"] == "confirmZeroing" && affected.contains(&&o["stepId"]))
                .map(|o| &o["payload"]["servoInstanceId"])
                .collect();
            require(
                p["servoInstanceId"].is_null() || servos.contains(&&p["servoInstanceId"]),
                "SERVO_SCOPE",
            )?;
            let reference = json!({"state":"known","ref":c["commandId"]});
            for r in expected["confirmationRecords"].as_array_mut().unwrap() {
                if affected.contains(&&r["stepId"])
                    && r["invalidatedByEventRef"]["state"] == "notApplicable"
                {
                    r["invalidatedByEventRef"] = reference.clone();
                }
            }
            for f in ["procedureAcknowledgments", "zeroingAttestations"] {
                for r in expected[f].as_array_mut().unwrap() {
                    let op = ops
                        .iter()
                        .find(|o| o["id"] == r["operationId"])
                        .ok_or("CONDITION_OPERATION")?;
                    if affected.contains(&&op["stepId"])
                        && r["invalidationEventRef"]["state"] == "notApplicable"
                    {
                        r["invalidationEventRef"] = reference.clone();
                    }
                }
            }
            for e in expected["servoEpochs"].as_array_mut().unwrap() {
                if servos.contains(&&e["servoInstanceId"]) {
                    e["epoch"] = json!(number(e, "epoch")? + 1);
                }
            }
            expected["invalidationEventIds"]
                .as_array_mut()
                .unwrap()
                .push(c["commandId"].clone());
            expected["reviewStepId"] = p["stepId"].clone();
        }
        "bookmark" => {
            expected["reviewStepId"] = p["stepId"].clone();
        }
        "observation" => {
            expected["observationIds"].as_array_mut().unwrap().push(p["record"]["id"].clone());
        }
        _ => return Err("EVENT_AUTHORIZATION".into()),
    }
    require(expected == *next, "UNAUTHORIZED_SNAPSHOT_WRITE")
}

fn import_record(r: &Value) -> Result<()> {
    keys(
        r,
        &[
            "id",
            "sourceOrigin",
            "sourceKey",
            "raw",
            "rawHash",
            "migrationVersion",
            "status",
            "reason",
        ],
    )?;
    require(
        text(r, "sourceKey")? == "picarx.v1"
            && number(r, "migrationVersion")? == 1
            && text(r, "sourceOrigin")?.len() <= 4096
            && text(r, "reason")?.len() <= 4096
            && ["adopted", "quarantined", "divergent", "recovery"].contains(&text(r, "status")?),
        "INVALID_IMPORT",
    )?;
    let raw_digest = raw_hash(text(r, "raw")?);
    require(
        raw_digest == text(r, "rawHash")?
            && raw_hash(&format!(
                "{}\n{}\n{}\n1",
                text(r, "sourceOrigin")?,
                text(r, "sourceKey")?,
                raw_digest
            )) == text(r, "id")?,
        "LEGACY_HASH",
    )
}
fn validate_stored(stored: &Value) -> Result<()> {
    keys(stored, &["aggregate", "events"])?;
    let a = &stored["aggregate"];
    keys(
        a,
        &[
            "id",
            "revision",
            "graphHash",
            "modelHash",
            "snapshot",
            "snapshotHash",
        ],
    )?;
    id(text(a, "id")?)?;
    let es = stored["events"].as_array().ok_or("EVENT_SEQUENCE")?;
    require(
        !es.is_empty() && es.len() as u64 == number(a, "revision")?,
        "EVENT_SEQUENCE",
    )?;
    let mut prior: Option<Value> = None;
    let mut previous = hash("aggregate", &Value::Null)?;
    let mut ids = std::collections::HashSet::new();
    for (i, e) in es.iter().enumerate() {
        keys(
            e,
            &[
                "sequence",
                "commandId",
                "action",
                "previousHash",
                "nextHash",
                "proposal",
            ],
        )?;
        id(text(e, "commandId")?)?;
        require(
            ids.insert(text(e, "commandId")?)
                && number(e, "sequence")? == i as u64 + 1
                && text(e, "previousHash")? == previous,
            "EVENT_SEQUENCE",
        )?;
        require(
            hash("aggregate", &e["proposal"])? == text(e, "nextHash")?,
            "EVENT_HASH",
        )?;
        let c = json!({"aggregateId":a["id"],"commandId":e["commandId"],"expectedRevision":i,"graphHash":a["graphHash"],"modelHash":a["modelHash"],"payload":e["action"],"proposal":e["proposal"]});
        event_authorization(&c, prior.as_ref())?;
        previous = text(e, "nextHash")?.into();
        prior = Some(
            json!({"id":a["id"],"revision":i+1,"graphHash":a["graphHash"],"modelHash":a["modelHash"],"snapshot":e["proposal"],"snapshotHash":e["nextHash"]}),
        );
    }
    require(prior.as_ref() == Some(a), "CORRUPT_SNAPSHOT")
}
fn current_stored(connection: &Connection, a: &Value) -> Result<Value> {
    let cached: String = connection
        .query_row(
            "SELECT json FROM snapshots WHERE id=?1",
            [text(a, "id")?],
            |r| r.get(0),
        )
        .map_err(io)?;
    require(parse(&cached)? == *a, "CORRUPT_SNAPSHOT")?;
    let mut st = connection
        .prepare("SELECT sequence,json FROM events WHERE aggregate_id=?1 ORDER BY sequence")
        .map_err(io)?;
    let es = st
        .query_map([text(a, "id")?], |r| {
            Ok((r.get::<_, u64>(0)?, r.get::<_, String>(1)?))
        })
        .map_err(io)?
        .map(|r| {
            let (seq, raw) = r.map_err(io)?;
            let e = parse(&raw)?;
            require(number(&e, "sequence")? == seq, "EVENT_SEQUENCE")?;
            Ok(e)
        })
        .collect::<Result<Vec<Value>>>()?;
    let stored = json!({"aggregate":a,"events":es});
    validate_stored(&stored)?;
    Ok(stored)
}

fn validate_backup_closure(b: &Value) -> Result<()> {
    let aggregates = b["aggregates"].as_array().ok_or("INVALID_IMPORT")?;
    let results = b["results"].as_array().ok_or("INVALID_IMPORT")?;
    let imports = b["imports"].as_array().ok_or("INVALID_IMPORT")?;
    let mut commands = std::collections::HashMap::new();
    let mut aggregate_ids = std::collections::HashSet::new();
    let mut import_records = std::collections::HashMap::new();
    for stored in aggregates {
        validate_stored(stored)?;
        let a = &stored["aggregate"];
        require(aggregate_ids.insert(text(a, "id")?), "DUPLICATE_AGGREGATE")?;
        for e in stored["events"].as_array().unwrap() {
            let body = json!({"payloadVersion":1,"aggregateId":a["id"],"commandId":e["commandId"],"expectedRevision":number(e,"sequence")?-1,"graphHash":a["graphHash"],"modelHash":a["modelHash"],"payload":e["action"],"proposal":e["proposal"],"previousHash":e["previousHash"],"nextHash":e["nextHash"]});
            require(
                commands.insert(text(e, "commandId")?, body).is_none(),
                "COMMAND_ID_REUSE",
            )?;
            if e["action"]["kind"] == "legacy" {
                let r = &e["action"]["record"];
                require(
                    import_records.insert(text(r, "id")?, r).is_none(),
                    "IMPORT_CLOSURE",
                )?;
            }
        }
    }
    for c in commands.values() {
        if c["payload"]["kind"] == "reconcile" {
            let p = &c["payload"];
            let source = aggregates
                .iter()
                .find(|s| s["aggregate"]["id"] == p["sessionId"])
                .ok_or("RECONCILIATION_CLOSURE")?;
            let e = source["events"]
                .as_array()
                .unwrap()
                .get(
                    number(p, "sessionRevision")?
                        .checked_sub(1)
                        .ok_or("RECONCILIATION_CLOSURE")? as usize,
                )
                .ok_or("RECONCILIATION_CLOSURE")?;
            require(
                source["aggregate"]["graphHash"] == p["graphHash"]
                    && e["proposal"]["confirmationRecords"]
                        .as_array()
                        .is_some_and(|a| {
                            a.iter()
                                .filter(|r| r["invalidatedByEventRef"]["state"] == "notApplicable")
                                .count()
                                == 29
                        }),
                "RECONCILIATION_CLOSURE",
            )?;
        }
    }
    require(results.len() == commands.len(), "RESULT_CLOSURE")?;
    let mut result_ids = std::collections::HashSet::new();
    for r in results {
        keys(r, &["commandId", "requestHash", "acknowledgment"])?;
        let c = commands
            .get(text(r, "commandId")?)
            .ok_or("RESULT_CLOSURE")?;
        require(
            result_ids.insert(text(r, "commandId")?)
                && text(r, "requestHash")? == hash("command", c)?
                && r["acknowledgment"]
                    == json!({"aggregateId":c["aggregateId"],"commandId":c["commandId"],"acknowledgedRevision":number(c,"expectedRevision")?+1,"snapshotHash":c["nextHash"]}),
            "RESULT_CLOSURE",
        )?;
    }
    let mut import_ids = std::collections::HashSet::new();
    for r in imports {
        import_record(r)?;
        require(import_ids.insert(text(r, "id")?), "IMPORT_CLOSURE")?;
        if let Some(expected) = import_records.get(text(r, "id")?) {
            require(*expected == r, "IMPORT_CLOSURE")?;
        } else {
            require(
                r["status"] == "quarantined" && r["reason"] == "LEGACY_OVERSIZED",
                "IMPORT_CLOSURE",
            )?;
        }
    }
    require(
        import_records.keys().all(|id| import_ids.contains(id)),
        "IMPORT_CLOSURE",
    )
}

pub struct Repository {
    pub connection: Connection,
    pub read_only: bool,
    pub path: std::path::PathBuf,
}
impl Repository {
    pub fn open(path: &Path) -> Result<Self> {
        let mut connection = Connection::open(path).map_err(io)?;
        connection
            .busy_timeout(Duration::from_secs(5))
            .map_err(io)?;
        let version: u64 = connection
            .pragma_query_value(None, "user_version", |r| r.get(0))
            .map_err(io)?;
        if version > 1 {
            drop(connection);
            let connection =
                Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
                    .map_err(io)?;
            return Ok(Self {
                connection,
                read_only: true,
                path: path.to_owned(),
            });
        }
        connection
            .execute_batch(
                "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;",
            )
            .map_err(io)?;
        if version == 0 {
            let tables:u64=connection.query_row("SELECT count(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",[],|r|r.get(0)).map_err(io)?;
            require(tables == 0, "UNRECOGNIZED_DATABASE_EXPORT_REQUIRED")?;
            // A new empty database has no prior session data. Any future nonempty migration requires a verified consistent backup first.
            let tx = connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(io)?;
            tx.execute_batch("CREATE TABLE aggregates(id TEXT PRIMARY KEY, json TEXT NOT NULL); CREATE TABLE events(aggregate_id TEXT NOT NULL REFERENCES aggregates(id), sequence INTEGER NOT NULL, json TEXT NOT NULL, PRIMARY KEY(aggregate_id,sequence)); CREATE TABLE snapshots(id TEXT PRIMARY KEY REFERENCES aggregates(id), json TEXT NOT NULL); CREATE TABLE command_results(command_id TEXT PRIMARY KEY, aggregate_id TEXT NOT NULL REFERENCES aggregates(id), request_hash TEXT NOT NULL, acknowledgment TEXT NOT NULL); CREATE TABLE imports(id TEXT PRIMARY KEY,json TEXT NOT NULL); PRAGMA user_version=1;").map_err(io)?;
            tx.commit().map_err(io)?;
        }
        Ok(Self {
            connection,
            read_only: false,
            path: path.to_owned(),
        })
    }
    pub fn load(&self, id: &str) -> Result<Value> {
        require(!self.read_only, "UNSUPPORTED_VERSION")?;
        id_check(id)?;
        let row: Option<String> = self
            .connection
            .query_row("SELECT json FROM aggregates WHERE id=?1", [id], |r| {
                r.get(0)
            })
            .optional()
            .map_err(io)?;
        let Some(row) = row else {
            return Ok(Value::Null);
        };
        let aggregate: Value = serde_json::from_str(&row).map_err(io)?;
        current_stored(&self.connection, &aggregate)
    }
    pub fn list(&self) -> Result<Value> {
        self.rows("SELECT json FROM aggregates")
    }
    pub fn imports(&self) -> Result<Value> {
        self.rows("SELECT json FROM imports")
    }
    fn rows(&self, query: &str) -> Result<Value> {
        let mut st = self.connection.prepare(query).map_err(io)?;
        let rows = st
            .query_map([], |r| r.get::<_, String>(0))
            .map_err(io)?
            .map(|r| serde_json::from_str(&r.map_err(io)?).map_err(io))
            .collect::<Result<Vec<Value>>>()?;
        Ok(json!(rows))
    }
    pub fn commit(&mut self, raw: &str) -> Result<Value> {
        require(!self.read_only, "UNSUPPORTED_VERSION")?;
        let c = parse(raw)?;
        keys(
            &c,
            &[
                "payloadVersion",
                "aggregateId",
                "commandId",
                "expectedRevision",
                "graphHash",
                "modelHash",
                "payload",
                "proposal",
                "previousHash",
                "nextHash",
                "requestHash",
            ],
        )?;
        require(c["payloadVersion"] == 1, "INVALID_ENVELOPE")?;
        id(text(&c, "commandId")?)?;
        id(text(&c, "aggregateId")?)?;
        number(&c, "expectedRevision")?;
        let mut body = c.clone();
        body.as_object_mut().unwrap().remove("requestHash");
        require(
            hash("command", &body)? == text(&c, "requestHash")?
                && hash("aggregate", &c["proposal"])? == text(&c, "nextHash")?,
            "COMMAND_HASH",
        )?;
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(io)?;
        let prior:Option<(String,String,String)>=tx.query_row("SELECT request_hash,aggregate_id,acknowledgment FROM command_results WHERE command_id=?1",[text(&c,"commandId")?],|r|Ok((r.get(0)?,r.get(1)?,r.get(2)?))).optional().map_err(io)?;
        if let Some((h, a, response)) = prior {
            require(
                h == text(&c, "requestHash")? && a == text(&c, "aggregateId")?,
                "COMMAND_ID_REUSE",
            )?;
            return serde_json::from_str(&response).map_err(io);
        }
        if c["payload"]["kind"] == "legacy" {
            let r = &c["payload"]["record"];
            import_record(r)?;
            let prior: Option<String> = tx
                .query_row(
                    "SELECT json FROM imports WHERE id=?1",
                    [text(r, "id")?],
                    |r| r.get(0),
                )
                .optional()
                .map_err(io)?;
            if let Some(prior) = prior {
                require(parse(&prior)? == *r, "LEGACY_ID_REUSE")?;
                let ack:String=tx.query_row("SELECT cr.acknowledgment FROM command_results cr JOIN events e ON cr.command_id=json_extract(e.json,'$.commandId') WHERE json_extract(e.json,'$.action.record.id')=?1",[text(r,"id")?],|r|r.get(0)).map_err(|_|"MIGRATION_MARKER_CORRUPT".to_owned())?;
                return parse(&ack);
            }
        }
        let old: Option<String> = tx
            .query_row(
                "SELECT json FROM aggregates WHERE id=?1",
                [text(&c, "aggregateId")?],
                |r| r.get(0),
            )
            .optional()
            .map_err(io)?;
        let old: Option<Value> = old
            .map(|r| serde_json::from_str(&r).map_err(io))
            .transpose()?;
        if let Some(a) = &old {
            current_stored(&tx, a)?;
        }
        let revision = old
            .as_ref()
            .map(|r| number(r, "revision"))
            .transpose()?
            .unwrap_or(0);
        require(revision == number(&c, "expectedRevision")?, "CONFLICT")?;
        require(
            text(&c, "previousHash")?
                == old
                    .as_ref()
                    .map(|r| text(r, "snapshotHash").map(str::to_owned))
                    .transpose()?
                    .unwrap_or(hash("aggregate", &Value::Null)?),
            "CORRUPT_STATE",
        )?;
        if let Some(o) = &old {
            require(
                o["graphHash"] == c["graphHash"] && o["modelHash"] == c["modelHash"],
                "UNKNOWN_MODEL",
            )?;
        }
        if c["payload"]["kind"] == "observation" {
            crate::evidence::verify(self.path.parent().ok_or("EVIDENCE_PATH")?, &c["payload"]["record"])?;
        }
        if c["payload"]["kind"] == "create" && !c["payload"]["forkOf"].is_null() {
            let source: Option<String> = tx
                .query_row(
                    "SELECT json FROM aggregates WHERE id=?1",
                    [text(&c["payload"], "forkOf")?],
                    |r| r.get(0),
                )
                .optional()
                .map_err(io)?;
            let source = parse(&source.ok_or("UNKNOWN_FORK_SOURCE")?)?;
            require(!source["graphHash"].is_null(), "UNKNOWN_FORK_SOURCE")?;
            current_stored(&tx, &source)?;
        }
        if c["payload"]["kind"] == "reconcile" {
            let p = &c["payload"];
            let source: Option<String> = tx
                .query_row(
                    "SELECT json FROM aggregates WHERE id=?1",
                    [text(p, "sessionId")?],
                    |r| r.get(0),
                )
                .optional()
                .map_err(io)?;
            let source = parse(&source.ok_or("CONFLICT")?)?;
            current_stored(&tx, &source)?;
            require(
                source["revision"] == p["sessionRevision"]
                    && source["graphHash"] == p["graphHash"]
                    && source["snapshot"]["confirmationRecords"]
                        .as_array()
                        .is_some_and(|a| {
                            a.iter()
                                .filter(|r| r["invalidatedByEventRef"]["state"] == "notApplicable")
                                .count()
                                == 29
                        }),
                "CONFLICT",
            )?;
        }
        event_authorization(&c, old.as_ref())?;
        if c["payload"]["kind"] == "legacy" {
            let found: bool = tx
                .query_row(
                    "SELECT EXISTS(SELECT 1 FROM imports WHERE id=?1)",
                    [text(&c["payload"]["record"], "id")?],
                    |r| r.get(0),
                )
                .map_err(io)?;
            require(!found, "MIGRATION_ALREADY_APPLIED")?;
            tx.execute(
                "INSERT INTO imports VALUES(?1,?2)",
                params![
                    text(&c["payload"]["record"], "id")?,
                    canon(&c["payload"]["record"])?
                ],
            )
            .map_err(io)?;
        }
        let a = json!({"id":c["aggregateId"],"revision":revision+1,"graphHash":c["graphHash"],"modelHash":c["modelHash"],"snapshot":c["proposal"],"snapshotHash":c["nextHash"]});
        let e = json!({"sequence":revision+1,"commandId":c["commandId"],"action":c["payload"],"previousHash":c["previousHash"],"nextHash":c["nextHash"],"proposal":c["proposal"]});
        let response = json!({"aggregateId":c["aggregateId"],"commandId":c["commandId"],"acknowledgedRevision":revision+1,"snapshotHash":c["nextHash"]});
        tx.execute(
            "INSERT INTO aggregates VALUES(?1,?2) ON CONFLICT(id) DO UPDATE SET json=excluded.json",
            params![text(&c, "aggregateId")?, canon(&a)?],
        )
        .map_err(io)?;
        tx.execute(
            "INSERT INTO events VALUES(?1,?2,?3)",
            params![text(&c, "aggregateId")?, revision + 1, canon(&e)?],
        )
        .map_err(io)?;
        tx.execute(
            "INSERT INTO snapshots VALUES(?1,?2) ON CONFLICT(id) DO UPDATE SET json=excluded.json",
            params![text(&c, "aggregateId")?, canon(&a)?],
        )
        .map_err(io)?;
        tx.execute(
            "INSERT INTO command_results VALUES(?1,?2,?3,?4)",
            params![
                text(&c, "commandId")?,
                text(&c, "aggregateId")?,
                text(&c, "requestHash")?,
                canon(&response)?
            ],
        )
        .map_err(io)?;
        tx.commit().map_err(io)?;
        Ok(response)
    }
    pub fn consistent_backup(&self, destination: &Path) -> Result<()> {
        require(!destination.exists(), "BACKUP_EXISTS")?;
        let mut copy = Connection::open(destination).map_err(io)?;
        let backup = rusqlite::backup::Backup::new(&self.connection, &mut copy).map_err(io)?;
        backup
            .run_to_completion(32, Duration::from_millis(5), None)
            .map_err(io)?;
        drop(backup);
        let check: String = copy
            .query_row("PRAGMA integrity_check", [], |r| r.get(0))
            .map_err(io)?;
        require(check == "ok", "CORRUPT_BACKUP")?;
        let originals = self.list()?;
        let mut st = copy.prepare("SELECT json FROM aggregates").map_err(io)?;
        let rows = st
            .query_map([], |r| r.get::<_, String>(0))
            .map_err(io)?
            .map(|r| serde_json::from_str(&r.map_err(io)?).map_err(io))
            .collect::<Result<Vec<Value>>>()?;
        require(json!(rows) == originals, "BACKUP_MISMATCH")
    }
}
fn id_check(value: &str) -> Result<()> {
    id(value)
}
impl Repository {
    pub fn export(&mut self) -> Result<Value> {
        let schema_version: u64 = self
            .connection
            .pragma_query_value(None, "user_version", |r| r.get(0))
            .map_err(io)?;
        let tx = self.connection.transaction().map_err(io)?;
        let mut st = tx
            .prepare("SELECT id,json FROM aggregates ORDER BY id")
            .map_err(io)?;
        let rows = st
            .query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))
            .map_err(io)?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(io)?;
        drop(st);
        let mut aggregates = Vec::new();
        for (id, a) in rows {
            let a: Value = serde_json::from_str(&a).map_err(io)?;
            let mut st = tx
                .prepare("SELECT json FROM events WHERE aggregate_id=?1 ORDER BY sequence")
                .map_err(io)?;
            let es = st
                .query_map([id], |r| r.get::<_, String>(0))
                .map_err(io)?
                .map(|r| serde_json::from_str(&r.map_err(io)?).map_err(io))
                .collect::<Result<Vec<Value>>>()?;
            aggregates.push(json!({"aggregate":a,"events":es}));
        }
        let mut st=tx.prepare("SELECT command_id,request_hash,acknowledgment FROM command_results ORDER BY command_id").map_err(io)?;
        let results = st
            .query_map([], |r| {
                Ok((
                    r.get::<_, String>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                ))
            })
            .map_err(io)?
            .map(|r| {
                let (id, h, a) = r.map_err(io)?;
                let a: Value = serde_json::from_str(&a).map_err(io)?;
                Ok(json!({"commandId":id,"requestHash":h,"acknowledgment":a}))
            })
            .collect::<Result<Vec<Value>>>()?;
        drop(st);
        let mut st = tx
            .prepare("SELECT json FROM imports ORDER BY id")
            .map_err(io)?;
        let imports = st
            .query_map([], |r| r.get::<_, String>(0))
            .map_err(io)?
            .map(|r| serde_json::from_str(&r.map_err(io)?).map_err(io))
            .collect::<Result<Vec<Value>>>()?;
        drop(st);
        let mut body = json!({"format":"picar-sessions","schemaVersion":schema_version,"aggregates":aggregates,"results":results,"imports":imports});
        let checksum = hash("backup", &body)?;
        body["checksum"] = json!(checksum);
        tx.commit().map_err(io)?;
        Ok(body)
    }
    pub fn restore(&mut self, raw: &str) -> Result<()> {
        require(!self.read_only, "UNSUPPORTED_VERSION")?;
        let b = parse(raw)?;
        keys(
            &b,
            &[
                "format",
                "schemaVersion",
                "aggregates",
                "results",
                "imports",
                "checksum",
            ],
        )?;
        let mut body = b.clone();
        body.as_object_mut().unwrap().remove("checksum");
        require(
            b["format"] == "picar-sessions"
                && b["schemaVersion"] == 1
                && hash("backup", &body)? == text(&b, "checksum")?,
            "INVALID_IMPORT",
        )?;
        validate_backup_closure(&b)?;
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(io)?;
        let count: u64 = tx
            .query_row("SELECT (SELECT count(*) FROM aggregates)+(SELECT count(*) FROM events)+(SELECT count(*) FROM snapshots)+(SELECT count(*) FROM command_results)+(SELECT count(*) FROM imports)", [], |r| r.get(0))
            .map_err(io)?;
        require(count == 0, "RECOVERY_DESTINATION_NOT_EMPTY")?;
        for stored in b["aggregates"].as_array().ok_or("INVALID_IMPORT")? {
            keys(stored, &["aggregate", "events"])?;
            let a = &stored["aggregate"];
            keys(
                a,
                &[
                    "id",
                    "revision",
                    "graphHash",
                    "modelHash",
                    "snapshot",
                    "snapshotHash",
                ],
            )?;
            id(text(a, "id")?)?;
            validate_stored(stored)?;
            let es = stored["events"].as_array().unwrap();
            tx.execute(
                "INSERT INTO aggregates VALUES(?1,?2)",
                params![text(a, "id")?, canon(a)?],
            )
            .map_err(io)?;
            tx.execute(
                "INSERT INTO snapshots VALUES(?1,?2)",
                params![text(a, "id")?, canon(a)?],
            )
            .map_err(io)?;
            for e in es {
                tx.execute(
                    "INSERT INTO events VALUES(?1,?2,?3)",
                    params![text(a, "id")?, number(e, "sequence")?, canon(e)?],
                )
                .map_err(io)?;
            }
        }
        for r in b["results"].as_array().ok_or("INVALID_IMPORT")? {
            keys(r, &["commandId", "requestHash", "acknowledgment"])?;
            id(text(r, "commandId")?)?;
            tx.execute(
                "INSERT INTO command_results VALUES(?1,?2,?3,?4)",
                params![
                    text(r, "commandId")?,
                    text(&r["acknowledgment"], "aggregateId")?,
                    text(r, "requestHash")?,
                    canon(&r["acknowledgment"])?
                ],
            )
            .map_err(io)?;
        }
        for r in b["imports"].as_array().ok_or("INVALID_IMPORT")? {
            import_record(r)?;
            require(
                raw_hash(text(r, "raw")?) == text(r, "rawHash")?,
                "LEGACY_HASH",
            )?;
            tx.execute(
                "INSERT INTO imports VALUES(?1,?2)",
                params![text(r, "id")?, canon(r)?],
            )
            .map_err(io)?;
        }
        tx.commit().map_err(io)
    }
}
impl Repository {
    pub fn quarantine(&mut self, raw: &str) -> Result<()> {
        require(!self.read_only, "UNSUPPORTED_VERSION")?;
        // Separate raw retention transaction, outside the 8 MiB interpreted-command envelope.
        require(
            raw.len() <= 64 * 1024 * 1024,
            "RAW_BACKUP_TOO_LARGE_ORIGINAL_RETAINED",
        )?;
        let r = super::strict_json::parse(raw)?;
        import_record(&r)?;
        require(
            r["status"] == "quarantined" && r["reason"] == "LEGACY_OVERSIZED",
            "INVALID_IMPORT",
        )?;
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(io)?;
        let prior: Option<String> = tx
            .query_row(
                "SELECT json FROM imports WHERE id=?1",
                [text(&r, "id")?],
                |r| r.get(0),
            )
            .optional()
            .map_err(io)?;
        if let Some(prior) = prior {
            require(super::strict_json::parse(&prior)? == r, "LEGACY_ID_REUSE")?;
        } else {
            tx.execute(
                "INSERT INTO imports VALUES(?1,?2)",
                params![text(&r, "id")?, canon(&r)?],
            )
            .map_err(io)?;
        }
        tx.commit().map_err(io)
    }
}
#[cfg(test)]
mod tests;
