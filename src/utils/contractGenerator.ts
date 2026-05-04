import { jsPDF } from 'jspdf'
import arabicFontBoldUrl from '@/assets/fonts/arial-unicode-bold.ttf?url'
import arabicFontRegularUrl from '@/assets/fonts/arial-unicode.ttf?url'

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

let cachedArabicFontRegular: string | null = null
let cachedArabicFontBold: string | null = null

const arrayBufferToBinaryString = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return binary
}

const loadFontBinary = async (fontUrl: string): Promise<string> => {
  const response = await fetch(fontUrl)

  if (!response.ok) {
    throw new Error(`Unable to load font: ${fontUrl}`)
  }

  const buffer = await response.arrayBuffer()
  return arrayBufferToBinaryString(buffer)
}

const ensureArabicFont = async (doc: jsPDF): Promise<void> => {
  if (!cachedArabicFontRegular) {
    cachedArabicFontRegular = await loadFontBinary(arabicFontRegularUrl)
  }

  if (!cachedArabicFontBold) {
    cachedArabicFontBold = await loadFontBinary(arabicFontBoldUrl)
  }

  doc.addFileToVFS('ArialUnicode.ttf', cachedArabicFontRegular)
  doc.addFont('ArialUnicode.ttf', 'ArialUnicode', 'normal')
  doc.addFileToVFS('ArialUnicode-Bold.ttf', cachedArabicFontBold)
  doc.addFont('ArialUnicode-Bold.ttf', 'ArialUnicode', 'bold')
  doc.setFont('ArialUnicode', 'normal')
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
  doc.setFont('ArialUnicode', 'normal')
  doc.text(rtlText(`صفحة 1 من ${totalPages}`), pageWidth / 2, pageHeight - 10, {
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

export const generateRentalContractAr = async (
  data: ContractData,
): Promise<void> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 25
  const rtlX = pageWidth - margin
  let yPosition = 40

  await ensureArabicFont(doc)

  const LRM = ' '
  const rtlText = (text: string) => doc.processArabic(text)
  const rtlLines = (text: string) =>
    doc.splitTextToSize(rtlText(text), pageWidth - 2 * margin)
  const rtlField = (label: string, value: string | number) =>
    rtlText(`${label}: ${LRM}${String(value)}${LRM}`)

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
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlField(data.referenceId, 'المرجع'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 20

  // Title
  doc.setFontSize(16)
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('عقد إيجار أداة'), pageWidth / 2, yPosition, {
    align: 'center',
  })
  yPosition += 20

  // Header - Between the undersigned
  doc.setFontSize(12)
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('بين الموقعين أدناه'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Owner details
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText(': المالك'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(`${data.ownerName}`, rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.ownerAddress, 'العنوان'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.ownerPhone, 'الهاتف'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.ownerEmail, 'البريد الإلكتروني'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 15

  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('و'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Renter details
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText(': المستأجر'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(`${data.renterName}`, rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.renterAddress, 'العنوان'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.renterPhone, 'الهاتف'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.renterEmail, 'البريد الإلكتروني'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 20

  // Article 1 - Purpose of the Contract
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 1 - الغرض من العقد'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(
    rtlText('الغرض من هذا العقد هو تأجير الأداة التالية'),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 10
  doc.text(rtlField(data.toolName, 'التسمية'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.toolBrand, 'العلامة التجارية'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.toolModel, 'الموديل'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 6
  doc.text(rtlField(data.condition, 'الحالة'), rtlX, yPosition, {
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
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 2 - مدة الإيجار'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(
    rtlText(
      ` ${LRM}${data.startDate}${LRM}  ${LRM}تاريخ البدء`,
    ),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(
    rtlText(
      ` ${LRM}${data.endDate}${LRM}  ${LRM}تاريخ الانتهاء`,
    ),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 15

  // Article 3 - Price and Payment Terms
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 3 - السعر وشروط الدفع'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(
    rtlText(
      ` ${LRM}${data.totalPrice}£${LRM} : ${LRM}سعر الإيجار`,
    ),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(
    rtlText(
      `${LRM}${data.rentalDuration}${LRM} : ${LRM}مدة الإيجار`,
    ),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(
    rtlText(` ${LRM}${data.deposit}£${LRM} : ${LRM}الضمان`),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 6
  doc.text(rtlText('طريقة الدفع: عبر منصة بريكولا'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 15

  // Article 4 - Renter's Obligations
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 4 - التزامات المستأجر'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  const renterObligations = [
    'استخدام الأداة وفقًا للغرض المقصود منها',
    'اتخاذ جميع الاحتياطات اللازمة للحفاظ عليها',
    'عدم إعارة أو تأجير الأداة من الباطن لطرف ثالث',
    'الإبلاغ فورًا عن أي عطل',
    'إرجاع الأداة في نفس الحالة التي تم استلامها بها',
    'احترام أوقات الإرجاع المتفق عليها',
  ]
  renterObligations.forEach((obligation) => {
    doc.text(rtlText(`${obligation} • `), rtlX, yPosition, {
      align: 'right',
    })
    yPosition += 6
  })
  yPosition += 10

  // Article 5 - Owner's Obligations
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 5 - التزامات المالك'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  const ownerObligations = [
    'تسليم الأداة في حالة عمل ممتازة',
    'توفير تعليمات الاستخدام إذا لزم الأمر',
    'التأكد من أن الأداة تطابق وصفها',
    'التواجد وقت التسليم والإرجاع',
  ]
  ownerObligations.forEach((obligation) => {
    doc.text(rtlText(`${obligation} • `), rtlX, yPosition, {
      align: 'right',
    })
    yPosition += 6
  })
  yPosition += 10

  // Article 6 - Insurance and Liability
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 6 - الضمان والمسؤولية'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(
    rtlText('الأداة مشمولة بضمان خلال فترة الإيجار من أجل'),
    rtlX,
    yPosition,
    {
      align: 'right',
    },
  )
  yPosition += 8
  const insuranceCoverage = [
    'الأضرار العرضية',
    'السرقة تحت ظروف معينة',
    'الأضرار الناتجة عن عيب في الأداة',
  ]
  insuranceCoverage.forEach((coverage) => {
    doc.text(rtlText(`${coverage} • `), rtlX, yPosition, {
      align: 'right',
    })
    yPosition += 6
  })
  yPosition += 6
  const liabilityText = rtlLines(
    'يظل المستأجر مسؤولاً عن الأضرار الناتجة عن الاستخدام غير السليم أو الإهمال الجسيم',
  )
  doc.text(liabilityText, rtlX, yPosition, {
    align: 'right',
  })
  yPosition += liabilityText.length * 6 + 10

  // Add page number in footer
  doc.setPage(2)
  doc.setFontSize(10)
  doc.setFont('ArialUnicode', 'normal')
  doc.text(rtlText(`صفحة 2 من ${totalPages}`), pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    startNewPage()
  }

  // Article 7 - Dispute Resolution
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('المادة 7 - حل النزاعات'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  const disputeText = rtlLines(
    'في حالة حدوث نزاع ، يوافق الطرفان على البحث عن حل ودي. إذا فشل ذلك، ستتدخل خدمة عملاء بريكولا في الوساطة. النزاعات التي لم يتم حلها ستحال إلى المحاكم المختصة.',
  )
  doc.text(disputeText, rtlX, yPosition, {
    align: 'right',
  })
  yPosition += disputeText.length * 6 + 20

  // Signatures
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('توقيع المالك'), rtlX, yPosition, {
    align: 'right',
  })
  doc.text(rtlText('توقيع المستأجر'), pageWidth - margin - 80, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  doc.text(rtlText('[التوقيع والتاريخ]'), rtlX, yPosition, {
    align: 'right',
  })
  doc.text(rtlText('[التوقيع والتاريخ]'), pageWidth - margin - 80, yPosition, {
    align: 'right',
  })
  yPosition += 20

  // Usage Instructions
  doc.setFont('ArialUnicode', 'bold')
  doc.text(rtlText('تعليمات الاستخدام'), rtlX, yPosition, {
    align: 'right',
  })
  yPosition += 8
  doc.setFont('ArialUnicode', 'normal')
  const instructions = [
    'أكمل جميع الأقسام المحددة بين أقواس بالمعلومات المناسبة- ',
    'تأكد من أن جميع الأطراف قد قرأوا وفهموا العقد قبل التوقيع-',
    'احتفظ بنسخة موقعة من العقد طوال فترة الإيجار-',
    'إذا كان لديك أي أسئلة، اتصل بخدمة العملاء-',
  ]
  instructions.forEach((instruction, index) => {
    const splitInstruction = rtlLines(instruction)
    // instruction + index
    doc.text(splitInstruction, rtlX, yPosition, {
      align: 'right',
    })
    yPosition += splitInstruction.length * 6 + 2
  })
  doc.setPage(3)
  doc.setFontSize(10)
  doc.setFont('ArialUnicode', 'normal')
  doc.text(rtlText(`صفحة 3 من ${totalPages}`), pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })
  // Download the PDF
  doc.save(`عقد-ايجار-${data.referenceId}.pdf`)
}
