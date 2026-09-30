use super::*;
use std::sync::atomic::{AtomicU64, Ordering};
static NEXT: AtomicU64 = AtomicU64::new(0);
fn fixture() -> Value {
    serde_json::from_str(include_str!("../../../tests/native/fixtures.json")).unwrap()
}
struct Temp(std::path::PathBuf);
impl Temp {
    fn new() -> Self {
        let path = std::env::temp_dir().join(format!(
            "picar-m3-native-rust-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::SeqCst)
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path.canonicalize().unwrap())
    }
    fn repo(&self, name: &str) -> Repository {
        Repository::open(&self.0.join(name)).unwrap()
    }
}
impl Drop for Temp {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).unwrap();
    }
}
fn commit(r: &mut Repository, c: &Value) -> Value {
    r.commit(&canon(c).unwrap()).unwrap()
}
fn reject(r: &mut Repository, c: &Value, code: &str) {
    let e = r.commit(&canon(c).unwrap()).unwrap_err();
    assert!(e.contains(code), "expected {code}, got {e}");
}
#[test]
fn initialization_append_retry_cas_restart_wal_backup() {
    let f = fixture();
    let tmp = Temp::new();
    let mut r = tmp.repo("sessions.sqlite3");
    for (pragma, expected) in [
        ("journal_mode", json!("wal")),
        ("foreign_keys", json!(1)),
        ("synchronous", json!(2)),
        ("user_version", json!(1)),
    ] {
        let v: rusqlite::types::Value = r
            .connection
            .pragma_query_value(None, pragma, |r| r.get(0))
            .unwrap();
        let v = match v {
            rusqlite::types::Value::Text(s) => json!(s),
            rusqlite::types::Value::Integer(n) => json!(n),
            _ => panic!(),
        };
        assert_eq!(v, expected);
    }
    let ack = commit(&mut r, &f["setupCreate"]);
    assert_eq!(ack, commit(&mut r, &f["setupCreate"]));
    reject(&mut r, &f["reused"], "COMMAND_ID_REUSE");
    commit(&mut r, &f["setupAppend"]);
    reject(&mut r, &f["stale"], "CONFLICT");
    assert_eq!(ack, commit(&mut r, &f["setupCreate"]));
    assert!(std::fs::metadata(tmp.0.join("sessions.sqlite3-wal")).unwrap().len()>0);
    r.consistent_backup(&tmp.0.join("backup.sqlite3")).unwrap();
    let exported = r.export().unwrap();
    drop(r);
    let mut reopened = tmp.repo("sessions.sqlite3");
    assert_eq!(reopened.export().unwrap(), exported);
    let mut copied = tmp.repo("backup.sqlite3");
    assert_eq!(copied.export().unwrap(), exported);
    let mut recovery = tmp.repo("recovery.sqlite3");
    recovery.restore(&canon(&exported).unwrap()).unwrap();
    assert_eq!(recovery.export().unwrap(), exported);
    assert!(recovery
        .restore(&canon(&exported).unwrap())
        .unwrap_err()
        .contains("RECOVERY_DESTINATION_NOT_EMPTY"));
}
#[test]
fn all29_records_consumption_invalidation_and_forgery() {
    let f = fixture();
    let tmp = Temp::new();
    for (i, journey) in f["journeys"].as_array().unwrap().iter().enumerate() {
        let mut r = tmp.repo(&format!("journey-{i}.sqlite3"));
        for c in journey.as_array().unwrap() {
            let ack = commit(&mut r, c);
            assert_eq!(ack, commit(&mut r, c));
        }
        let last = journey.as_array().unwrap().last().unwrap();
        let stored = r.load(text(last, "aggregateId").unwrap()).unwrap();
        let s = &stored["aggregate"]["snapshot"];
        assert_eq!(
            s["confirmationRecords"]
                .as_array()
                .unwrap()
                .iter()
                .filter(|r| r["invalidatedByEventRef"]["state"] == "notApplicable")
                .count(),
            17
        );
        assert!(s["servoEpochs"]
            .as_array()
            .unwrap()
            .iter()
            .all(|e| e["epoch"] == 1));
        assert!(s["zeroingAttestations"]
            .as_array()
            .unwrap()
            .iter()
            .all(|a| a["consumedByCommandRef"]["state"] == "known"
                && a["invalidationEventRef"]["state"] == "known"));
    }
    let mut r = tmp.repo("forgery.sqlite3");
    commit(&mut r, &f["journeys"][0][0]);
    reject(&mut r, &f["forged"], "UNAUTHORIZED_SNAPSHOT_WRITE");
    let mut r = tmp.repo("dependency.sqlite3");
    for c in f["journeys"][0].as_array().unwrap() {
        if c["payload"]["kind"] == "condition" {
            break;
        }
        commit(&mut r, c);
    }
    reject(&mut r, &f["missing"], "CONDITION_SCOPE");
}
#[test]
fn migration_raw_markers_retry_malformed_and_oversized() {
    let f = fixture();
    let tmp = Temp::new();
    let mut r = tmp.repo("legacy.sqlite3");
    r.connection.execute_batch("CREATE TRIGGER fail_import BEFORE INSERT ON imports BEGIN SELECT RAISE(ABORT,'TEST_INTERRUPTION'); END;").unwrap();
    reject(&mut r, &f["migration"], "TEST_INTERRUPTION");
    assert!(r.load("PX-SETUP").unwrap().is_null());
    assert!(r.imports().unwrap().as_array().unwrap().is_empty());
    r.connection
        .execute_batch("DROP TRIGGER fail_import")
        .unwrap();
    let ack = commit(&mut r, &f["migration"]);
    let mut retry = f["migration"].clone();
    retry["commandId"] = json!("TEST-MIGRATION-RETRY");
    let mut body = retry.clone();
    body.as_object_mut().unwrap().remove("requestHash");
    retry["requestHash"] = json!(hash("command", &body).unwrap());
    assert_eq!(ack, commit(&mut r, &retry));
    assert_eq!(r.imports().unwrap().as_array().unwrap().len(), 1);
    assert!(r.load("PX-SETUP").unwrap()["aggregate"]["snapshot"]
        .get("confirmationRecords")
        .is_none());
    let mut q = tmp.repo("malformed.sqlite3");
    commit(&mut q, &f["malformed"]);
    assert_eq!(q.imports().unwrap()[0]["raw"], "{bad");
    let raw = "x".repeat(LIMIT + 1);
    let raw_digest = raw_hash(&raw);
    let record = json!({"id":raw_hash(&format!("TEST-ORIGIN\npicarx.v1\n{raw_digest}\n1")),"sourceOrigin":"TEST-ORIGIN","sourceKey":"picarx.v1","raw":raw,"rawHash":raw_digest,"migrationVersion":1,"status":"quarantined","reason":"LEGACY_OVERSIZED"});
    q.quarantine(&canon(&record).unwrap()).unwrap();
    assert!(q.imports().unwrap().as_array().unwrap().contains(&record));
}
#[test]
fn real_transaction_rollback_disk_full_and_corrupt_current_history() {
    let f = fixture();
    let tmp = Temp::new();
    let mut r = tmp.repo("rollback.sqlite3");
    commit(&mut r, &f["setupCreate"]);
    let before = r.export().unwrap();
    r.connection.execute_batch("CREATE TRIGGER fail_event BEFORE INSERT ON events BEGIN SELECT RAISE(ABORT,'TEST_DISK_FAULT'); END;").unwrap();
    reject(&mut r, &f["setupAppend"], "TEST_DISK_FAULT");
    assert_eq!(r.export().unwrap(), before);
    r.connection
        .execute_batch("DROP TRIGGER fail_event; PRAGMA max_page_count=12;")
        .unwrap();
    let mut large = f["setupAppend"].clone();
    let checks: serde_json::Map<String, Value> = (0..100000)
        .map(|n| (format!("TEST-{n}"), json!(true)))
        .collect();
    large["payload"]["setup"]["checks"] = json!(checks);
    large["proposal"] = large["payload"]["setup"].clone();
    large["nextHash"] = json!(hash("aggregate", &large["proposal"]).unwrap());
    let mut body = large.clone();
    body.as_object_mut().unwrap().remove("requestHash");
    large["requestHash"] = json!(hash("command", &body).unwrap());
    assert!(r.commit(&canon(&large).unwrap()).unwrap_err().contains("database or disk is full"));
    assert_eq!(r.export().unwrap(), before);
    r.connection.execute("DELETE FROM events", []).unwrap();
    reject(&mut r, &f["setupAppend"], "EVENT_SEQUENCE");
}
#[test]
fn strict_json_checksum_import_closure_and_newer_read_only() {
    let f = fixture();
    let tmp = Temp::new();
    let mut r = tmp.repo("import.sqlite3");
    for field in ["path", "canonicalPath", "destination"] {
        let mut b = f["setupBackup"].clone();
        b[field] = json!("../../digital-twin");
        let mut body = b.clone();
        body.as_object_mut().unwrap().remove("checksum");
        b["checksum"] = json!(hash("backup", &body).unwrap());
        assert!(r.restore(&canon(&b).unwrap()).is_err());
    }
    let mut broken = f["setupBackup"].clone();
    broken["aggregates"][0]["events"]
        .as_array_mut()
        .unwrap()
        .remove(0);
    let mut body = broken.clone();
    body.as_object_mut().unwrap().remove("checksum");
    broken["checksum"] = json!(hash("backup", &body).unwrap());
    assert!(r.restore(&canon(&broken).unwrap()).is_err());
    assert!(r.commit("{\"a\":1,\"a\":2}").is_err());
    r.restore(&canon(&f["setupBackup"]).unwrap()).unwrap();
    r.connection.pragma_update(None, "user_version", 2).unwrap();
    drop(r);
    let mut newer = tmp.repo("import.sqlite3");
    assert!(newer.read_only);
    reject(&mut newer, &f["setupAppend"], "UNSUPPORTED_VERSION");
    assert_eq!(newer.export().unwrap()["schemaVersion"], 2);
}
#[test]
fn independent_connections_exactly_one_writer_wins() {
    let f = fixture();
    let tmp = Temp::new();
    let mut r = tmp.repo("concurrent.sqlite3");
    commit(&mut r, &f["setupCreate"]);
    drop(r);
    let barrier = std::sync::Arc::new(std::sync::Barrier::new(2));
    let handles: Vec<_> = ["setupAppend", "stale"]
        .into_iter()
        .map(|key| {
            let path = tmp.0.join("concurrent.sqlite3");
            let raw = canon(&f[key]).unwrap();
            let barrier = barrier.clone();
            std::thread::spawn(move || {
                let mut r = Repository::open(&path).unwrap();
                barrier.wait();
                r.commit(&raw)
            })
        })
        .collect();
    let outcomes: Vec<_> = handles.into_iter().map(|h| h.join().unwrap()).collect();
    assert_eq!(outcomes.iter().filter(|r| r.is_ok()).count(), 1);
    assert!(outcomes
        .iter()
        .any(|r| r.as_ref().err().is_some_and(|e| e.contains("CONFLICT"))));
    assert_eq!(
        tmp.repo("concurrent.sqlite3").load("PX-SETUP").unwrap()["aggregate"]["revision"],
        2
    );
}
