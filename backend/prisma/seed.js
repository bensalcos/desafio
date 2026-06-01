const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.chatMessage.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: { username: 'admin', password: adminPassword, role: 'ADMIN' }
  });

  const comercialPassword = await bcrypt.hash('comercial123', 10);
  await prisma.user.create({
    data: { username: 'comercial1', password: comercialPassword, role: 'COMERCIAL' }
  });

  const viewerPassword = await bcrypt.hash('viewer123', 10);
  await prisma.user.create({
    data: { username: 'viewer', password: viewerPassword, role: 'VIEWER' }
  });

  await prisma.opportunity.createMany({
    data: [
      {
        company_name: "Banco Andino",
        contact_name: "Laura Pérez",
        contact_email: "laura.perez@bancoandino.com",
        opportunity_name: "Asistente IA para atención interna",
        description: "Implementación de un asistente de IA para consultas internas sobre políticas, procesos y documentos.",
        estimated_value: 85000,
        currency: "USD",
        stage: "Diagnóstico",
        priority: "Alta",
        probability: 65,
        owner: "LABS IA",
        next_follow_up_date: new Date("2026-06-05T00:00:00Z"),
        last_interaction_summary: "Cliente solicitó revisar alcance técnico y modelo de seguridad.",
        ai_recommendation: "Priorizar levantamiento de restricciones de datos y arquitectura cloud/local."
      },
      {
        company_name: "Retail Nova",
        contact_name: "Carlos Ríos",
        contact_email: "carlos.rios@retailnova.com",
        opportunity_name: "Automatización de seguimiento comercial con IA",
        description: "Sistema para registrar oportunidades, generar recordatorios y sugerir acciones comerciales.",
        estimated_value: 42000,
        currency: "USD",
        stage: "Propuesta enviada",
        priority: "Media",
        probability: 55,
        owner: "LABS IA",
        next_follow_up_date: new Date("2026-06-10T00:00:00Z"),
        last_interaction_summary: "Se envió propuesta inicial y se espera feedback del área de innovación.",
        ai_recommendation: "Enviar caso de uso comparable y reforzar beneficios de eficiencia."
      },
      {
        company_name: "Minería Horizonte",
        contact_name: "Patricia Gómez",
        contact_email: "patricia.gomez@mhorizonte.com",
        opportunity_name: "Modelo predictivo de mantenimiento",
        description: "Proyecto de IA para predecir fallas de maquinaria crítica utilizando datos históricos.",
        estimated_value: 120000,
        currency: "USD",
        stage: "Negociación",
        priority: "Crítica",
        probability: 80,
        owner: "Sebastián Saavedra",
        next_follow_up_date: new Date("2026-06-02T00:00:00Z"),
        last_interaction_summary: "Cliente validó alcance técnico y solicitó propuesta económica final.",
        ai_recommendation: "Acelerar cierre comercial y preparar plan de implementación inicial."
      },
      {
        company_name: "Salud Integral",
        contact_name: "Andrés Molina",
        contact_email: "andres.molina@saludintegral.com",
        opportunity_name: "Chatbot clínico interno",
        description: "Asistente conversacional para soporte interno del personal médico y administrativo.",
        estimated_value: 65000,
        currency: "USD",
        stage: "Contactado",
        priority: "Alta",
        probability: 40,
        owner: "LABS IA",
        next_follow_up_date: new Date("2026-06-07T00:00:00Z"),
        last_interaction_summary: "Cliente interesado en capacidades de seguridad y compliance.",
        ai_recommendation: "Enviar arquitectura híbrida y enfoque de protección de datos."
      },
      {
        company_name: "Logística Global",
        contact_name: "María Fernández",
        contact_email: "maria.fernandez@logisticaglobal.com",
        opportunity_name: "Optimización logística con IA",
        description: "Sistema de análisis y recomendación de rutas utilizando modelos de optimización.",
        estimated_value: 98000,
        currency: "USD",
        stage: "Lead nuevo",
        priority: "Media",
        probability: 25,
        owner: "Carlos Bermúdez",
        next_follow_up_date: new Date("2026-06-12T00:00:00Z"),
        last_interaction_summary: "Se realizó reunión inicial con el área de operaciones.",
        ai_recommendation: "Profundizar en requerimientos de integración y fuentes de datos disponibles."
      }
    ]
  });

  console.log('Seed completed successfully.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
