"""Build a lossless outgoing CSR graph for the browser from the author's FlyWire 630 files."""
import argparse, csv, gzip, hashlib, json, pathlib, shutil, struct, sys, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'research/python-deps'))
import numpy as np
import pyarrow.parquet as pq
COMMIT = '91bdd1e7dcf193f3e7ca5a8933497fcef63b7960'
BASE = f'https://raw.githubusercontent.com/philshiu/Drosophila_brain_model/{COMMIT}/'
FILES = {'completeness.csv':'2023_03_23_completeness_630_final.csv', 'connectivity.parquet':'2023_03_23_connectivity_630_final.parquet', 'LICENSE-shiu':'LICENSE'}
HASHES = {'completeness.csv':'e6b71e17671a9bdb05f55e4bc6774640a1418cb7a05125e0fc994ad40f9bfdfb', 'connectivity.parquet':'94db8c650533bc36ffa3223f2e62325d5648b8d6bd31c3a4e1c804628c7557b3', 'LICENSE-shiu':'3621f6d6476189190e2960fa43f11b275ba4eca848fdac50a1ba2925de6223e8'}
SUGAR = ['720575940624963786','720575940630233916','720575940637568838','720575940638202345','720575940617000768','720575940630797113','720575940632889389','720575940621754367','720575940621502051','720575940640649691','720575940639332736','720575940616885538','720575940639198653','720575940620900446','720575940617937543','720575940632425919','720575940633143833','720575940612670570','720575940628853239','720575940629176663','720575940611875570']
MN9 = '720575940660219265'
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--download',action='store_true');args=parser.parse_args()
    source=ROOT/'research';source.mkdir(exist_ok=True)
    if args.download:
        for local,remote in FILES.items():
            print('Download',remote,flush=True);urllib.request.urlretrieve(BASE+remote,source/local)
        vendor=ROOT/'dist/brain/vendor';vendor.mkdir(parents=True,exist_ok=True)
        for remote,local in [('build/three.module.min.js','three.module.min.js'),('build/three.core.min.js','three.core.min.js'),('LICENSE','LICENSE')]:
            urllib.request.urlretrieve('https://cdn.jsdelivr.net/npm/three@0.180.0/'+remote,vendor/local)
    for local,expected in HASHES.items():
        assert hashlib.sha256((source/local).read_bytes()).hexdigest()==expected, f'Source checksum mismatch: {local}'
    with (source/'completeness.csv').open() as f: ids=[row[0] for row in list(csv.reader(f))[1:]]
    table=pq.read_table(source/'connectivity.parquet',columns=['Presynaptic_Index','Postsynaptic_Index','Excitatory x Connectivity'])
    src=table.column(0).to_numpy().astype(np.uint32);dst=table.column(1).to_numpy().astype(np.uint32);w=table.column(2).to_numpy()
    assert len(ids)==127400 and src.max()<len(ids) and dst.max()<len(ids)
    assert np.isfinite(w).all() and np.array_equal(w,w.astype(np.int16)), 'Weights must fit signed int16 losslessly'
    order=np.argsort(src,kind='stable');src=src[order];dst=dst[order];w=w[order].astype('<i2')
    ptr=np.zeros(len(ids)+1,dtype='<u4');ptr[1:]=np.cumsum(np.bincount(src,minlength=len(ids)))
    out=ROOT/'dist/brain/data';out.mkdir(parents=True,exist_ok=True)
    raw=out/'connectome.bin'
    with raw.open('wb') as f:
        f.write(struct.pack('<4I',0x464c5931,len(ids),len(dst),1));f.write(ptr.tobytes());f.write(dst.astype('<u4').tobytes());f.write(w.tobytes())
    with raw.open('rb') as f, (out/'connectome.bin.gz').open('wb') as target:
        with gzip.GzipFile(fileobj=target,mode='wb',compresslevel=6,mtime=0) as gz:shutil.copyfileobj(f,gz)
    idx={s:i for i,s in enumerate(ids)}
    manifest={'format':'FLY1-CSR-v1','neurons':len(ids),'connections':len(dst),'sourceCommit':COMMIT,'sourceRepository':'https://github.com/philshiu/Drosophila_brain_model','paper':'https://doi.org/10.1038/s41586-024-07763-9','dataset':'FlyWire 630 / Shiu et al. 2024','sugarIds':SUGAR,'sugarIndices':[idx[s] for s in SUGAR],'mn9Id':MN9,'mn9Index':idx[MN9],'binaryBytes':raw.stat().st_size,'gzipBytes':(out/'connectome.bin.gz').stat().st_size,'binarySha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'sourceHashes':{k:hashlib.sha256((source/k).read_bytes()).hexdigest() for k in FILES},'parameters':{'dtMs':0.1,'restMv':-52,'thresholdMv':-45,'tauMembraneMs':20,'tauSynapseMs':5,'refractoryMs':2.2,'delayMs':1.8,'weightMv':0.275,'poissonWeightMv':68.75},'limitations':['Full source connectivity retained; simplified point-neuron dynamics.','Original paper model port, not independently validated biological twin.','Body locomotion and leg gait are engineered; MN9 controls feeding only.','Separate browser-local simulation for each visitor, not a shared server.']}
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8');shutil.copyfile(source/'LICENSE-shiu',out/'LICENSE-shiu')
    print(json.dumps({k:manifest[k] for k in ['neurons','connections','mn9Index','binaryBytes','gzipBytes']},indent=2))
if __name__=='__main__':main()
