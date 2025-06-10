const extractDataFromPDF = (pdfText, type) => {
  const unidadeMatch = pdfText.match(/Unidade:\s*([^\n]+)/i);
  const medidorMatch = pdfText.match(/Medidor:\s*(\d+)/i);
  const enderecoMatch = pdfText.match(/Endereço:\s*([^\n]+)/i);
  
  const valores = pdfText.match(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})/g) || [];
  
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  
  const monthlyData = {};
  meses.forEach((mes, index) => {
    if (valores[index]) {
      const valorNumerico = parseFloat(valores[index]
        .replace("R$", "")
        .replace(".", "")
        .replace(",", "."));
      
      monthlyData[mes] = {
        valor: valores[index],
        valorNumerico,
        demanda: 0,
        tributos: 0,
        total: 0
      };
    }
  });
  
  const valoresNumericos = Object.values(monthlyData).map(item => item.valorNumerico);
  const totalValor = valoresNumericos.reduce((sum, val) => sum + val, 0);
  const demandaMedia = totalValor / (valoresNumericos.length || 1);
  
  Object.keys(monthlyData).forEach(mes => {
    monthlyData[mes].tributos = monthlyData[mes].valorNumerico * 0.21;
    monthlyData[mes].demanda = demandaMedia * 0.7;
    monthlyData[mes].total = monthlyData[mes].valorNumerico + monthlyData[mes].tributos + monthlyData[mes].demanda;
  });
  
  return {
    unidade: unidadeMatch ? unidadeMatch[1].trim() : "Unidade não identificada",
    medidor: medidorMatch ? medidorMatch[1] : "N/A",
    endereco: enderecoMatch ? enderecoMatch[1].trim() : "Endereço não encontrado",
    meses: monthlyData,
    totalGeral: totalValor,
    demandaMedia,
    tipo: type
  };
};

export { extractDataFromPDF }; 