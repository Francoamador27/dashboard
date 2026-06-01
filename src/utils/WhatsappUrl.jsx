import useCont from "../hooks/useCont";

export default function WhatsappHref({ message = "" }) {
  const { company, logoUrl, contact } = useCont();

  let phone = contact.whatsapp || "";
  // encodeURIComponent para que no se rompa el mensaje en la URL
  const url = `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(
    message
  )}`;

  return url;
}
