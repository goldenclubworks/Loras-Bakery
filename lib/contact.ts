/** Contact channels come from env so no placeholder numbers ever ship. Missing values are simply hidden. */
export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/[^\d]/g, ""),
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
};

export const hasContact = Boolean(contact.email || contact.whatsapp);
