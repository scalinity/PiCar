import type { Context } from './commands';
import { validateContext } from './commands';
import type { CompiledGraph, RuntimeRegistry } from '../../generated/twin/contracts';
import { rawHash } from './hash';
// Lazy imports use the accepted source artifacts, never generated geometry or public evidence copies.
const registryRaw = () => import('../../../../digital-twin/validation/m2/runtime-registry.json?raw');
const graphLoaders = {
 rpi4: () => import('../../../../digital-twin/validation/m2/rpi4/compiled-graph.json?raw'),
 rpi5: () => import('../../../../digital-twin/validation/m2/rpi5/compiled-graph.json?raw'),
 'rpi-zero-2-w': () => import('../../../../digital-twin/validation/m2/rpi-zero-2-w/compiled-graph.json?raw'),
};
const hashes = { rpi4: 'b6d39dca86efd9fdb3fbaa5a1ac5054bc12ff4ff8bbbfc929a3787761591b17b', rpi5: '832c7b4cda68a069574f5555a6ad5969224ab35565dab79c91125bf8fd5eb82b', 'rpi-zero-2-w': '257e045b191fdff4ec7b04565c17d73231af3efc1f1cf47e837b9b928584f91e' };
export const contexts = new Map<string, Context>();
export async function acceptedContext(variant: string): Promise<Context> {
 if (!(variant in graphLoaders)) throw Error('UNSUPPORTED_VARIANT');
 const v = variant as keyof typeof graphLoaders;
 const [g, r, ledger, sourceLock] = await Promise.all([graphLoaders[v](), registryRaw(), import('../../../../docs/digital-twin/V40_ASSEMBLY_LEDGER.md?raw'), import('../../../tools/content-pipeline/documentation-source-lock.json?raw')]);
 if (rawHash(g.default) !== hashes[v] || rawHash(r.default) !== '231b5df34360f923428db992afa2595185c610f0862353c715955e8fbdd05214') throw Error('ACCEPTED_ARTIFACT_DRIFT');
 if(rawHash(ledger.default)!=='65e66d256d53fad48e086d44f99b8a91492f722734037d20a125660077a7657a')throw Error('PROCEDURE_SOURCE_DRIFT');
 const graph = JSON.parse(g.default) as CompiledGraph, registry = JSON.parse(r.default) as RuntimeRegistry;
 const procedureText = Object.fromEntries(ledger.default.split(/(?=^## \d\d\.)/m).slice(1).map(t => [t.match(/PX-V40-STEP-\d\d/)![0],t]));
 if (rawHash(sourceLock.default) !== '8ca58014ece62abf765ebdbd767d72611d69eaac39440e06b78769505fd6d0b3') throw Error('SOURCE_LOCK_DRIFT');
 const ctx: Context = { graph, registry, procedureText, evidenceHash: 'e00e7825f413a37edeb3c9ac47611fbf790480d6efb71337b5cd219bfd082d5c' };
 validateContext(ctx); contexts.set(graph.graphHash, ctx); return ctx;
}
