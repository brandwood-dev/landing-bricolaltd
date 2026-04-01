import { jsPDF } from 'jspdf'

interface ContractData {
  referenceId: string
  toolName: string
  toolDescription: string
  toolBrand: string
  toolModel: string
  condition: string
  ownerName: string
  ownerAddress: string
  ownerEmail: string
  ownerPhone: string
  renterName: string
  renterAddress: string
  renterEmail: string
  renterPhone: string
  startDate: string
  endDate: string
  pickupHour: string
  handoverLocation: string
  returnLocation: string
  totalPrice: number
  rentalDuration: string
  deposit: number
}

export const generateRentalContract = (data: ContractData): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 25
  let yPosition = 40

  // Helper function to add separator line
  const addSeparatorLine = (y: number) => {
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
  }

  // Helper function to start new page with separator
  const startNewPage = () => {
    doc.addPage()
    yPosition = 40
    addSeparatorLine(30)
    yPosition += 15
  }

  // Reference at the top
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text(`Reference: ${data.referenceId}`, margin, yPosition)
  yPosition += 20

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('TOOL RENTAL CONTRACT', pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 20

  // Header - Between the undersigned
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Between the undersigned', margin, yPosition)
  yPosition += 15

  // Owner details
  doc.setFont(undefined, 'bold')
  doc.text('The Owner:', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(`${data.ownerName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Address: ${data.ownerAddress}`, margin, yPosition)
  yPosition += 6
  doc.text(`Phone: ${data.ownerPhone}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${data.ownerEmail}`, margin, yPosition)
  yPosition += 15

  doc.setFont(undefined, 'bold')
  doc.text('AND', margin, yPosition)
  yPosition += 15

  // Renter details
  doc.setFont(undefined, 'bold')
  doc.text('The Renter:', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(`${data.renterName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Address: ${data.renterAddress}`, margin, yPosition)
  yPosition += 6
  doc.text(`Phone: ${data.renterPhone}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${data.renterEmail}`, margin, yPosition)
  yPosition += 20

  // Article 1 - Purpose of the Contract
  doc.setFont(undefined, 'bold')
  doc.text('Article 1 - Purpose of the Contract', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    'The purpose of this contract is to rent the following tool:',
    margin,
    yPosition,
  )
  yPosition += 10
  doc.text(`Designation : ${data.toolName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Brand : ${data.toolBrand}`, margin, yPosition)
  yPosition += 6
  doc.text(`Model : ${data.toolModel}`, margin, yPosition)
  yPosition += 6
  doc.text(`Condition : ${data.condition}`, margin, yPosition)
  yPosition += 6

  doc.text(
    `-----------------------------------------------------------------------------`,
    margin,
    yPosition,
  )
  yPosition += 15
  // Add page number in footer
  const totalPages = 3

  doc.setPage(1)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Page 1 of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    startNewPage()
  }
  // Article 2 - Rental Duration
  doc.setFont(undefined, 'bold')
  doc.text('Article 2 - Rental Duration', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    `Start Date: ${data.startDate} at ${data.pickupHour}`,
    margin,
    yPosition,
  )
  yPosition += 6
  doc.text(`End Date: ${data.endDate} at ${data.pickupHour}`, margin, yPosition)
  yPosition += 6
  doc.text(`Handover Location: ${data.handoverLocation}`, margin, yPosition)
  yPosition += 6
  doc.text(`Return Location: ${data.returnLocation}`, margin, yPosition)
  yPosition += 15

  // Article 3 - Price and Payment Terms
  doc.setFont(undefined, 'bold')
  doc.text('Article 3 - Price and Payment Terms', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    `Rental Price: ${data.totalPrice}€ for ${data.rentalDuration}`,
    margin,
    yPosition,
  )
  yPosition += 6
  doc.text(`Deposit: ${data.deposit}€`, margin, yPosition)
  yPosition += 6
  doc.text('Payment Method: Via the Bricola platform', margin, yPosition)
  yPosition += 15

  // Article 4 - Renter's Obligations
  doc.setFont(undefined, 'bold')
  doc.text("Article 4 - Renter's Obligations", margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const renterObligations = [
    'Use the tool according to its intended purpose',
    'Take all necessary precautions to preserve it',
    'Do not lend or sublet the tool to a third party',
    'Immediately report any malfunction',
    'Return the tool in the same condition it was received',
    'Respect the agreed return times',
  ]
  renterObligations.forEach((obligation) => {
    doc.text(`• ${obligation}`, margin, yPosition)
    yPosition += 6
  })
  yPosition += 10

  // Article 5 - Owner's Obligations
  doc.setFont(undefined, 'bold')
  doc.text("Article 5 - Owner's Obligations", margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const ownerObligations = [
    'Deliver the tool in perfect working condition',
    'Provide usage instructions if necessary',
    'Ensure the tool matches its description',
    'Be available for handover and return',
  ]
  ownerObligations.forEach((obligation) => {
    doc.text(`• ${obligation}`, margin, yPosition)
    yPosition += 6
  })
  yPosition += 10

  // Article 6 - Insurance and Liability
  doc.setFont(undefined, 'bold')
  doc.text('Article 6 - Insurance and Liability', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    'The tool is covered by Bricola insurance during the rental period for:',
    margin,
    yPosition,
  )
  yPosition += 8
  const insuranceCoverage = [
    'Accidental damage',
    'Theft (under certain conditions)',
    'Damage caused by a defect in the tool',
  ]
  insuranceCoverage.forEach((coverage) => {
    doc.text(`• ${coverage}`, margin, yPosition)
    yPosition += 6
  })
  yPosition += 6
  const liabilityText = doc.splitTextToSize(
    'The renter remains responsible for damage resulting from improper use or gross negligence.',
    pageWidth - 2 * margin,
  )
  doc.text(liabilityText, margin, yPosition)
  yPosition += liabilityText.length * 6 + 10

  // Add page number in footer
  doc.setPage(2)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Page 2 of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    startNewPage()
  }

  // Article 7 - Dispute Resolution
  doc.setFont(undefined, 'bold')
  doc.text('Article 7 - Dispute Resolution', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const disputeText = doc.splitTextToSize(
    'In case of a dispute, the parties agree to seek an amicable solution. If this fails, Bricola customer service will intervene in mediation. Unresolved disputes will be submitted to the competent courts.',
    pageWidth - 2 * margin,
  )
  doc.text(disputeText, margin, yPosition)
  yPosition += disputeText.length * 6 + 20

  // Signatures
  doc.setFont(undefined, 'bold')
  doc.text("Owner's Signature", margin, yPosition)
  doc.text("Renter's Signature", pageWidth - margin - 80, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text('[Signature and date]', margin, yPosition)
  doc.text('[Signature and date]', pageWidth - margin - 80, yPosition)
  yPosition += 20

  // Usage Instructions
  doc.setFont(undefined, 'bold')
  doc.text('Usage Instructions', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const instructions = [
    '1. Complete all sections marked in brackets with the appropriate information.',
    '2. Ensure all parties have read and understood the contract before signing.',
    '3. Keep a signed copy of the contract for the entire rental period.',
    '4. If you have any questions, contact Bricola customer service.',
  ]
  instructions.forEach((instruction) => {
    const splitInstruction = doc.splitTextToSize(
      instruction,
      pageWidth - 2 * margin,
    )
    doc.text(splitInstruction, margin, yPosition)
    yPosition += splitInstruction.length * 6 + 2
  })
  doc.setPage(3)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Page 3 of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Download the PDF
  doc.save(`rental-contract-${data.referenceId}.pdf`)
}

export const generateRentalContractFr = (data: ContractData): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 25
  let yPosition = 40

  // Helper function to add separator line
  const addSeparatorLine = (y: number) => {
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
  }

  // Helper function to start new page with separator
  const startNewPage = () => {
    doc.addPage()
    yPosition = 40
    addSeparatorLine(30)
    yPosition += 15
  }

  // Reference at the top
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text(`Référence: ${data.referenceId}`, margin, yPosition)
  yPosition += 20

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text("CONTRAT DE LOCATION D'OUTIL", pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 20

  // Header - Between the undersigned
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Entre les soussignés', margin, yPosition)
  yPosition += 15

  // Owner details
  doc.setFont(undefined, 'bold')
  doc.text('Le Propriétaire:', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(`${data.ownerName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Adresse: ${data.ownerAddress}`, margin, yPosition)
  yPosition += 6
  doc.text(`Téléphone: ${data.ownerPhone}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${data.ownerEmail}`, margin, yPosition)
  yPosition += 15

  doc.setFont(undefined, 'bold')
  doc.text('ET', margin, yPosition)
  yPosition += 15

  // Renter details
  doc.setFont(undefined, 'bold')
  doc.text('Le Locataire:', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(`${data.renterName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Adresse: ${data.renterAddress}`, margin, yPosition)
  yPosition += 6
  doc.text(`Téléphone: ${data.renterPhone}`, margin, yPosition)
  yPosition += 6
  doc.text(`Email: ${data.renterEmail}`, margin, yPosition)
  yPosition += 20

  // Article 1 - Purpose of the Contract
  doc.setFont(undefined, 'bold')
  doc.text('Article 1 - Objet du Contrat', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    "L'objet de ce contrat est la location de l'outil suivant:",
    margin,
    yPosition,
  )
  yPosition += 10
  doc.text(`Désignation : ${data.toolName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Marque : ${data.toolBrand}`, margin, yPosition)
  yPosition += 6
  doc.text(`Modèle : ${data.toolModel}`, margin, yPosition)
  yPosition += 6
  doc.text(`État : ${data.condition}`, margin, yPosition)
  yPosition += 6

  doc.text(
    `-----------------------------------------------------------------------------`,
    margin,
    yPosition,
  )
  yPosition += 15
  // Add page number in footer
  const totalPages = 3

  doc.setPage(1)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Page 1 sur ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    startNewPage()
  }
  // Article 2 - Rental Duration
  doc.setFont(undefined, 'bold')
  doc.text('Article 2 - Durée de la Location', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    `Date de début: ${data.startDate} à ${data.pickupHour}`,
    margin,
    yPosition,
  )
  yPosition += 6
  doc.text(
    `Date de fin: ${data.endDate} à ${data.pickupHour}`,
    margin,
    yPosition,
  )
  yPosition += 6
  doc.text(`Lieu de remise: ${data.handoverLocation}`, margin, yPosition)
  yPosition += 6
  doc.text(`Lieu de restitution: ${data.returnLocation}`, margin, yPosition)
  yPosition += 15

  // Article 3 - Price and Payment Terms
  doc.setFont(undefined, 'bold')
  doc.text('Article 3 - Prix et Modalités de Paiement', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    `Prix de la location: ${data.totalPrice}€ pour ${data.rentalDuration}`,
    margin,
    yPosition,
  )
  yPosition += 6
  doc.text(`Caution: ${data.deposit}€`, margin, yPosition)
  yPosition += 6
  doc.text('Mode de paiement: Via la plateforme Bricola', margin, yPosition)
  yPosition += 15

  // Article 4 - Renter's Obligations
  doc.setFont(undefined, 'bold')
  doc.text('Article 4 - Obligations du Locataire', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const renterObligations = [
    "Utiliser l'outil conformément à sa destination",
    'Prendre toutes les précautions nécessaires pour le préserver',
    "Ne pas prêter ou sous-louer l'outil à un tiers",
    'Signaler immédiatement tout dysfonctionnement',
    "Restituer l'outil dans l'état où il a été reçu",
    'Respecter les heures de restitution convenues',
  ]
  renterObligations.forEach((obligation) => {
    doc.text(`• ${obligation}`, margin, yPosition)
    yPosition += 6
  })
  yPosition += 10

  // Article 5 - Owner's Obligations
  doc.setFont(undefined, 'bold')
  doc.text('Article 5 - Obligations du Propriétaire', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const ownerObligations = [
    "Délivrer l'outil en parfait état de marche",
    "Fournir les instructions d'utilisation si nécessaire",
    "S'assurer que l'outil correspond à sa description",
    'Être disponible pour la remise et la restitution',
  ]
  ownerObligations.forEach((obligation) => {
    doc.text(`• ${obligation}`, margin, yPosition)
    yPosition += 6
  })
  yPosition += 10

  // Article 6 - Insurance and Liability
  doc.setFont(undefined, 'bold')
  doc.text('Article 6 - Assurance et Responsabilité', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    "L'outil est couvert par l'assurance Bricola pendant la période de location pour:",
    margin,
    yPosition,
  )
  yPosition += 8
  const insuranceCoverage = [
    'Dommages accidentels',
    'Vol (sous certaines conditions)',
    "Dommages causés par un défaut de l'outil",
  ]
  insuranceCoverage.forEach((coverage) => {
    doc.text(`• ${coverage}`, margin, yPosition)
    yPosition += 6
  })
  yPosition += 6
  const liabilityText = doc.splitTextToSize(
    "Le locataire reste responsable des dommages résultant d'une mauvaise utilisation ou d'une négligence grave.",
    pageWidth - 2 * margin,
  )
  doc.text(liabilityText, margin, yPosition)
  yPosition += liabilityText.length * 6 + 10

  // Add page number in footer
  doc.setPage(2)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Page 2 sur ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    startNewPage()
  }

  // Article 7 - Dispute Resolution
  doc.setFont(undefined, 'bold')
  doc.text('Article 7 - Résolution des Litiges', margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const disputeText = doc.splitTextToSize(
    "En cas de litige, les parties s'engagent à rechercher une solution à l'amiable. En cas d'échec, le service client de Bricola interviendra en médiation. Les litiges non résolus seront soumis aux tribunaux compétents.",
    pageWidth - 2 * margin,
  )
  doc.text(disputeText, margin, yPosition)
  yPosition += disputeText.length * 6 + 20

  // Signatures
  doc.setFont(undefined, 'bold')
  doc.text('Signature du Propriétaire', margin, yPosition)
  doc.text('Signature du Locataire', pageWidth - margin - 80, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text('[Signature et date]', margin, yPosition)
  doc.text('[Signature et date]', pageWidth - margin - 80, yPosition)
  yPosition += 20

  // Usage Instructions
  doc.setFont(undefined, 'bold')
  doc.text("Instructions d'Utilisation", margin, yPosition)
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const instructions = [
    '1. Complétez toutes les sections entre crochets avec les informations appropriées.',
    '2. Assurez-vous que toutes les parties ont lu et compris le contrat avant de signer.',
    '3. Conservez une copie signée du contrat pendant toute la durée de la location.',
    '4. Si vous avez des questions, contactez le service client de Bricola.',
  ]
  instructions.forEach((instruction) => {
    const splitInstruction = doc.splitTextToSize(
      instruction,
      pageWidth - 2 * margin,
    )
    doc.text(splitInstruction, margin, yPosition)
    yPosition += splitInstruction.length * 6 + 2
  })
  doc.setPage(3)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Page 3 sur ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Download the PDF
  doc.save(`contrat-location-${data.referenceId}.pdf`)
}

export const generateRentalContractAr = (data: ContractData): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 25
  let yPosition = 40

  // Helper function to add separator line
  const addSeparatorLine = (y: number) => {
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
  }

  // Helper function to start new page with separator
  const startNewPage = () => {
    doc.addPage()
    yPosition = 40
    addSeparatorLine(30)
    yPosition += 15
  }

  // Reference at the top
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text(`المرجع: ${data.referenceId}`, margin, yPosition)
  yPosition += 20

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('عقد إيجار أداة', pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 20

  // Header - Between the undersigned
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('بين الموقعين أدناه', margin, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Owner details
  doc.setFont(undefined, 'bold')
  doc.text('المالك:', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(`${data.ownerName}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`العنوان: ${data.ownerAddress}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`الهاتف: ${data.ownerPhone}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`البريد الإلكتروني: ${data.ownerEmail}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 15

  doc.setFont(undefined, 'bold')
  doc.text('و', margin, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Renter details
  doc.setFont(undefined, 'bold')
  doc.text('المستأجر:', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(`${data.renterName}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`العنوان: ${data.renterAddress}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`الهاتف: ${data.renterPhone}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`البريد الإلكتروني: ${data.renterEmail}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 20

  // Article 1 - Purpose of the Contract
  doc.setFont(undefined, 'bold')
  doc.text('المادة 1 - الغرض من العقد', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text('الغرض من هذا العقد هو تأجير الأداة التالية:', margin, yPosition, {
    align: 'right',
  })
  yPosition += 10
  doc.text(`التسمية : ${data.toolName}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`العلامة التجارية : ${data.toolBrand}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`الموديل : ${data.toolModel}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`الحالة : ${data.condition}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6

  doc.text(
    `-----------------------------------------------------------------------------`,
    margin,
    yPosition,
  )
  yPosition += 15
  // Add page number in footer
  const totalPages = 3

  doc.setPage(1)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`صفحة 1 من ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    startNewPage()
  }
  // Article 2 - Rental Duration
  doc.setFont(undefined, 'bold')
  doc.text('المادة 2 - مدة الإيجار', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    `تاريخ البدء: ${data.startDate} في ${data.pickupHour}`,
    margin,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(
    `تاريخ الانتهاء: ${data.endDate} في ${data.pickupHour}`,
    margin,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(`مكان التسليم: ${data.handoverLocation}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(`مكان الإرجاع: ${data.returnLocation}`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Article 3 - Price and Payment Terms
  doc.setFont(undefined, 'bold')
  doc.text('المادة 3 - السعر وشروط الدفع', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    `سعر الإيجار: ${data.totalPrice}€ لمدة ${data.rentalDuration}`,
    margin,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(`التأمين: ${data.deposit}€`, margin, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text('طريقة الدفع: عبر منصة Bricola', margin, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Article 4 - Renter's Obligations
  doc.setFont(undefined, 'bold')
  doc.text('المادة 4 - التزامات المستأجر', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const renterObligations = [
    'استخدام الأداة وفقًا للغرض المقصود منها',
    'اتخاذ جميع الاحتياطات اللازمة للحفاظ عليها',
    'عدم إعارة أو تأجير الأداة من الباطن لطرف ثالث',
    'الإبلاغ فورًا عن أي عطل',
    'إرجاع الأداة في نفس الحالة التي تم استلامها بها',
    'احترام أوقات الإرجاع المتفق عليها',
  ]
  renterObligations.forEach((obligation) => {
    doc.text(`• ${obligation}`, margin, yPosition, {
      align: 'right',
    })
    yPosition += 6
  })
  yPosition += 10

  // Article 5 - Owner's Obligations
  doc.setFont(undefined, 'bold')
  doc.text('المادة 5 - التزامات المالك', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const ownerObligations = [
    'تسليم الأداة في حالة عمل ممتازة',
    'توفير تعليمات الاستخدام إذا لزم الأمر',
    'التأكد من أن الأداة تطابق وصفها',
    'التواجد وقت التسليم والإرجاع',
  ]
  ownerObligations.forEach((obligation) => {
    doc.text(`• ${obligation}`, margin, yPosition, {
      align: 'right',
    })
    yPosition += 6
  })
  yPosition += 10

  // Article 6 - Insurance and Liability
  doc.setFont(undefined, 'bold')
  doc.text('المادة 6 - التأمين والمسؤولية', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text(
    'الأداة مشمولة بتأمين Bricola خلال فترة الإيجار من أجل:',
    margin,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 8
  const insuranceCoverage = [
    'الأضرار العرضية',
    'السرقة (تحت ظروف معينة)',
    'الأضرار الناتجة عن عيب في الأداة',
  ]
  insuranceCoverage.forEach((coverage) => {
    doc.text(`• ${coverage}`, margin, yPosition, {
      align: 'right',
    })
    yPosition += 6
  })
  yPosition += 6
  const liabilityText = doc.splitTextToSize(
    'يظل المستأجر مسؤولاً عن الأضرار الناتجة عن الاستخدام غير السليم أو الإهمال الجسيم.',
    pageWidth - 2 * margin,
  )
  doc.text(liabilityText, margin, yPosition, {
    align: 'right',
  })
  yPosition += liabilityText.length * 6 + 10

  // Add page number in footer
  doc.setPage(2)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`صفحة 2 من ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    startNewPage()
  }

  // Article 7 - Dispute Resolution
  doc.setFont(undefined, 'bold')
  doc.text('المادة 7 - حل النزاعات', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const disputeText = doc.splitTextToSize(
    'في حالة حدوث نزاع، يوافق الطرفان على البحث عن حل ودي. إذا فشل ذلك، ستتدخل خدمة عملاء Bricola في الوساطة. النزاعات التي لم يتم حلها ستحال إلى المحاكم المختصة.',
    pageWidth - 2 * margin,
  )
  doc.text(disputeText, margin, yPosition, {
    align: 'right',
  })
  yPosition += disputeText.length * 6 + 20

  // Signatures
  doc.setFont(undefined, 'bold')
  doc.text('توقيع المالك', margin, yPosition, {
    align: 'right',
  })
  doc.text('توقيع المستأجر', pageWidth - margin - 80, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  doc.text('[التوقيع والتاريخ]', margin, yPosition, {
    align: 'right',
  })
  doc.text('[التوقيع والتاريخ]', pageWidth - margin - 80, yPosition, {
    align: 'right',
  })
  yPosition += 20

  // Usage Instructions
  doc.setFont(undefined, 'bold')
  doc.text('تعليمات الاستخدام', margin, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont(undefined, 'normal')
  const instructions = [
    '1. أكمل جميع الأقسام المحددة بين أقواس بالمعلومات المناسبة.',
    '2. تأكد من أن جميع الأطراف قد قرأوا وفهموا العقد قبل التوقيع.',
    '3. احتفظ بنسخة موقعة من العقد طوال فترة الإيجار.',
    '4. إذا كان لديك أي أسئلة، اتصل بخدمة عملاء Bricola.',
  ]
  instructions.forEach((instruction) => {
    const splitInstruction = doc.splitTextToSize(
      instruction,
      pageWidth - 2 * margin,
    )
    doc.text(splitInstruction, margin, yPosition, {
      align: 'right',
    })
    yPosition += splitInstruction.length * 6 + 2
  })
  doc.setPage(3)
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`صفحة 3 من ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Download the PDF
  doc.save(`عقد-ايجار-${data.referenceId}.pdf`)
}
