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
    yPosition
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
    yPosition
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
    yPosition
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
    yPosition
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
    yPosition
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
    pageWidth - 2 * margin
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
    pageWidth - 2 * margin
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
      pageWidth - 2 * margin
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
