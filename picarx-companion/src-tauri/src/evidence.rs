// Only generated evidence IDs resolve beneath this repository's app-data directory. No frontend path argument.
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{fs,io::Write,path::{Path,PathBuf}};
fn valid_id(id:&str)->bool { id.len()<=256&&id.strip_prefix("PX-").or_else(||id.strip_prefix("TEST-")).is_some_and(|s|!s.is_empty()&&s.bytes().all(|b|b.is_ascii_uppercase()||b.is_ascii_digit()||b==b'-')) }
pub fn path(root:&Path,session:&str,observation:&str)->Result<PathBuf,String>{
 if !valid_id(session)||!valid_id(observation){return Err("INVALID_EVIDENCE_ID".into());}
 let directory=root.join("evidence").join(session);
 for p in [root.to_path_buf(),root.join("evidence"),directory.clone()] {
  if fs::symlink_metadata(&p).is_ok_and(|m|m.file_type().is_symlink()){return Err("EVIDENCE_SYMLINK".into());}
 }
 let p=directory.join(observation);
 if fs::symlink_metadata(&p).is_ok_and(|m|m.file_type().is_symlink()){return Err("EVIDENCE_SYMLINK".into());}Ok(p)
}
pub fn media_type(bytes:&[u8])->Result<&'static str,String>{
 if bytes.is_empty()||bytes.len()>20*1024*1024{return Err("PHOTO_SIZE".into());}
 if bytes.starts_with(&[137,80,78,71,13,10,26,10]){Ok("image/png")}
 else if bytes.starts_with(&[255,216,255]){Ok("image/jpeg")}
 else if bytes.len()>=12&&&bytes[..4]==b"RIFF"&&&bytes[8..12]==b"WEBP"{Ok("image/webp")}
 else{Err("PHOTO_TYPE".into())}
}
pub fn verify(root:&Path,record:&Value)->Result<Vec<u8>,String>{
 let session=record["sessionId"].as_str().ok_or("INVALID_EVIDENCE_ID")?;let observation=record["id"].as_str().ok_or("INVALID_EVIDENCE_ID")?;
 let p=path(root,session,observation)?;let metadata=fs::metadata(&p).map_err(|_|"EVIDENCE_MISSING")?;
 if metadata.len()>20*1024*1024{return Err("PHOTO_SIZE".into());}
 let bytes=fs::read(p).map_err(|_|"EVIDENCE_MISSING")?;
 if record["file"]["sha256"]!=format!("{:x}",Sha256::digest(&bytes))||record["file"]["byteLength"]!=bytes.len()||record["file"]["mediaType"]!=media_type(&bytes)?{return Err("EVIDENCE_CORRUPT".into());}Ok(bytes)
}
pub fn copy(root:&Path,session:&str,observation:&str,bytes:&[u8])->Result<Value,String>{
 let media=media_type(bytes)?;let p=path(root,session,observation)?;fs::create_dir_all(p.parent().ok_or("EVIDENCE_PATH")?).map_err(|e|e.to_string())?;
 let mut file=fs::OpenOptions::new().create_new(true).write(true).open(&p).map_err(|e|format!("EVIDENCE_COPY: {e}"))?;
 let result=(||{file.write_all(bytes).map_err(|e|e.to_string())?;file.sync_all().map_err(|e|e.to_string())?;
 let copied=fs::read(&p).map_err(|e|e.to_string())?;if copied!=bytes{return Err("EVIDENCE_COPY_HASH".into());}
 for directory in [p.parent().ok_or("EVIDENCE_PATH")?,&root.join("evidence"),root]{fs::File::open(directory).and_then(|f|f.sync_all()).map_err(|e|e.to_string())?;}
 Ok(json!({"sha256":format!("{:x}",Sha256::digest(&copied)),"byteLength":copied.len(),"mediaType":media,"storageKey":format!("evidence/{session}/{observation}")}))})();
 if result.is_err(){let _=fs::remove_file(&p);}result
}
#[cfg(test)]mod tests{
 use super::*;
 #[test]fn copy_hash_collision_and_paths(){let root=std::env::temp_dir().join(format!("picar-studio-evidence-{}",std::process::id()));fs::create_dir_all(&root).unwrap();let bytes=[137,80,78,71,13,10,26,10,1,2,3];let file=copy(&root,"TEST-SESSION","TEST-PHOTO",&bytes).unwrap();let record=json!({"id":"TEST-PHOTO","sessionId":"TEST-SESSION","file":file});assert_eq!(verify(&root,&record).unwrap(),bytes);assert!(copy(&root,"TEST-SESSION","TEST-PHOTO",&bytes).is_err());assert!(path(&root,"../escape","TEST-PHOTO").is_err());assert!(copy(&root,"TEST-SESSION","TEST-BAD",b"bad").is_err());fs::remove_dir_all(root).unwrap();}
}
