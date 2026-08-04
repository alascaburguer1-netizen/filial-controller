import asyncio
import aiohttp
import json
import re
import time
import ast

# Configurações
ARQUIVO = 'ruas.js'
LIMITE_CONCORRENCIA = 15 

async def reparar_rua(session, semaphore, item, contador, total):
    async with semaphore:
        try:
            # 1. Extração de Coordenadas (Mantém o que já existe)
            coords_match = re.search(r'(\(-?\d+.*?\))', item)
            coords = coords_match.group(1) if coords_match else ""
            
            # 2. Limpeza da string para identificar Nome, Bairro e CEP atual
            # Remove as coordenadas da análise temporariamente
            texto_sem_coords = re.sub(r'\s*\(-?\d+.*?\)', '', item).strip()
            partes = [p.strip() for p in texto_sem_coords.split(' - ')]
            
            nome_rua = partes[0]
            bairro = partes[1] if len(partes) > 1 else "SBC"
            
            # Verifica se já existe um CEP formatado com & &
            cep_existente_match = re.search(r'&(\d{5}-?\d{3})&', item)
            cep = cep_existente_match.group(1) if cep_existente_match else None

            # 3. Busca o CEP se ele não existir ou não estiver formatado
            if not cep:
                busca_nome = nome_rua.replace("Acesso ", "").strip()
                url = f"https://brasilapi.com.br/api/cep/v2/search?street={busca_nome}&city=Sao%20Bernardo%20do%20Campo"
                
                async with session.get(url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if isinstance(data, list) and len(data) > 0:
                            # Tenta validar pelo bairro
                            for r in data:
                                if bairro.lower() in r.get('bairro', '').lower():
                                    cep = r.get('cep')
                                    break
                            if not cep: cep = data[0].get('cep')
                        elif isinstance(data, dict):
                            cep = data.get('cep')

            contador['atual'] += 1
            if contador['atual'] % 10 == 0 or contador['atual'] == total:
                print(f"🔄 {contador['atual']}/{total} | Processando: {nome_rua}")

            # 4. Montagem Final com a formatação &cep&
            cep_formatado = f"&{cep}&" if cep else "&00000-000&"
            nova_string = f"{nome_rua} - {bairro} - {cep_formatado} {coords}".strip()
            return nova_string

        except Exception:
            contador['atual'] += 1
            return item

async def main():
    print("🚀 Iniciando reparo de CEPs com formatação &cep&...")
    start_time = time.time()

    with open(ARQUIVO, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_idx = content.find('[')
    end_idx = content.rfind(']') + 1
    lista_original = ast.literal_eval(content[start_idx:end_idx])
    
    semaphore = asyncio.Semaphore(LIMITE_CONCORRENCIA)
    contador = {'atual': 0}
    
    async with aiohttp.ClientSession() as session:
        tasks = [reparar_rua(session, semaphore, item, contador, len(lista_original)) for item in lista_original]
        nova_lista = await asyncio.gather(*tasks)

    with open(ARQUIVO, 'w', encoding='utf-8') as f:
        f.write("// Base de dados atualizada - Formato &cep&\n")
        f.write(f"const RUAS_SBC = {json.dumps(nova_lista, ensure_ascii=False, indent=2)};")

    print(f"\n🎯 Finalizado em {int(time.time() - start_time)}s!")

if __name__ == "__main__":
    asyncio.run(main())