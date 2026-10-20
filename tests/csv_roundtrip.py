"""Executa o exportador real e lê seu CSV com o parser independente do Python.

Sem argumento usa 100 registros fictícios. Caminho JSON opcional aceita backup
aplicacional privado; não publicar esse arquivo nem o CSV gerado.
Não comprova download no navegador nem abertura no Excel.
"""
import csv
import io
import json
from pathlib import Path
import subprocess
import sys

if len(sys.argv) > 1:
    source = json.loads(Path(sys.argv[1]).read_text())
    leads = source['tables']['leads']
else:
    leads = [dict(company=f'Empresa fictícia {i}: São João, "Visual"\nLinha 2',
                  city='Joinville', uf='SC', verification_status='identificada',
                  next_action='=HYPERLINK("https://example.com")',
                  contact_phone='+5547999991234') for i in range(100)]

adapter = r'''
const fs=require('node:fs'),vm=require('node:vm');
let blob;
class QAURL extends URL {static createObjectURL(b){blob=b;return 'blob:qa'}static revokeObjectURL(){}}
const root={innerHTML:'',addEventListener(){}};
const ctx={document:{getElementById:()=>root,body:{appendChild(){}},createElement:()=>({click(){},remove(){}})},window:{MAS_CONFIG:{}},URL:QAURL,Blob,crypto:require('node:crypto').webcrypto,setTimeout:()=>{}};
const source=fs.readFileSync(process.argv[1],'utf8');
vm.createContext(ctx);
vm.runInContext(source.replace('init();\n})();','window.qa={state,exportCSV};init();\n})();'),ctx);
ctx.window.qa.state.leads=JSON.parse(fs.readFileSync(0,'utf8'));
ctx.window.qa.exportCSV();
blob.arrayBuffer().then(bytes=>process.stdout.write(Buffer.from(bytes))).catch(e=>{console.error(e);process.exitCode=1});
'''
app = Path(__file__).resolve().parents[1] / 'app.js'
result = subprocess.run(['node', '-e', adapter, str(app)],
                        input=json.dumps(leads, ensure_ascii=False).encode(),
                        capture_output=True, check=True)
assert result.stdout.startswith(b'\xef\xbb\xbf'), 'BOM UTF-8 ausente'
reader = csv.DictReader(io.StringIO(result.stdout.decode('utf-8-sig'), newline=''))
rows = list(reader)
assert len(rows) == len(leads), 'Quantidade de linhas alterada'
assert len(reader.fieldnames) == 21 and len(set(reader.fieldnames)) == 21
for actual, original in zip(rows, leads):
    assert None not in actual, 'Quantidade incorreta de colunas'
    for field in reader.fieldnames:
        if field == 'score':
            expected = original.get('score_total')
        else:
            expected = original.get(field)
        expected = '' if expected is None else str(expected)
        if expected and expected[0] in '=+-@\t\r':
            expected = "'" + expected
        assert actual[field] == expected, f'Conteúdo alterado em {field}'
print(f'PASS CSV: {len(rows)} registros, 21 colunas únicas, UTF-8/BOM e conteúdo preservados')
