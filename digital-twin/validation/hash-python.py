"""Only the M1-requested independent Python RFC8785 conformance harness.
No file edits, application behavior or CAD implementation.
"""
import hashlib
import json
import math
import sys
import rfc8785


def pairs(values):
    out = {}
    for key, value in values:
        if key in out:
            raise ValueError('DUPLICATE_KEY')
        out[key] = value
    return out


def check(value, key=''):
    if isinstance(value, str):
        if any(0xd800 <= ord(c) <= 0xdfff for c in value):
            raise ValueError('LONE_SURROGATE')
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        if not math.isfinite(value):
            raise ValueError('NONFINITE')
        if value == 0 and math.copysign(1, value) < 0:
            raise ValueError('NEGATIVE_ZERO')
        if key in ["revision","definitionRevision","predicateVersion","contractVersion","schemaVersion","printedNumber","printedPrimary","printedBackup","printedTotal","byteLength","tier","lineStart","lineEnd","page","servoEpoch"]:
            if int(value) != value or abs(value) > 9007199254740991:
                raise ValueError('UNSAFE_INTEGER')
    elif isinstance(value, dict):
        if value.get('unit') == 'count' and value.get('state') == 'known':
            number = value.get('value')
            if int(number) != number or abs(number) > 9007199254740991:
                raise ValueError('UNSAFE_INTEGER')
        for k, v in value.items():
            check(k)
            check(v, k)
    elif isinstance(value, list):
        for v in value:
            check(v, key)


def normalize(value):
    if isinstance(value, dict):
        for k, v in value.items():
            normalize(v)
            if k == 'evidenceRefs':
                v.sort()
    elif isinstance(value, list):
        for v in value:
            normalize(v)


def strict_integer(text):
    number = int(text)
    if number == 0 and text.startswith('-'):
        raise ValueError('NEGATIVE_ZERO')
    return number if abs(number) <= 9007199254740991 else float(text)


def bad_constant(_):
    raise ValueError('INVALID_JSON')


with open(sys.argv[1], encoding='utf-8') as stream:
    corpus = json.load(stream)
results = []
for vector in corpus['valid'] + corpus['invalid']:
    try:
        value = json.loads(vector['input'], object_pairs_hook=pairs, parse_constant=bad_constant, parse_int=strict_integer)
        check(value)
        normalize(value)
        canonical = rfc8785.dumps(value)
        results.append(dict(id=vector['id'], status='accepted', canonical=canonical.decode('utf-8'),
                            hash=hashlib.sha256(b'picar-v2:test-vector\n' + canonical).hexdigest()))
    except (ValueError, rfc8785.CanonicalizationError) as error:
        code = str(error) if str(error) in ['DUPLICATE_KEY', 'INVALID_JSON', 'LONE_SURROGATE', 'NEGATIVE_ZERO', 'NONFINITE', 'UNSAFE_INTEGER'] else 'INVALID_JSON'
        results.append(dict(id=vector['id'], status='rejected', error=code))
print(json.dumps(results, ensure_ascii=False))
