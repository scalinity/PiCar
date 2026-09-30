// Strict parser adapted from the accepted local M1 hash-vector harness; no new serialization policy.
use serde::de::{self, Deserialize, Deserializer, MapAccess, SeqAccess, Visitor};
use serde_json::{Map, Number, Value};
use std::fmt;

struct Strict(Value);
impl<'de> Deserialize<'de> for Strict {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct V;
        impl<'de> Visitor<'de> for V {
            type Value = Strict;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, "strict JSON")
            }
            fn visit_bool<E: de::Error>(self, v: bool) -> Result<Strict, E> {
                Ok(Strict(Value::Bool(v)))
            }
            fn visit_unit<E: de::Error>(self) -> Result<Strict, E> {
                Ok(Strict(Value::Null))
            }
            fn visit_str<E: de::Error>(self, v: &str) -> Result<Strict, E> {
                Ok(Strict(Value::String(v.into())))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Strict, E> {
                Ok(Strict(Value::Number(v.into())))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Strict, E> {
                Ok(Strict(Value::Number(v.into())))
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Strict, E> {
                if !v.is_finite() {
                    return Err(E::custom("NONFINITE"));
                }
                if v == 0.0 && v.is_sign_negative() {
                    return Err(E::custom("NEGATIVE_ZERO"));
                }
                Ok(Strict(Value::Number(
                    Number::from_f64(v).ok_or_else(|| E::custom("NONFINITE"))?,
                )))
            }
            fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<Strict, A::Error> {
                let mut xs = Vec::new();
                while let Some(Strict(v)) = seq.next_element()? {
                    xs.push(v);
                }
                Ok(Strict(Value::Array(xs)))
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Strict, A::Error> {
                let mut xs = Map::new();
                while let Some(k) = map.next_key::<String>()? {
                    if xs.contains_key(&k) {
                        return Err(de::Error::custom("DUPLICATE_KEY"));
                    }
                    let Strict(v) = map.next_value()?;
                    xs.insert(k, v);
                }
                Ok(Strict(Value::Object(xs)))
            }
        }
        d.deserialize_any(V)
    }
}
fn check(v: &Value, key: &str) -> Result<(), String> {
    if let Some(n) = v.as_f64() {
        if [
            "revision",
            "expectedRevision",
            "sequence",
            "epoch",
            "servoEpoch",
            "definitionRevision",
            "predicateVersion",
            "contractVersion",
            "schemaVersion",
            "printedNumber",
            "printedPrimary",
            "printedBackup",
            "printedTotal",
            "byteLength",
            "tier",
            "lineStart",
            "lineEnd",
            "page",
            "servoEpoch",
        ]
        .contains(&key)
            && (n.fract() != 0.0 || n.abs() > 9007199254740991.0)
        {
            return Err("UNSAFE_INTEGER".into());
        }
    }
    match v {
        Value::Object(o) => {
            if o.get("unit") == Some(&Value::String("count".into()))
                && o.get("state") == Some(&Value::String("known".into()))
            {
                if let Some(n) = o.get("value").and_then(Value::as_f64) {
                    if n.fract() != 0.0 || n.abs() > 9007199254740991.0 {
                        return Err("UNSAFE_INTEGER".into());
                    }
                }
            }
            for (k, x) in o {
                check(x, k)?;
            }
        }
        Value::Array(xs) => {
            for x in xs {
                check(x, key)?;
            }
        }
        _ => {}
    }
    Ok(())
}
pub fn parse(input: &str) -> Result<Value, String> {
    let Strict(v) = serde_json::from_str::<Strict>(input).map_err(|e| {
        let s = e.to_string();
        if s.contains("NEGATIVE_ZERO") {
            "NEGATIVE_ZERO"
        } else if s.contains("DUPLICATE_KEY") {
            "DUPLICATE_KEY"
        } else if s.contains("surrogate")
            || s.contains("unicode code point")
            || s.contains("unexpected end of hex escape")
        {
            "LONE_SURROGATE"
        } else if s.contains("number out of range") || s.contains("NONFINITE") {
            "NONFINITE"
        } else {
            "INVALID_JSON"
        }
        .to_string()
    })?;
    check(&v, "")?;
    Ok(v)
}
