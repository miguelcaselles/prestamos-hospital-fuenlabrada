import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Hospitales de la Comunidad de Madrid
  const hospitals = [
    {
      name: "Hospital Universitario La Paz",
      email: "farmacia@hulp.es",
      address: "Paseo de la Castellana, 261, 28046 Madrid",
      phone: "917 27 70 00",
    },
    {
      name: "Hospital Universitario 12 de Octubre",
      email: "farmacia@h12o.es",
      address: "Av. de Córdoba, s/n, 28041 Madrid",
      phone: "913 90 80 00",
    },
    {
      name: "Hospital General Universitario Gregorio Marañón",
      email: "farmacia@hgugm.es",
      address: "Calle del Dr. Esquerdo, 46, 28007 Madrid",
      phone: "915 86 80 00",
    },
    {
      name: "Hospital Universitario Ramón y Cajal",
      email: "farmacia@hrc.es",
      address: "Ctra. de Colmenar Viejo, km. 9,100, 28034 Madrid",
      phone: "913 36 80 00",
    },
    {
      name: "Hospital Clínico San Carlos",
      email: "farmacia@hcsc.es",
      address: "Calle del Prof Martín Lagos, s/n, 28040 Madrid",
      phone: "913 30 30 00",
    },
    {
      name: "Hospital Universitario de Getafe",
      email: "farmacia@hgetafe.es",
      address: "Ctra. de Toledo, km 12,500, 28905 Getafe",
      phone: "916 83 93 60",
    },
    {
      name: "Hospital Universitario Príncipe de Asturias",
      email: "farmacia@hupa.es",
      address: "Ctra. Alcalá-Meco, s/n, 28805 Alcalá de Henares",
      phone: "918 87 81 00",
    },
    {
      name: "Hospital Universitario de Móstoles",
      email: "farmacia@hmostoles.es",
      address: "C/ Río Júcar, s/n, 28935 Móstoles",
      phone: "916 64 86 00",
    },
    {
      name: "Hospital Universitario Severo Ochoa",
      email: "farmacia@hseveroochoa.es",
      address: "Av. de Orellana, s/n, 28911 Leganés",
      phone: "914 81 80 00",
    },
    {
      name: "Hospital Universitario Infanta Sofía",
      email: "farmacia@hinfantasofia.es",
      address: "Paseo de Europa, 34, 28703 San Sebastián de los Reyes",
      phone: "911 91 40 00",
    },
    {
      name: "Hospital Universitario Infanta Leonor",
      email: "farmacia@hinfantaleonor.es",
      address: "C/ Gran Vía del Este, 80, 28031 Madrid",
      phone: "911 91 80 00",
    },
    {
      name: "Hospital Universitario del Sureste",
      email: "farmacia@hsureste.es",
      address: "Ronda del Sur, 10, 28500 Arganda del Rey",
      phone: "918 39 50 00",
    },
    {
      name: "Hospital Universitario del Henares",
      email: "farmacia@hhenares.es",
      address: "Av. de Marie Curie, 0, 28822 Coslada",
      phone: "911 91 20 00",
    },
    {
      name: "Hospital Universitario Rey Juan Carlos",
      email: "farmacia@hrjc.es",
      address: "C/ Gladiolo, s/n, 28933 Móstoles",
      phone: "914 81 62 00",
    },
    {
      name: "Hospital Universitario Infanta Cristina",
      email: "farmacia@hinfantacristina.es",
      address: "Av. 9 de Junio, 2, 28981 Parla",
      phone: "911 91 50 00",
    },
  ]

  for (const hospital of hospitals) {
    await prisma.hospital.upsert({
      where: { id: hospital.name.replace(/\s+/g, "-").toLowerCase().slice(0, 25) },
      update: hospital,
      create: hospital,
    })
  }
  console.log(`Created ${hospitals.length} hospitals`)

  // Medicamentos comunes hospitalarios
  const medications = [
    {
      name: "Omeprazol 20mg Cápsulas",
      nationalCode: "654321",
      presentation: "28 cápsulas",
      activeIngredient: "Omeprazol",
    },
    {
      name: "Amoxicilina 500mg Cápsulas",
      nationalCode: "712345",
      presentation: "30 cápsulas",
      activeIngredient: "Amoxicilina",
    },
    {
      name: "Paracetamol 1g Comprimidos",
      nationalCode: "698765",
      presentation: "40 comprimidos",
      activeIngredient: "Paracetamol",
    },
    {
      name: "Ibuprofeno 600mg Comprimidos",
      nationalCode: "687432",
      presentation: "40 comprimidos",
      activeIngredient: "Ibuprofeno",
    },
    {
      name: "Metformina 850mg Comprimidos",
      nationalCode: "701234",
      presentation: "50 comprimidos",
      activeIngredient: "Metformina",
    },
    {
      name: "Atorvastatina 20mg Comprimidos",
      nationalCode: "715678",
      presentation: "28 comprimidos",
      activeIngredient: "Atorvastatina",
    },
    {
      name: "Enoxaparina 40mg/0.4ml Jeringas",
      nationalCode: "660123",
      presentation: "10 jeringas precargadas",
      activeIngredient: "Enoxaparina sódica",
    },
    {
      name: "Insulina Glargina 100UI/ml",
      nationalCode: "672345",
      presentation: "5 plumas precargadas",
      activeIngredient: "Insulina glargina",
    },
    {
      name: "Piperacilina/Tazobactam 4g/0.5g IV",
      nationalCode: "690456",
      presentation: "12 viales",
      activeIngredient: "Piperacilina/Tazobactam",
    },
    {
      name: "Meropenem 1g IV",
      nationalCode: "695678",
      presentation: "10 viales",
      activeIngredient: "Meropenem",
    },
    {
      name: "Vancomicina 1g IV",
      nationalCode: "698012",
      presentation: "10 viales",
      activeIngredient: "Vancomicina",
    },
    {
      name: "Rituximab 500mg/50ml IV",
      nationalCode: "720456",
      presentation: "1 vial",
      activeIngredient: "Rituximab",
    },
    {
      name: "Pembrolizumab 100mg/4ml IV",
      nationalCode: "730789",
      presentation: "1 vial",
      activeIngredient: "Pembrolizumab",
    },
    {
      name: "Adalimumab 40mg Jeringa",
      nationalCode: "725012",
      presentation: "2 jeringas precargadas",
      activeIngredient: "Adalimumab",
    },
    {
      name: "Dexmedetomidina 200mcg/2ml IV",
      nationalCode: "710234",
      presentation: "5 ampollas",
      activeIngredient: "Dexmedetomidina",
    },
    {
      name: "Sugammadex 200mg/2ml IV",
      nationalCode: "718567",
      presentation: "10 viales",
      activeIngredient: "Sugammadex",
    },
    {
      name: "Levofloxacino 500mg Comprimidos",
      nationalCode: "705678",
      presentation: "10 comprimidos",
      activeIngredient: "Levofloxacino",
    },
    {
      name: "Ceftriaxona 1g IV",
      nationalCode: "693456",
      presentation: "10 viales",
      activeIngredient: "Ceftriaxona",
    },
    {
      name: "Tramadol 50mg Cápsulas",
      nationalCode: "667890",
      presentation: "60 cápsulas",
      activeIngredient: "Tramadol",
    },
    {
      name: "Morfina 10mg/ml Ampollas",
      nationalCode: "661234",
      presentation: "10 ampollas",
      activeIngredient: "Morfina",
    },
    {
      name: "Furosemida 20mg/2ml IV",
      nationalCode: "658901",
      presentation: "100 ampollas",
      activeIngredient: "Furosemida",
    },
    {
      name: "Noradrenalina 10mg/10ml IV",
      nationalCode: "662345",
      presentation: "10 ampollas",
      activeIngredient: "Noradrenalina",
    },
    {
      name: "Midazolam 15mg/3ml IV",
      nationalCode: "665678",
      presentation: "5 ampollas",
      activeIngredient: "Midazolam",
    },
    {
      name: "Propofol 1% 20ml IV",
      nationalCode: "668901",
      presentation: "5 ampollas",
      activeIngredient: "Propofol",
    },
    {
      name: "Heparina Sódica 5000UI/ml",
      nationalCode: "671234",
      presentation: "1 vial 5ml",
      activeIngredient: "Heparina sódica",
    },
  ]

  for (const medication of medications) {
    await prisma.medication.create({
      data: medication,
    })
  }
  console.log(`Created ${medications.length} medications`)

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
