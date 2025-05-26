import { PrismaClient } from "@prisma/client";
import { sendLeadNotification } from "./leadSignalNotification.js";
import { sendTelegramMessage } from "./telegramChatBoat.js";
const prisma = new PrismaClient();

/**
 * Round Robin lead distribution utility.
 * @param {string} projectId - The ID of the project for which leads need to be distributed.
 * @returns {Promise<object>} - An object containing a success message and count of distributed leads.
 */
async function roundRobinDistributeLeads(
  formDetails,
  mappedLead,
  assignedSalesperson,
  allEmails,
  leadDescription,
  facebookId,
  sourceId
) {
  const initialPipelineStage = await prisma.salesPipelineStage.findFirst({
    where: { position: 1 },
    select: { id: true },
  });

  await prisma.$transaction(async (transaction) => {
    const maxLead = await transaction.lead.findFirst({
      orderBy: { leadId: "desc" },
      select: { leadId: true },
    });

    const nextLeadId = maxLead ? maxLead.leadId + 1 : 101;
    //   console.log("maxLead = ", maxLead, "nextLeadId = ", nextLeadId);
    const newLead = await transaction.lead.create({
      data: {
        leadId: nextLeadId,
        name: mappedLead.name,
        email: mappedLead.email,
        phone: mappedLead.phoneNo1,
        alternatePhone: mappedLead.alternatePhone,
        businessName: mappedLead.businessName,
        enquiryDescription: leadDescription,
        campaign_id: facebookId.campaign_id,
        adId: facebookId.ad_id,
        adSetId: facebookId.adset_id,
        source: {
          connect: {
            id: sourceId,
          },
        },
        assignedTo: {
          connect: { id: assignedSalesperson.userId },
        },
        pipelineStage: {
          connect: { id: initialPipelineStage.id },
        },
        //   assignedToId: salespersonIds[startIndex], // Assign directly during creation
      },
    });

    if (formDetails.projectId) {
      const projectExists = await transaction.project.findFirst({
        where: { id: formDetails.projectId, deletedAt: null },
      });
      if (!projectExists) {
        throw new Error(
          `Invalid projectId: ${formDetails.projectId}. Project not found.`
        );
      }
      await transaction.leadProjects.create({
        data: {
          leadId: newLead.id,
          projectId: formDetails.projectId,
        },
      });
    }

    sendLeadNotification(
      mappedLead,
      assignedSalesperson,
      formDetails.project.name,
      allEmails
    );

    const message = `New Lead Received:\nName: ${newLead.name}\nPhone: ${newLead.phone}\nEmail: ${newLead.email}`;

    sendTelegramMessage(message);
    console.log(`New lead created!`);
  });
}
export default roundRobinDistributeLeads;
