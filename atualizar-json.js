import fs from 'fs';
import fetch from 'node-fetch';

async function atualizarJSON() {
  const url = 'https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/lotofacil.json';
  const caminho = './lotofacil_combinacoes_convertido.json';
  let atual = [];

  try {
    // Corrigir estrutura antiga se existir
    if (fs.existsSync(caminho)) {
      const conteudo = JSON.parse(fs.readFileSync(caminho));

      if (!Array.isArray(conteudo)) {
        const convertido = Object.entries(conteudo).map(([key, dezenas]) => ({
          concurso: parseInt(key),
          data: "",
          dezenas
        }));

        fs.writeFileSync(caminho, JSON.stringify(convertido, null, 2));
        console.log("🔄 JSON antigo convertido para formato compatível com Vercel.");
        atual = convertido;
      } else {
        atual = conteudo;
      }
    }

    // Buscar novos dados
    const json = await (await fetch(url)).json();
    const lista = Object.values(json).filter(item =>
      item && typeof item === 'object' && Array.isArray(item.dezenas)
    );

    const concursosExistentes = new Set(atual.map(item => item.concurso));
    let novos = 0;

    for (const item of lista) {
      const concurso = item.numero;
      const dezenas = item.dezenas.map(n => parseInt(n));
      const data = item.data;

      if (!concursosExistentes.has(concurso)) {
        atual.push({ concurso, data, dezenas });
        novos++;
        console.log(`✅ Adicionado concurso ${concurso}`);
      }
    }

    if (novos > 0) {
      atual.sort((a, b) => a.concurso - b.concurso);
      fs.writeFileSync(caminho, JSON.stringify(atual, null, 2));
      console.log(`🧾 ${novos} concursos adicionados ao JSON.`);
    } else {
      console.log("ℹ️ Nenhum concurso novo para adicionar.");
    }
  } catch (err) {
    console.error("❌ Erro ao atualizar JSON:", err.message);
    process.exit(1);
  }
}

atualizarJSON();"// trigger redeploy" 
