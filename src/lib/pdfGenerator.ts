import { jsPDF } from "jspdf";
import { Client } from "@/context/CRMContext";

export function generateBriefingPDF(client: Client, briefing: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 20;
      addPageHeader();
    }
  };

  const addPageHeader = () => {
    doc.setDrawColor(124, 58, 237); // violet-600
    doc.setLineWidth(1);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // --- Document Header ---
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(margin, y, contentWidth, 26, "F");

  doc.setTextColor(167, 139, 250); // violet-400
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("DEVCRM — Briefing de Reunião", margin + 5, y + 9);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Cliente: ${client.name} (${client.company})`, margin + 5, y + 17);

  doc.setTextColor(161, 161, 170); // zinc-400
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  doc.text(`Data do documento: ${dateStr}`, pageWidth - margin - 5, y + 17, { align: "right" });

  y += 32;

  // Contact Info Strip
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(244, 244, 245);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "FD");

  doc.setTextColor(63, 63, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`E-mail: ${client.email}   |   WhatsApp: ${client.whatsapp}`, margin + 4, y + 7.5);
  y += 18;

  // Helper for Section Titles
  const addSectionTitle = (title: string) => {
    checkPageBreak(12);
    doc.setFillColor(124, 58, 237); // violet-600
    doc.rect(margin, y, 3, 7, "F");

    doc.setTextColor(24, 24, 27);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, margin + 6, y + 5.5);
    y += 10;
  };

  // Helper for Field rendering
  const addField = (label: string, value: string | string[] | boolean | undefined, isQuestion = false) => {
    let displayVal = "";
    if (Array.isArray(value)) {
      displayVal = value.length > 0 ? value.join(", ") : "Nenhum selecionado";
    } else if (typeof value === "boolean") {
      displayVal = value ? "Sim" : "Não";
    } else {
      displayVal = value && value.trim() ? value.trim() : "Não especificado";
    }

    const labelText = isQuestion ? `• ${label}` : `${label}:`;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(isQuestion ? 109 : 39, isQuestion ? 40 : 39, isQuestion ? 217 : 42); // violet if question

    const splitLabel = doc.splitTextToSize(labelText, contentWidth);
    checkPageBreak(splitLabel.length * 4.5 + 4);

    doc.text(splitLabel, margin + 2, y);
    y += splitLabel.length * 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(63, 63, 70); // zinc-700

    const splitVal = doc.splitTextToSize(displayVal, contentWidth - 4);
    checkPageBreak(splitVal.length * 4.5 + 4);

    doc.text(splitVal, margin + 4, y);
    y += splitVal.length * 4.5 + 3;
  };

  // 1. Conhecendo o negócio
  addSectionTitle("1. Conhecendo o Negócio");
  addField("Nome da Empresa / Marca", briefing.businessName || client.company);
  addField("Tempo de Mercado", briefing.businessTime);
  addField("Diferencial da Empresa", briefing.differentiator);
  addField("Principal Produto / Serviço", briefing.mainProduct);
  addField("Principais Clientes", briefing.mainCustomers);
  addField("História da Empresa", briefing.history, true);
  addField("Essência / O que entender da Marca", briefing.brandEssence, true);
  y += 4;

  // 2. Objetivo do site
  addSectionTitle("2. Objetivo do Site");
  addField("Objetivos Principais", briefing.goals);
  if (briefing.goalsOther) addField("Outro Objetivo", briefing.goalsOther);
  addField("Expectativas com o Site", briefing.expectations, true);
  addField("Faltas na Presença Digital Atual", briefing.missingDigital, true);
  y += 4;

  // 3. Público-alvo
  addSectionTitle("3. Público-Alvo");
  addField("Público a Atingir", briefing.targetAudience);
  addField("Região de Atendimento", briefing.targetRegion);
  addField("Perfil dos Clientes", briefing.targetProfile);
  addField("Quem normalmente procura a empresa", briefing.whoLooksFor, true);
  addField("Tipo de cliente que deseja conquistar mais", briefing.whoToConquer, true);
  y += 4;

  // 4. Estrutura do site
  addSectionTitle("4. Estrutura do Site");
  addField("Páginas Necessárias", briefing.pages);
  addField("Informações Essenciais", briefing.essentialInfo, true);
  addField("Sites de Referência / Inspiração", briefing.referencesSites, true);
  y += 4;

  // 5. Conteúdo disponível
  addSectionTitle("5. Conteúdo Disponível");
  addField("Materiais Disponíveis", briefing.materials);
  addField("Precisa de Ajuda para Organizar Conteúdo", briefing.needHelpContent);
  addField("Status dos Fotos/Materiais", briefing.materialsStatus, true);
  y += 4;

  // 6. Identidade visual
  addSectionTitle("6. Identidade Visual");
  addField("Cores da Marca", briefing.brandColors);
  addField("Estilo Desejado", briefing.visualStyle);
  addField("Cor/Estilo que Representa a Empresa", briefing.colorsRepresentation, true);
  addField("Referências Visuais Gostadas", briefing.visualReferences, true);
  y += 4;

  // 7. Funcionalidades
  addSectionTitle("7. Funcionalidades");
  addField("Recursos / Funcionalidades", briefing.features);
  addField("Função Específica Desejada", briefing.featuresSpecific, true);
  addField("Ação Necessária do Cliente no Site", briefing.clientAction, true);
  y += 4;

  // 8. Hospedagem e domínio
  addSectionTitle("8. Hospedagem & Domínio");
  addField("Domínio Existente", briefing.hasDomain);
  addField("Hospedagem Existente", briefing.hasHosting);
  addField("Opção de Contratação", briefing.domainHostingOption);
  addField("Observações de Hospedagem", briefing.domainHostingNotes);
  y += 4;

  // 9. Prazo
  addSectionTitle("9. Prazo");
  addField("Data Desejada para Lançamento", briefing.desiredDate);
  addField("Eventos / Campanhas Específicas", briefing.launchEvents, true);
  y += 4;

  // 10. Investimento
  addSectionTitle("10. Investimento & Proposta");
  addField("Itens da Proposta Comercial", briefing.proposalItems);
  addField("Acordo / Pergunta sobre Investimento", briefing.investmentNotes, true);
  y += 4;

  // 11. Próximos passos
  addSectionTitle("11. Próximos Passos");
  addField("Etapas do Fluxo", briefing.nextSteps);
  addField("Notas Finais de Acompanhamento", briefing.nextStepsNotes);

  // Footer with Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `Página ${i} de ${totalPages} — Gerado via DevCRM`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Save PDF
  const cleanName = (client.name || "cliente").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`briefing_${cleanName}.pdf`);
}
