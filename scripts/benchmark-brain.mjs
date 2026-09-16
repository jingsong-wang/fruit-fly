import fs from 'node:fs';
import {parseGraph,SpikingBrain} from '../dist/brain/model.mjs';
const bytes=fs.readFileSync('dist/brain/data/connectome.bin');const graph=parseGraph(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));const manifest=JSON.parse(fs.readFileSync('dist/brain/data/manifest.json'));
const rows=[];
for(const condition of ['no-input','sugar-100Hz','sugar-150Hz','MN9-silenced']){
 const brain=new SpikingBrain(graph,manifest.sugarIndices,manifest.mn9Index,42);brain.silenceMotor=condition==='MN9-silenced';const start=performance.now();const result=brain.run(1000,condition==='no-input'?0:condition==='sugar-100Hz'?100:150);const elapsed=performance.now()-start;const row={condition,...result,wallMs:Math.round(elapsed),simulationSpeed:+(1000/elapsed).toFixed(3)};rows.push(row);console.log(row);
}
fs.mkdirSync('research/results',{recursive:true});fs.writeFileSync('research/results/benchmark.json',JSON.stringify({manifest:manifest.sourceCommit,rows},null,2));
if(rows[0].mn9Spikes!==0||rows[1].mn9Spikes===0||rows[3].mn9Spikes!==0)process.exitCode=1;
