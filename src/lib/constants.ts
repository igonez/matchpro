/**
 * Constantes globais e links de suporte da ArenaFitPro
 */

export const CONTACT_CONFIG = {
  // Link do Grupo de WhatsApp / Comunidade VIP de Treinadores (ex: https://chat.whatsapp.com/...)
  // Configure via variável de ambiente NEXT_PUBLIC_WHATSAPP_GROUP_URL na Vercel ou adicione aqui
  vipWhatsappGroupUrl: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || '',

  // Telefone oficial para canal direto (apenas se desejado)
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '5512991647211',

  // E-mail de contato oficial
  supportEmail: 'contato@arenafitpro.com.br',

  // Gerador de link direto de WhatsApp para atendimento
  getDirectWhatsappUrl: (message?: string) => {
    const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '5512991647211';
    const text = message ? encodeURIComponent(message) : encodeURIComponent('Olá, tenho interesse na ArenaFitPro.');
    return `https://wa.me/${phone}?text=${text}`;
  },
};
